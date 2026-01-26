/**
 * 🏛️ NoleggioStorageProvider (Storage Facade)
 * Centralizza la logica di gestione dei percorsi per il bucket noleggio_docs.
 * Elimina l'hardcoding nei componenti e garantisce la coerenza dell'architettura.
 */

export const NOLEGGIO_BUCKET = "noleggio_docs";

export type NoleggioPathType =
    | "PREVENTIVO_FIRMATO"
    | "PREVENTIVO_VERSIONE"  // Per archiviare versioni storiche PDF
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
        case "PREVENTIVO_FIRMATO":
            return `preventivi/firmati/preventivo_firmato_${cleanId}_${ts}.pdf`;

        case "PREVENTIVO_VERSIONE":
            // Archivia versioni storiche in cartella dedicata
            // Formato: preventivi/versioni/PN-2025-00001-V1_timestamp.pdf
            const versionSuffix = version ? `-V${version}` : '';
            return `preventivi/versioni/${cleanId}${versionSuffix}_${ts}.pdf`;

        case "CONTRATTO_FIRMATO":
            return `contratti/firmati/contratto_firmato_${cleanId}_${ts}.pdf`;

        case "STATIC_ASSETS":
            return `static/${identifier}`; // identifier = nome file (es. condizioni.pdf)

        default:
            throw new Error(`Tipo di percorso storage non supportato: ${type}`);
    }
}

/**
 * Helper per generare l'URL pubblico (per iframe o download diretti)
 */
export function getNoleggioPublicUrl(path: string): string {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/${NOLEGGIO_BUCKET}/${path}`;
}
