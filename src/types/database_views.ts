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
