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
        const { accountId, to, subject, text, html } = body;

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

        const messageConfig: any = {
            from: `${account.nome_account || account.email} <${account.email}>`,
            to: toAddresses,
            subject: subject,
            text: text || "",
        };

        if (html) {
            messageConfig.attachment = [
                { data: html, alternative: true }
            ];
        }

        const message = await smtpClient.sendAsync(messageConfig);

        // Salva con stati tipizzati
        const messageId = `smtp-${accountId}-${Date.now()}`;
        const { data: savedEmail, error: saveError } = await supabaseClient
            .from("messaggi_email")
            .insert({
                id_account: accountId,
                message_id_esterno: messageId,
                direzione: "inviata",
                da_email: account.email,
                da_nome: account.nome_account || account.email,
                a_emails: toList.map((t: any) => ({
                    email: typeof t === "string" ? t : t.email,
                    name: typeof t === "object" ? t.name : undefined,
                })),
                oggetto: subject,
                corpo_text: text || "",
                corpo_html: html || "",
                // Vecchio campo per retrocompatibilità
                stato: "inviata",
                // NUOVO: Campo tipizzato ENUM
                stato_inviata: "inviata",
                data_invio_effettiva: new Date().toISOString(),
            })
            .select()
            .single();

        if (saveError) {
            console.error("Errore salvataggio:", saveError);
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
