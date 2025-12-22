export type CategoriaUscita = "Spese Bancarie" | "Fornitori" | "Tasse/Imposte" | "Varie";
export type TipoMovimento = "BONIFICO" | "RICEVUTA_BANCARIA" | "ASSEGNO" | "CONTANTI" | "ALTRO";
export type TipoTransazione = "ENTRATA" | "USCITA" | "TRASFERIMENTO";
export type FormTransactionType = "ENTRATA" | "USCITA" | "GIROCONTO";

export interface BankAccount {
  id: string;
  nome: string;
  nome_banca: string;
  iban: string | null;
  saldo_attuale: number;
  creato_il: string;
  aggiornato_il: string;
}

export interface Transaction {
  id: string;
  tipo: TipoTransazione;
  descrizione: string;
  importo: number;
  data_scadenza_originale: string;
  data_scadenza_mese: string;
  data_pagamento: string | null;
  tipo_movimento: TipoMovimento;
  data_deposito_riba: string | null;
  conto_bancario_id: string;
  transazione_collegata_id: string | null;
  note: string | null;
  creato_il: string;
  aggiornato_il: string;
  pagato: boolean;
  categoria_uscita: CategoriaUscita | null;
}
