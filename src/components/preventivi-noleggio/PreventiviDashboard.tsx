import { useState } from "react";
import { FileText, Send, Clock, AlertTriangle, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

interface StatCardProps {
  label: string;
  count: number;
  icon: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
  onClick?: () => void;
}

function StatCard({ label, count, icon, variant = "secondary", onClick }: StatCardProps) {
  const isDisabled = count === 0;
  
  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg transition-colors",
        isDisabled 
          ? "opacity-50 cursor-not-allowed" 
          : "hover:bg-muted/50 cursor-pointer"
      )}
    >
      <Badge variant={variant} className="h-8 min-w-[2rem] justify-center text-sm font-bold">
        {count}
      </Badge>
      <span className="text-sm text-muted-foreground flex items-center gap-1">
        {icon}
        {label}
      </span>
    </button>
  );
}

export function PreventiviDashboard() {
  const annoCorrente = new Date().getFullYear();
  const meseCorrente = new Date().getMonth() + 1;

  const [anno, setAnno] = useState(annoCorrente);
  const [mese, setMese] = useState(meseCorrente);

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
          {stats.totale} preventivi in {MESI[mese - 1]} {anno}
        </p>
        <div className="flex items-center gap-2">
          <Select value={mese.toString()} onValueChange={(v) => setMese(Number(v))}>
            <SelectTrigger className="w-[130px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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

      <div className="flex flex-wrap gap-1">
        <StatCard
          label="Bozze"
          count={stats.bozze}
          icon={<FileText className="h-3.5 w-3.5" />}
          variant="outline"
          onClick={() => openFilter(StatoPreventivo.BOZZA, "Preventivi Bozza")}
        />

        <StatCard
          label="Da Inviare"
          count={stats.daInviare}
          icon={<Send className="h-3.5 w-3.5" />}
          variant="default"
          onClick={() => openFilter(StatoPreventivo.DA_INVIARE, "Preventivi Da Inviare")}
        />
        
        <StatCard
          label="Inviati"
          count={stats.inviati}
          icon={<Clock className="h-3.5 w-3.5" />}
          variant="secondary"
          onClick={() => openFilter(StatoPreventivo.INVIATO, "Preventivi Inviati")}
        />

        <StatCard
          label="Scaduti"
          count={stats.scaduti}
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
          variant="destructive"
          onClick={() => openFilter(StatoPreventivo.SCADUTO, "Preventivi Scaduti")}
        />

        <StatCard
          label="In Revisione"
          count={stats.inRevisione}
          icon={<Edit className="h-3.5 w-3.5" />}
          variant="outline"
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
