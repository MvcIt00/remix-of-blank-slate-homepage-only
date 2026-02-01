import { useMemo } from "react";

export interface EmailThread {
    id: string;
    emails: any[];
    latest: any;
    count: number;
}

/**
 * Hook per unificare emails ricevute + inviate e raggrupparle per conversazione
 */
export function useEmailThreads(emailsRicevute: any[] = [], emailsInviate: any[] = []) {
    return useMemo(() => {
        // Merge ricevute + inviate
        const allEmails = [
            ...emailsRicevute.map(e => ({
                ...e,
                direzione: 'ricevuta',
                // Usa data_ricezione_server per ricevute
                dataOrd: e.data_ricezione_server || e.data_creazione
            })),
            ...emailsInviate.map(e => ({
                ...e,
                direzione: 'inviata',
                // Usa data_invio_effettiva o data_creazione per inviate
                dataOrd: e.data_invio_effettiva || e.data_creazione
            }))
        ];

        // Helper per normalizzare l'oggetto
        const normalizeSubject = (s: string) => {
            if (!s) return "";
            return s.replace(/^(Re|Fwd|AW|WG|R|Vs|Risposta|Inoltro|Rif):\s*/gi, "")
                .replace(/\s+/g, " ")
                .trim()
                .toLowerCase();
        };

        // Raggruppa emails
        const threadMap = new Map<string, any[]>();
        const subjectToThreadId = new Map<string, string>();
        const messageIdToThreadId = new Map<string, string>();

        // Prima passata: Gruppi forti (id_conversazione) e build indici
        allEmails.forEach(email => {
            if (email.id_conversazione) {
                if (!threadMap.has(email.id_conversazione)) {
                    threadMap.set(email.id_conversazione, []);
                }
                threadMap.get(email.id_conversazione)!.push(email);

                if (email.message_id) messageIdToThreadId.set(email.message_id, email.id_conversazione);
                const normSub = normalizeSubject(email.oggetto);
                if (normSub) subjectToThreadId.set(normSub, email.id_conversazione);
            }
        });

        // Seconda passata: Orfani (no id_conversazione)
        allEmails.forEach(email => {
            if (email.id_conversazione) return;

            let targetThreadId: string | undefined;

            // 1. Prova via in_reply_to
            if (email.in_reply_to && messageIdToThreadId.has(email.in_reply_to)) {
                targetThreadId = messageIdToThreadId.get(email.in_reply_to);
            }
            // 2. Prova via Soggetto Normalizzato
            if (!targetThreadId) {
                const normSub = normalizeSubject(email.oggetto);
                if (normSub && subjectToThreadId.has(normSub)) {
                    targetThreadId = subjectToThreadId.get(normSub);
                }
            }

            // Se trovato un thread esistente, aggiungilo
            if (targetThreadId) {
                threadMap.get(targetThreadId)!.push(email);
                if (email.message_id) messageIdToThreadId.set(email.message_id, targetThreadId);
            } else {
                // Altrimenti crea un nuovo thread "virtuale" basato sull'oggetto o ID
                const normSub = normalizeSubject(email.oggetto);
                const virtualId = normSub ? `sub-${normSub}` : email.id;

                if (!threadMap.has(virtualId)) {
                    threadMap.set(virtualId, []);
                }
                threadMap.get(virtualId)!.push(email);

                if (email.message_id) messageIdToThreadId.set(email.message_id, virtualId);
                if (normSub) subjectToThreadId.set(normSub, virtualId);
            }
        });

        // Trasforma in array di thread
        const threads: EmailThread[] = Array.from(threadMap.entries()).map(([id, emails]) => {
            // Ordina le email del thread cronologicamente (oldest first)
            const sortedEmails = [...emails].sort((a, b) =>
                new Date(a.dataOrd).getTime() - new Date(b.dataOrd).getTime()
            );

            return {
                id,
                emails: sortedEmails,
                latest: sortedEmails[sortedEmails.length - 1], // Ultima email
                count: sortedEmails.length
            };
        });

        // Ordina i thread per data ultima email (newest first)
        return threads.sort((a, b) =>
            new Date(b.latest.dataOrd).getTime() - new Date(a.latest.dataOrd).getTime()
        );
    }, [emailsRicevute, emailsInviate]);
}
