/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  PreventivoNoleggio,
  PreventivoNoleggioInput,
  StatoPreventivo,
} from "@/types/preventiviNoleggio";

interface ConvertiOptions {
  creaContratto?: boolean;
  datiContratto?: Record<string, any>;
}

export function usePreventiviNoleggio() {
  const [preventivi, setPreventivi] = useState<PreventivoNoleggio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreventivi = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: supaError } = await supabase
      .from("prev_noleggi" as any)
      .select(
        "*, Anagrafiche:id_anagrafica ( ragione_sociale ), Mezzi ( matricola, marca, modello ), Noleggi:convertito_in_noleggio_id ( is_terminato )"
      )
      .neq("stato", "archiviato")
      .order("created_at", { ascending: false });

    if (supaError) {
      console.error("Errore caricamento preventivi noleggio", supaError);
      setError("Impossibile caricare i preventivi");
      setLoading(false);
      return;
    }

    setPreventivi((data || []) as unknown as PreventivoNoleggio[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPreventivi();
  }, [fetchPreventivi]);

  const creaPreventivo = async (input: PreventivoNoleggioInput) => {
    // 1. Creazione record nella tabella PADRE (Preventivi)
    const { data: parentData, error: parentError } = await supabase
      .from("Preventivi" as any)
      .insert({
        id_anagrafica: input.id_anagrafica,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (parentError) throw parentError;

    // 2. Creazione record nella tabella FIGLIA (prev_noleggi) usando lo stesso ID
    const payload = {
      ...input,
      id_preventivo: (parentData as any).id_preventivo, // Link fondamentale
      stato: input.stato ?? StatoPreventivo.BOZZA,
    };

    const { data, error: supaError } = await supabase
      .from("prev_noleggi" as any)
      .insert(payload)
      .select(
        "*, Anagrafiche:id_anagrafica ( ragione_sociale ), Mezzi ( matricola, marca, modello ), Noleggi:convertito_in_noleggio_id ( is_terminato )"
      )
      .single();

    if (supaError) {
      // Rollback (best effort): se fallisce la creazione del figlio, proviamo a cancellare il padre orfano
      await supabase.from("Preventivi").delete().eq("id_preventivo", (parentData as any).id_preventivo);
      throw supaError;
    }

    setPreventivi((prev) => [data as unknown as PreventivoNoleggio, ...prev]);
    return data as unknown as PreventivoNoleggio;
  };

  const aggiornaPreventivo = async (
    id_preventivo: string,
    updates: Partial<PreventivoNoleggioInput>
  ) => {
    const { data, error: supaError } = await supabase
      .from("prev_noleggi" as any)
      .update(updates)
      .eq("id_preventivo", id_preventivo)
      .select(
        "*, Anagrafiche:id_anagrafica ( ragione_sociale ), Mezzi ( matricola, marca, modello ), Noleggi:convertito_in_noleggio_id ( is_terminato )"
      )
      .single();

    if (supaError) throw supaError;
    setPreventivi((prev) =>
      prev.map((p) =>
        p.id_preventivo === id_preventivo ? (data as unknown as PreventivoNoleggio) : p
      )
    );
    return data as unknown as PreventivoNoleggio;
  };

  const aggiornaStato = async (
    id_preventivo: string,
    stato: StatoPreventivo
  ) => {
    return aggiornaPreventivo(id_preventivo, { stato });
  };

  const eliminaPreventivo = async (id_preventivo: string) => {
    const { error: supaError } = await supabase
      .from("prev_noleggi" as any)
      .delete()
      .eq("id_preventivo", id_preventivo);
    if (supaError) throw supaError;
    setPreventivi((prev) => prev.filter((p) => p.id_preventivo !== id_preventivo));
  };

  const archiviaPreventivo = async (id_preventivo: string) => {
    const { data, error: supaError } = await supabase
      .from("prev_noleggi" as any)
      .update({ stato: StatoPreventivo.ARCHIVIATO })
      .eq("id_preventivo", id_preventivo)
      .select(
        "*, Anagrafiche:id_anagrafica ( ragione_sociale ), Mezzi ( matricola, marca, modello ), Noleggi:convertito_in_noleggio_id ( is_terminato )"
      )
      .single();

    if (supaError) throw supaError;
    setPreventivi((prev) => prev.filter((p) => p.id_preventivo !== id_preventivo));
    return data as unknown as PreventivoNoleggio;
  };

  const convertiInNoleggio = async (
    preventivo: PreventivoNoleggio,
    options?: ConvertiOptions
  ) => {
    const { data: noleggio, error: noleggioError } = await supabase
      .from("Noleggi")
      .insert({
        id_mezzo: preventivo.id_mezzo,
        id_anagrafica: preventivo.id_anagrafica,
        sede_operativa: preventivo.sede_operativa,
        data_inizio: preventivo.data_inizio,
        data_fine: preventivo.tempo_indeterminato
          ? null
          : preventivo.data_fine ?? null,
        tempo_indeterminato: preventivo.tempo_indeterminato,
        prezzo_noleggio: preventivo.prezzo_noleggio,
        prezzo_trasporto: preventivo.prezzo_trasporto,
        tipo_canone: preventivo.tipo_canone,
        note: preventivo.note,
        stato_noleggio: "attivo",
      })
      .select()
      .single();

    if (noleggioError) throw noleggioError;

    if (options?.creaContratto && options.datiContratto) {
      const noleggioId = (noleggio as { id_noleggio: string }).id_noleggio;
      const { error: contrattoError } = await supabase
        .from("contratti_noleggio")
        .insert({
          id_noleggio: noleggioId,
          id_anagrafica_cliente: preventivo.id_anagrafica,
          id_anagrafica_fornitore: preventivo.id_anagrafica_fornitore ?? preventivo.id_anagrafica,
          data_inizio: preventivo.data_inizio ?? new Date().toISOString().split('T')[0],
          codice_contratto: `CNT-${Date.now()}`,
          dati_cliente: {},
          dati_fornitore: {},
          dati_mezzo: {},
          tempo_indeterminato: preventivo.tempo_indeterminato,
          canone_noleggio: preventivo.prezzo_noleggio,
          tipo_canone: preventivo.tipo_canone,
          costo_trasporto: preventivo.prezzo_trasporto,
          ...options.datiContratto,
        });
      if (contrattoError) throw contrattoError;
    }

    const { data: updatedPreventivo, error: updateError } = await supabase
      .from("prev_noleggi" as any)
      .update({
        // stato: StatoPreventivo.CONVERTITO, // Removed: Status remains as is (e.g. APPROVATO)
        convertito_in_noleggio_id: (noleggio as any).id_noleggio,
      })
      .eq("id_preventivo", preventivo.id_preventivo)
      .select(
        "*, Anagrafiche:id_anagrafica ( ragione_sociale ), Mezzi ( matricola, marca, modello ), Noleggi:convertito_in_noleggio_id ( is_terminato )"
      )
      .single();

    if (updateError) throw updateError;

    setPreventivi((prev) =>
      prev.map((p) =>
        p.id_preventivo === preventivo.id_preventivo
          ? (updatedPreventivo as unknown as PreventivoNoleggio)
          : p
      )
    );

    return {
      preventivoAggiornato: updatedPreventivo as unknown as PreventivoNoleggio,
      noleggioCreato: noleggio,
    };
  };

  return {
    preventivi,
    loading,
    error,
    fetchPreventivi,
    creaPreventivo,
    aggiornaPreventivo,
    aggiornaStato,
    eliminaPreventivo,
    archiviaPreventivo,
    convertiInNoleggio,
  };
}
