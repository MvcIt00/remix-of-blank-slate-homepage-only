/**
 * Hook per recuperare i dati dell'azienda owner (is_owner = true)
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DatiAziendaOwner } from "@/components/pdf";

export function useOwnerData() {
  const [ownerData, setOwnerData] = useState<DatiAziendaOwner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOwnerData() {
      try {
        // Recupera l'anagrafica owner
        const { data: anagrafica, error: anagraficaError } = await supabase
          .from("Anagrafiche")
          .select("*")
          .eq("is_owner", true)
          .eq("is_cancellato", false)
          .single();

        if (anagraficaError) throw anagraficaError;

        // Recupera sede legale
        const { data: sedeLegale } = await supabase
          .from("Sedi")
          .select("*")
          .eq("id_anagrafica", anagrafica.id_anagrafica)
          .eq("is_legale", true)
          .eq("is_cancellato", false)
          .single();

        // Recupera dati amministrativi
        const { data: datiAmm } = await supabase
          .from("an_dati_amministrativi")
          .select("*")
          .eq("id_anagrafica", anagrafica.id_anagrafica)
          .single();

        // Recupera contatto aziendale
        const { data: contatto } = await supabase
          .from("an_contatti")
          .select("*")
          .eq("id_anagrafica", anagrafica.id_anagrafica)
          .eq("is_aziendale", true)
          .eq("is_cancellato", false)
          .single();

        const ownerDataComplete: DatiAziendaOwner = {
          ragione_sociale: anagrafica.ragione_sociale,
          partita_iva: anagrafica.partita_iva,
          indirizzo: sedeLegale?.indirizzo || null,
          citta: sedeLegale?.citta || null,
          cap: sedeLegale?.cap?.toString() || null,
          provincia: sedeLegale?.provincia || null,
          telefono: contatto?.telefono || null,
          email: contatto?.email || null,
          pec: datiAmm?.pec || null,
          codice_univoco: datiAmm?.codice_univoco || null,
          iban: datiAmm?.iban || null,
        };

        setOwnerData(ownerDataComplete);
      } catch (err) {
        console.error("Errore caricamento dati owner:", err);
        setError("Impossibile caricare i dati aziendali");
      } finally {
        setLoading(false);
      }
    }

    loadOwnerData();
  }, []);

  return { ownerData, loading, error };
}
