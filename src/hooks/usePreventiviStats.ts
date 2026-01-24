import { useMemo } from "react";
import { usePreventiviNoleggio } from "./usePreventiviNoleggio";
import { StatoPreventivo } from "@/types/preventiviNoleggio";

export function usePreventiviStats(anno: number, mese: number | null) {
  const { preventivi, loading, error } = usePreventiviNoleggio();

  const stats = useMemo(() => {
    // Filtra preventivi per anno e opzionalmente mese (esclusi archiviati)
    const preventiviPeriodo = preventivi.filter(p => {
      if (p.stato === StatoPreventivo.ARCHIVIATO) return false;
      const dataCreazione = new Date(p.created_at);
      const matchAnno = dataCreazione.getFullYear() === anno;
      const matchMese = mese === null || dataCreazione.getMonth() + 1 === mese;
      return matchAnno && matchMese;
    });

    return {
      totale: preventiviPeriodo.length,
      bozze: preventiviPeriodo.filter(p => p.stato === StatoPreventivo.BOZZA).length,
      daInviare: preventiviPeriodo.filter(p => p.stato === StatoPreventivo.DA_INVIARE).length,
      inviati: preventiviPeriodo.filter(p => p.stato === StatoPreventivo.INVIATO).length,
      scaduti: preventiviPeriodo.filter(p => p.stato === StatoPreventivo.SCADUTO).length,
      inRevisione: preventiviPeriodo.filter(p => p.stato === StatoPreventivo.IN_REVISIONE).length,
    };
  }, [preventivi, anno, mese]);

  // Preventivi per stato filtrati per periodo
  const getPreventiviByStato = (stato: StatoPreventivo) => {
    return preventivi.filter(p => {
      if (p.stato !== stato) return false;
      const dataCreazione = new Date(p.created_at);
      const matchAnno = dataCreazione.getFullYear() === anno;
      const matchMese = mese === null || dataCreazione.getMonth() + 1 === mese;
      return matchAnno && matchMese;
    });
  };

  return { 
    stats, 
    loading, 
    error, 
    preventivi,
    getPreventiviByStato 
  };
}
