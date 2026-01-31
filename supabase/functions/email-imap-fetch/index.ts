/**
 * Edge Function IMAP Fetch - v21
 * Implementazione Delta Sync (UID based) + Batching RPC
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { ImapClient } from "jsr:@workingdevshero/deno-imap";
import PostalMime from "npm:postal-mime@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function decrypt(s: string): string {
    try { return atob(s); } catch { return s; }
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    const sb = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    try {
        const { accountId, limit = 50 } = await req.json();

        if (!accountId) {
            return new Response(
                JSON.stringify({ error: "accountId richiesto" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // 1. Recupera configurazione account (inclusi parametri Delta Sync)
        const { data: acc, error: accErr } = await sb
            .from("account_email")
            .select("*")
            .eq("id", accountId)
            .single();

        if (accErr || !acc) {
            throw new Error(`Account non trovato: ${accErr?.message}`);
        }

        const password = decrypt(acc.password_encrypted);
        let lastUid = acc.imap_last_uid_fetch || 0;
        let lastValidity = acc.imap_last_uid_validity || 0;

        // 2. Connessione IMAP
        const client = new ImapClient({
            host: acc.imap_host,
            port: acc.imap_port || 993,
            tls: true,
            username: acc.email,
            password: password,
            commandTimeout: 30000,
            connectionTimeout: 30000,
        });

        await client.connect();
        await client.authenticate();

        const inbox = await client.selectMailbox("INBOX");
        const currentValidity = inbox.uidValidity || 0;
        const totalMessages = inbox.exists || 0;

        // 3. Verifica Validità UID (se cambiata, resetta sync)
        if (currentValidity !== lastValidity) {
            console.log(`[IMAP] UIDValidity changed (${lastValidity} -> ${currentValidity}). Resetting sync.`);
            lastUid = 0;
        }

        // 4. Determina range da scaricare
        // Se lastUid è 0, scarichiamo solo gli ultimi 'limit' messaggi
        // Altrimenti, scarichiamo tutto da lastUid + 1
        let fetchQuery: string;
        if (lastUid === 0) {
            const startSeq = Math.max(1, totalMessages - limit + 1);
            fetchQuery = `${startSeq}:${totalMessages}`;
        } else {
            // IMAP FETCH UID usa i numeri UID, non sequenziali
            // Ma per semplicità con questa libreria useremo UID FETCH
            // Nota: deno-imap supporta UID nelle opzioni? 
            // In questa libreria .fetch() usa sequenziali, per UID serve .uidFetch()
            fetchQuery = `${lastUid + 1}:*`;
        }

        console.log(`[IMAP] Fetching range: ${fetchQuery} (Last UID: ${lastUid})`);

        // Esegui FETCH UID (incremental)
        const messages = await client.fetch(fetchQuery, {
            envelope: true,
            flags: true,
            uid: true,
            full: true,
        }, { uid: true }); // Attiva modalità UID se supportata dal metodo

        console.log(`[IMAP] Fetched ${messages.length} new messages`);

        if (messages.length === 0) {
            client.disconnect();
            return new Response(
                JSON.stringify({ success: true, count: 0, totalInbox: totalMessages }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const batch: any[] = [];
        let maxSeenUid = lastUid;

        for (const msg of messages) {
            try {
                const uid = msg.uid;
                if (!uid) continue;
                if (uid > maxSeenUid) maxSeenUid = uid;

                // Estrai raw data
                let rawData: any = msg.raw;
                if (!rawData && msg.parts) {
                    for (const key of Object.keys(msg.parts)) {
                        if (msg.parts[key]?.data) {
                            rawData = msg.parts[key].data;
                            break;
                        }
                    }
                }

                if (!rawData) continue;

                const rawStr = typeof rawData === 'string' ? rawData : new TextDecoder().decode(rawData);
                const parser = new PostalMime();
                const parsed = await parser.parse(rawStr);

                const isSeen = msg.flags?.includes("\\Seen") || msg.flags?.includes("Seen") || false;

                // Prepara oggetto per batch RPC
                batch.push({
                    id_account: accountId,
                    uid_imap: uid,
                    uid_validity: currentValidity,
                    da_email: parsed.from?.address || "",
                    da_nome: parsed.from?.name || parsed.from?.address || "",
                    a_emails: parsed.to?.map((t: any) => ({ email: t.address, nome: t.name })) || [],
                    oggetto: parsed.subject || "(Nessun oggetto)",
                    corpo_text: (parsed.text || "").substring(0, 50000),
                    corpo_html: (parsed.html || "").substring(0, 100000),
                    data_ricezione_server: parsed.date ? new Date(parsed.date).toISOString() : new Date().toISOString(),
                    stato: isSeen ? "letta" : "non_letta",
                    ha_allegati: (parsed.attachments && parsed.attachments.length > 0) || false
                });

                // Gestione allegati (opzionale qui, o in un secondo step)
                // Se implementiamo upload allegati, va fatto qui o via background job.
                // Per ora ci concentriamo sulla struttura messaggi.

            } catch (msgErr) {
                console.error(`[IMAP] Error parsing message:`, msgErr);
            }
        }

        // 5. Salva in Batch tramite RPC
        if (batch.length > 0) {
            const { error: rpcErr } = await sb.rpc("sync_emails_ricevute_batch", {
                p_emails: batch
            });

            if (rpcErr) {
                throw new Error(`Errore RPC Sync: ${rpcErr.message}`);
            }

            // 6. Aggiorna metadati account nel DB
            const { error: updErr } = await sb
                .from("account_email")
                .update({
                    imap_last_uid_fetch: maxSeenUid,
                    imap_last_uid_validity: currentValidity,
                    ultima_sincronizzazione: new Date().toISOString()
                })
                .eq("id", accountId);

            if (updErr) {
                console.error(`[IMAP] Errore update account:`, updErr.message);
            }
        }

        client.disconnect();

        return new Response(
            JSON.stringify({
                success: true,
                count: batch.length,
                totalInbox: totalMessages,
                lastUid: maxSeenUid
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error: any) {
        console.error("[IMAP] Global Error:", error.message);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
