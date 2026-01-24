import { useMemo } from "react";
import { usePreventiviNoleggio } from "./usePreventiviNoleggio";
import { StatoPreventivo } from "@/types/preventiviNoleggio";

/**
 * Hook per statistiche operative preventivi.
 * 
 * FILOSOFIA (Protocollo AX04/AX05/AX06):
 * Questo hook serve la Dashboard Proattiva che suggerisce azioni all'operatore.
 * NON è un contatore statistico ma un indicatore operativo.
 * 
 * Gli archiviati sono esclusi (is_archiviato = true).
 */
export function usePreventiviStats() {
  const { preventivi, loading, error } = usePreventiviNoleggio();

  const stats = useMemo(() => {
    // Escludi archiviati dalla dashboard operativa
    const attivi = preventivi.filter(p => !p.is_archiviato);

    return {
      bozze: attivi.filter(p => p.stato === StatoPreventivo.BOZZA).length,
      daInviare: attivi.filter(p => p.stato === StatoPreventivo.DA_INVIARE).length,
      inviati: attivi.filter(p => p.stato === StatoPreventivo.INVIATO).length,
      daModificare: attivi.filter(p => p.stato === StatoPreventivo.IN_REVISIONE).length,
      scaduti: attivi.filter(p => p.stato === StatoPreventivo.SCADUTO).length,
      // Totale operativo (solo stati che richiedono azione)
      totale: attivi.filter(p => 
        [StatoPreventivo.BOZZA, StatoPreventivo.DA_INVIARE, StatoPreventivo.INVIATO, 
         StatoPreventivo.IN_REVISIONE, StatoPreventivo.SCADUTO].includes(p.stato)
      ).length,
    };
  }, [preventivi]);

  // Restituisce anche i preventivi filtrati per stato (per il dialog)
  const getPreventiviPerStato = (stato: StatoPreventivo) => {
    return preventivi.filter(p => p.stato === stato && !p.is_archiviato);
  };

  return { stats, loading, error, getPreventiviPerStato };
}
