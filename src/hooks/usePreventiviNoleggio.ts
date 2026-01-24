/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  PreventivoNoleggio,
  PreventivoNoleggioInput,
  StatoPreventivo,
} from "@/types/preventiviNoleggio";
import { PreventivoCompletoView } from "@/types/database_views";
import { toast } from "@/hooks/use-toast";

interface ConvertiOptions {
  creaContratto?: boolean;
  datiContratto?: Record<string, any>;
}

// Helper per mappare la View al tipo interno dell'app
function mapPreventivoViewToModel(view: PreventivoCompletoView): PreventivoNoleggio {
  // 1. PRIORITÀ SNAPSHOTS (Immutabilità Enterprise)
  // IDV Turn 2895: dati_cliente, dati_mezzo, dati_azienda confermati nel DB reale
  const snapshotCliente = view.dati_cliente || view.snapshot_cliente || {};
  const snapshotMezzo = view.dati_mezzo || view.snapshot_mezzo || {};
  const snapshotAzienda = view.dati_azienda || view.snapshot_azienda || {};

  return {
    id_preventivo: view.id_preventivo,
    id_anagrafica: view.id_anagrafica,
    id_mezzo: view.id_mezzo || undefined,
    data_inizio: view.data_inizio || undefined,
    data_fine: view.data_fine || undefined,
    tempo_indeterminato: view.tempo_indeterminato,
    prezzo_noleggio: view.prezzo_noleggio || undefined,
    prezzo_trasporto: view.prezzo_trasporto || undefined,
    tipo_canone: view.tipo_canone || "mensile",
    note: view.note || undefined,
    stato: view.stato || StatoPreventivo.BOZZA,
    codice: view.codice || null,
    pdf_firmato_path: view.pdf_firmato_path || null,
    convertito_in_noleggio_id: view.convertito_in_noleggio_id || undefined,
    is_archiviato: view.is_archiviato ?? false,
    created_at: view.created_at,

    // Hydration con fallback: Snapshot > Database View Live > Default
    Anagrafiche: {
      ragione_sociale: snapshotCliente.ragione_sociale || view.cliente_ragione_sociale || "N/D",
      partita_iva: snapshotCliente.partita_iva || view.cliente_partita_iva,
      pec: snapshotCliente.pec || view.cliente_pec,
      codice_univoco: snapshotCliente.codice_univoco || view.cliente_codice_univoco,
      email: snapshotCliente.email || view.cliente_email,
      telefono: snapshotCliente.telefono || view.cliente_telefono,
      indirizzo: snapshotCliente.indirizzo || undefined,
      citta: snapshotCliente.citta || undefined,
      cap: snapshotCliente.cap || undefined,
      provincia: snapshotCliente.provincia || undefined,
    },
    Mezzi: (snapshotMezzo.matricola || view.matricola) ? {
      matricola: snapshotMezzo.matricola || view.matricola,
      marca: snapshotMezzo.marca || view.marca,
      modello: snapshotMezzo.modello || view.modello,
      anno: snapshotMezzo.anno || view.anno,
      ore: snapshotMezzo.ore || view.ore,
      categoria: snapshotMezzo.categoria || undefined,
    } : undefined,
    Sedi: view.sede_nome || view.sede_indirizzo ? {
      nome_sede: view.sede_nome,
      indirizzo: view.sede_indirizzo,
      citta: view.sede_citta,
      cap: view.sede_cap,
      provincia: view.sede_provincia
    } : undefined,
    Noleggi: view.noleggio_is_terminato !== null ? {
      is_terminato: view.noleggio_is_terminato
    } : undefined,
    sede_operativa: view.sede_operativa || null,
    updated_at: view.updated_at || null,
    // Extra Info per PDF (BRANDING DOMINANTE - Priorità assoluta ai dati Live Owner)
    dati_azienda: {
      ragione_sociale: view.owner_ragione_sociale || snapshotAzienda.ragione_sociale || "MVC TOSCANA CARRELLI",
      partita_iva: view.owner_partita_iva || snapshotAzienda.partita_iva || "000000001",
      pec: view.owner_pec || snapshotAzienda.pec,
      codice_univoco: view.owner_sdi || snapshotAzienda.codice_univoco,
      iban: view.owner_iban || snapshotAzienda.iban,
      indirizzo: view.owner_indirizzo || snapshotAzienda.indirizzo || "Viale magri 115",
      citta: view.owner_citta || snapshotAzienda.citta || "Livorno",
      cap: view.owner_cap || snapshotAzienda.cap,
      provincia: view.owner_provincia || snapshotAzienda.provincia,
      telefono: "0586.000000",
      email: "info@toscanacarrelli.it"
    }
  } as PreventivoNoleggio;
}

