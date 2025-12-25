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
  // Snapshot priority: if snapshot exists, use it for historical integrity
  const cliente = view.snapshot_cliente || {};
  const mezzo = view.snapshot_mezzo || {};

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
    created_at: view.created_at,

    // Snapshot-aware mapping
    Anagrafiche: {
      ragione_sociale: cliente.ragione_sociale || view.cliente_ragione_sociale || "N/D",
      partita_iva: cliente.partita_iva || view.cliente_partita_iva,
      pec: cliente.pec || view.cliente_pec,
      codice_univoco: cliente.codice_univoco || view.cliente_codice_univoco,
      email: view.cliente_email,
      telefono: view.cliente_telefono
    },
    Mezzi: (mezzo.matricola || view.matricola) ? {
      matricola: mezzo.matricola || view.matricola,
      marca: mezzo.marca || view.marca,
      modello: mezzo.modello || view.modello,
      anno: mezzo.anno || view.anno,
      ore: mezzo.ore || view.ore
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
    } : undefined
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
        stato: input.stato ?? StatoPreventivo.BOZZA,
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

  // 5. MUTATION: Archivia
  const archiviaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("prev_noleggi" as any)
        .update({ stato: StatoPreventivo.ARCHIVIATO })
        .eq("id_preventivo", id);
      if (error) throw error;
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
    fetchPreventivi: async () => queryClient.invalidateQueries({ queryKey: ["preventivi_noleggio"] }), // Dummy function for compatibility
    creaPreventivo: creaMutation.mutateAsync,
    aggiornaPreventivo: (id: string, v: any) => aggiornaMutation.mutateAsync({ id, updates: v }),
    aggiornaStato: (id: string, s: StatoPreventivo) => aggiornaMutation.mutateAsync({ id, updates: { stato: s } }),
    eliminaPreventivo: eliminaMutation.mutateAsync,
    archiviaPreventivo: archiviaMutation.mutateAsync,
    convertiInNoleggio,
  };
}
