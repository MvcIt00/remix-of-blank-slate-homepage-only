import { useState } from "react";
import { usePreventiviStats } from "@/hooks/usePreventiviStats";
import { StatoPreventivo } from "@/types/preventiviNoleggio";
import { PreventiviFilteredDialog } from "./PreventiviFilteredDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const MESI = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
];

interface StatItemProps {
  label: string;
  count: number;
  onClick?: () => void;
}

function StatItem({ label, count, onClick }: StatItemProps) {
  const isDisabled = count === 0;
  
  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={cn(
        "text-base font-bold transition-colors",
        isDisabled 
          ? "text-muted-foreground/40 cursor-not-allowed" 
          : "text-foreground hover:text-primary cursor-pointer"
      )}
    >
      {label} {count}
    </button>
  );
}

export function PreventiviDashboard() {
  const annoCorrente = new Date().getFullYear();
  const meseCorrente = new Date().getMonth() + 1;

  const [anno, setAnno] = useState(annoCorrente);
  const [mese, setMese] = useState<number | null>(meseCorrente);

  const { stats, loading } = usePreventiviStats(anno, mese);
  const [filterDialog, setFilterDialog] = useState<{
    open: boolean;
    stato: StatoPreventivo;
    title: string;
  }>({
    open: false,
    stato: StatoPreventivo.INVIATO,
    title: "",
  });

  const openFilter = (stato: StatoPreventivo, title: string) => {
    setFilterDialog({ open: true, stato, title });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {stats.totale} preventivi {mese ? `in ${MESI[mese - 1]}` : "nel"} {anno}
        </p>
        <div className="flex items-center gap-2">
          <Select 
            value={mese?.toString() ?? "all"} 
            onValueChange={(v) => setMese(v === "all" ? null : Number(v))}
          >
            <SelectTrigger className="w-[130px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutto l'anno</SelectItem>
              {MESI.map((nomeMese, index) => (
                <SelectItem key={index + 1} value={(index + 1).toString()}>
                  {nomeMese}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={anno.toString()} onValueChange={(v) => setAnno(Number(v))}>
            <SelectTrigger className="w-[90px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026, 2027].map((a) => (
                <SelectItem key={a} value={a.toString()}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <StatItem
          label="Bozze"
          count={stats.bozze}
          onClick={() => openFilter(StatoPreventivo.BOZZA, "Preventivi Bozza")}
        />

        <StatItem
          label="Da Inviare"
          count={stats.daInviare}
          onClick={() => openFilter(StatoPreventivo.DA_INVIARE, "Preventivi Da Inviare")}
        />
        
        <StatItem
          label="Inviati"
          count={stats.inviati}
          onClick={() => openFilter(StatoPreventivo.INVIATO, "Preventivi Inviati")}
        />

        <StatItem
          label="Scaduti"
          count={stats.scaduti}
          onClick={() => openFilter(StatoPreventivo.SCADUTO, "Preventivi Scaduti")}
        />

        <StatItem
          label="In Revisione"
          count={stats.inRevisione}
          onClick={() => openFilter(StatoPreventivo.IN_REVISIONE, "Preventivi In Revisione")}
        />
      </div>

      <PreventiviFilteredDialog
        open={filterDialog.open}
        onOpenChange={(open) => setFilterDialog(prev => ({ ...prev, open }))}
        filterStato={filterDialog.stato}
        title={filterDialog.title}
      />
    </div>
  );
}
