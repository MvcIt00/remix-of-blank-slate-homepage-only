// Enum for strict typing - allineato con DB enum stato_preventivo
export enum StatoPreventivo {
  BOZZA = "bozza",
  INVIATO = "inviato",
  SCADUTO = "scaduto", // Preventivo inviato che ha superato data_scadenza senza risposta
  IN_REVISIONE = "in_revisione",
  APPROVATO = "approvato",
  RIFIUTATO = "rifiutato",
  CONCLUSO = "concluso",
  ARCHIVIATO = "archiviato",
}

export interface PreventivoNoleggio {
  id_preventivo: string;
  id_mezzo: string;
  id_anagrafica: string;
  id_anagrafica_fornitore?: string | null;
  data_inizio: string | null;
  data_fine: string | null;
  tempo_indeterminato: boolean;
  prezzo_noleggio: number | null;
  prezzo_trasporto: number | null;
  tipo_canone: "giornaliero" | "mensile" | null;
  note: string | null;
  sede_operativa: string | null;
  stato: StatoPreventivo; // Use Enum
  codice: string | null;
  pdf_firmato_path: string | null;
  convertito_in_noleggio_id?: string | null;
  created_at: string;
  updated_at: string | null;
  Anagrafiche?: {
    ragione_sociale?: string | null;
    partita_iva?: string | null;
    cod_fiscale?: string | null;
    email?: string | null;
    telefono?: string | null;
    pec?: string | null;
    codice_univoco?: string | null;
    indirizzo?: string | null;
    citta?: string | null;
    cap?: string | null;
    provincia?: string | null;
  } | null;
  Mezzi?: {
    matricola?: string | null;
    marca?: string | null;
    modello?: string | null;
    anno?: number | string | null;
    ore?: number | null;
  } | null;
  Noleggi?: {
    is_terminato: boolean;
  } | null;
  Sedi?: {
    nome_sede?: string | null;
    indirizzo?: string | null;
    citta?: string | null;
    cap?: string | null;
    provincia?: string | null;
  } | null;
  dati_azienda?: any | null; // Logica Dinamica Owner MVC
}

export interface PreventivoNoleggioInput {
  id_mezzo: string;
  id_anagrafica: string;
  id_anagrafica_fornitore?: string | null;
  sede_operativa?: string | null;
  data_inizio: string | null;
  data_fine: string | null;
  tempo_indeterminato: boolean;
  prezzo_noleggio: number | null;
  prezzo_trasporto: number | null;
  tipo_canone: "giornaliero" | "mensile" | null;
  note?: string | null;
  stato?: StatoPreventivo; // Use Enum
}
