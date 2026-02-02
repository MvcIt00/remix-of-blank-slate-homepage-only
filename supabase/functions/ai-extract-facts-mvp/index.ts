/**
 * AI Extract Facts MVP - Edge Function
 * 
 * Purpose: Extract relevant facts from emails using LLM
 * 
 * Safety features:
 * - Email content truncation (max 3000 chars)
 * - Rate limiting (max 10 emails per invocation)
 * - Timeout protection (stops after 50 seconds)
 * - Duplicate detection (skip already processed emails)
 * - Graceful error handling (continues on single email failure)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    const startTime = Date.now();
    const MAX_EXECUTION_TIME = 50 * 1000; // 50 seconds (leave 10sec margin)

    try {
        // 1. Validate environment
        const openaiKey = Deno.env.get("OPENAI_API_KEY");
        if (!openaiKey) {
            return new Response(JSON.stringify({
                error: "OPENAI_API_KEY not configured",
                message: "Please set OPENAI_API_KEY in Supabase Edge Function secrets"
            }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // 2. Parse request
        const { email_ids } = await req.json();

        if (!email_ids || !Array.isArray(email_ids)) {
            return new Response(JSON.stringify({
                error: "Invalid request",
                message: "email_ids must be an array of UUID strings"
            }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // Limit to 10 emails max (safety)
        const limitedEmailIds = email_ids.slice(0, 10);

        // 3. Initialize clients
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const openai = new OpenAI({ apiKey: openaiKey });

        const results = [];

        // 4. Process each email
        for (const email_id of limitedEmailIds) {
            // Check timeout
            if (Date.now() - startTime > MAX_EXECUTION_TIME) {
                results.push({
                    email_id,
                    skipped: true,
                    reason: "timeout_approaching"
                });
                break;
            }

            try {
                // 4a. Check if already processed
                const { data: existing } = await supabase
                    .from("ai_knowledge_base")
                    .select("id")
                    .eq("source_email_id", email_id)
                    .maybeSingle();

                if (existing) {
                    results.push({
                        email_id,
                        skipped: true,
                        reason: "already_processed"
                    });
                    continue;
                }

                // 4b. Fetch email
                const { data: email, error: fetchError } = await supabase
                    .from("emails_ricevute")
                    .select("id, da_nome, da_email, oggetto, corpo_text")
                    .eq("id", email_id)
                    .maybeSingle();

                if (fetchError || !email) {
                    results.push({
                        email_id,
                        skipped: true,
                        reason: "email_not_found",
                        error: fetchError?.message
                    });
                    continue;
                }

                // 4c. Validate & truncate content
                const emailText = email.corpo_text || "";
                if (emailText.length === 0) {
                    results.push({
                        email_id,
                        skipped: true,
                        reason: "empty_body"
                    });
                    continue;
                }

                const truncatedText = emailText.slice(0, 3000); // Max 3000 chars (~750 tokens)
                const wasTruncated = emailText.length > 3000;

                // 4d. Call LLM
                const prompt = buildExtractionPrompt(email, truncatedText, wasTruncated);

                const completion = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: prompt }],
                    response_format: { type: "json_object" },
                    temperature: 0.3,
                    max_tokens: 500 // Keep response concise
                });

                // 4e. Parse LLM response
                let extracted;
                try {
                    extracted = JSON.parse(completion.choices[0].message.content || "{}");
                } catch (parseError) {
                    results.push({
                        email_id,
                        skipped: true,
                        reason: "llm_response_invalid_json",
                        error: parseError.message
                    });
                    continue;
                }

                // 4f. Skip if low relevance (lowered threshold for testing phase)
                if (!extracted.relevance_score || extracted.relevance_score < 0.2) {
                    results.push({
                        email_id,
                        skipped: true,
                        reason: "low_relevance",
                        relevance_score: extracted.relevance_score
                    });
                    continue;
                }

                // 4g. Insert into ai_knowledge_base
                const { data: fact, error: insertError } = await supabase
                    .from("ai_knowledge_base")
                    .insert({
                        source_email_id: email_id,
                        fact_summary: extracted.fact_summary || "No summary",
                        fact_type: extracted.fact_type || "info",
                        relevance_score: extracted.relevance_score,
                        confidence_score: extracted.confidence_score || 0.5,
                        extraction_raw: extracted
                    })
                    .select()
                    .single();

                if (insertError) {
                    results.push({
                        email_id,
                        skipped: true,
                        reason: "db_insert_failed",
                        error: insertError.message
                    });
                    continue;
                }

                // 4h. Create briefing
                const { error: briefingError } = await supabase
                    .from("ai_briefings")
                    .insert({
                        fact_id: fact.id,
                        title: extracted.title || extracted.fact_summary?.slice(0, 50) || "Nuovo aggiornamento",
                        message: extracted.message || extracted.fact_summary || "Dettagli non disponibili",
                        priority: extracted.priority || "medium",
                        icon: extracted.icon || "🔵"
                    });

                if (briefingError) {
                    // Fact created but briefing failed - log but don't fail
                    console.warn("Briefing creation failed:", briefingError);
                }

                results.push({
                    email_id,
                    fact_id: fact.id,
                    success: true,
                    relevance_score: extracted.relevance_score
                });

                // Rate limiting: delay between API calls
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (emailError: any) {
                console.error(`Error processing email ${email_id}:`, emailError);
                results.push({
                    email_id,
                    skipped: true,
                    reason: "unexpected_error",
                    error: emailError?.message || "Unknown error"
                });
            }
        }

        // 5. Return results
        const successful = results.filter(r => r.success).length;
        const skipped = results.filter(r => r.skipped).length;

        return new Response(JSON.stringify({
            processed: limitedEmailIds.length,
            successful,
            skipped,
            execution_time_ms: Date.now() - startTime,
            results
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (error: any) {
        console.error("Fatal error:", error);
        return new Response(JSON.stringify({
            error: "internal_server_error",
            message: error?.message || "Unknown error occurred"
        }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
});

function buildExtractionPrompt(email: any, text: string, wasTruncated: boolean): string {
    // Determine sender display (prefer nome, fallback to email)
    const senderDisplay = email.da_nome || email.da_email.split('@')[0] || email.da_email;

    return `Sei un assistente esperto nel settore noleggio carrelli elevatori e mezzi industriali.

CONTEXT: Azienda che gestisce noleggio, vendita, manutenzione di carrelli elevatori, piattaforme aeree, e mezzi simili.

EMAIL:
Da: ${email.da_nome || "N/A"} <${email.da_email}>
Oggetto: ${email.oggetto || "(nessun oggetto)"}
${wasTruncated ? "[NOTA: Corpo email troncato a 3000 caratteri]" : ""}

Corpo:
${text}

---

TASK: Analizza questa email ed estrai il contenuto rilevante.

**FORMATO RICHIESTO PER IL MESSAGGIO**:
Il "message" deve SEMPRE seguire questa struttura:

"${senderDisplay} [COSA VUOLE/FA]. [Argomentazione se necessario]."

Esempi:
- "Marco Rossi chiede conferma disponibilità carrello. Ha urgenza per cantiere di Milano che parte lunedì."
- "ABC Forniture segnala ritardo consegna. Problema con trasportatore, slittamento di 2 giorni."
- "info@newsletter.com invia aggiornamenti prodotti. Newsletter mensile standard."
- "Luca Bianchi conferma preventivo #PRV-045. Procede con noleggio 3 mesi."

Se l'email è spam puro o completamente irrilevante, imposta relevance_score = 0.

RISPONDI IN JSON con questa struttura:
{
  "fact_summary": "Sintesi molto breve (max 100 char)",
  "fact_type": "conferma|domanda|problema|info|irrilevante",
  "relevance_score": 0.0-1.0,
  "confidence_score": 0.0-1.0,
  "title": "${senderDisplay} - Breve oggetto (max 50 char)",
  "message": "SEGUI IL FORMATO: ${senderDisplay} [cosa vuole]. [Argomenti se necessari].",
  "priority": "urgent|high|medium|low",
  "icon": "emoji appropriato (es: 🟢, 🔴, 🟡, 🔵, ⚠️, ✅, 📋, 📧)"
}

REGOLE:
1. **SEMPRE inizia il message con il nome/account mittente**
2. Dopo il nome, descrivi COSA vuole/fa in modo conciso
3. Se necessario, aggiungi 1-2 frasi di argomentazione con dettagli utili
4. Usa NOMI quando disponibili, altrimenti account email (es: "info@azienda.com")
5. Se menciona codici (#PRV-xxx, #NOL-xxx, #TRS-xxx), includili
6. Tono: diretto e professionale
7. relevance_score: usa scala 0.0-1.0 realisticamente (anche 0.3-0.5 va bene per email normali)
8. priority "urgent" solo se deadline imminente o problema critico

ESEMPI COMPLETI:
{
  "title": "Marco Rossi - Richiesta preventivo",
  "message": "Marco Rossi chiede preventivo per noleggio carrello 3 ton. Necessita per cantiere Bologna, durata 2 mesi da fine marzo.",
  "priority": "medium",
  "icon": "📋",
  "relevance_score": 0.7
}

{
  "title": "Luca Verdi - Conferma ordine",
  "message": "Luca Verdi conferma preventivo #PRV-123. Procede con noleggio, firma contratto domani.",
  "priority": "high",
  "icon": "✅",
  "relevance_score": 0.9
}

{
  "title": "info@newsletter.com - Aggiornamenti",
  "message": "info@newsletter.com invia newsletter settimanale. Contenuti marketing generici.",
  "priority": "low",
  "icon": "📧",
  "relevance_score": 0.2
}`;
}
