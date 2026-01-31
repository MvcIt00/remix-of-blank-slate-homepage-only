/**
 * 🏛️ NoleggioStorageProvider (Storage Facade)
 * Centralizza la logica di gestione dei percorsi per il bucket noleggio_docs.
 * Elimina l'hardcoding nei componenti e garantisce la coerenza dell'architettura.
 */

import { supabase } from "@/integrations/supabase/client";

export const NOLEGGIO_BUCKET = "noleggio_docs";

export type NoleggioPathType =
    | "PREVENTIVO_BOZZA"       // PDF bozza (non ancora firmato)
    | "PREVENTIVO_FIRMATO"
    | "PREVENTIVO_VERSIONE"  // Per archiviare versioni storiche PDF
    | "CONTRATTO_BOZZA"       // PDF bozza contratto (non ancora firmato)
    | "CONTRATTO_FIRMATO"
    | "STATIC_ASSETS";

/**
 * Genera il percorso corretto per un documento nel silo noleggio.
 * @param type - Tipo di documento
 * @param identifier - Identificatore (es. codice preventivo)
 * @param timestamp - Timestamp opzionale (default: Date.now())
 * @param version - Numero versione opzionale (per PREVENTIVO_VERSIONE)
 */
export function getNoleggioPath(
    type: NoleggioPathType,
    identifier: string,
    timestamp?: number,
    version?: number
): string {
    const ts = timestamp || Date.now();
    const cleanId = identifier.replace(/\//g, "-"); // Normalizzazione per i codici con '/'

    switch (type) {
        case "PREVENTIVO_BOZZA":
            return `preventivi/bozze/preventivo_${cleanId}_${ts}.pdf`;

        case "PREVENTIVO_FIRMATO":
            return `preventivi/firmati/preventivo_firmato_${cleanId}_${ts}.pdf`;

        case "PREVENTIVO_VERSIONE":
            // Archivia versioni storiche in cartella dedicata
            // Formato: preventivi/versioni/PN-2025-00001-V1_timestamp.pdf
            const versionSuffix = version ? `-V${version}` : '';
            return `preventivi/versioni/${cleanId}${versionSuffix}_${ts}.pdf`;

        case "CONTRATTO_BOZZA":
            return `contratti/bozze/contratto_${cleanId}_${ts}.pdf`;

        case "CONTRATTO_FIRMATO":
            return `contratti/firmati/contratto_firmato_${cleanId}_${ts}.pdf`;

        case "STATIC_ASSETS":
            return `static/${identifier}`; // identifier = nome file (es. condizioni.pdf)

        default:
            throw new Error(`Tipo di percorso storage non supportato: ${type}`);
    }
}

/**
 * Genera un Signed URL valido per accedere a un file nel bucket noleggio_docs.
 * Validità: 5 minuti.
 */
export async function createNoleggioSignedUrl(path: string): Promise<string> {
    const { data, error } = await supabase.storage
        .from(NOLEGGIO_BUCKET)
        .createSignedUrl(path, 60 * 5); // 5 minuti

    if (error) throw error;
    if (!data?.signedUrl) throw new Error("Errore generazione Signed URL");

    return data.signedUrl;
}

/**
 * Upload centralizzato di PDF preventivo su Supabase Storage
 * @param blob - Blob del PDF generato
 * @param preventivoId - ID del preventivo
 * @param codice - Codice preventivo (es. PN-2025-00001-V1)
 * @param isVersionArchive - Se true, salva come versione archiviata
 * @param versione - Numero versione (opzionale, per archivio)
 * @returns Path del file caricato
 */
export async function uploadPreventivoPDF(
    blob: Blob,
    preventivoId: string,
    codice: string,
    isVersionArchive: boolean = false,
    versione?: number
): Promise<string> {
    const type: NoleggioPathType = isVersionArchive ? "PREVENTIVO_VERSIONE" : "PREVENTIVO_BOZZA";
    const path = getNoleggioPath(
        type,
        codice || preventivoId,
        Date.now(),
        versione
    );

    const { error } = await supabase.storage
        .from(NOLEGGIO_BUCKET)
        .upload(path, blob, {
            contentType: 'application/pdf',
            upsert: true // Sovrascrive se esiste già
        });

    if (error) throw error;
    return path;
}

/**
 * Upload centralizzato di PDF contratto su Supabase Storage
 * @param blob - Blob del PDF generato
 * @param contrattoId - ID del contratto
 * @param codice - Codice contratto (es. CNT-2026-00001)
 * @returns Path del file caricato
 */
export async function uploadContrattoPDF(
    blob: Blob,
    contrattoId: string,
    codice: string
): Promise<string> {
    const path = getNoleggioPath(
        "CONTRATTO_BOZZA",
        codice || contrattoId,
        Date.now()
    );

    const { error } = await supabase.storage
        .from(NOLEGGIO_BUCKET)
        .upload(path, blob, {
            contentType: 'application/pdf',
            upsert: true // Sovrascrive se esiste già
        });

    if (error) throw error;
    return path;
}
