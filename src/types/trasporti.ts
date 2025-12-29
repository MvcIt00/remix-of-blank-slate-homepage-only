// ============================================================================
// TYPES: Trasporti Module
// Generated from DB schema (verified 2025-12-28)
// Aligned with ARCHITECTURE_TRASPORTI.md
// ============================================================================

/**
 * Trasporto - Universal Economic Ledger for transport events
 * Table: public.trasporti
 */
export interface Trasporti {
    id_trasporto: string;
    id_mezzo: string | null;
    id_vettore: string | null;
    id_sede_partenza: string | null;  // FK to Sedi (NOT config_trasporti_zone)
    id_sede_arrivo: string | null;    // FK to Sedi (NOT config_trasporti_zone)
    stato: 'richiesto' | 'confermato' | 'completato';
    data_programmata: string | null; // ISO timestamp
    data_effettiva: string | null; // ISO timestamp
    prezzo_cliente: number | null;
    costo_vettore: number | null;
    metadata: TrasportoMetadata;
    is_cancellato: boolean;
    note: string | null;
    created_at: string; // ISO timestamp
    updated_at: string; // ISO timestamp
}

/**
 * Metadata JSONB structure for fiscal immutability
 */
export interface TrasportoMetadata {
    mezzo?: {
        seriale: string;
        marca: string;
        modello: string;
        targa: string;
    };
    vettore?: {
        ragione_sociale: string;
        nome: string;
        cognome: string;
    };
    sede_partenza?: {
        nome: string;
        indirizzo: string;
        citta: string;
        anagrafica: string;
    };
    sede_arrivo?: {
        nome: string;
        indirizzo: string;
        citta: string;
        anagrafica: string;
    };
    noleggio?: {
        numero: string;
        cliente: string;
        data_inizio: string;
        data_fine: string;
    };
}

/**
 * Bridge table: Noleggi ↔ Trasporti (N:N)
 * Table: public.noleggi_trasporti
 */
export interface NoleggioTrasporto {
    id_noleggio: string;
    id_trasporto: string;
    created_at: string; // ISO timestamp
}

/**
 * Insert payload for creating new trasporto
 */
export interface TrasportoInsert {
    id_mezzo?: string;
    id_vettore?: string;
    id_sede_partenza?: string;
    id_sede_arrivo?: string;
    stato?: 'richiesto' | 'confermato' | 'completato';
    data_programmata?: string;
    data_effettiva?: string;
    prezzo_cliente?: number;
    costo_vettore?: number;
    note?: string;
    // metadata is auto-populated by trigger
}

/**
 * Update payload for existing trasporto
 */
export interface TrasportoUpdate {
    id_vettore?: string;
    id_sede_partenza?: string;
    id_sede_arrivo?: string;
    stato?: 'richiesto' | 'confermato' | 'completato';
    data_programmata?: string;
    data_effettiva?: string;
    prezzo_cliente?: number;
    costo_vettore?: number;
    note?: string;
}

/**
 * Extended Trasporto with joined data for UI display
 */
export interface TrasportoWithRelations extends Trasporti {
    mezzo?: {
        marca: string;
        modello: string;
        matricola: string;
    };
    vettore?: {
        ragione_sociale: string;
    };
    sede_partenza?: {
        nome_sede: string;
        citta: string;
    };
    sede_arrivo?: {
        nome_sede: string;
        citta: string;
    };
    noleggi?: Array<{
        id_noleggio: string;
        id_anagrafica: string;
    }>;
}
