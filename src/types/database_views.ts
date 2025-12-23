export interface SedeNested {
    id_sede?: string;
    nome_sede: string;
    indirizzo: string;
    citta: string;
    cap: string;
    provincia: string;
    is_legale?: boolean;
    is_operativa?: boolean;
}

export interface ContattoNested {
    id_contatto: string;
    nome: string;
    email: string;
    telefono: string;
    is_referente: boolean;
    is_aziendale: boolean;
}

export interface AnagraficaComplete {
    id_anagrafica: string;
    ragione_sociale: string;
    partita_iva: string | null;
    is_cliente: boolean;
    is_fornitore: boolean;
    is_owner: boolean;
    pec: string | null;
    codice_univoco: string | null;
    iban: string | null;
    modalita_pagamento_default: string | null;
    esente_iva: boolean;
    sede_legale: SedeNested | null;
    sedi: SedeNested[];
    contatti: ContattoNested[];
}

export interface OwnerInfo {
    id_anagrafica: string;
    ragione_sociale: string;
    partita_iva: string | null;
    pec: string | null;
    iban: string | null;
    codice_univoco: string | null;
    sede_legale_indirizzo: string | null;
    sede_legale_citta: string | null;
    sede_legale_cap: string | null;
    sede_legale_provincia: string | null;
    contatto_email: string | null;
    contatto_telefono: string | null;
}

export interface MezzoCompleto {
    id_mezzo: string;
    id_anagrafica: string;
    id_sede_assegnata: string | null;
    marca: string | null;
    modello: string | null;
    matricola: string | null;
    id_interno: string | null;
    stato_funzionamento: "funzionante" | "intervenire" | "ritirare" | null;
    stato_funzionamento_descrizione: string | null;
    is_cancellato: boolean;
    created_at: string;
    // Dati Sede Assegnata
    nome_sede_ubicazione: string | null;
    sede_ubicazione_citta: string | null;
    sede_ubicazione_indirizzo: string | null;
    // Dati Proprietario (Anagrafica)
    ragione_sociale: string | null;
}

export interface StoricoNoleggioView {
    id_storico: string;
    id_noleggio: string;
    data_evento: string;
    tipo_evento: "terminazione" | "cambio_sede" | "cancellazione" | "riattivazione";
    note: string | null;
    created_at: string;
    // Snapshot Data
    mezzo_descrizione: string | null;
    ragione_sociale_cliente: string | null;
    sede_operativa_descrizione: string | null;
    data_inizio: string | null;
    data_fine: string | null;
    data_fine_periodo: string | null;
    data_terminazione_effettiva: string | null;
    tempo_indeterminato: boolean | null;
    prezzo_noleggio: number | null;
    prezzo_trasporto: number | null;
    tipo_canone: "giornaliero" | "mensile" | null;
    is_terminato: boolean | null;
}

export interface PreventivoCompletoView {
    id_preventivo: string;
    id_anagrafica: string;
    id_mezzo: string | null;
    data_inizio: string | null;
    data_fine: string | null;
    tempo_indeterminato: boolean;
    prezzo_noleggio: number | null;
    prezzo_trasporto: number | null;
    tipo_canone: "giornaliero" | "mensile" | null;
    note: string | null;
    stato: "bozza" | "inviato" | "approvato" | "rifiutato" | "concluso" | "archiviato";
    codice: string | null;
    pdf_bozza_path: string | null;
    pdf_firmato_path: string | null;
    convertito_in_noleggio_id: string | null;
    created_at: string;
    // Dati Cliente
    cliente_ragione_sociale: string | null;
    cliente_piva: string | null;
    cliente_email: string | null;
    cliente_telefono: string | null;
    // Dati Mezzo
    marca: string | null;
    modello: string | null;
    matricola: string | null;
    // Noleggio Correlato
    noleggio_is_terminato: boolean | null;
}
