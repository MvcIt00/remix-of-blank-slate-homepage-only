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
        const { accountId, to, subject, inReplyTo, references } = body;

        // Helper per la conformità RFC 822 (SMTP richiede CRLF \r\n)
        const normalizeCRLF = (str: string) => str.replace(/\r?\n/g, "\r\n");

        // Parametri corpo flessibili e normalizzati
        const rawText = body.text || body.body || body.bodyText || "";
        const text = normalizeCRLF(rawText);
        const html = normalizeCRLF(body.html || (rawText ? rawText.replace(/\n/g, "<br>") : ""));

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

        const toList = Array.isArray(to) ? to : [to];
        const toAddresses = toList.map((t: any) =>
            typeof t === "string" ? t : t.email
        ).join(", ");

        // 1. THREADING: Lookup/Create Conversazione tramite RPC (PRIMA dell'invio)
        const { data: convId, error: convErr } = await supabaseClient.rpc("get_or_create_conversation_by_refs", {
            p_subject: subject,
            p_message_id: `<temp-${Date.now()}>`,
            p_references: references || [],
            p_id_anagrafica: body.id_anagrafica || null,
            p_id_noleggio: body.id_noleggio || null,
            p_id_preventivo: body.id_preventivo || null
        });

        if (convErr) console.error("[SMTP] Errore conversazione:", convErr.message);

        // 2. CREA RECORD IN DB (Stato iniziale: bozza o inviata_con_errore come placeholder)
        const { data: savedEmail, error: saveError } = await supabaseClient
            .from("emails_inviate")
            .insert({
                id_account: accountId,
                da_email: account.email,
                da_nome: account.nome_account || account.email,
                a_emails: toList.map((t: any) => ({
                    email: typeof t === "string" ? t : t.email,
                    name: typeof t === "object" ? t.name : undefined,
                })),
                oggetto: subject,
                corpo_text: text,
                corpo_html: html,
                stato: "bozza", // Placeholder
                id_conversazione: convId,
                in_reply_to: inReplyTo,
                references_chain: references || [],
                id_anagrafica: body.id_anagrafica || null,
                id_noleggio: body.id_noleggio || null,
                id_preventivo: body.id_preventivo || null
            })
            .select()
            .single();

        if (saveError) throw new Error(`Errore creazione record DB: ${saveError.message}`);

        // 3. INVIO SMTP
        const password = decryptPassword(account.password_encrypted);
        const smtpClient = new SMTPClient({
            user: account.email,
            password: password,
            host: account.smtp_host,
            port: account.smtp_port || 465,
            ssl: true,
            timeout: 30000,
        });

        const localMessageId = `<${Date.now()}.${Math.random().toString(36).substring(7)}@antigravity.system>`;
        const fromHeader = normalizeCRLF(`${account.nome_account || account.email} <${account.email}>`).replace(/\r\n/g, " "); // No newlines in From
        const subjectHeader = normalizeCRLF(subject).replace(/\r\n/g, " "); // No newlines in Subject

        const messageConfig: any = {
            from: fromHeader,
            to: toAddresses,
            subject: subjectHeader,
            text: text,
            headers: { "Message-ID": localMessageId }
        };

        if (inReplyTo) messageConfig.headers["In-Reply-To"] = inReplyTo;
        if (references?.length) messageConfig.headers["References"] = references.join(" ");
        if (html) messageConfig.attachment = [{ data: html, alternative: true }];

        try {
            await smtpClient.sendAsync(messageConfig);

            // 4. AGGIORNA A 'inviata'
            await supabaseClient
                .from("emails_inviate")
                .update({
                    stato: "inviata",
                    data_invio_effettiva: new Date().toISOString(),
                    message_id: localMessageId
                })
                .eq("id", savedEmail.id);

            return new Response(
                JSON.stringify({ success: true, messageId: localMessageId, savedId: savedEmail.id }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );

        } catch (smtpErr: any) {
            console.error("[SMTP] Fallimento invio:", smtpErr);

            // 5. AGGIORNA A 'inviata_con_errore'
            await supabaseClient
                .from("emails_inviate")
                .update({
                    stato: "inviata_con_errore",
                    errore_messaggio: smtpErr.message
                })
                .eq("id", savedEmail.id);

            return new Response(
                JSON.stringify({ error: smtpErr.message, savedId: savedEmail.id }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

    } catch (error: any) {
        console.error("Errore generale:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
