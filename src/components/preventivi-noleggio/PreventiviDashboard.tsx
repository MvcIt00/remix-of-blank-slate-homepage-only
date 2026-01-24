import { useState } from "react";
import { FileText, Send, Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePreventiviStats } from "@/hooks/usePreventiviStats";
import { StatoPreventivo } from "@/types/preventiviNoleggio";
import { PreventiviFilteredDialog } from "./PreventiviFilteredDialog";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  count: number;
  icon: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
  onClick?: () => void;
}

function StatCard({ label, count, icon, variant = "secondary", onClick }: StatCardProps) {
  if (count === 0) return null;
  
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
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
  const { stats, loading } = usePreventiviStats();
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {stats.totale} preventivi attivi
        </p>
      </div>

      <div className="flex flex-wrap gap-1">
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
          icon={<FileText className="h-3.5 w-3.5" />}
          variant="outline"
          onClick={() => openFilter(StatoPreventivo.IN_REVISIONE, "Preventivi In Revisione")}
        />

        <StatCard
          label="Approvati"
          count={stats.approvati}
          icon={<CheckCircle className="h-3.5 w-3.5" />}
          variant="default"
          onClick={() => openFilter(StatoPreventivo.APPROVATO, "Preventivi Approvati")}
        />

        <StatCard
          label="Rifiutati"
          count={stats.rifiutati}
          icon={<XCircle className="h-3.5 w-3.5" />}
          variant="destructive"
          onClick={() => openFilter(StatoPreventivo.RIFIUTATO, "Preventivi Rifiutati")}
        />
      </div>

      {stats.totale === 0 && (
        <p className="text-sm text-muted-foreground italic">
          Nessun preventivo attivo quest'anno
        </p>
      )}

      <PreventiviFilteredDialog
        open={filterDialog.open}
        onOpenChange={(open) => setFilterDialog(prev => ({ ...prev, open }))}
        filterStato={filterDialog.stato}
        title={filterDialog.title}
      />
    </div>
  );
}
