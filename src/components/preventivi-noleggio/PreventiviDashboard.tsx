import { useState } from "react";
import { FileText, Send, AlertTriangle } from "lucide-react";
import { usePreventiviStats } from "@/hooks/usePreventiviStats";
import { PreventiviFilteredDialog } from "./PreventiviFilteredDialog";

type FilterType = "inviati" | "scaduti" | null;

export function PreventiviDashboard() {
  const { stats, loading, preventiviInviati, preventiviScaduti } = usePreventiviStats();
  const [activeFilter, setActiveFilter] = useState<FilterType>(null);

  const currentYear = new Date().getFullYear();

  const handleOpenDialog = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  const getDialogData = () => {
    switch (activeFilter) {
      case "inviati":
        return preventiviInviati;
      case "scaduti":
        return preventiviScaduti;
      default:
        return [];
    }
  };

  const getDialogTitle = () => {
    switch (activeFilter) {
      case "inviati":
        return `Preventivi Inviati (${stats.inviati})`;
      case "scaduti":
        return `Preventivi Scaduti (${stats.scaduti})`;
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="flex gap-4">
          <div className="h-16 w-32 bg-muted animate-pulse rounded" />
          <div className="h-16 w-32 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Totale annuale */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span className="text-sm">
            <span className="font-semibold text-foreground text-lg">{stats.totale}</span> preventivi nel {currentYear}
          </span>
        </div>

        {/* Statistiche cliccabili */}
        <div className="flex gap-4">
          {/* Inviati */}
          <button
            onClick={() => handleOpenDialog("inviati")}
            className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border bg-card hover:bg-accent hover:border-accent-foreground/20 transition-colors cursor-pointer group"
          >
            <Send className="h-4 w-4 text-blue-500 group-hover:text-blue-600" />
            <div className="text-left">
              <p className="text-2xl font-bold text-foreground">{stats.inviati}</p>
              <p className="text-xs text-muted-foreground">Inviati</p>
            </div>
          </button>

          {/* Scaduti */}
          <button
            onClick={() => handleOpenDialog("scaduti")}
            className="flex items-center gap-2 px-4 py-3 rounded-lg border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 hover:border-destructive/50 transition-colors cursor-pointer group"
          >
            <AlertTriangle className="h-4 w-4 text-destructive group-hover:text-destructive" />
            <div className="text-left">
              <p className="text-2xl font-bold text-destructive">{stats.scaduti}</p>
              <p className="text-xs text-destructive/80">Scaduti</p>
            </div>
          </button>
        </div>
      </div>

      {/* Dialog filtrato */}
      <PreventiviFilteredDialog
        open={activeFilter !== null}
        onOpenChange={(open) => !open && setActiveFilter(null)}
        data={getDialogData()}
        title={getDialogTitle()}
        loading={loading}
      />
    </>
  );
}
