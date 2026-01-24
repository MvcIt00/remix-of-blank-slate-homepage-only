import { useMemo } from "react";
import { usePreventiviNoleggio } from "./usePreventiviNoleggio";
import { StatoPreventivo } from "@/types/preventiviNoleggio";

export function usePreventiviStats() {
  const { preventivi, loading, error } = usePreventiviNoleggio();

  const stats = useMemo(() => {
    const annoCorrente = new Date().getFullYear();
    
    // Filtra preventivi dell'anno corrente (non archiviati)
    const preventiviAttivi = preventivi.filter(p => {
      const anno = new Date(p.created_at).getFullYear();
      return anno === annoCorrente && p.stato !== StatoPreventivo.ARCHIVIATO;
    });

    return {
      totale: preventiviAttivi.length,
      bozze: preventiviAttivi.filter(p => p.stato === StatoPreventivo.BOZZA).length,
      daInviare: preventiviAttivi.filter(p => p.stato === StatoPreventivo.DA_INVIARE).length,
      inviati: preventiviAttivi.filter(p => p.stato === StatoPreventivo.INVIATO).length,
      scaduti: preventiviAttivi.filter(p => p.stato === StatoPreventivo.SCADUTO).length,
      inRevisione: preventiviAttivi.filter(p => p.stato === StatoPreventivo.IN_REVISIONE).length,
      approvati: preventiviAttivi.filter(p => p.stato === StatoPreventivo.APPROVATO).length,
      rifiutati: preventiviAttivi.filter(p => p.stato === StatoPreventivo.RIFIUTATO).length,
      conclusi: preventiviAttivi.filter(p => p.stato === StatoPreventivo.CONCLUSO).length,
    };
  }, [preventivi]);

  // Preventivi per stato (per dialog filtrati)
  const getPreventiviByStato = (stato: StatoPreventivo) => {
    return preventivi.filter(p => p.stato === stato);
  };

  return { 
    stats, 
    loading, 
    error, 
    preventivi,
    getPreventiviByStato 
  };
}
