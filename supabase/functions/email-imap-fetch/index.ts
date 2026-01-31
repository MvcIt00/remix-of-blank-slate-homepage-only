// Edge Function IMAP Fetch - v4
// Con postal-mime + stati tipizzati (stato_ricevuta ENUM)
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import PostalMime from "npm:postal-mime@2.4.1";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Decoder MIME RFC 2047
function decodeMimeWord(text: string): string {
    if (!text) return "";
    const mimePattern = /=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g;
    return text.replace(mimePattern, (match, charset, encoding, encoded) => {
        try {
            if (encoding.toUpperCase() === "B") {
                return atob(encoded);
            } else if (encoding.toUpperCase() === "Q") {
                return encoded
                    .replace(/_/g, " ")
                    .replace(/=([0-9A-Fa-f]{2})/g, (_m: string, hex: string) =>
                        String.fromCharCode(parseInt(hex, 16))
                    );
            }
        } catch { return match; }
        return match;
    });
}

// Client IMAP minimale
class DenoImapClient {
    private conn: Deno.TlsConn | null = null;
    private tagCounter = 0;

    async connect(host: string, port: number): Promise<void> {
        this.conn = await Deno.connectTls({ hostname: host, port });
        await this.readResponse();
    }

    private async readResponse(): Promise<string> {
        if (!this.conn) throw new Error("Non connesso");
        const buffer = new Uint8Array(32768);
        const n = await this.conn.read(buffer);
        return n ? decoder.decode(buffer.subarray(0, n)) : "";
    }

    private async sendCommand(command: string): Promise<string> {
        if (!this.conn) throw new Error("Non connesso");
        this.tagCounter++;
        const tag = `A${this.tagCounter}`;
        await this.conn.write(encoder.encode(`${tag} ${command}\r\n`));

        let response = "";
        let attempts = 0;
        while (attempts < 100) {
            const chunk = await this.readResponse();
            response += chunk;
            attempts++;
            if (response.includes(`${tag} OK`) ||
                response.includes(`${tag} NO`) ||
                response.includes(`${tag} BAD`)) break;
        }
        return response;
    }

    async login(user: string, password: string): Promise<boolean> {
        const response = await this.sendCommand(`LOGIN "${user}" "${password}"`);
        return response.includes("OK");
    }

    async selectInbox(): Promise<{ exists: number }> {
        const response = await this.sendCommand("SELECT INBOX");
        const match = response.match(/\* (\d+) EXISTS/);
        return { exists: match ? parseInt(match[1]) : 0 };
    }

    async fetchRaw(seqno: number): Promise<{ uid: number; raw: string; flags: string[] }> {
        const response = await this.sendCommand(
            `FETCH ${seqno} (UID FLAGS BODY.PEEK[])`
        );

        const uidMatch = response.match(/UID (\d+)/);
        const uid = uidMatch ? parseInt(uidMatch[1]) : seqno;

        const flagsMatch = response.match(/FLAGS \(([^)]*)\)/);
        const flags = flagsMatch ? flagsMatch[1].split(/\s+/).filter(Boolean) : [];

        const bodyMatch = response.match(/BODY\[\]\s*\{(\d+)\}\r\n([\s\S]*?)(?=\)\r\nA\d+|\)$)/);
        const raw = bodyMatch ? bodyMatch[2] : "";

        return { uid, raw, flags };
    }

    async logout(): Promise<void> {
        if (this.conn) {
            try { await this.sendCommand("LOGOUT"); } catch { /* ignore */ }
            try { this.conn.close(); } catch { /* ignore */ }
            this.conn = null;
        }
    }
}

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
        const { accountId, limit = 20 } = await req.json();

        if (!accountId) {
            return new Response(
                JSON.stringify({ error: "accountId richiesto" }),
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
                JSON.stringify({ error: "Account non trovato" }),
                { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const password = decryptPassword(account.password_encrypted);
        if (!account.imap_host || !password) {
            return new Response(
                JSON.stringify({ error: "Configurazione IMAP incompleta" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const client = new DenoImapClient();
        const parser = new PostalMime();

        try {
            await client.connect(account.imap_host, account.imap_port || 993);

            const loginOk = await client.login(account.email, password);
            if (!loginOk) throw new Error("Login IMAP fallito");

            const inbox = await client.selectInbox();
            if (inbox.exists === 0) {
                await client.logout();
                return new Response(
                    JSON.stringify({ success: true, count: 0, emails: [] }),
                    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            }

            const fetchFrom = Math.max(1, inbox.exists - limit + 1);
            const results: any[] = [];

            for (let seqno = fetchFrom; seqno <= inbox.exists; seqno++) {
                try {
                    const { uid, raw, flags } = await client.fetchRaw(seqno);
                    const parsed = await parser.parse(raw);

                    const bodyText = parsed.text || "";
                    const bodyHtml = parsed.html || "";
                    const subject = decodeMimeWord(parsed.subject || "(Nessun oggetto)");
                    const fromEmail = parsed.from?.address || "";
                    const fromName = decodeMimeWord(parsed.from?.name || fromEmail);

                    // NUOVO: Determina stato_ricevuta basato su IMAP flags
                    const isSeen = flags.includes("\\Seen");
                    const statoRicevuta = isSeen ? "letta" : "non_letta";

                    // Upsert con nuovi campi tipizzati
                    const { error: upsertError } = await supabaseClient
                        .from("messaggi_email")
                        .upsert({
                            id_account: accountId,
                            message_id_esterno: `imap-${accountId}-${uid}`,
                            direzione: "ricevuta",
                            da_email: fromEmail,
                            da_nome: fromName,
                            a_emails: parsed.to?.map(t => ({ email: t.address, name: t.name })) || [],
                            oggetto: subject,
                            corpo_text: bodyText.substring(0, 50000),
                            corpo_html: bodyHtml.substring(0, 100000),
                            // Vecchio campo per retrocompatibilità
                            stato: statoRicevuta,
                            // NUOVO: Campo tipizzato ENUM
                            stato_ricevuta: statoRicevuta,
                            data_creazione: parsed.date ? new Date(parsed.date).toISOString() : new Date().toISOString(),
                            data_ricezione: parsed.date ? new Date(parsed.date).toISOString() : new Date().toISOString(),
                        }, { onConflict: "message_id_esterno" });

                    if (upsertError) {
                        console.error("Errore upsert:", upsertError);
                    }

                    results.push({
                        uid,
                        subject,
                        from: fromName,
                        date: parsed.date,
                        stato: statoRicevuta,
                        hasText: !!bodyText,
                        hasHtml: !!bodyHtml,
                    });
                } catch (parseErr) {
                    console.error(`Errore parsing email ${seqno}:`, parseErr);
                }
            }

            await client.logout();

            await supabaseClient
                .from("account_email")
                .update({ ultima_sincronizzazione: new Date().toISOString() })
                .eq("id", accountId);

            return new Response(
                JSON.stringify({
                    success: true,
                    count: results.length,
                    totalInbox: inbox.exists,
                    emails: results,
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );

        } catch (imapErr: any) {
            await client.logout();
            throw imapErr;
        }

    } catch (error: any) {
        console.error("Errore IMAP:", error);
        return new Response(
            JSON.stringify({ error: error.message, stack: error.stack }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
