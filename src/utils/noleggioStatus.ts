/**
 * Utility centralizzata per calcolare lo stato di un noleggio
 * e generare le proprietà del badge corrispondente.
 */

export interface StatoNoleggioResult {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    className?: string;
}

export interface NoleggioData {
    stato_noleggio?: "futuro" | "attivo" | "scaduto" | "archiviato" | "terminato" | null;
    is_terminato?: boolean;
}

/**
 * Calcola lo stato del noleggio e restituisce le proprietà per il badge.
 * La logica è centralizzata per garantire consistenza visiva in tutta l'app.
 */
export function calcolaStatoNoleggio(noleggio: NoleggioData): StatoNoleggioResult {
    const stato = noleggio.stato_noleggio;

    if (stato === "terminato" || noleggio.is_terminato) {
        return { label: "Terminato", variant: "secondary" };
    }
    if (stato === "archiviato") {
        return { label: "Archiviato", variant: "outline" };
    }
    if (stato === "scaduto") {
        return {
            label: "Scaduto",
            variant: "outline",
            className: "border-orange-500 text-orange-600 bg-orange-50"
        };
    }
    if (stato === "futuro") {
        return { label: "Futuro", variant: "secondary" };
    }

    // Default / Attivo
    return {
        label: "Attivo",
        variant: "default",
        className: "bg-green-600 hover:bg-green-700"
    };
}

/**
 * Verifica se un mezzo è disponibile per un nuovo noleggio.
 * Un mezzo NON è disponibile se ha un noleggio attivo o futuro.
 */
export function isMezzoDisponibilePerNoleggio(noleggio: NoleggioData | null): boolean {
    // Nessun oggetto noleggio = disponibile
    if (!noleggio) return true;

    const stato = noleggio.stato_noleggio;

    // Nessuno stato (null/undefined) = nessun noleggio = disponibile
    if (!stato) return true;

    // Non disponibile se: attivo o futuro
    if (stato === "attivo" || stato === "futuro") return false;

    // Disponibile se: terminato, archiviato, o scaduto
    return true;
}
