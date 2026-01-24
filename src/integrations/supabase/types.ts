export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      an_contatti: {
        Row: {
          created_at: string
          email: string | null
          id_anagrafica: string
          id_contatto: string
          id_sede: string | null
          is_aziendale: boolean | null
          is_cancellato: boolean | null
          is_referente: boolean | null
          nome: string | null
          telefono: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id_anagrafica: string
          id_contatto?: string
          id_sede?: string | null
          is_aziendale?: boolean | null
          is_cancellato?: boolean | null
          is_referente?: boolean | null
          nome?: string | null
          telefono?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id_anagrafica?: string
          id_contatto?: string
          id_sede?: string | null
          is_aziendale?: boolean | null
          is_cancellato?: boolean | null
          is_referente?: boolean | null
          nome?: string | null
          telefono?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "an_contatti_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "an_contatti_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "an_contatti_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "an_contatti_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "an_contatti_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "an_contatti_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "an_contatti_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "an_contatti_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "an_contatti_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "an_contatti_id_sede_fkey"
            columns: ["id_sede"]
            isOneToOne: false
            referencedRelation: "sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "an_contatti_id_sede_fkey"
            columns: ["id_sede"]
            isOneToOne: false
            referencedRelation: "Sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "an_contatti_id_sede_fkey"
            columns: ["id_sede"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_sede_operativa"]
          },
          {
            foreignKeyName: "an_contatti_id_sede_fkey"
            columns: ["id_sede"]
            isOneToOne: false
            referencedRelation: "vw_sedi_per_anagrafica"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "an_contatti_id_sede_fkey"
            columns: ["id_sede"]
            isOneToOne: false
            referencedRelation: "vw_sedi_tutte"
            referencedColumns: ["id_sede"]
          },
        ]
      }
      an_dati_amministrativi: {
        Row: {
          codice_univoco: string | null
          created_at: string
          esente_iva: boolean | null
          iban: string | null
          id_anagrafica: string
          is_cancellato: boolean | null
          pagamento: string | null
          partita_iva_estera: string | null
          pec: string | null
          prezzo_manodopera: number | null
        }
        Insert: {
          codice_univoco?: string | null
          created_at?: string
          esente_iva?: boolean | null
          iban?: string | null
          id_anagrafica: string
          is_cancellato?: boolean | null
          pagamento?: string | null
          partita_iva_estera?: string | null
          pec?: string | null
          prezzo_manodopera?: number | null
        }
        Update: {
          codice_univoco?: string | null
          created_at?: string
          esente_iva?: boolean | null
          iban?: string | null
          id_anagrafica?: string
          is_cancellato?: boolean | null
          pagamento?: string | null
          partita_iva_estera?: string | null
          pec?: string | null
          prezzo_manodopera?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "an_dati_amministrativi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "an_dati_amministrativi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "an_dati_amministrativi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "an_dati_amministrativi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "an_dati_amministrativi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "an_dati_amministrativi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "an_dati_amministrativi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "an_dati_amministrativi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "an_dati_amministrativi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
        ]
      }
      Anagrafiche: {
        Row: {
          created_at: string | null
          id_anagrafica: string
          is_cancellato: boolean | null
          is_cliente: boolean | null
          is_fornitore: boolean | null
          is_owner: boolean | null
          partita_iva: string | null
          ragione_sociale: string
          richiede_contratto_noleggio: boolean | null
        }
        Insert: {
          created_at?: string | null
          id_anagrafica?: string
          is_cancellato?: boolean | null
          is_cliente?: boolean | null
          is_fornitore?: boolean | null
          is_owner?: boolean | null
          partita_iva?: string | null
          ragione_sociale: string
          richiede_contratto_noleggio?: boolean | null
        }
        Update: {
          created_at?: string | null
          id_anagrafica?: string
          is_cancellato?: boolean | null
          is_cliente?: boolean | null
          is_fornitore?: boolean | null
          is_owner?: boolean | null
          partita_iva?: string | null
          ragione_sociale?: string
          richiede_contratto_noleggio?: boolean | null
        }
        Relationships: []
      }
      conti_bancari: {
        Row: {
          aggiornato_il: string
          creato_il: string
          iban: string | null
          id: string
          nome: string
          nome_banca: string
          saldo_attuale: number
        }
        Insert: {
          aggiornato_il?: string
          creato_il?: string
          iban?: string | null
          id?: string
          nome: string
          nome_banca: string
          saldo_attuale?: number
        }
        Update: {
          aggiornato_il?: string
          creato_il?: string
          iban?: string | null
          id?: string
          nome?: string
          nome_banca?: string
          saldo_attuale?: number
        }
        Relationships: []
      }
      contratti_noleggio: {
        Row: {
          canone_noleggio: number | null
          clausole_speciali: string | null
          codice_contratto: string
          costo_trasporto: number | null
          created_at: string | null
          data_creazione: string | null
          data_fine: string | null
          data_firma: string | null
          data_inizio: string
          data_invio: string | null
          dati_cliente: Json
          dati_fornitore: Json
          dati_mezzo: Json
          deposito_cauzionale: number | null
          id_anagrafica_cliente: string
          id_anagrafica_fornitore: string
          id_contratto: string
          id_noleggio: string
          is_cancellato: boolean | null
          modalita_pagamento:
            | Database["public"]["Enums"]["modalita_pagamento"]
            | null
          note_interne: string | null
          pdf_bozza_path: string | null
          pdf_firmato_path: string | null
          stato_contratto: Database["public"]["Enums"]["stato_contratto"] | null
          tempo_indeterminato: boolean | null
          termini_pagamento: string | null
          tipo_canone: Database["public"]["Enums"]["tipo_canone"] | null
        }
        Insert: {
          canone_noleggio?: number | null
          clausole_speciali?: string | null
          codice_contratto: string
          costo_trasporto?: number | null
          created_at?: string | null
          data_creazione?: string | null
          data_fine?: string | null
          data_firma?: string | null
          data_inizio: string
          data_invio?: string | null
          dati_cliente: Json
          dati_fornitore: Json
          dati_mezzo: Json
          deposito_cauzionale?: number | null
          id_anagrafica_cliente: string
          id_anagrafica_fornitore: string
          id_contratto?: string
          id_noleggio: string
          is_cancellato?: boolean | null
          modalita_pagamento?:
            | Database["public"]["Enums"]["modalita_pagamento"]
            | null
          note_interne?: string | null
          pdf_bozza_path?: string | null
          pdf_firmato_path?: string | null
          stato_contratto?:
            | Database["public"]["Enums"]["stato_contratto"]
            | null
          tempo_indeterminato?: boolean | null
          termini_pagamento?: string | null
          tipo_canone?: Database["public"]["Enums"]["tipo_canone"] | null
        }
        Update: {
          canone_noleggio?: number | null
          clausole_speciali?: string | null
          codice_contratto?: string
          costo_trasporto?: number | null
          created_at?: string | null
          data_creazione?: string | null
          data_fine?: string | null
          data_firma?: string | null
          data_inizio?: string
          data_invio?: string | null
          dati_cliente?: Json
          dati_fornitore?: Json
          dati_mezzo?: Json
          deposito_cauzionale?: number | null
          id_anagrafica_cliente?: string
          id_anagrafica_fornitore?: string
          id_contratto?: string
          id_noleggio?: string
          is_cancellato?: boolean | null
          modalita_pagamento?:
            | Database["public"]["Enums"]["modalita_pagamento"]
            | null
          note_interne?: string | null
          pdf_bozza_path?: string | null
          pdf_firmato_path?: string | null
          stato_contratto?:
            | Database["public"]["Enums"]["stato_contratto"]
            | null
          tempo_indeterminato?: boolean | null
          termini_pagamento?: string | null
          tipo_canone?: Database["public"]["Enums"]["tipo_canone"] | null
        }
        Relationships: [
          {
            foreignKeyName: "contratti_noleggio_id_anagrafica_cliente_fkey"
            columns: ["id_anagrafica_cliente"]
            isOneToOne: false
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "contratti_noleggio_id_anagrafica_cliente_fkey"
            columns: ["id_anagrafica_cliente"]
            isOneToOne: false
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "contratti_noleggio_id_anagrafica_cliente_fkey"
            columns: ["id_anagrafica_cliente"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "contratti_noleggio_id_anagrafica_cliente_fkey"
            columns: ["id_anagrafica_cliente"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "contratti_noleggio_id_anagrafica_cliente_fkey"
            columns: ["id_anagrafica_cliente"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "contratti_noleggio_id_anagrafica_cliente_fkey"
            columns: ["id_anagrafica_cliente"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "contratti_noleggio_id_anagrafica_cliente_fkey"
            columns: ["id_anagrafica_cliente"]
            isOneToOne: false
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "contratti_noleggio_id_anagrafica_cliente_fkey"
            columns: ["id_anagrafica_cliente"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "contratti_noleggio_id_anagrafica_cliente_fkey"
            columns: ["id_anagrafica_cliente"]
            isOneToOne: false
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "contratti_noleggio_id_anagrafica_fornitore_fkey"
            columns: ["id_anagrafica_fornitore"]
            isOneToOne: false
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "contratti_noleggio_id_anagrafica_fornitore_fkey"
            columns: ["id_anagrafica_fornitore"]
            isOneToOne: false
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "contratti_noleggio_id_anagrafica_fornitore_fkey"
            columns: ["id_anagrafica_fornitore"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "contratti_noleggio_id_anagrafica_fornitore_fkey"
            columns: ["id_anagrafica_fornitore"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "contratti_noleggio_id_anagrafica_fornitore_fkey"
            columns: ["id_anagrafica_fornitore"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "contratti_noleggio_id_anagrafica_fornitore_fkey"
            columns: ["id_anagrafica_fornitore"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "contratti_noleggio_id_anagrafica_fornitore_fkey"
            columns: ["id_anagrafica_fornitore"]
            isOneToOne: false
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "contratti_noleggio_id_anagrafica_fornitore_fkey"
            columns: ["id_anagrafica_fornitore"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "contratti_noleggio_id_anagrafica_fornitore_fkey"
            columns: ["id_anagrafica_fornitore"]
            isOneToOne: false
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "contratti_noleggio_id_noleggio_fkey"
            columns: ["id_noleggio"]
            isOneToOne: false
            referencedRelation: "noleggi"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "contratti_noleggio_id_noleggio_fkey"
            columns: ["id_noleggio"]
            isOneToOne: false
            referencedRelation: "Noleggi"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "contratti_noleggio_id_noleggio_fkey"
            columns: ["id_noleggio"]
            isOneToOne: false
            referencedRelation: "vw_card_mezzo"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "contratti_noleggio_id_noleggio_fkey"
            columns: ["id_noleggio"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_disponibili_noleggio"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "contratti_noleggio_id_noleggio_fkey"
            columns: ["id_noleggio"]
            isOneToOne: false
            referencedRelation: "vw_mezzo_noleggi_attivi"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "contratti_noleggio_id_noleggio_fkey"
            columns: ["id_noleggio"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "contratti_noleggio_id_noleggio_fkey"
            columns: ["id_noleggio"]
            isOneToOne: false
            referencedRelation: "vw_storico_noleggi"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "contratti_noleggio_id_noleggio_fkey"
            columns: ["id_noleggio"]
            isOneToOne: false
            referencedRelation: "vw_storico_noleggi"
            referencedColumns: ["id_storico"]
          },
        ]
      }
      cose_varie: {
        Row: {
          created_at: string | null
          descrizione: string | null
          id: string
          is_cancellato: boolean | null
          nome: string
        }
        Insert: {
          created_at?: string | null
          descrizione?: string | null
          id?: string
          is_cancellato?: boolean | null
          nome: string
        }
        Update: {
          created_at?: string | null
          descrizione?: string | null
          id?: string
          is_cancellato?: boolean | null
          nome?: string
        }
        Relationships: []
      }
      document_sequences: {
        Row: {
          current_value: number
          doc_type: string
          id: string
          updated_at: string | null
          year: number
        }
        Insert: {
          current_value?: number
          doc_type: string
          id?: string
          updated_at?: string | null
          year: number
        }
        Update: {
          current_value?: number
          doc_type?: string
          id?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      documenti_noleggio: {
        Row: {
          created_at: string | null
          data_documento: string | null
          descrizione: string | null
          dimensione_bytes: number | null
          file_path: string
          id_documento: string
          id_noleggio: string
          is_cancellato: boolean | null
          nome_file_originale: string | null
          tipo_documento: Database["public"]["Enums"]["tipo_documento_noleggio"]
        }
        Insert: {
          created_at?: string | null
          data_documento?: string | null
          descrizione?: string | null
          dimensione_bytes?: number | null
          file_path: string
          id_documento?: string
          id_noleggio: string
          is_cancellato?: boolean | null
          nome_file_originale?: string | null
          tipo_documento: Database["public"]["Enums"]["tipo_documento_noleggio"]
        }
        Update: {
          created_at?: string | null
          data_documento?: string | null
          descrizione?: string | null
          dimensione_bytes?: number | null
          file_path?: string
          id_documento?: string
          id_noleggio?: string
          is_cancellato?: boolean | null
          nome_file_originale?: string | null
          tipo_documento?: Database["public"]["Enums"]["tipo_documento_noleggio"]
        }
        Relationships: [
          {
            foreignKeyName: "documenti_noleggio_id_noleggio_fkey"
            columns: ["id_noleggio"]
            isOneToOne: false
            referencedRelation: "noleggi"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "documenti_noleggio_id_noleggio_fkey"
            columns: ["id_noleggio"]
            isOneToOne: false
            referencedRelation: "Noleggi"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "documenti_noleggio_id_noleggio_fkey"
            columns: ["id_noleggio"]
            isOneToOne: false
            referencedRelation: "vw_card_mezzo"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "documenti_noleggio_id_noleggio_fkey"
            columns: ["id_noleggio"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_disponibili_noleggio"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "documenti_noleggio_id_noleggio_fkey"
            columns: ["id_noleggio"]
            isOneToOne: false
            referencedRelation: "vw_mezzo_noleggi_attivi"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "documenti_noleggio_id_noleggio_fkey"
            columns: ["id_noleggio"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "documenti_noleggio_id_noleggio_fkey"
            columns: ["id_noleggio"]
            isOneToOne: false
            referencedRelation: "vw_storico_noleggi"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "documenti_noleggio_id_noleggio_fkey"
            columns: ["id_noleggio"]
            isOneToOne: false
            referencedRelation: "vw_storico_noleggi"
            referencedColumns: ["id_storico"]
          },
        ]
      }
      frn_mezzi: {
        Row: {
          created_at: string
          id_anagrafica: string
          is_cancellato: boolean | null
        }
        Insert: {
          created_at?: string
          id_anagrafica: string
          is_cancellato?: boolean | null
        }
        Update: {
          created_at?: string
          id_anagrafica?: string
          is_cancellato?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "frn_mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
        ]
      }
      frn_ricambi: {
        Row: {
          created_at: string
          id_anagrafica: string
          is_cancellato: boolean | null
          sconto: number | null
        }
        Insert: {
          created_at?: string
          id_anagrafica: string
          is_cancellato?: boolean | null
          sconto?: number | null
        }
        Update: {
          created_at?: string
          id_anagrafica?: string
          is_cancellato?: boolean | null
          sconto?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "frn_ricambi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_ricambi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_ricambi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_ricambi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_ricambi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_ricambi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_ricambi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_ricambi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_ricambi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
        ]
      }
      frn_servizi: {
        Row: {
          created_at: string
          id_anagrafica: string
          is_cancellato: boolean | null
          tariffa_oraria: number | null
        }
        Insert: {
          created_at?: string
          id_anagrafica: string
          is_cancellato?: boolean | null
          tariffa_oraria?: number | null
        }
        Update: {
          created_at?: string
          id_anagrafica?: string
          is_cancellato?: boolean | null
          tariffa_oraria?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "frn_servizi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_servizi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_servizi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_servizi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_servizi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_servizi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_servizi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_servizi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_servizi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
        ]
      }
      frn_trasporti: {
        Row: {
          created_at: string
          id_anagrafica: string
          id_contatto_whatsapp: string | null
          is_cancellato: boolean | null
        }
        Insert: {
          created_at?: string
          id_anagrafica: string
          id_contatto_whatsapp?: string | null
          is_cancellato?: boolean | null
        }
        Update: {
          created_at?: string
          id_anagrafica?: string
          id_contatto_whatsapp?: string | null
          is_cancellato?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "frn_trasporti_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_trasporti_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_trasporti_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_trasporti_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_trasporti_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_trasporti_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_trasporti_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_trasporti_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_trasporti_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: true
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "frn_trasporti_id_contatto_whatsapp_fkey"
            columns: ["id_contatto_whatsapp"]
            isOneToOne: false
            referencedRelation: "an_contatti"
            referencedColumns: ["id_contatto"]
          },
        ]
      }
      int_lav_prod: {
        Row: {
          costo_prodotto_lavorazione: number | null
          created_at: string
          id_lav_prod: string
          id_lavorazione: string | null
          id_prodotto: string | null
          n_prodotto_uscita_prevista: number | null
          prezzo_prodotto_lavorazione: number | null
        }
        Insert: {
          costo_prodotto_lavorazione?: number | null
          created_at?: string
          id_lav_prod?: string
          id_lavorazione?: string | null
          id_prodotto?: string | null
          n_prodotto_uscita_prevista?: number | null
          prezzo_prodotto_lavorazione?: number | null
        }
        Update: {
          costo_prodotto_lavorazione?: number | null
          created_at?: string
          id_lav_prod?: string
          id_lavorazione?: string | null
          id_prodotto?: string | null
          n_prodotto_uscita_prevista?: number | null
          prezzo_prodotto_lavorazione?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "int_lav_prod_id_lavorazione_fkey"
            columns: ["id_lavorazione"]
            isOneToOne: false
            referencedRelation: "int_lavorazioni"
            referencedColumns: ["id_lavorazione"]
          },
          {
            foreignKeyName: "int_lav_prod_id_lavorazione_fkey"
            columns: ["id_lavorazione"]
            isOneToOne: false
            referencedRelation: "vw_int_lavorazioni_dettaglio"
            referencedColumns: ["id_lavorazione"]
          },
          {
            foreignKeyName: "int_lav_prod_id_lavorazione_fkey"
            columns: ["id_lavorazione"]
            isOneToOne: false
            referencedRelation: "vw_lavorazioni_complete"
            referencedColumns: ["id_lavorazione"]
          },
          {
            foreignKeyName: "int_lav_prod_id_prodotto_fkey"
            columns: ["id_prodotto"]
            isOneToOne: false
            referencedRelation: "prodotti"
            referencedColumns: ["id_prodotto"]
          },
          {
            foreignKeyName: "int_lav_prod_id_prodotto_fkey"
            columns: ["id_prodotto"]
            isOneToOne: false
            referencedRelation: "Prodotti"
            referencedColumns: ["id_prodotto"]
          },
        ]
      }
      int_lavorazioni: {
        Row: {
          competenza_lavorazione:
            | Database["public"]["Enums"]["competenza_lavorazione"]
            | null
          created_at: string
          data_a_prevista: string | null
          data_da_prevista: string | null
          data_effettiva: string | null
          descrizione_lavorazione: string | null
          durata_prevista: string | null
          id_intervento: string | null
          id_lavorazione: string
          is_cancellato: boolean | null
          is_completato: boolean | null
          n_tecnici_previsti: number | null
          nome_lavorazione: string | null
          prezzo_lavorazione: number | null
          prezzo_manodopera: number | null
          ricambi: Json | null
          stato_lavorazione:
            | Database["public"]["Enums"]["stato_lavorazione"]
            | null
        }
        Insert: {
          competenza_lavorazione?:
            | Database["public"]["Enums"]["competenza_lavorazione"]
            | null
          created_at?: string
          data_a_prevista?: string | null
          data_da_prevista?: string | null
          data_effettiva?: string | null
          descrizione_lavorazione?: string | null
          durata_prevista?: string | null
          id_intervento?: string | null
          id_lavorazione?: string
          is_cancellato?: boolean | null
          is_completato?: boolean | null
          n_tecnici_previsti?: number | null
          nome_lavorazione?: string | null
          prezzo_lavorazione?: number | null
          prezzo_manodopera?: number | null
          ricambi?: Json | null
          stato_lavorazione?:
            | Database["public"]["Enums"]["stato_lavorazione"]
            | null
        }
        Update: {
          competenza_lavorazione?:
            | Database["public"]["Enums"]["competenza_lavorazione"]
            | null
          created_at?: string
          data_a_prevista?: string | null
          data_da_prevista?: string | null
          data_effettiva?: string | null
          descrizione_lavorazione?: string | null
          durata_prevista?: string | null
          id_intervento?: string | null
          id_lavorazione?: string
          is_cancellato?: boolean | null
          is_completato?: boolean | null
          n_tecnici_previsti?: number | null
          nome_lavorazione?: string | null
          prezzo_lavorazione?: number | null
          prezzo_manodopera?: number | null
          ricambi?: Json | null
          stato_lavorazione?:
            | Database["public"]["Enums"]["stato_lavorazione"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "int_lavorazioni_id_intervento_fkey"
            columns: ["id_intervento"]
            isOneToOne: false
            referencedRelation: "interventi"
            referencedColumns: ["id_intervento"]
          },
          {
            foreignKeyName: "int_lavorazioni_id_intervento_fkey"
            columns: ["id_intervento"]
            isOneToOne: false
            referencedRelation: "Interventi"
            referencedColumns: ["id_intervento"]
          },
          {
            foreignKeyName: "int_lavorazioni_id_intervento_fkey"
            columns: ["id_intervento"]
            isOneToOne: false
            referencedRelation: "vw_gestione_interventi"
            referencedColumns: ["id_intervento"]
          },
        ]
      }
      Interventi: {
        Row: {
          codice_intervento: string | null
          created_at: string | null
          descrizione_intervento: string | null
          id_anagrafica: string | null
          id_intervento: string
          id_mezzo: string
          is_cancellato: boolean | null
          is_chiuso: boolean
          is_fatturato: boolean
          stato_intervento:
            | Database["public"]["Enums"]["stato_intervento"]
            | null
          stato_preventivo:
            | Database["public"]["Enums"]["stato_preventivo"]
            | null
        }
        Insert: {
          codice_intervento?: string | null
          created_at?: string | null
          descrizione_intervento?: string | null
          id_anagrafica?: string | null
          id_intervento?: string
          id_mezzo: string
          is_cancellato?: boolean | null
          is_chiuso?: boolean
          is_fatturato?: boolean
          stato_intervento?:
            | Database["public"]["Enums"]["stato_intervento"]
            | null
          stato_preventivo?:
            | Database["public"]["Enums"]["stato_preventivo"]
            | null
        }
        Update: {
          codice_intervento?: string | null
          created_at?: string | null
          descrizione_intervento?: string | null
          id_anagrafica?: string | null
          id_intervento?: string
          id_mezzo?: string
          is_cancellato?: boolean | null
          is_chiuso?: boolean
          is_fatturato?: boolean
          stato_intervento?:
            | Database["public"]["Enums"]["stato_intervento"]
            | null
          stato_preventivo?:
            | Database["public"]["Enums"]["stato_preventivo"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "Interventi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Interventi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Interventi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Interventi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Interventi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Interventi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Interventi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Interventi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Interventi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Interventi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "mezzi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Interventi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "Mezzi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Interventi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_card_mezzo"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Interventi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_completi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Interventi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_disponibili_noleggio"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Interventi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_guasti"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Interventi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_selettore"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Interventi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzo_completo"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Interventi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_mezzo"]
          },
        ]
      }
      lav_tecnici: {
        Row: {
          created_at: string
          id_lav_tecnico: string
          id_lavorazione: string
          id_tecnico: string
        }
        Insert: {
          created_at?: string
          id_lav_tecnico?: string
          id_lavorazione: string
          id_tecnico: string
        }
        Update: {
          created_at?: string
          id_lav_tecnico?: string
          id_lavorazione?: string
          id_tecnico?: string
        }
        Relationships: [
          {
            foreignKeyName: "lav_tecnici_id_lavorazione_fkey"
            columns: ["id_lavorazione"]
            isOneToOne: false
            referencedRelation: "int_lavorazioni"
            referencedColumns: ["id_lavorazione"]
          },
          {
            foreignKeyName: "lav_tecnici_id_lavorazione_fkey"
            columns: ["id_lavorazione"]
            isOneToOne: false
            referencedRelation: "vw_int_lavorazioni_dettaglio"
            referencedColumns: ["id_lavorazione"]
          },
          {
            foreignKeyName: "lav_tecnici_id_lavorazione_fkey"
            columns: ["id_lavorazione"]
            isOneToOne: false
            referencedRelation: "vw_lavorazioni_complete"
            referencedColumns: ["id_lavorazione"]
          },
          {
            foreignKeyName: "lav_tecnici_id_tecnico_fkey"
            columns: ["id_tecnico"]
            isOneToOne: false
            referencedRelation: "tecnici"
            referencedColumns: ["id_tecnico"]
          },
        ]
      }
      Mezzi: {
        Row: {
          anno: string | null
          categoria: Database["public"]["Enums"]["categoria_mezzo"] | null
          created_at: string
          id_anagrafica: string | null
          id_interno: string | null
          id_mezzo: string
          id_sede_assegnata: string | null
          id_sede_ubicazione: string | null
          is_cancellato: boolean | null
          is_disponibile_noleggio: boolean | null
          marca: string | null
          matricola: string | null
          modello: string | null
          ore_moto: number | null
          specifiche_tecniche: Json | null
          stato_funzionamento:
            | Database["public"]["Enums"]["stato_funzionamento"]
            | null
          stato_funzionamento_descrizione: string | null
          ubicazione: string | null
        }
        Insert: {
          anno?: string | null
          categoria?: Database["public"]["Enums"]["categoria_mezzo"] | null
          created_at?: string
          id_anagrafica?: string | null
          id_interno?: string | null
          id_mezzo?: string
          id_sede_assegnata?: string | null
          id_sede_ubicazione?: string | null
          is_cancellato?: boolean | null
          is_disponibile_noleggio?: boolean | null
          marca?: string | null
          matricola?: string | null
          modello?: string | null
          ore_moto?: number | null
          specifiche_tecniche?: Json | null
          stato_funzionamento?:
            | Database["public"]["Enums"]["stato_funzionamento"]
            | null
          stato_funzionamento_descrizione?: string | null
          ubicazione?: string | null
        }
        Update: {
          anno?: string | null
          categoria?: Database["public"]["Enums"]["categoria_mezzo"] | null
          created_at?: string
          id_anagrafica?: string | null
          id_interno?: string | null
          id_mezzo?: string
          id_sede_assegnata?: string | null
          id_sede_ubicazione?: string | null
          is_cancellato?: boolean | null
          is_disponibile_noleggio?: boolean | null
          marca?: string | null
          matricola?: string | null
          modello?: string | null
          ore_moto?: number | null
          specifiche_tecniche?: Json | null
          stato_funzionamento?:
            | Database["public"]["Enums"]["stato_funzionamento"]
            | null
          stato_funzionamento_descrizione?: string | null
          ubicazione?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_assegnata_fkey"
            columns: ["id_sede_assegnata"]
            isOneToOne: false
            referencedRelation: "sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_assegnata_fkey"
            columns: ["id_sede_assegnata"]
            isOneToOne: false
            referencedRelation: "Sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_assegnata_fkey"
            columns: ["id_sede_assegnata"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_sede_operativa"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_assegnata_fkey"
            columns: ["id_sede_assegnata"]
            isOneToOne: false
            referencedRelation: "vw_sedi_per_anagrafica"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_assegnata_fkey"
            columns: ["id_sede_assegnata"]
            isOneToOne: false
            referencedRelation: "vw_sedi_tutte"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "Sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_sede_operativa"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "vw_sedi_per_anagrafica"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "vw_sedi_tutte"
            referencedColumns: ["id_sede"]
          },
        ]
      }
      Noleggi: {
        Row: {
          contratto: string | null
          created_at: string
          data_fine: string | null
          data_inizio: string | null
          data_terminazione_effettiva: string | null
          id_anagrafica: string
          id_mezzo: string
          id_noleggio: string
          is_cancellato: boolean | null
          is_terminato: boolean
          note: string | null
          prezzo_noleggio: number | null
          prezzo_trasporto: number | null
          sede_operativa: string | null
          tempo_indeterminato: boolean | null
          tipo_canone: Database["public"]["Enums"]["tipo_canone"] | null
        }
        Insert: {
          contratto?: string | null
          created_at?: string
          data_fine?: string | null
          data_inizio?: string | null
          data_terminazione_effettiva?: string | null
          id_anagrafica: string
          id_mezzo: string
          id_noleggio?: string
          is_cancellato?: boolean | null
          is_terminato?: boolean
          note?: string | null
          prezzo_noleggio?: number | null
          prezzo_trasporto?: number | null
          sede_operativa?: string | null
          tempo_indeterminato?: boolean | null
          tipo_canone?: Database["public"]["Enums"]["tipo_canone"] | null
        }
        Update: {
          contratto?: string | null
          created_at?: string
          data_fine?: string | null
          data_inizio?: string | null
          data_terminazione_effettiva?: string | null
          id_anagrafica?: string
          id_mezzo?: string
          id_noleggio?: string
          is_cancellato?: boolean | null
          is_terminato?: boolean
          note?: string | null
          prezzo_noleggio?: number | null
          prezzo_trasporto?: number | null
          sede_operativa?: string | null
          tempo_indeterminato?: boolean | null
          tipo_canone?: Database["public"]["Enums"]["tipo_canone"] | null
        }
        Relationships: [
          {
            foreignKeyName: "Noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "mezzi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "Mezzi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_card_mezzo"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_completi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_disponibili_noleggio"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_guasti"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_selettore"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzo_completo"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_sede_operativa_fkey"
            columns: ["sede_operativa"]
            isOneToOne: false
            referencedRelation: "sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Noleggi_sede_operativa_fkey"
            columns: ["sede_operativa"]
            isOneToOne: false
            referencedRelation: "Sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Noleggi_sede_operativa_fkey"
            columns: ["sede_operativa"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_sede_operativa"]
          },
          {
            foreignKeyName: "Noleggi_sede_operativa_fkey"
            columns: ["sede_operativa"]
            isOneToOne: false
            referencedRelation: "vw_sedi_per_anagrafica"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Noleggi_sede_operativa_fkey"
            columns: ["sede_operativa"]
            isOneToOne: false
            referencedRelation: "vw_sedi_tutte"
            referencedColumns: ["id_sede"]
          },
        ]
      }
      noleggi_trasporti: {
        Row: {
          created_at: string
          id_noleggio: string
          id_trasporto: string
        }
        Insert: {
          created_at?: string
          id_noleggio: string
          id_trasporto: string
        }
        Update: {
          created_at?: string
          id_noleggio?: string
          id_trasporto?: string
        }
        Relationships: [
          {
            foreignKeyName: "noleggi_trasporti_id_noleggio_fkey"
            columns: ["id_noleggio"]
            isOneToOne: false
            referencedRelation: "noleggi"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "noleggi_trasporti_id_noleggio_fkey"
            columns: ["id_noleggio"]
            isOneToOne: false
            referencedRelation: "Noleggi"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "noleggi_trasporti_id_noleggio_fkey"
            columns: ["id_noleggio"]
            isOneToOne: false
            referencedRelation: "vw_card_mezzo"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "noleggi_trasporti_id_noleggio_fkey"
            columns: ["id_noleggio"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_disponibili_noleggio"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "noleggi_trasporti_id_noleggio_fkey"
            columns: ["id_noleggio"]
            isOneToOne: false
            referencedRelation: "vw_mezzo_noleggi_attivi"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "noleggi_trasporti_id_noleggio_fkey"
            columns: ["id_noleggio"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "noleggi_trasporti_id_noleggio_fkey"
            columns: ["id_noleggio"]
            isOneToOne: false
            referencedRelation: "vw_storico_noleggi"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "noleggi_trasporti_id_noleggio_fkey"
            columns: ["id_noleggio"]
            isOneToOne: false
            referencedRelation: "vw_storico_noleggi"
            referencedColumns: ["id_storico"]
          },
          {
            foreignKeyName: "noleggi_trasporti_id_trasporto_fkey"
            columns: ["id_trasporto"]
            isOneToOne: false
            referencedRelation: "trasporti"
            referencedColumns: ["id_trasporto"]
          },
        ]
      }
      Porti: {
        Row: {
          created_at: string | null
          id_porto: string
          is_cancellato: boolean | null
          nome_porto: string
        }
        Insert: {
          created_at?: string | null
          id_porto?: string
          is_cancellato?: boolean | null
          nome_porto: string
        }
        Update: {
          created_at?: string | null
          id_porto?: string
          is_cancellato?: boolean | null
          nome_porto?: string
        }
        Relationships: []
      }
      prev_interventi: {
        Row: {
          created_at: string
          id_intervento: string | null
          id_preventivo: string
          is_cancellato: boolean | null
          nome_preventivo: string | null
          pdf_created_at: string | null
          pdf_path: string | null
          pdf_size: number | null
          stato_preventivo:
            | Database["public"]["Enums"]["stato_preventivo"]
            | null
        }
        Insert: {
          created_at?: string
          id_intervento?: string | null
          id_preventivo: string
          is_cancellato?: boolean | null
          nome_preventivo?: string | null
          pdf_created_at?: string | null
          pdf_path?: string | null
          pdf_size?: number | null
          stato_preventivo?:
            | Database["public"]["Enums"]["stato_preventivo"]
            | null
        }
        Update: {
          created_at?: string
          id_intervento?: string | null
          id_preventivo?: string
          is_cancellato?: boolean | null
          nome_preventivo?: string | null
          pdf_created_at?: string | null
          pdf_path?: string | null
          pdf_size?: number | null
          stato_preventivo?:
            | Database["public"]["Enums"]["stato_preventivo"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "prev_interventi_id_intervento_fkey"
            columns: ["id_intervento"]
            isOneToOne: false
            referencedRelation: "interventi"
            referencedColumns: ["id_intervento"]
          },
          {
            foreignKeyName: "prev_interventi_id_intervento_fkey"
            columns: ["id_intervento"]
            isOneToOne: false
            referencedRelation: "Interventi"
            referencedColumns: ["id_intervento"]
          },
          {
            foreignKeyName: "prev_interventi_id_intervento_fkey"
            columns: ["id_intervento"]
            isOneToOne: false
            referencedRelation: "vw_gestione_interventi"
            referencedColumns: ["id_intervento"]
          },
          {
            foreignKeyName: "prev_interventi_id_preventivo_fkey"
            columns: ["id_preventivo"]
            isOneToOne: true
            referencedRelation: "preventivi"
            referencedColumns: ["id_preventivo"]
          },
          {
            foreignKeyName: "prev_interventi_id_preventivo_fkey"
            columns: ["id_preventivo"]
            isOneToOne: true
            referencedRelation: "Preventivi"
            referencedColumns: ["id_preventivo"]
          },
        ]
      }
      prev_noleggi: {
        Row: {
          clausole_speciali: string | null
          codice: string | null
          convertito_in_noleggio_id: string | null
          created_at: string
          data_fine: string | null
          data_inizio: string | null
          data_scadenza: string | null
          dati_azienda: Json | null
          dati_cliente: Json | null
          dati_mezzo: Json | null
          deposito_cauzionale: number | null
          id_anagrafica: string
          id_anagrafica_fornitore: string | null
          id_mezzo: string
          id_preventivo: string
          modalita_pagamento: string | null
          note: string | null
          pdf_bozza_path: string | null
          pdf_firmato_path: string | null
          prezzo_noleggio: number | null
          prezzo_trasporto: number | null
          sede_operativa: string | null
          stato: Database["public"]["Enums"]["stato_preventivo"]
          tempo_indeterminato: boolean
          tipo_canone: string | null
          updated_at: string | null
        }
        Insert: {
          clausole_speciali?: string | null
          codice?: string | null
          convertito_in_noleggio_id?: string | null
          created_at?: string
          data_fine?: string | null
          data_inizio?: string | null
          data_scadenza?: string | null
          dati_azienda?: Json | null
          dati_cliente?: Json | null
          dati_mezzo?: Json | null
          deposito_cauzionale?: number | null
          id_anagrafica: string
          id_anagrafica_fornitore?: string | null
          id_mezzo: string
          id_preventivo?: string
          modalita_pagamento?: string | null
          note?: string | null
          pdf_bozza_path?: string | null
          pdf_firmato_path?: string | null
          prezzo_noleggio?: number | null
          prezzo_trasporto?: number | null
          sede_operativa?: string | null
          stato?: Database["public"]["Enums"]["stato_preventivo"]
          tempo_indeterminato?: boolean
          tipo_canone?: string | null
          updated_at?: string | null
        }
        Update: {
          clausole_speciali?: string | null
          codice?: string | null
          convertito_in_noleggio_id?: string | null
          created_at?: string
          data_fine?: string | null
          data_inizio?: string | null
          data_scadenza?: string | null
          dati_azienda?: Json | null
          dati_cliente?: Json | null
          dati_mezzo?: Json | null
          deposito_cauzionale?: number | null
          id_anagrafica?: string
          id_anagrafica_fornitore?: string | null
          id_mezzo?: string
          id_preventivo?: string
          modalita_pagamento?: string | null
          note?: string | null
          pdf_bozza_path?: string | null
          pdf_firmato_path?: string | null
          prezzo_noleggio?: number | null
          prezzo_trasporto?: number | null
          sede_operativa?: string | null
          stato?: Database["public"]["Enums"]["stato_preventivo"]
          tempo_indeterminato?: boolean
          tipo_canone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prev_noleggi_convertito_in_noleggio_id_fkey"
            columns: ["convertito_in_noleggio_id"]
            isOneToOne: false
            referencedRelation: "noleggi"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "prev_noleggi_convertito_in_noleggio_id_fkey"
            columns: ["convertito_in_noleggio_id"]
            isOneToOne: false
            referencedRelation: "Noleggi"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "prev_noleggi_convertito_in_noleggio_id_fkey"
            columns: ["convertito_in_noleggio_id"]
            isOneToOne: false
            referencedRelation: "vw_card_mezzo"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "prev_noleggi_convertito_in_noleggio_id_fkey"
            columns: ["convertito_in_noleggio_id"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_disponibili_noleggio"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "prev_noleggi_convertito_in_noleggio_id_fkey"
            columns: ["convertito_in_noleggio_id"]
            isOneToOne: false
            referencedRelation: "vw_mezzo_noleggi_attivi"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "prev_noleggi_convertito_in_noleggio_id_fkey"
            columns: ["convertito_in_noleggio_id"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "prev_noleggi_convertito_in_noleggio_id_fkey"
            columns: ["convertito_in_noleggio_id"]
            isOneToOne: false
            referencedRelation: "vw_storico_noleggi"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "prev_noleggi_convertito_in_noleggio_id_fkey"
            columns: ["convertito_in_noleggio_id"]
            isOneToOne: false
            referencedRelation: "vw_storico_noleggi"
            referencedColumns: ["id_storico"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fornitore_fkey"
            columns: ["id_anagrafica_fornitore"]
            isOneToOne: false
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fornitore_fkey"
            columns: ["id_anagrafica_fornitore"]
            isOneToOne: false
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fornitore_fkey"
            columns: ["id_anagrafica_fornitore"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fornitore_fkey"
            columns: ["id_anagrafica_fornitore"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fornitore_fkey"
            columns: ["id_anagrafica_fornitore"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fornitore_fkey"
            columns: ["id_anagrafica_fornitore"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fornitore_fkey"
            columns: ["id_anagrafica_fornitore"]
            isOneToOne: false
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fornitore_fkey"
            columns: ["id_anagrafica_fornitore"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fornitore_fkey"
            columns: ["id_anagrafica_fornitore"]
            isOneToOne: false
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "mezzi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "prev_noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "Mezzi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "prev_noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_card_mezzo"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "prev_noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_completi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "prev_noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_disponibili_noleggio"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "prev_noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_guasti"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "prev_noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_selettore"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "prev_noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzo_completo"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "prev_noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "prev_noleggi_id_preventivo_fkey"
            columns: ["id_preventivo"]
            isOneToOne: true
            referencedRelation: "preventivi"
            referencedColumns: ["id_preventivo"]
          },
          {
            foreignKeyName: "prev_noleggi_id_preventivo_fkey"
            columns: ["id_preventivo"]
            isOneToOne: true
            referencedRelation: "Preventivi"
            referencedColumns: ["id_preventivo"]
          },
          {
            foreignKeyName: "prev_noleggi_sede_operativa_fkey"
            columns: ["sede_operativa"]
            isOneToOne: false
            referencedRelation: "sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "prev_noleggi_sede_operativa_fkey"
            columns: ["sede_operativa"]
            isOneToOne: false
            referencedRelation: "Sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "prev_noleggi_sede_operativa_fkey"
            columns: ["sede_operativa"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_sede_operativa"]
          },
          {
            foreignKeyName: "prev_noleggi_sede_operativa_fkey"
            columns: ["sede_operativa"]
            isOneToOne: false
            referencedRelation: "vw_sedi_per_anagrafica"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "prev_noleggi_sede_operativa_fkey"
            columns: ["sede_operativa"]
            isOneToOne: false
            referencedRelation: "vw_sedi_tutte"
            referencedColumns: ["id_sede"]
          },
        ]
      }
      Preventivi: {
        Row: {
          created_at: string
          id_anagrafica: string | null
          id_preventivo: string
          is_cancellato: boolean | null
        }
        Insert: {
          created_at?: string
          id_anagrafica?: string | null
          id_preventivo?: string
          is_cancellato?: boolean | null
        }
        Update: {
          created_at?: string
          id_anagrafica?: string | null
          id_preventivo?: string
          is_cancellato?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "Preventivi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Preventivi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Preventivi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Preventivi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Preventivi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Preventivi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Preventivi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Preventivi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Preventivi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
        ]
      }
      Prodotti: {
        Row: {
          categoria: Database["public"]["Enums"]["categorie_prodotti"] | null
          codice: string | null
          costo_prodotto: number | null
          created_at: string
          descrizione: Json | null
          id_prodotto: string
          is_cancellato: boolean | null
          marca: string | null
          modello: string | null
          nome: string | null
          prezzo_prodotto: number | null
        }
        Insert: {
          categoria?: Database["public"]["Enums"]["categorie_prodotti"] | null
          codice?: string | null
          costo_prodotto?: number | null
          created_at?: string
          descrizione?: Json | null
          id_prodotto?: string
          is_cancellato?: boolean | null
          marca?: string | null
          modello?: string | null
          nome?: string | null
          prezzo_prodotto?: number | null
        }
        Update: {
          categoria?: Database["public"]["Enums"]["categorie_prodotti"] | null
          codice?: string | null
          costo_prodotto?: number | null
          created_at?: string
          descrizione?: Json | null
          id_prodotto?: string
          is_cancellato?: boolean | null
          marca?: string | null
          modello?: string | null
          nome?: string | null
          prezzo_prodotto?: number | null
        }
        Relationships: []
      }
      Sedi: {
        Row: {
          cap: number | null
          citta: string | null
          created_at: string
          id_anagrafica: string | null
          id_porto: string | null
          id_sede: string
          indirizzo: string | null
          is_banchina: boolean | null
          is_cancellato: boolean | null
          is_legale: boolean | null
          is_nave: boolean | null
          is_officina: boolean | null
          is_operativa: boolean | null
          nome_sede: string | null
          provincia: string | null
        }
        Insert: {
          cap?: number | null
          citta?: string | null
          created_at?: string
          id_anagrafica?: string | null
          id_porto?: string | null
          id_sede?: string
          indirizzo?: string | null
          is_banchina?: boolean | null
          is_cancellato?: boolean | null
          is_legale?: boolean | null
          is_nave?: boolean | null
          is_officina?: boolean | null
          is_operativa?: boolean | null
          nome_sede?: string | null
          provincia?: string | null
        }
        Update: {
          cap?: number | null
          citta?: string | null
          created_at?: string
          id_anagrafica?: string | null
          id_porto?: string | null
          id_sede?: string
          indirizzo?: string | null
          is_banchina?: boolean | null
          is_cancellato?: boolean | null
          is_legale?: boolean | null
          is_nave?: boolean | null
          is_officina?: boolean | null
          is_operativa?: boolean | null
          nome_sede?: string | null
          provincia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Sedi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Sedi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Sedi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Sedi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Sedi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Sedi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Sedi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Sedi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Sedi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Sedi_id_porto_fkey"
            columns: ["id_porto"]
            isOneToOne: false
            referencedRelation: "porti"
            referencedColumns: ["id_porto"]
          },
          {
            foreignKeyName: "Sedi_id_porto_fkey"
            columns: ["id_porto"]
            isOneToOne: false
            referencedRelation: "Porti"
            referencedColumns: ["id_porto"]
          },
        ]
      }
      Subnoleggi: {
        Row: {
          contratto: string | null
          costo_subnoleggio: number | null
          created_at: string
          data_fine: string | null
          data_inizio: string | null
          id_anagrafica: string
          id_mezzo: string
          id_subnoleggio: string
          is_cancellato: boolean | null
          tempo_indeterminato: boolean | null
          valore_residuo: number | null
        }
        Insert: {
          contratto?: string | null
          costo_subnoleggio?: number | null
          created_at?: string
          data_fine?: string | null
          data_inizio?: string | null
          id_anagrafica: string
          id_mezzo: string
          id_subnoleggio?: string
          is_cancellato?: boolean | null
          tempo_indeterminato?: boolean | null
          valore_residuo?: number | null
        }
        Update: {
          contratto?: string | null
          costo_subnoleggio?: number | null
          created_at?: string
          data_fine?: string | null
          data_inizio?: string | null
          id_anagrafica?: string
          id_mezzo?: string
          id_subnoleggio?: string
          is_cancellato?: boolean | null
          tempo_indeterminato?: boolean | null
          valore_residuo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Subnoleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Subnoleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Subnoleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Subnoleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Subnoleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Subnoleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Subnoleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Subnoleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Subnoleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Subnoleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "mezzi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Subnoleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "Mezzi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Subnoleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_card_mezzo"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Subnoleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_completi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Subnoleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_disponibili_noleggio"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Subnoleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_guasti"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Subnoleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_selettore"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Subnoleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzo_completo"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Subnoleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_mezzo"]
          },
        ]
      }
      tecnici: {
        Row: {
          cognome: string | null
          created_at: string | null
          id_tecnico: string
          id_utente: string | null
          nome: string | null
          specializzazione: string | null
        }
        Insert: {
          cognome?: string | null
          created_at?: string | null
          id_tecnico?: string
          id_utente?: string | null
          nome?: string | null
          specializzazione?: string | null
        }
        Update: {
          cognome?: string | null
          created_at?: string | null
          id_tecnico?: string
          id_utente?: string | null
          nome?: string | null
          specializzazione?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tecnici_id_utente_fkey"
            columns: ["id_utente"]
            isOneToOne: false
            referencedRelation: "utenti"
            referencedColumns: ["id_utente"]
          },
        ]
      }
      test: {
        Row: {
          codice: string
          created_at: string
          created_by: string | null
          descrizione: string | null
          id: string
          id_anagrafica: string
          is_cancellato: boolean
          note: string | null
          stato: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          codice: string
          created_at?: string
          created_by?: string | null
          descrizione?: string | null
          id?: string
          id_anagrafica: string
          is_cancellato?: boolean
          note?: string | null
          stato?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          codice?: string
          created_at?: string
          created_by?: string | null
          descrizione?: string | null
          id?: string
          id_anagrafica?: string
          is_cancellato?: boolean
          note?: string | null
          stato?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_anagrafica_fk"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "test_anagrafica_fk"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "test_anagrafica_fk"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "test_anagrafica_fk"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "test_anagrafica_fk"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "test_anagrafica_fk"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "test_anagrafica_fk"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "test_anagrafica_fk"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "test_anagrafica_fk"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
        ]
      }
      transazioni: {
        Row: {
          aggiornato_il: string
          categoria_uscita:
            | Database["public"]["Enums"]["categoria_uscita"]
            | null
          conto_bancario_id: string
          creato_il: string
          data_deposito_riba: string | null
          data_pagamento: string | null
          data_scadenza_mese: string
          data_scadenza_originale: string
          descrizione: string
          id: string
          importo: number
          note: string | null
          pagato: boolean
          tipo: Database["public"]["Enums"]["tipo_transazione"]
          tipo_movimento: Database["public"]["Enums"]["tipo_movimento"]
          transazione_collegata_id: string | null
        }
        Insert: {
          aggiornato_il?: string
          categoria_uscita?:
            | Database["public"]["Enums"]["categoria_uscita"]
            | null
          conto_bancario_id: string
          creato_il?: string
          data_deposito_riba?: string | null
          data_pagamento?: string | null
          data_scadenza_mese: string
          data_scadenza_originale: string
          descrizione: string
          id?: string
          importo: number
          note?: string | null
          pagato?: boolean
          tipo: Database["public"]["Enums"]["tipo_transazione"]
          tipo_movimento: Database["public"]["Enums"]["tipo_movimento"]
          transazione_collegata_id?: string | null
        }
        Update: {
          aggiornato_il?: string
          categoria_uscita?:
            | Database["public"]["Enums"]["categoria_uscita"]
            | null
          conto_bancario_id?: string
          creato_il?: string
          data_deposito_riba?: string | null
          data_pagamento?: string | null
          data_scadenza_mese?: string
          data_scadenza_originale?: string
          descrizione?: string
          id?: string
          importo?: number
          note?: string | null
          pagato?: boolean
          tipo?: Database["public"]["Enums"]["tipo_transazione"]
          tipo_movimento?: Database["public"]["Enums"]["tipo_movimento"]
          transazione_collegata_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transazioni_conto_bancario_id_fkey"
            columns: ["conto_bancario_id"]
            isOneToOne: false
            referencedRelation: "conti_bancari"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transazioni_transazione_collegata_id_fkey"
            columns: ["transazione_collegata_id"]
            isOneToOne: false
            referencedRelation: "transazioni"
            referencedColumns: ["id"]
          },
        ]
      }
      trasporti: {
        Row: {
          costo_vettore: number | null
          created_at: string
          created_by: string | null
          data_effettiva: string | null
          data_programmata: string | null
          id_mezzo: string | null
          id_sede_arrivo: string | null
          id_sede_partenza: string | null
          id_trasporto: string
          id_vettore: string | null
          is_cancellato: boolean | null
          metadata: Json | null
          note: string | null
          prezzo_cliente: number | null
          stato: string
          updated_at: string
          whatsapp_sent_at: string | null
          whatsapp_sent_by: string | null
          whatsapp_sent_to: string | null
        }
        Insert: {
          costo_vettore?: number | null
          created_at?: string
          created_by?: string | null
          data_effettiva?: string | null
          data_programmata?: string | null
          id_mezzo?: string | null
          id_sede_arrivo?: string | null
          id_sede_partenza?: string | null
          id_trasporto?: string
          id_vettore?: string | null
          is_cancellato?: boolean | null
          metadata?: Json | null
          note?: string | null
          prezzo_cliente?: number | null
          stato?: string
          updated_at?: string
          whatsapp_sent_at?: string | null
          whatsapp_sent_by?: string | null
          whatsapp_sent_to?: string | null
        }
        Update: {
          costo_vettore?: number | null
          created_at?: string
          created_by?: string | null
          data_effettiva?: string | null
          data_programmata?: string | null
          id_mezzo?: string | null
          id_sede_arrivo?: string | null
          id_sede_partenza?: string | null
          id_trasporto?: string
          id_vettore?: string | null
          is_cancellato?: boolean | null
          metadata?: Json | null
          note?: string | null
          prezzo_cliente?: number | null
          stato?: string
          updated_at?: string
          whatsapp_sent_at?: string | null
          whatsapp_sent_by?: string | null
          whatsapp_sent_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trasporti_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "mezzi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "trasporti_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "Mezzi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "trasporti_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_card_mezzo"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "trasporti_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_completi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "trasporti_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_disponibili_noleggio"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "trasporti_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_guasti"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "trasporti_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_selettore"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "trasporti_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzo_completo"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "trasporti_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "trasporti_id_sede_arrivo_fkey"
            columns: ["id_sede_arrivo"]
            isOneToOne: false
            referencedRelation: "sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "trasporti_id_sede_arrivo_fkey"
            columns: ["id_sede_arrivo"]
            isOneToOne: false
            referencedRelation: "Sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "trasporti_id_sede_arrivo_fkey"
            columns: ["id_sede_arrivo"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_sede_operativa"]
          },
          {
            foreignKeyName: "trasporti_id_sede_arrivo_fkey"
            columns: ["id_sede_arrivo"]
            isOneToOne: false
            referencedRelation: "vw_sedi_per_anagrafica"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "trasporti_id_sede_arrivo_fkey"
            columns: ["id_sede_arrivo"]
            isOneToOne: false
            referencedRelation: "vw_sedi_tutte"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "trasporti_id_sede_partenza_fkey"
            columns: ["id_sede_partenza"]
            isOneToOne: false
            referencedRelation: "sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "trasporti_id_sede_partenza_fkey"
            columns: ["id_sede_partenza"]
            isOneToOne: false
            referencedRelation: "Sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "trasporti_id_sede_partenza_fkey"
            columns: ["id_sede_partenza"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_sede_operativa"]
          },
          {
            foreignKeyName: "trasporti_id_sede_partenza_fkey"
            columns: ["id_sede_partenza"]
            isOneToOne: false
            referencedRelation: "vw_sedi_per_anagrafica"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "trasporti_id_sede_partenza_fkey"
            columns: ["id_sede_partenza"]
            isOneToOne: false
            referencedRelation: "vw_sedi_tutte"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "trasporti_id_vettore_fkey"
            columns: ["id_vettore"]
            isOneToOne: false
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "trasporti_id_vettore_fkey"
            columns: ["id_vettore"]
            isOneToOne: false
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "trasporti_id_vettore_fkey"
            columns: ["id_vettore"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "trasporti_id_vettore_fkey"
            columns: ["id_vettore"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "trasporti_id_vettore_fkey"
            columns: ["id_vettore"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "trasporti_id_vettore_fkey"
            columns: ["id_vettore"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "trasporti_id_vettore_fkey"
            columns: ["id_vettore"]
            isOneToOne: false
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "trasporti_id_vettore_fkey"
            columns: ["id_vettore"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "trasporti_id_vettore_fkey"
            columns: ["id_vettore"]
            isOneToOne: false
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      utenti: {
        Row: {
          cognome: string | null
          created_at: string | null
          email: string | null
          id_utente: string
          nome: string | null
        }
        Insert: {
          cognome?: string | null
          created_at?: string | null
          email?: string | null
          id_utente?: string
          nome?: string | null
        }
        Update: {
          cognome?: string | null
          created_at?: string | null
          email?: string | null
          id_utente?: string
          nome?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      anagrafiche: {
        Row: {
          created_at: string | null
          id_anagrafica: string | null
          is_cancellato: boolean | null
          is_cliente: boolean | null
          is_fornitore: boolean | null
          is_owner: boolean | null
          partita_iva: string | null
          ragione_sociale: string | null
          richiede_contratto_noleggio: boolean | null
        }
        Insert: {
          created_at?: string | null
          id_anagrafica?: string | null
          is_cancellato?: boolean | null
          is_cliente?: boolean | null
          is_fornitore?: boolean | null
          is_owner?: boolean | null
          partita_iva?: string | null
          ragione_sociale?: string | null
          richiede_contratto_noleggio?: boolean | null
        }
        Update: {
          created_at?: string | null
          id_anagrafica?: string | null
          is_cancellato?: boolean | null
          is_cliente?: boolean | null
          is_fornitore?: boolean | null
          is_owner?: boolean | null
          partita_iva?: string | null
          ragione_sociale?: string | null
          richiede_contratto_noleggio?: boolean | null
        }
        Relationships: []
      }
      interventi: {
        Row: {
          codice_intervento: string | null
          created_at: string | null
          descrizione_intervento: string | null
          id_anagrafica: string | null
          id_intervento: string | null
          id_mezzo: string | null
          is_cancellato: boolean | null
          is_chiuso: boolean | null
          is_fatturato: boolean | null
          stato_intervento:
            | Database["public"]["Enums"]["stato_intervento"]
            | null
          stato_preventivo:
            | Database["public"]["Enums"]["stato_preventivo"]
            | null
        }
        Insert: {
          codice_intervento?: string | null
          created_at?: string | null
          descrizione_intervento?: string | null
          id_anagrafica?: string | null
          id_intervento?: string | null
          id_mezzo?: string | null
          is_cancellato?: boolean | null
          is_chiuso?: boolean | null
          is_fatturato?: boolean | null
          stato_intervento?:
            | Database["public"]["Enums"]["stato_intervento"]
            | null
          stato_preventivo?:
            | Database["public"]["Enums"]["stato_preventivo"]
            | null
        }
        Update: {
          codice_intervento?: string | null
          created_at?: string | null
          descrizione_intervento?: string | null
          id_anagrafica?: string | null
          id_intervento?: string | null
          id_mezzo?: string | null
          is_cancellato?: boolean | null
          is_chiuso?: boolean | null
          is_fatturato?: boolean | null
          stato_intervento?:
            | Database["public"]["Enums"]["stato_intervento"]
            | null
          stato_preventivo?:
            | Database["public"]["Enums"]["stato_preventivo"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "Interventi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Interventi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Interventi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Interventi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Interventi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Interventi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Interventi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Interventi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Interventi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Interventi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "mezzi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Interventi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "Mezzi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Interventi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_card_mezzo"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Interventi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_completi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Interventi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_disponibili_noleggio"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Interventi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_guasti"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Interventi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_selettore"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Interventi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzo_completo"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Interventi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_mezzo"]
          },
        ]
      }
      mezzi: {
        Row: {
          anno: string | null
          categoria: Database["public"]["Enums"]["categoria_mezzo"] | null
          created_at: string | null
          id_anagrafica: string | null
          id_interno: string | null
          id_mezzo: string | null
          id_sede_assegnata: string | null
          id_sede_ubicazione: string | null
          is_cancellato: boolean | null
          is_disponibile_noleggio: boolean | null
          marca: string | null
          matricola: string | null
          modello: string | null
          ore_moto: number | null
          specifiche_tecniche: Json | null
          stato_funzionamento:
            | Database["public"]["Enums"]["stato_funzionamento"]
            | null
          stato_funzionamento_descrizione: string | null
          ubicazione: string | null
        }
        Insert: {
          anno?: string | null
          categoria?: Database["public"]["Enums"]["categoria_mezzo"] | null
          created_at?: string | null
          id_anagrafica?: string | null
          id_interno?: string | null
          id_mezzo?: string | null
          id_sede_assegnata?: string | null
          id_sede_ubicazione?: string | null
          is_cancellato?: boolean | null
          is_disponibile_noleggio?: boolean | null
          marca?: string | null
          matricola?: string | null
          modello?: string | null
          ore_moto?: number | null
          specifiche_tecniche?: Json | null
          stato_funzionamento?:
            | Database["public"]["Enums"]["stato_funzionamento"]
            | null
          stato_funzionamento_descrizione?: string | null
          ubicazione?: string | null
        }
        Update: {
          anno?: string | null
          categoria?: Database["public"]["Enums"]["categoria_mezzo"] | null
          created_at?: string | null
          id_anagrafica?: string | null
          id_interno?: string | null
          id_mezzo?: string | null
          id_sede_assegnata?: string | null
          id_sede_ubicazione?: string | null
          is_cancellato?: boolean | null
          is_disponibile_noleggio?: boolean | null
          marca?: string | null
          matricola?: string | null
          modello?: string | null
          ore_moto?: number | null
          specifiche_tecniche?: Json | null
          stato_funzionamento?:
            | Database["public"]["Enums"]["stato_funzionamento"]
            | null
          stato_funzionamento_descrizione?: string | null
          ubicazione?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_assegnata_fkey"
            columns: ["id_sede_assegnata"]
            isOneToOne: false
            referencedRelation: "sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_assegnata_fkey"
            columns: ["id_sede_assegnata"]
            isOneToOne: false
            referencedRelation: "Sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_assegnata_fkey"
            columns: ["id_sede_assegnata"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_sede_operativa"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_assegnata_fkey"
            columns: ["id_sede_assegnata"]
            isOneToOne: false
            referencedRelation: "vw_sedi_per_anagrafica"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_assegnata_fkey"
            columns: ["id_sede_assegnata"]
            isOneToOne: false
            referencedRelation: "vw_sedi_tutte"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "Sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_sede_operativa"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "vw_sedi_per_anagrafica"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "vw_sedi_tutte"
            referencedColumns: ["id_sede"]
          },
        ]
      }
      noleggi: {
        Row: {
          contratto: string | null
          created_at: string | null
          data_fine: string | null
          data_inizio: string | null
          data_terminazione_effettiva: string | null
          id_anagrafica: string | null
          id_mezzo: string | null
          id_noleggio: string | null
          is_cancellato: boolean | null
          is_terminato: boolean | null
          note: string | null
          prezzo_noleggio: number | null
          prezzo_trasporto: number | null
          sede_operativa: string | null
          tempo_indeterminato: boolean | null
          tipo_canone: Database["public"]["Enums"]["tipo_canone"] | null
        }
        Insert: {
          contratto?: string | null
          created_at?: string | null
          data_fine?: string | null
          data_inizio?: string | null
          data_terminazione_effettiva?: string | null
          id_anagrafica?: string | null
          id_mezzo?: string | null
          id_noleggio?: string | null
          is_cancellato?: boolean | null
          is_terminato?: boolean | null
          note?: string | null
          prezzo_noleggio?: number | null
          prezzo_trasporto?: number | null
          sede_operativa?: string | null
          tempo_indeterminato?: boolean | null
          tipo_canone?: Database["public"]["Enums"]["tipo_canone"] | null
        }
        Update: {
          contratto?: string | null
          created_at?: string | null
          data_fine?: string | null
          data_inizio?: string | null
          data_terminazione_effettiva?: string | null
          id_anagrafica?: string | null
          id_mezzo?: string | null
          id_noleggio?: string | null
          is_cancellato?: boolean | null
          is_terminato?: boolean | null
          note?: string | null
          prezzo_noleggio?: number | null
          prezzo_trasporto?: number | null
          sede_operativa?: string | null
          tempo_indeterminato?: boolean | null
          tipo_canone?: Database["public"]["Enums"]["tipo_canone"] | null
        }
        Relationships: [
          {
            foreignKeyName: "Noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "mezzi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "Mezzi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_card_mezzo"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_completi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_disponibili_noleggio"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_guasti"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_selettore"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzo_completo"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_sede_operativa_fkey"
            columns: ["sede_operativa"]
            isOneToOne: false
            referencedRelation: "sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Noleggi_sede_operativa_fkey"
            columns: ["sede_operativa"]
            isOneToOne: false
            referencedRelation: "Sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Noleggi_sede_operativa_fkey"
            columns: ["sede_operativa"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_sede_operativa"]
          },
          {
            foreignKeyName: "Noleggi_sede_operativa_fkey"
            columns: ["sede_operativa"]
            isOneToOne: false
            referencedRelation: "vw_sedi_per_anagrafica"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Noleggi_sede_operativa_fkey"
            columns: ["sede_operativa"]
            isOneToOne: false
            referencedRelation: "vw_sedi_tutte"
            referencedColumns: ["id_sede"]
          },
        ]
      }
      porti: {
        Row: {
          created_at: string | null
          id_porto: string | null
          is_cancellato: boolean | null
          nome_porto: string | null
        }
        Insert: {
          created_at?: string | null
          id_porto?: string | null
          is_cancellato?: boolean | null
          nome_porto?: string | null
        }
        Update: {
          created_at?: string | null
          id_porto?: string | null
          is_cancellato?: boolean | null
          nome_porto?: string | null
        }
        Relationships: []
      }
      preventivi: {
        Row: {
          created_at: string | null
          id_anagrafica: string | null
          id_preventivo: string | null
          is_cancellato: boolean | null
        }
        Insert: {
          created_at?: string | null
          id_anagrafica?: string | null
          id_preventivo?: string | null
          is_cancellato?: boolean | null
        }
        Update: {
          created_at?: string | null
          id_anagrafica?: string | null
          id_preventivo?: string | null
          is_cancellato?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "Preventivi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Preventivi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Preventivi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Preventivi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Preventivi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Preventivi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Preventivi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Preventivi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Preventivi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
        ]
      }
      prodotti: {
        Row: {
          categoria: Database["public"]["Enums"]["categorie_prodotti"] | null
          codice: string | null
          costo_prodotto: number | null
          created_at: string | null
          descrizione: Json | null
          id_prodotto: string | null
          is_cancellato: boolean | null
          marca: string | null
          modello: string | null
          nome: string | null
          prezzo_prodotto: number | null
        }
        Insert: {
          categoria?: Database["public"]["Enums"]["categorie_prodotti"] | null
          codice?: string | null
          costo_prodotto?: number | null
          created_at?: string | null
          descrizione?: Json | null
          id_prodotto?: string | null
          is_cancellato?: boolean | null
          marca?: string | null
          modello?: string | null
          nome?: string | null
          prezzo_prodotto?: number | null
        }
        Update: {
          categoria?: Database["public"]["Enums"]["categorie_prodotti"] | null
          codice?: string | null
          costo_prodotto?: number | null
          created_at?: string | null
          descrizione?: Json | null
          id_prodotto?: string | null
          is_cancellato?: boolean | null
          marca?: string | null
          modello?: string | null
          nome?: string | null
          prezzo_prodotto?: number | null
        }
        Relationships: []
      }
      sedi: {
        Row: {
          cap: number | null
          citta: string | null
          created_at: string | null
          id_anagrafica: string | null
          id_porto: string | null
          id_sede: string | null
          indirizzo: string | null
          is_banchina: boolean | null
          is_cancellato: boolean | null
          is_legale: boolean | null
          is_nave: boolean | null
          is_officina: boolean | null
          is_operativa: boolean | null
          nome_sede: string | null
          provincia: string | null
        }
        Insert: {
          cap?: number | null
          citta?: string | null
          created_at?: string | null
          id_anagrafica?: string | null
          id_porto?: string | null
          id_sede?: string | null
          indirizzo?: string | null
          is_banchina?: boolean | null
          is_cancellato?: boolean | null
          is_legale?: boolean | null
          is_nave?: boolean | null
          is_officina?: boolean | null
          is_operativa?: boolean | null
          nome_sede?: string | null
          provincia?: string | null
        }
        Update: {
          cap?: number | null
          citta?: string | null
          created_at?: string | null
          id_anagrafica?: string | null
          id_porto?: string | null
          id_sede?: string | null
          indirizzo?: string | null
          is_banchina?: boolean | null
          is_cancellato?: boolean | null
          is_legale?: boolean | null
          is_nave?: boolean | null
          is_officina?: boolean | null
          is_operativa?: boolean | null
          nome_sede?: string | null
          provincia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Sedi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Sedi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Sedi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Sedi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Sedi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Sedi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Sedi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Sedi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Sedi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Sedi_id_porto_fkey"
            columns: ["id_porto"]
            isOneToOne: false
            referencedRelation: "porti"
            referencedColumns: ["id_porto"]
          },
          {
            foreignKeyName: "Sedi_id_porto_fkey"
            columns: ["id_porto"]
            isOneToOne: false
            referencedRelation: "Porti"
            referencedColumns: ["id_porto"]
          },
        ]
      }
      subnoleggi: {
        Row: {
          contratto: string | null
          costo_subnoleggio: number | null
          created_at: string | null
          data_fine: string | null
          data_inizio: string | null
          id_anagrafica: string | null
          id_mezzo: string | null
          id_subnoleggio: string | null
          is_cancellato: boolean | null
          tempo_indeterminato: boolean | null
          valore_residuo: number | null
        }
        Insert: {
          contratto?: string | null
          costo_subnoleggio?: number | null
          created_at?: string | null
          data_fine?: string | null
          data_inizio?: string | null
          id_anagrafica?: string | null
          id_mezzo?: string | null
          id_subnoleggio?: string | null
          is_cancellato?: boolean | null
          tempo_indeterminato?: boolean | null
          valore_residuo?: number | null
        }
        Update: {
          contratto?: string | null
          costo_subnoleggio?: number | null
          created_at?: string | null
          data_fine?: string | null
          data_inizio?: string | null
          id_anagrafica?: string | null
          id_mezzo?: string | null
          id_subnoleggio?: string | null
          is_cancellato?: boolean | null
          tempo_indeterminato?: boolean | null
          valore_residuo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Subnoleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Subnoleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Subnoleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Subnoleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Subnoleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Subnoleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Subnoleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Subnoleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Subnoleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Subnoleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "mezzi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Subnoleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "Mezzi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Subnoleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_card_mezzo"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Subnoleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_completi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Subnoleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_disponibili_noleggio"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Subnoleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_guasti"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Subnoleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_selettore"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Subnoleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzo_completo"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Subnoleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_mezzo"]
          },
        ]
      }
      vw_anagrafiche_complete: {
        Row: {
          codice_univoco: string | null
          contatti: Json | null
          esente_iva: boolean | null
          iban: string | null
          id_anagrafica: string | null
          is_cliente: boolean | null
          is_fornitore: boolean | null
          is_owner: boolean | null
          modalita_pagamento_default: string | null
          partita_iva: string | null
          pec: string | null
          ragione_sociale: string | null
          sede_legale: Json | null
          sedi: Json | null
        }
        Relationships: []
      }
      vw_anagrafiche_owners: {
        Row: {
          id_anagrafica: string | null
          is_cliente: boolean | null
          is_fornitore: boolean | null
          is_owner: boolean | null
          partita_iva: string | null
          ragione_sociale: string | null
        }
        Insert: {
          id_anagrafica?: string | null
          is_cliente?: boolean | null
          is_fornitore?: boolean | null
          is_owner?: boolean | null
          partita_iva?: string | null
          ragione_sociale?: string | null
        }
        Update: {
          id_anagrafica?: string | null
          is_cliente?: boolean | null
          is_fornitore?: boolean | null
          is_owner?: boolean | null
          partita_iva?: string | null
          ragione_sociale?: string | null
        }
        Relationships: []
      }
      vw_anagrafiche_selettore: {
        Row: {
          id_anagrafica: string | null
          is_cliente: boolean | null
          is_fornitore: boolean | null
          is_owner: boolean | null
          num_sedi: number | null
          partita_iva: string | null
          ragione_sociale: string | null
          search_text: string | null
          sede_legale_citta: string | null
          sede_legale_nome: string | null
          sede_legale_provincia: string | null
        }
        Relationships: []
      }
      vw_anagrafiche_trasportatori: {
        Row: {
          id_anagrafica: string | null
          is_cancellato: boolean | null
          is_cliente: boolean | null
          is_fornitore: boolean | null
          is_owner: boolean | null
          partita_iva: string | null
          ragione_sociale: string | null
        }
        Relationships: []
      }
      vw_card_mezzo: {
        Row: {
          anno: string | null
          categoria: Database["public"]["Enums"]["categoria_mezzo"] | null
          cliente_piva: string | null
          cliente_ragione_sociale: string | null
          costo_subnoleggio: number | null
          fornitore_ragione_sociale: string | null
          id_anagrafica: string | null
          id_interno: string | null
          id_mezzo: string | null
          id_noleggio: string | null
          id_sede_assegnata: string | null
          id_sede_ubicazione: string | null
          id_subnoleggio: string | null
          is_disponibile_noleggio: boolean | null
          marca: string | null
          margine_noleggio: number | null
          margine_percentuale: number | null
          matricola: string | null
          modello: string | null
          noleggio_data_fine: string | null
          noleggio_data_inizio: string | null
          noleggio_is_terminato: boolean | null
          noleggio_sede_citta: string | null
          noleggio_sede_nome: string | null
          noleggio_tempo_indeterminato: boolean | null
          ore_moto: number | null
          owner_ragione_sociale: string | null
          prezzo_noleggio: number | null
          sede_assegnata_nome: string | null
          sede_assegnata_ubicazione_completa: string | null
          sede_ubicazione_completa: string | null
          sede_ubicazione_nome: string | null
          stato_funzionamento:
            | Database["public"]["Enums"]["stato_funzionamento"]
            | null
          stato_funzionamento_descrizione: string | null
          stato_noleggio: string | null
          subnoleggio_contratto: string | null
          subnoleggio_data_fine: string | null
          subnoleggio_data_inizio: string | null
          subnoleggio_tempo_indeterminato: boolean | null
          subnoleggio_valore_residuo: number | null
          tipo_canone: Database["public"]["Enums"]["tipo_canone"] | null
        }
        Relationships: [
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_assegnata_fkey"
            columns: ["id_sede_assegnata"]
            isOneToOne: false
            referencedRelation: "sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_assegnata_fkey"
            columns: ["id_sede_assegnata"]
            isOneToOne: false
            referencedRelation: "Sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_assegnata_fkey"
            columns: ["id_sede_assegnata"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_sede_operativa"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_assegnata_fkey"
            columns: ["id_sede_assegnata"]
            isOneToOne: false
            referencedRelation: "vw_sedi_per_anagrafica"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_assegnata_fkey"
            columns: ["id_sede_assegnata"]
            isOneToOne: false
            referencedRelation: "vw_sedi_tutte"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "Sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_sede_operativa"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "vw_sedi_per_anagrafica"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "vw_sedi_tutte"
            referencedColumns: ["id_sede"]
          },
        ]
      }
      vw_entita_anagrafica_documentale: {
        Row: {
          codice_univoco: string | null
          email_principale: string | null
          iban: string | null
          id_anagrafica: string | null
          modalita_pagamento_default: string | null
          nome_contatto_principale: string | null
          partita_iva: string | null
          pec: string | null
          ragione_sociale: string | null
          sede_legale_cap: number | null
          sede_legale_citta: string | null
          sede_legale_indirizzo: string | null
          sede_legale_provincia: string | null
          telefono_principale: string | null
        }
        Relationships: []
      }
      vw_gestione_interventi: {
        Row: {
          codice_intervento: string | null
          created_at: string | null
          descrizione_intervento: string | null
          id_anagrafica: string | null
          id_interno: string | null
          id_intervento: string | null
          id_mezzo: string | null
          is_chiuso: boolean | null
          is_fatturato: boolean | null
          marca: string | null
          matricola: string | null
          mezzo_categoria: Database["public"]["Enums"]["categoria_mezzo"] | null
          modello: string | null
          n_lavorazioni: number | null
          nomi_tecnici_aggregati: string | null
          partita_iva: string | null
          prima_data_prevista: string | null
          ragione_sociale: string | null
          stato_funzionamento:
            | Database["public"]["Enums"]["stato_funzionamento"]
            | null
          stato_intervento:
            | Database["public"]["Enums"]["stato_intervento"]
            | null
          stato_preventivo:
            | Database["public"]["Enums"]["stato_preventivo"]
            | null
          totale_tecnici_assegnati: number | null
          totale_tecnici_previsti: number | null
          ubicazione: string | null
          ultima_data_prevista: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Interventi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Interventi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Interventi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Interventi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Interventi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Interventi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Interventi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Interventi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Interventi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Interventi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "mezzi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Interventi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "Mezzi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Interventi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_card_mezzo"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Interventi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_completi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Interventi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_disponibili_noleggio"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Interventi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_guasti"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Interventi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_selettore"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Interventi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzo_completo"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Interventi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_mezzo"]
          },
        ]
      }
      vw_int_lavorazioni_dettaglio: {
        Row: {
          competenza_lavorazione:
            | Database["public"]["Enums"]["competenza_lavorazione"]
            | null
          created_at: string | null
          data_a_prevista: string | null
          data_da_prevista: string | null
          data_effettiva: string | null
          descrizione_lavorazione: string | null
          durata_prevista: string | null
          id_intervento: string | null
          id_lavorazione: string | null
          is_completato: boolean | null
          n_tecnici_assegnati: number | null
          n_tecnici_previsti: number | null
          nome_lavorazione: string | null
          nomi_tecnici: string[] | null
          prezzo_lavorazione: number | null
          prezzo_manodopera: number | null
          stato_lavorazione:
            | Database["public"]["Enums"]["stato_lavorazione"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "int_lavorazioni_id_intervento_fkey"
            columns: ["id_intervento"]
            isOneToOne: false
            referencedRelation: "interventi"
            referencedColumns: ["id_intervento"]
          },
          {
            foreignKeyName: "int_lavorazioni_id_intervento_fkey"
            columns: ["id_intervento"]
            isOneToOne: false
            referencedRelation: "Interventi"
            referencedColumns: ["id_intervento"]
          },
          {
            foreignKeyName: "int_lavorazioni_id_intervento_fkey"
            columns: ["id_intervento"]
            isOneToOne: false
            referencedRelation: "vw_gestione_interventi"
            referencedColumns: ["id_intervento"]
          },
        ]
      }
      vw_lav_tecnici_count: {
        Row: {
          id_lavorazione: string | null
          n_tecnici_assegnati: number | null
          nomi_tecnici: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "lav_tecnici_id_lavorazione_fkey"
            columns: ["id_lavorazione"]
            isOneToOne: false
            referencedRelation: "int_lavorazioni"
            referencedColumns: ["id_lavorazione"]
          },
          {
            foreignKeyName: "lav_tecnici_id_lavorazione_fkey"
            columns: ["id_lavorazione"]
            isOneToOne: false
            referencedRelation: "vw_int_lavorazioni_dettaglio"
            referencedColumns: ["id_lavorazione"]
          },
          {
            foreignKeyName: "lav_tecnici_id_lavorazione_fkey"
            columns: ["id_lavorazione"]
            isOneToOne: false
            referencedRelation: "vw_lavorazioni_complete"
            referencedColumns: ["id_lavorazione"]
          },
        ]
      }
      vw_lavorazioni_complete: {
        Row: {
          competenza_lavorazione:
            | Database["public"]["Enums"]["competenza_lavorazione"]
            | null
          created_at: string | null
          data_a_prevista: string | null
          data_da_prevista: string | null
          data_effettiva: string | null
          descrizione_lavorazione: string | null
          durata_prevista: string | null
          id_intervento: string | null
          id_lavorazione: string | null
          is_completato: boolean | null
          n_tecnici_previsti: number | null
          nome_lavorazione: string | null
          prezzo_lavorazione: number | null
          prezzo_manodopera: number | null
          prodotti: Json | null
          stato_lavorazione:
            | Database["public"]["Enums"]["stato_lavorazione"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "int_lavorazioni_id_intervento_fkey"
            columns: ["id_intervento"]
            isOneToOne: false
            referencedRelation: "interventi"
            referencedColumns: ["id_intervento"]
          },
          {
            foreignKeyName: "int_lavorazioni_id_intervento_fkey"
            columns: ["id_intervento"]
            isOneToOne: false
            referencedRelation: "Interventi"
            referencedColumns: ["id_intervento"]
          },
          {
            foreignKeyName: "int_lavorazioni_id_intervento_fkey"
            columns: ["id_intervento"]
            isOneToOne: false
            referencedRelation: "vw_gestione_interventi"
            referencedColumns: ["id_intervento"]
          },
        ]
      }
      vw_mezzi_completi: {
        Row: {
          created_at: string | null
          id_anagrafica: string | null
          id_interno: string | null
          id_mezzo: string | null
          id_sede_assegnata: string | null
          id_sede_ubicazione: string | null
          is_cancellato: boolean | null
          marca: string | null
          matricola: string | null
          modello: string | null
          nome_sede: string | null
          nome_sede_ubicazione: string | null
          ragione_sociale: string | null
          sede_citta: string | null
          sede_indirizzo: string | null
          sede_ubicazione_citta: string | null
          sede_ubicazione_indirizzo: string | null
          stato_funzionamento:
            | Database["public"]["Enums"]["stato_funzionamento"]
            | null
          stato_funzionamento_descrizione: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_assegnata_fkey"
            columns: ["id_sede_assegnata"]
            isOneToOne: false
            referencedRelation: "sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_assegnata_fkey"
            columns: ["id_sede_assegnata"]
            isOneToOne: false
            referencedRelation: "Sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_assegnata_fkey"
            columns: ["id_sede_assegnata"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_sede_operativa"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_assegnata_fkey"
            columns: ["id_sede_assegnata"]
            isOneToOne: false
            referencedRelation: "vw_sedi_per_anagrafica"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_assegnata_fkey"
            columns: ["id_sede_assegnata"]
            isOneToOne: false
            referencedRelation: "vw_sedi_tutte"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "Sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_sede_operativa"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "vw_sedi_per_anagrafica"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "vw_sedi_tutte"
            referencedColumns: ["id_sede"]
          },
        ]
      }
      vw_mezzi_disponibili_noleggio: {
        Row: {
          anno: string | null
          categoria: Database["public"]["Enums"]["categoria_mezzo"] | null
          cliente_piva: string | null
          cliente_ragione_sociale: string | null
          id_anagrafica: string | null
          id_interno: string | null
          id_mezzo: string | null
          id_noleggio: string | null
          id_sede_assegnata: string | null
          id_sede_ubicazione: string | null
          is_disponibile_noleggio: boolean | null
          marca: string | null
          matricola: string | null
          modello: string | null
          noleggio_data_fine: string | null
          noleggio_data_inizio: string | null
          noleggio_is_terminato: boolean | null
          noleggio_sede_citta: string | null
          noleggio_sede_nome: string | null
          noleggio_tempo_indeterminato: boolean | null
          ore_moto: number | null
          owner_partita_iva: string | null
          owner_ragione_sociale: string | null
          prezzo_noleggio: number | null
          sede_assegnata_nome: string | null
          sede_assegnata_ubicazione_completa: string | null
          sede_ubicazione_completa: string | null
          sede_ubicazione_nome: string | null
          stato_funzionamento:
            | Database["public"]["Enums"]["stato_funzionamento"]
            | null
          stato_funzionamento_descrizione: string | null
          stato_noleggio: string | null
          tipo_canone: Database["public"]["Enums"]["tipo_canone"] | null
        }
        Relationships: [
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_assegnata_fkey"
            columns: ["id_sede_assegnata"]
            isOneToOne: false
            referencedRelation: "sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_assegnata_fkey"
            columns: ["id_sede_assegnata"]
            isOneToOne: false
            referencedRelation: "Sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_assegnata_fkey"
            columns: ["id_sede_assegnata"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_sede_operativa"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_assegnata_fkey"
            columns: ["id_sede_assegnata"]
            isOneToOne: false
            referencedRelation: "vw_sedi_per_anagrafica"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_assegnata_fkey"
            columns: ["id_sede_assegnata"]
            isOneToOne: false
            referencedRelation: "vw_sedi_tutte"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "Sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_sede_operativa"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "vw_sedi_per_anagrafica"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "vw_sedi_tutte"
            referencedColumns: ["id_sede"]
          },
        ]
      }
      vw_mezzi_guasti: {
        Row: {
          id_anagrafica: string | null
          id_interno: string | null
          id_mezzo: string | null
          id_sede_ubicazione: string | null
          marca: string | null
          matricola: string | null
          modello: string | null
          num_interventi_attivi: number | null
          proprietario: string | null
          stato_funzionamento:
            | Database["public"]["Enums"]["stato_funzionamento"]
            | null
          stato_funzionamento_descrizione: string | null
          ubicazione: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "Sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_sede_operativa"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "vw_sedi_per_anagrafica"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "vw_sedi_tutte"
            referencedColumns: ["id_sede"]
          },
        ]
      }
      vw_mezzi_selettore: {
        Row: {
          anno: string | null
          categoria: Database["public"]["Enums"]["categoria_mezzo"] | null
          id_anagrafica: string | null
          id_interno: string | null
          id_mezzo: string | null
          id_sede_assegnata: string | null
          id_sede_ubicazione: string | null
          is_disponibile_noleggio: boolean | null
          marca: string | null
          matricola: string | null
          modello: string | null
          ore_moto: number | null
          owner_ragione_sociale: string | null
          search_text: string | null
          sede_assegnata_nome: string | null
          sede_assegnata_ubicazione: string | null
          stato_funzionamento:
            | Database["public"]["Enums"]["stato_funzionamento"]
            | null
          ubicazione_completa: string | null
          ubicazione_nome: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_assegnata_fkey"
            columns: ["id_sede_assegnata"]
            isOneToOne: false
            referencedRelation: "sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_assegnata_fkey"
            columns: ["id_sede_assegnata"]
            isOneToOne: false
            referencedRelation: "Sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_assegnata_fkey"
            columns: ["id_sede_assegnata"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_sede_operativa"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_assegnata_fkey"
            columns: ["id_sede_assegnata"]
            isOneToOne: false
            referencedRelation: "vw_sedi_per_anagrafica"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_assegnata_fkey"
            columns: ["id_sede_assegnata"]
            isOneToOne: false
            referencedRelation: "vw_sedi_tutte"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "Sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_sede_operativa"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "vw_sedi_per_anagrafica"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "vw_sedi_tutte"
            referencedColumns: ["id_sede"]
          },
        ]
      }
      vw_mezzo_completo: {
        Row: {
          anno: string | null
          categoria: Database["public"]["Enums"]["categoria_mezzo"] | null
          id_interno: string | null
          id_mezzo: string | null
          is_disponibile_noleggio: boolean | null
          marca: string | null
          matricola: string | null
          modello: string | null
          ore_moto: number | null
          proprietario: string | null
          sede_assegnata_citta: string | null
          sede_assegnata_indirizzo: string | null
          sede_assegnata_nome: string | null
          sede_ubicazione_citta: string | null
          sede_ubicazione_nome: string | null
          specifiche_tecniche: Json | null
          stato_funzionamento:
            | Database["public"]["Enums"]["stato_funzionamento"]
            | null
          stato_funzionamento_descrizione: string | null
          ubicazione: string | null
        }
        Relationships: []
      }
      vw_mezzo_noleggi_attivi: {
        Row: {
          cliente: string | null
          created_at: string | null
          data_fine: string | null
          data_inizio: string | null
          id_mezzo: string | null
          id_noleggio: string | null
          prezzo_noleggio: number | null
          prezzo_trasporto: number | null
          tempo_indeterminato: boolean | null
          tipo_canone: Database["public"]["Enums"]["tipo_canone"] | null
        }
        Relationships: [
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "mezzi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "Mezzi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_card_mezzo"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_completi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_disponibili_noleggio"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_guasti"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_selettore"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzo_completo"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_mezzo"]
          },
        ]
      }
      vw_mezzo_subnoleggi_attivi: {
        Row: {
          costo_subnoleggio: number | null
          created_at: string | null
          data_fine: string | null
          data_inizio: string | null
          fornitore: string | null
          id_mezzo: string | null
          id_subnoleggio: string | null
          tempo_indeterminato: boolean | null
          valore_residuo: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Subnoleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "mezzi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Subnoleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "Mezzi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Subnoleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_card_mezzo"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Subnoleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_completi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Subnoleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_disponibili_noleggio"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Subnoleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_guasti"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Subnoleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_selettore"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Subnoleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzo_completo"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Subnoleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_mezzo"]
          },
        ]
      }
      vw_noleggi_completi: {
        Row: {
          cliente_piva: string | null
          cliente_ragione_sociale: string | null
          contratto_bozza_info: Json | null
          contratto_firmato_info: Json | null
          created_at: string | null
          data_fine: string | null
          data_inizio: string | null
          data_terminazione_effettiva: string | null
          id_anagrafica: string | null
          id_interno: string | null
          id_mezzo: string | null
          id_noleggio: string | null
          id_preventivo: string | null
          id_sede_operativa: string | null
          id_sede_ubicazione: string | null
          is_terminato: boolean | null
          mezzo_marca: string | null
          mezzo_matricola: string | null
          mezzo_modello: string | null
          note: string | null
          prezzo_noleggio: number | null
          prezzo_trasporto: number | null
          richiede_contratto_noleggio: boolean | null
          sede_citta: string | null
          sede_indirizzo: string | null
          sede_nome: string | null
          sede_provincia: string | null
          stato_noleggio: string | null
          tempo_indeterminato: boolean | null
          tipo_canone: Database["public"]["Enums"]["tipo_canone"] | null
        }
        Relationships: [
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "Sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_sede_operativa"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "vw_sedi_per_anagrafica"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "Mezzi_id_sede_ubicazione_fkey"
            columns: ["id_sede_ubicazione"]
            isOneToOne: false
            referencedRelation: "vw_sedi_tutte"
            referencedColumns: ["id_sede"]
          },
        ]
      }
      vw_owner_info: {
        Row: {
          codice_univoco: string | null
          contatto_email: string | null
          contatto_telefono: string | null
          iban: string | null
          id_anagrafica: string | null
          partita_iva: string | null
          pec: string | null
          ragione_sociale: string | null
          sede_legale_cap: number | null
          sede_legale_citta: string | null
          sede_legale_indirizzo: string | null
          sede_legale_provincia: string | null
        }
        Relationships: []
      }
      vw_preventivi_completi: {
        Row: {
          anno: string | null
          clausole_speciali: string | null
          cliente_partita_iva: string | null
          cliente_ragione_sociale: string | null
          codice: string | null
          convertito_in_noleggio_id: string | null
          created_at: string | null
          data_fine: string | null
          data_inizio: string | null
          dati_azienda: Json | null
          dati_cliente: Json | null
          dati_mezzo: Json | null
          deposito_cauzionale: number | null
          id_anagrafica: string | null
          id_anagrafica_fornitore: string | null
          id_mezzo: string | null
          id_preventivo: string | null
          marca: string | null
          matricola: string | null
          modalita_pagamento: string | null
          modello: string | null
          note: string | null
          ore: number | null
          owner_cap: number | null
          owner_citta: string | null
          owner_iban: string | null
          owner_indirizzo: string | null
          owner_partita_iva: string | null
          owner_pec: string | null
          owner_provincia: string | null
          owner_ragione_sociale: string | null
          owner_sdi: string | null
          pdf_bozza_path: string | null
          pdf_firmato_path: string | null
          prezzo_noleggio: number | null
          prezzo_trasporto: number | null
          sede_citta: string | null
          sede_indirizzo: string | null
          sede_nome: string | null
          sede_operativa: string | null
          snapshot_azienda: Json | null
          snapshot_cliente: Json | null
          snapshot_mezzo: Json | null
          stato: Database["public"]["Enums"]["stato_preventivo"] | null
          tempo_indeterminato: boolean | null
          tipo_canone: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prev_noleggi_convertito_in_noleggio_id_fkey"
            columns: ["convertito_in_noleggio_id"]
            isOneToOne: false
            referencedRelation: "noleggi"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "prev_noleggi_convertito_in_noleggio_id_fkey"
            columns: ["convertito_in_noleggio_id"]
            isOneToOne: false
            referencedRelation: "Noleggi"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "prev_noleggi_convertito_in_noleggio_id_fkey"
            columns: ["convertito_in_noleggio_id"]
            isOneToOne: false
            referencedRelation: "vw_card_mezzo"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "prev_noleggi_convertito_in_noleggio_id_fkey"
            columns: ["convertito_in_noleggio_id"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_disponibili_noleggio"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "prev_noleggi_convertito_in_noleggio_id_fkey"
            columns: ["convertito_in_noleggio_id"]
            isOneToOne: false
            referencedRelation: "vw_mezzo_noleggi_attivi"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "prev_noleggi_convertito_in_noleggio_id_fkey"
            columns: ["convertito_in_noleggio_id"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "prev_noleggi_convertito_in_noleggio_id_fkey"
            columns: ["convertito_in_noleggio_id"]
            isOneToOne: false
            referencedRelation: "vw_storico_noleggi"
            referencedColumns: ["id_noleggio"]
          },
          {
            foreignKeyName: "prev_noleggi_convertito_in_noleggio_id_fkey"
            columns: ["convertito_in_noleggio_id"]
            isOneToOne: false
            referencedRelation: "vw_storico_noleggi"
            referencedColumns: ["id_storico"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fornitore_fkey"
            columns: ["id_anagrafica_fornitore"]
            isOneToOne: false
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fornitore_fkey"
            columns: ["id_anagrafica_fornitore"]
            isOneToOne: false
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fornitore_fkey"
            columns: ["id_anagrafica_fornitore"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fornitore_fkey"
            columns: ["id_anagrafica_fornitore"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fornitore_fkey"
            columns: ["id_anagrafica_fornitore"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fornitore_fkey"
            columns: ["id_anagrafica_fornitore"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fornitore_fkey"
            columns: ["id_anagrafica_fornitore"]
            isOneToOne: false
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fornitore_fkey"
            columns: ["id_anagrafica_fornitore"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_anagrafica_fornitore_fkey"
            columns: ["id_anagrafica_fornitore"]
            isOneToOne: false
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "prev_noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "mezzi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "prev_noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "Mezzi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "prev_noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_card_mezzo"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "prev_noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_completi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "prev_noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_disponibili_noleggio"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "prev_noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_guasti"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "prev_noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_selettore"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "prev_noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzo_completo"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "prev_noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "prev_noleggi_id_preventivo_fkey"
            columns: ["id_preventivo"]
            isOneToOne: true
            referencedRelation: "preventivi"
            referencedColumns: ["id_preventivo"]
          },
          {
            foreignKeyName: "prev_noleggi_id_preventivo_fkey"
            columns: ["id_preventivo"]
            isOneToOne: true
            referencedRelation: "Preventivi"
            referencedColumns: ["id_preventivo"]
          },
          {
            foreignKeyName: "prev_noleggi_sede_operativa_fkey"
            columns: ["sede_operativa"]
            isOneToOne: false
            referencedRelation: "sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "prev_noleggi_sede_operativa_fkey"
            columns: ["sede_operativa"]
            isOneToOne: false
            referencedRelation: "Sedi"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "prev_noleggi_sede_operativa_fkey"
            columns: ["sede_operativa"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_sede_operativa"]
          },
          {
            foreignKeyName: "prev_noleggi_sede_operativa_fkey"
            columns: ["sede_operativa"]
            isOneToOne: false
            referencedRelation: "vw_sedi_per_anagrafica"
            referencedColumns: ["id_sede"]
          },
          {
            foreignKeyName: "prev_noleggi_sede_operativa_fkey"
            columns: ["sede_operativa"]
            isOneToOne: false
            referencedRelation: "vw_sedi_tutte"
            referencedColumns: ["id_sede"]
          },
        ]
      }
      vw_sedi_per_anagrafica: {
        Row: {
          anagrafica_nome: string | null
          cap: number | null
          citta: string | null
          id_anagrafica: string | null
          id_sede: string | null
          indirizzo: string | null
          nome_sede: string | null
          provincia: string | null
          ubicazione_completa: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Sedi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Sedi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Sedi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Sedi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Sedi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Sedi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Sedi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Sedi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Sedi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
        ]
      }
      vw_sedi_tutte: {
        Row: {
          cap: number | null
          citta: string | null
          id_sede: string | null
          indirizzo: string | null
          nome_sede: string | null
          provincia: string | null
          ubicazione_completa: string | null
        }
        Insert: {
          cap?: number | null
          citta?: string | null
          id_sede?: string | null
          indirizzo?: string | null
          nome_sede?: string | null
          provincia?: string | null
          ubicazione_completa?: never
        }
        Update: {
          cap?: number | null
          citta?: string | null
          id_sede?: string | null
          indirizzo?: string | null
          nome_sede?: string | null
          provincia?: string | null
          ubicazione_completa?: never
        }
        Relationships: []
      }
      vw_storico_noleggi: {
        Row: {
          data_evento: string | null
          data_fine: string | null
          data_fine_periodo: string | null
          data_inizio: string | null
          data_terminazione_effettiva: string | null
          id_anagrafica: string | null
          id_mezzo: string | null
          id_noleggio: string | null
          id_storico: string | null
          is_terminato: boolean | null
          mezzo_descrizione: string | null
          note: string | null
          prezzo_noleggio: number | null
          prezzo_trasporto: number | null
          ragione_sociale_cliente: string | null
          sede_operativa_descrizione: string | null
          tempo_indeterminato: boolean | null
          tipo_canone: Database["public"]["Enums"]["tipo_canone"] | null
          tipo_evento: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "Anagrafiche"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_complete"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_owners"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_selettore"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_anagrafiche_trasportatori"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_entita_anagrafica_documentale"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Noleggi_id_anagrafica_fkey"
            columns: ["id_anagrafica"]
            isOneToOne: false
            referencedRelation: "vw_owner_info"
            referencedColumns: ["id_anagrafica"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "mezzi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "Mezzi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_card_mezzo"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_completi"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_disponibili_noleggio"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_guasti"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzi_selettore"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_mezzo_completo"
            referencedColumns: ["id_mezzo"]
          },
          {
            foreignKeyName: "Noleggi_id_mezzo_fkey"
            columns: ["id_mezzo"]
            isOneToOne: false
            referencedRelation: "vw_noleggi_completi"
            referencedColumns: ["id_mezzo"]
          },
        ]
      }
    }
    Functions: {
      get_all_tables: {
        Args: never
        Returns: {
          table_name: string
          table_type: string
        }[]
      }
      get_next_document_code: { Args: { p_doc_type: string }; Returns: string }
      get_table_columns: {
        Args: { p_table_name: string }
        Returns: {
          column_default: string
          column_name: string
          data_type: string
          is_nullable: boolean
          ordinal_position: number
        }[]
      }
      get_table_constraints: {
        Args: { p_table_name: string }
        Returns: {
          column_name: string
          constraint_name: string
          constraint_type: string
          foreign_column: string
          foreign_table: string
        }[]
      }
      hasrole: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_userid: string
        }
        Returns: boolean
      }
      introspect_schema: { Args: never; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "user"
      categoria_mezzo:
        | "sollevamento"
        | "trasporto"
        | "escavazione"
        | "compattazione"
        | "altro"
      categoria_uscita:
        | "Spese Bancarie"
        | "Fornitori"
        | "Tasse/Imposte"
        | "Varie"
      categorie_prodotti:
        | "ricambio"
        | "componente"
        | "materiale_consumo"
        | "attrezzatura"
        | "altro"
      competenza_lavorazione:
        | "meccanica"
        | "elettrica"
        | "idraulica"
        | "generale"
      modalita_pagamento:
        | "bonifico_anticipato"
        | "bonifico_30gg"
        | "bonifico_60gg"
        | "bonifico_90gg"
        | "riba_30gg"
        | "riba_60gg"
        | "riba_90gg"
        | "rimessa_diretta"
        | "contrassegno"
      stato_contratto: "bozza" | "inviato" | "firmato" | "attivo" | "annullato"
      stato_funzionamento: "funzionante" | "intervenire" | "ritirare"
      stato_intervento:
        | "aperto"
        | "in lavorazione"
        | "chiuso"
        | "preventivazione"
      stato_lavorazione:
        | "prevista"
        | "aperta"
        | "in lavorazione"
        | "chiusa"
        | "pronta"
        | "assegnata"
        | "in_lavorazione"
        | "completata"
      stato_noleggio:
        | "futuro"
        | "attivo"
        | "scaduto"
        | "archiviato"
        | "terminato"
      stato_preventivo:
        | "bozza"
        | "inviato"
        | "scaduto"
        | "in_revisione"
        | "approvato"
        | "rifiutato"
        | "concluso"
        | "archiviato"
      tipo_canone: "giornaliero" | "mensile"
      tipo_documento_noleggio:
        | "contratto_firmato"
        | "verbale_consegna"
        | "ddt"
        | "foto_consegna"
        | "foto_ritiro"
        | "altro"
      tipo_evento_storico:
        | "creazione"
        | "modifica"
        | "terminazione"
        | "cancellazione"
        | "riattivazione"
        | "cambio_sede"
      tipo_movimento:
        | "BONIFICO"
        | "RICEVUTA_BANCARIA"
        | "ASSEGNO"
        | "CONTANTI"
        | "ALTRO"
      tipo_transazione: "ENTRATA" | "USCITA" | "TRASFERIMENTO"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      categoria_mezzo: [
        "sollevamento",
        "trasporto",
        "escavazione",
        "compattazione",
        "altro",
      ],
      categoria_uscita: [
        "Spese Bancarie",
        "Fornitori",
        "Tasse/Imposte",
        "Varie",
      ],
      categorie_prodotti: [
        "ricambio",
        "componente",
        "materiale_consumo",
        "attrezzatura",
        "altro",
      ],
      competenza_lavorazione: [
        "meccanica",
        "elettrica",
        "idraulica",
        "generale",
      ],
      modalita_pagamento: [
        "bonifico_anticipato",
        "bonifico_30gg",
        "bonifico_60gg",
        "bonifico_90gg",
        "riba_30gg",
        "riba_60gg",
        "riba_90gg",
        "rimessa_diretta",
        "contrassegno",
      ],
      stato_contratto: ["bozza", "inviato", "firmato", "attivo", "annullato"],
      stato_funzionamento: ["funzionante", "intervenire", "ritirare"],
      stato_intervento: [
        "aperto",
        "in lavorazione",
        "chiuso",
        "preventivazione",
      ],
      stato_lavorazione: [
        "prevista",
        "aperta",
        "in lavorazione",
        "chiusa",
        "pronta",
        "assegnata",
        "in_lavorazione",
        "completata",
      ],
      stato_noleggio: [
        "futuro",
        "attivo",
        "scaduto",
        "archiviato",
        "terminato",
      ],
      stato_preventivo: [
        "bozza",
        "inviato",
        "scaduto",
        "in_revisione",
        "approvato",
        "rifiutato",
        "concluso",
        "archiviato",
      ],
      tipo_canone: ["giornaliero", "mensile"],
      tipo_documento_noleggio: [
        "contratto_firmato",
        "verbale_consegna",
        "ddt",
        "foto_consegna",
        "foto_ritiro",
        "altro",
      ],
      tipo_evento_storico: [
        "creazione",
        "modifica",
        "terminazione",
        "cancellazione",
        "riattivazione",
        "cambio_sede",
      ],
      tipo_movimento: [
        "BONIFICO",
        "RICEVUTA_BANCARIA",
        "ASSEGNO",
        "CONTANTI",
        "ALTRO",
      ],
      tipo_transazione: ["ENTRATA", "USCITA", "TRASFERIMENTO"],
    },
  },
} as const
