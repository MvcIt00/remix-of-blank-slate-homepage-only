import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePreventiviStats } from "@/hooks/usePreventiviStats";
import { PreventiviFilteredDialog } from "./PreventiviFilteredDialog";
import { StatoPreventivo } from "@/types/preventiviNoleggio";
import { cn } from "@/lib/utils";

// Voci operative (ordine da protocollo)
const VOCI_OPERATIVE = [
  { key: 'bozze', label: 'Bozze', stato: StatoPreventivo.BOZZA },
  { key: 'daInviare', label: 'Da Inviare', stato: StatoPreventivo.DA_INVIARE },
  { key: 'inviati', label: 'Inviati', stato: StatoPreventivo.INVIATO },
  { key: 'daModificare', label: 'Da Modificare', stato: StatoPreventivo.IN_REVISIONE },
  { key: 'scaduti', label: 'Scaduti', stato: StatoPreventivo.SCADUTO },
] as const;

interface StatItemProps {
  label: string;
  count: number;
  onClick?: () => void;
}

function StatItem({ label, count, onClick }: StatItemProps) {
  const isDisabled = count === 0;
  
  return (
    <button
      type="button"
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={cn(
        "text-lg font-bold transition-colors",
        isDisabled 
          ? "text-muted-foreground/40 cursor-not-allowed" 
          : "text-foreground hover:text-primary cursor-pointer"
      )}
    >
      {label} <span className="text-xl">{count}</span>
    </button>
  );
}

export function PreventiviDashboard() {
  const { stats, loading } = usePreventiviStats();
  const [filterDialog, setFilterDialog] = useState<{
    open: boolean;
    stato: StatoPreventivo;
    title: string;
  }>({ open: false, stato: StatoPreventivo.BOZZA, title: "" });

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-4">
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  const handleOpenDialog = (voce: typeof VOCI_OPERATIVE[number]) => {
    setFilterDialog({
      open: true,
      stato: voce.stato,
      title: voce.label,
    });
  };

  return (
    <>
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {VOCI_OPERATIVE.map((voce) => (
              <StatItem
                key={voce.key}
                label={voce.label}
                count={stats[voce.key as keyof typeof stats] as number}
                onClick={() => handleOpenDialog(voce)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <PreventiviFilteredDialog
        open={filterDialog.open}
        onOpenChange={(open) => setFilterDialog(prev => ({ ...prev, open }))}
        filterStato={filterDialog.stato}
        title={filterDialog.title}
      />
    </>
  );
}
