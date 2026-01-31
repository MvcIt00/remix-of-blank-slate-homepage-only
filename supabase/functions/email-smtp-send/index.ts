// Edge Function SMTP Send - v3
// Con stati tipizzati (stato_inviata ENUM)
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { SMTPClient } from "npm:emailjs@4.0.3";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function decryptPassword(encrypted: string): string {
    try { return atob(encrypted); } catch { return encrypted; }
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    try {
        const body = await req.json();
        const { accountId, to, subject, text, html, inReplyTo, references } = body;

        if (!accountId || !to || !subject) {
            return new Response(
                JSON.stringify({ error: "accountId, to e subject sono richiesti" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const { data: account, error: accError } = await supabaseClient
            .from("account_email")
            .select("*")
            .eq("id", accountId)
            .single();

        if (accError || !account) {
            return new Response(
                JSON.stringify({ error: "Account non trovato", details: accError?.message }),
                { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const password = decryptPassword(account.password_encrypted);

        if (!account.smtp_host || !password) {
            return new Response(
                JSON.stringify({ error: "Configurazione SMTP incompleta" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const smtpClient = new SMTPClient({
            user: account.email,
            password: password,
            host: account.smtp_host,
            port: account.smtp_port || 465,
            ssl: true,
            timeout: 30000,
        });

        const toList = Array.isArray(to) ? to : [to];
        const toAddresses = toList.map((t: any) =>
            typeof t === "string" ? t : t.email
        ).join(", ");

        // Generazione Message-ID locale per coerenza database
        const localMessageId = `<${Date.now()}.${Math.random().toString(36).substring(7)}@antigravity.system>`;

        const messageConfig: any = {
            from: `${account.nome_account || account.email} <${account.email}>`,
            to: toAddresses,
            subject: subject,
            text: text || "",
            // THREADING: Header RFC
            headers: {
                "Message-ID": localMessageId,
            }
        };

        if (inReplyTo) {
            messageConfig.headers["In-Reply-To"] = inReplyTo;
        }
        if (references && Array.isArray(references) && references.length > 0) {
            messageConfig.headers["References"] = references.join(" ");
        }

        if (html) {
            messageConfig.attachment = [
                { data: html, alternative: true }
            ];
        }

        const message = await smtpClient.sendAsync(messageConfig);

        // THREADING: Lookup/Create Conversazione tramite RPC
        const { data: convId, error: convErr } = await supabaseClient.rpc("get_or_create_conversation_by_refs", {
            p_subject: subject,
            p_message_id: localMessageId,
            p_references: references || [],
            p_id_anagrafica: body.id_anagrafica || null,
            p_id_noleggio: body.id_noleggio || null,
            p_id_preventivo: body.id_preventivo || null
        });

        if (convErr) {
            console.error("[SMTP] Errore lookup conversazione:", convErr.message);
        }

        // Salva nella NUOVA TABELLA emails_inviate
        const { data: savedEmail, error: saveError } = await supabaseClient
            .from("emails_inviate")
            .insert({
                id_account: accountId,
                message_id: localMessageId,
                da_email: account.email,
                da_nome: account.nome_account || account.email,
                a_emails: toList.map((t: any) => ({
                    email: typeof t === "string" ? t : t.email,
                    name: typeof t === "object" ? t.name : undefined,
                })),
                oggetto: subject,
                corpo_text: text || "",
                corpo_html: html || "",
                stato: "inviata",
                data_invio: new Date().toISOString(),
                // THREADING
                id_conversazione: convId,
                in_reply_to: inReplyTo,
                references_chain: references || [],
                // FK business
                id_anagrafica: body.id_anagrafica || null,
                id_noleggio: body.id_noleggio || null,
                id_preventivo: body.id_preventivo || null
            })
            .select()
            .single();

        if (saveError) {
            console.error("Errore salvataggio emails_inviate:", saveError);
        }

        return new Response(
            JSON.stringify({
                success: true,
                messageId: message.header?.["message-id"] || messageId,
                savedId: savedEmail?.id,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error: any) {
        console.error("Errore SMTP:", error);

        let errorMessage = error.message || "Errore invio email";
        if (error.message?.includes("auth")) {
            errorMessage = "Autenticazione SMTP fallita - verifica credenziali";
        } else if (error.message?.includes("timeout")) {
            errorMessage = "Timeout connessione SMTP - riprova";
        } else if (error.message?.includes("connection")) {
            errorMessage = "Connessione SMTP fallita - verifica host/porta";
        }

        return new Response(
            JSON.stringify({
                error: errorMessage,
                details: error.message,
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
