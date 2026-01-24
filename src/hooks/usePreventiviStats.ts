import { useMemo } from "react";
import { usePreventiviNoleggio } from "./usePreventiviNoleggio";
import { StatoPreventivo } from "@/types/preventiviNoleggio";

export function usePreventiviStats() {
  const { preventivi, loading, ...rest } = usePreventiviNoleggio();

  const stats = useMemo(() => {
    const annoCorrente = new Date().getFullYear();
    const preventiviAnno = preventivi.filter((p) => {
      if (!p.created_at) return false;
      return new Date(p.created_at).getFullYear() === annoCorrente;
    });

    return {
      totale: preventiviAnno.length,
      inviati: preventiviAnno.filter((p) => p.stato === StatoPreventivo.INVIATO).length,
      scaduti: preventiviAnno.filter((p) => p.stato === StatoPreventivo.SCADUTO).length,
    };
  }, [preventivi]);

  // Preventivi filtrati per stato (usati nei dialog)
  const preventiviInviati = useMemo(
    () => preventivi.filter((p) => p.stato === StatoPreventivo.INVIATO),
    [preventivi]
  );

  const preventiviScaduti = useMemo(
    () => preventivi.filter((p) => p.stato === StatoPreventivo.SCADUTO),
    [preventivi]
  );

  return {
    stats,
    loading,
    preventivi,
    preventiviInviati,
    preventiviScaduti,
    ...rest,
  };
}
