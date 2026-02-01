/**
 * ⚠️ ARCHITETTURA NON CONVENZIONALE - LEGGERE PRIMA DI MODIFICARE ⚠️
 * 
 * Edge Function IMAP Fetch - v22
 * Implementazione Delta Sync (UID based) + Batching RPC + Threading Automatico + ALLEGATI
 * 
 * 🔴 CRITICAL: Leggere OBBLIGATORIAMENTE la documentazione architettuale prima di modificare:
 * 📄 File: ../../src/components/email/README.md
 * 
 * Questa funzione NON è un semplice IMAP fetcher. Implementa:
 * - Delta sync resiliente (fallback automatico su reset UID)
 * - Parsing header RFC per threading (Message-ID, In-Reply-To, References)
 * - Batch insert via RPC che crea/aggiorna CONVERSAZIONI automaticamente
 * - Estrazione e storage degli ALLEGATI in Supabase Storage + insert in allegati_email
 * 
 * Il sistema di threading dipende CRITICAMENTE dai campi message_id, in_reply_to, references_chain.
 * Modifiche ai nomi dei campi o alla logica di parsing possono rompere l'intero threading.
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

// Interfaccia per allegati estratti
interface ExtractedAttachment {
    filename: string;
    mimeType: string;
    content: Uint8Array;
    size: number;
    contentId: string | null;
    isInline: boolean;
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

        console.log(`[IMAP] Mailbox: INBOX, Messages: ${totalMessages}, Validity: ${currentValidity}`);

        // 3. Verifica Validità UID (se cambiata, resetta sync)
        if (currentValidity !== lastValidity) {
            console.log(`[IMAP] UIDValidity changed (${lastValidity} -> ${currentValidity}). Resetting sync.`);
            lastUid = 0;
            lastValidity = currentValidity;
        }

        // 4. Determina range da scaricare
        if (totalMessages === 0) {
            console.log("[IMAP] Mailbox is empty. Skipping fetch.");
            client.disconnect();
            return new Response(
                JSON.stringify({ success: true, count: 0, totalInbox: 0 }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        let fetchQuery: string;
        let useUid = false;

        if (lastUid === 0) {
            // Primo sync o reset: prendi gli ultimi N messaggi per sequenza
            const startSeq = Math.max(1, totalMessages - limit + 1);
            fetchQuery = `${startSeq}:${totalMessages}`;
            useUid = false; // Sequence numbers
        } else {
            // Delta sync: prendi tutto dal UID successivo
            // Usiamo UID FETCH lastUid+1:*
            fetchQuery = `${lastUid + 1}:*`;
            useUid = true; // UID numbers
        }

        console.log(`[IMAP] Fetching range: ${fetchQuery} (Mode: ${useUid ? 'UID' : 'SEQ'})`);

        // Esegui FETCH con fallback automatico
        let messages = [];
        try {
            messages = await client.fetch(fetchQuery, {
                envelope: true,
                flags: true,
                uid: true,
                full: true,
            }, { uid: useUid });
        } catch (fetchErr: any) {
            // Alcuni server IMAP (es. Libero, Yahoo) restituiscono "Invalid messageset" o "NOT FOUND"
            // se chiedi un range UID (es. 10:*) che non contiene alcun messaggio.
            // In questo caso non è un errore e non dobbiamo resettare il sync, ma solo dire che ci sono 0 messaggi.
            const isNoNewMessages = fetchErr.message?.includes("Invalid messageset") ||
                fetchErr.message?.includes("not found") ||
                fetchErr.message?.includes("None of the messages");

            if (isNoNewMessages) {
                console.log("[IMAP] No new messages in requested range.");
                messages = [];
            } else {
                throw fetchErr;
            }
        }

        console.log(`[IMAP] Fetched ${messages.length} messages`);

        if (messages.length === 0) {
            client.disconnect();

            // Aggiorna comunque la data di ultima sincronizzazione per l'account
            await sb.from("account_email").update({
                ultima_sincronizzazione: new Date().toISOString(),
                imap_last_uid_validity: currentValidity
            }).eq("id", accountId);

            return new Response(
                JSON.stringify({ success: true, count: 0, totalInbox: totalMessages }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // --- FILTRAGGIO EMAIL GIÀ PRESENTI (per conteggio toast accurato) ---
        // Recuperiamo gli UID presenti nel range fetchato per evitare di contare i duplicati nel toast
        const uidsInBatch = messages.map(m => m.uid).filter(u => !!u);
        const { data: existingUids } = await sb
            .from("emails_ricevute")
            .select("uid_imap")
            .eq("id_account", accountId)
            .eq("uid_validity", currentValidity)
            .in("uid_imap", uidsInBatch);

        const existingUidSet = new Set(existingUids?.map(r => r.uid_imap) || []);
        let actuallyNewCount = 0;

        const batch: any[] = [];
        let maxSeenUid = lastUid;

        // ========== ALLEGATI: Mappa per UID ==========
        const attachmentsByUid = new Map<number, ExtractedAttachment[]>();

        for (const msg of messages) {
            try {
                const uid = msg.uid;
                if (!uid) continue;
                if (uid > maxSeenUid) maxSeenUid = uid;

                // Controlla se è davvero nuova per il conteggio
                if (!existingUidSet.has(uid)) {
                    actuallyNewCount++;
                }

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

                // THREADING: Estrazione header RFC
                const messageId = parsed.messageId || null;
                const inReplyTo = parsed.inReplyTo || null;
                const references = parsed.references || [];

                // THREADING: Lookup/Create Conversazione tramite RPC
                const { data: convId, error: convErr } = await sb.rpc("get_or_create_conversation_by_refs", {
                    p_subject: parsed.subject || "(Nessun oggetto)",
                    p_message_id: messageId,
                    p_references: references,
                    p_id_anagrafica: null,
                    p_id_noleggio: null,
                    p_id_preventivo: null
                });

                if (convErr) {
                    console.error(`[IMAP] Errore threading per messaggio ${uid}:`, convErr.message);
                }

                // ========== ALLEGATI: Estrazione da parsed.attachments ==========
                if (parsed.attachments && parsed.attachments.length > 0) {
                    const extractedAtts: ExtractedAttachment[] = [];
                    for (const att of parsed.attachments) {
                        // att.content è già Uint8Array in postal-mime v2
                        const content = att.content instanceof Uint8Array
                            ? att.content
                            : new Uint8Array(att.content || []);

                        extractedAtts.push({
                            filename: att.filename || `unnamed_${Date.now()}`,
                            mimeType: att.mimeType || 'application/octet-stream',
                            content: content,
                            size: content.length,
                            contentId: att.contentId || null,
                            isInline: att.disposition === 'inline'
                        });
                    }
                    if (extractedAtts.length > 0) {
                        attachmentsByUid.set(uid, extractedAtts);
                        console.log(`[IMAP] Email UID ${uid}: ${extractedAtts.length} allegati estratti`);
                    }
                }

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
                    ha_allegati: (parsed.attachments && parsed.attachments.length > 0) || false,
                    message_id: messageId,
                    in_reply_to: inReplyTo,
                    references_chain: references,
                    id_conversazione: convId
                });

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

            // ========== ALLEGATI: Lookup ID email e salvataggio ==========
            if (attachmentsByUid.size > 0) {
                console.log(`[IMAP] Processing attachments for ${attachmentsByUid.size} emails...`);

                // Recupera gli ID delle email appena inserite
                const uidsWithAttachments = Array.from(attachmentsByUid.keys());
                const { data: insertedEmails, error: lookupErr } = await sb
                    .from('emails_ricevute')
                    .select('id, uid_imap')
                    .eq('id_account', accountId)
                    .eq('uid_validity', currentValidity)
                    .in('uid_imap', uidsWithAttachments);

                if (lookupErr) {
                    console.error('[IMAP] Errore lookup email per allegati:', lookupErr.message);
                } else if (insertedEmails && insertedEmails.length > 0) {
                    let totalUploaded = 0;
                    let totalFailed = 0;

                    for (const email of insertedEmails) {
                        const atts = attachmentsByUid.get(email.uid_imap);
                        if (!atts || atts.length === 0) continue;

                        for (const att of atts) {
                            try {
                                // Genera path univoco: accountId/emailId/filename
                                // Sanitizza filename per evitare problemi con caratteri speciali
                                const safeFilename = att.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
                                const storagePath = `${accountId}/${email.id}/${safeFilename}`;

                                // Upload a Storage
                                const { error: uploadErr } = await sb.storage
                                    .from('email-attachments')
                                    .upload(storagePath, att.content, {
                                        contentType: att.mimeType,
                                        upsert: true // Sovrascrive se esiste già
                                    });

                                if (uploadErr) {
                                    console.error(`[IMAP] Upload fallito per ${att.filename}:`, uploadErr.message);
                                    totalFailed++;
                                    continue;
                                }

                                // Insert in allegati_email
                                const { error: insertErr } = await sb
                                    .from('allegati_email')
                                    .insert({
                                        id_email_ricevuta: email.id,
                                        nome_file: att.filename,
                                        tipo_mime: att.mimeType,
                                        dimensione_bytes: att.size,
                                        storage_path: storagePath,
                                        content_id: att.contentId,
                                        is_inline: att.isInline
                                    });

                                if (insertErr) {
                                    console.error(`[IMAP] Insert allegato fallito:`, insertErr.message);
                                    totalFailed++;
                                } else {
                                    totalUploaded++;
                                }

                            } catch (attErr: any) {
                                console.error(`[IMAP] Errore processing allegato:`, attErr.message);
                                totalFailed++;
                            }
                        }
                    }

                    console.log(`[IMAP] Allegati: ${totalUploaded} salvati, ${totalFailed} falliti`);
                }
            }

            // 6. Aggiorna metadati account nel DB
            await sb
                .from("account_email")
                .update({
                    imap_last_uid_fetch: maxSeenUid,
                    imap_last_uid_validity: currentValidity,
                    ultima_sincronizzazione: new Date().toISOString()
                })
                .eq("id", accountId);
        }

        client.disconnect();

        return new Response(
            JSON.stringify({
                success: true,
                count: actuallyNewCount, // CONTEGGIO REALE PER IL TOAST
                totalInbox: totalMessages,
                lastUid: maxSeenUid,
                attachmentsProcessed: attachmentsByUid.size
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