export function usePreventiviNoleggio() {
  const queryClient = useQueryClient();

  // 1. FETCH con React Query su VIEW
  const { data: preventivi = [], isLoading: loading, error } = useQuery({
    queryKey: ["preventivi_noleggio"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vw_preventivi_completi" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Mapping dei dati dalla View piana alla struttura a oggetti annidati usata nel frontend
      return (data as unknown as PreventivoCompletoView[]).map(mapPreventivoViewToModel);
    }
  });

  // 2. MUTATION: Crea
  const creaMutation = useMutation({
    mutationFn: async (input: PreventivoNoleggioInput) => {
      // Step 1: Crea padre
      const { data: parentData, error: parentError } = await supabase
        .from("Preventivi" as any)
        .insert({ id_anagrafica: input.id_anagrafica })
        .select()
        .single();
      if (parentError) throw parentError;

      // Step 2: Crea figlio
      const payload = {
        ...input,
        id_preventivo: (parentData as any).id_preventivo,
        stato: input.stato ?? StatoPreventivo.DA_INVIARE, // Default: pronto per invio
      };
      const { data, error: childError } = await supabase
        .from("prev_noleggi" as any)
        .insert(payload)
        .select()
        .single();

      if (childError) {
        // Rollback parziale
        await supabase.from("Preventivi").delete().eq("id_preventivo", (parentData as any).id_preventivo);
        throw childError;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["preventivi_noleggio"] });
    }
  });

  // 3. MUTATION: Aggiorna (Atomica)
  const aggiornaMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PreventivoNoleggioInput> }) => {
      // Se l'anagrafica cambia nel form, dobbiamo aggiornare anche il record Padre per coerenza
      if (updates.id_anagrafica) {
        const { error: parentError } = await supabase
          .from("Preventivi")
          .update({ id_anagrafica: updates.id_anagrafica })
          .eq("id_preventivo", id);

        if (parentError) throw parentError;
      }

      const { error } = await supabase
        .from("prev_noleggi" as any)
        .update(updates)
        .eq("id_preventivo", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["preventivi_noleggio"] });
    }
  });

  // 4. MUTATION: Elimina
  const eliminaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("prev_noleggi" as any).delete().eq("id_preventivo", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["preventivi_noleggio"] });
    }
  });

  // 5. MUTATION: Archivia (mantiene stato originale, imposta is_archiviato = true)
  const archiviaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("prev_noleggi" as any)
        .update({ is_archiviato: true })
        .eq("id_preventivo", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["preventivi_noleggio"] });
    }
  });

  // 6. MUTATION: Duplica preventivo (per "Rinnova")
  const duplicaMutation = useMutation({
    mutationFn: async (originalId: string) => {
      // Trova il preventivo originale
      const originale = preventivi.find(p => p.id_preventivo === originalId);
      if (!originale) throw new Error("Preventivo non trovato");

      // Step 1: Crea nuovo padre
      const { data: parentData, error: parentError } = await supabase
        .from("Preventivi" as any)
        .insert({ id_anagrafica: originale.id_anagrafica })
        .select()
        .single();
      if (parentError) throw parentError;

      // Step 2: Crea figlio clonato (azzerando date e stato)
      const payload = {
        id_preventivo: (parentData as any).id_preventivo,
        id_anagrafica: originale.id_anagrafica,
        id_mezzo: originale.id_mezzo,
        sede_operativa: originale.sede_operativa,
        data_inizio: null, // Date azzerate per rinnovo
        data_fine: null,
        tempo_indeterminato: originale.tempo_indeterminato,
        prezzo_noleggio: originale.prezzo_noleggio,
        prezzo_trasporto: originale.prezzo_trasporto,
        tipo_canone: originale.tipo_canone,
        note: `Rinnovo da ${originale.codice || 'BOZZA'}`,
        stato: StatoPreventivo.BOZZA, // Nuovo preventivo parte da bozza
      };
      
      const { data, error: childError } = await supabase
        .from("prev_noleggi" as any)
        .insert(payload)
        .select()
        .single();

      if (childError) {
        await supabase.from("Preventivi").delete().eq("id_preventivo", (parentData as any).id_preventivo);
        throw childError;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["preventivi_noleggio"] });
    }
  });

  // 6. LOGICA DI CONVERSIONE (Complessa, lasciamo come async function wrappata)
  const convertiInNoleggio = async (preventivo: PreventivoNoleggio, options?: ConvertiOptions) => {
    try {
      const { data: noleggio, error: noleggioError } = await supabase
        .from("Noleggi")
        .insert({
          id_mezzo: preventivo.id_mezzo,
          id_anagrafica: preventivo.id_anagrafica,
          sede_operativa: preventivo.sede_operativa,
          data_inizio: preventivo.data_inizio,
          data_fine: preventivo.tempo_indeterminato ? null : preventivo.data_fine ?? null,
          tempo_indeterminato: preventivo.tempo_indeterminato,
          prezzo_noleggio: preventivo.prezzo_noleggio,
          prezzo_trasporto: preventivo.prezzo_trasporto,
          tipo_canone: preventivo.tipo_canone,
          note: preventivo.note,
        })
        .select()
        .single();

      if (noleggioError) throw noleggioError;

      if (options?.creaContratto && options.datiContratto) {
        const noleggioId = (noleggio as any).id_noleggio;
        const { error: contrattoError } = await supabase
          .from("contratti_noleggio")
          .insert({
            id_noleggio: noleggioId,
            id_anagrafica_cliente: preventivo.id_anagrafica,
            id_anagrafica_fornitore: preventivo.id_anagrafica_fornitore ?? preventivo.id_anagrafica, // Fallback safe
            data_inizio: preventivo.data_inizio ?? new Date().toISOString().split('T')[0],
            tempo_indeterminato: preventivo.tempo_indeterminato,
            canone_noleggio: preventivo.prezzo_noleggio,
            tipo_canone: preventivo.tipo_canone,
            costo_trasporto: preventivo.prezzo_trasporto,
            ...options.datiContratto,
          } as any);
        if (contrattoError) throw contrattoError;
      }

      // Update preventivo con link
      const { error: updateError } = await supabase
        .from("prev_noleggi" as any)
        .update({ convertito_in_noleggio_id: (noleggio as any).id_noleggio })
        .eq("id_preventivo", preventivo.id_preventivo);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ["preventivi_noleggio"] });
      queryClient.invalidateQueries({ queryKey: ["noleggi_attivi"] }); // Aggiorna anche l'altra lista!

      return { noleggioCreato: noleggio };

    } catch (e) {
      console.error(e);
      toast({ title: "Errore conversione", description: "Qualcosa è andato storto.", variant: "destructive" });
      throw e;
    }
  };

  return {
    preventivi,
    loading,
    error: error ? (error as Error).message : null,
    fetchPreventivi: async () => queryClient.invalidateQueries({ queryKey: ["preventivi_noleggio"] }),
    creaPreventivo: creaMutation.mutateAsync,
    aggiornaPreventivo: (id: string, v: any) => aggiornaMutation.mutateAsync({ id, updates: v }),
    aggiornaStato: (id: string, s: StatoPreventivo) => aggiornaMutation.mutateAsync({ id, updates: { stato: s } }),
    eliminaPreventivo: eliminaMutation.mutateAsync,
    archiviaPreventivo: archiviaMutation.mutateAsync,
    duplicaPreventivo: duplicaMutation.mutateAsync,
    convertiInNoleggio,
  };
}
