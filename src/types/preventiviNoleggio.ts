// Enum for strict typing
export enum StatoPreventivo {
  BOZZA = "bozza",
  INVIATO = "inviato",
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
  pdf_bozza_path: string | null;
  pdf_firmato_path: string | null;
  convertito_in_noleggio_id?: string | null;
  created_at: string;
  updated_at: string | null;
  Anagrafiche?: {
    ragione_sociale?: string | null;
  } | null;
  Mezzi?: {
    matricola?: string | null;
    marca?: string | null;
    modello?: string | null;
  } | null;
  Noleggi?: {
    is_terminato: boolean;
  } | null;
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
