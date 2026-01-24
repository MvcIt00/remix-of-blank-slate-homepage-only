import { useState } from "react";
import { StatusBadge, StatusConfig } from "@/components/ui/status-badge";
import { StatoPreventivo } from "@/types/preventiviNoleggio";
import { DettaglioModificaDialog } from "./DettaglioModificaDialog";

/**
 * Configurazione label per ogni stato preventivo
 * Label custom: IN_REVISIONE → "Da Modificare"
 */
const PREVENTIVO_STATUS_CONFIG: Record<StatoPreventivo, StatusConfig> = {
  [StatoPreventivo.BOZZA]: { label: "Bozza" },
  [StatoPreventivo.DA_INVIARE]: { label: "Da Inviare" },
  [StatoPreventivo.INVIATO]: { label: "Inviato" },
  [StatoPreventivo.IN_REVISIONE]: { label: "Da Modificare" },
  [StatoPreventivo.SCADUTO]: { label: "Scaduto" },
  [StatoPreventivo.APPROVATO]: { label: "Approvato" },
  [StatoPreventivo.RIFIUTATO]: { label: "Rifiutato" },
  [StatoPreventivo.CONCLUSO]: { label: "Concluso" },
  [StatoPreventivo.ARCHIVIATO]: { label: "Archiviato" },
};

/**
 * Transizioni permesse per ogni stato
 * Segue il workflow: bozza → da_inviare → inviato → approvato/rifiutato/scaduto → concluso
 */
const TRANSIZIONI_PERMESSE: Record<StatoPreventivo, StatoPreventivo[]> = {
  [StatoPreventivo.BOZZA]: [StatoPreventivo.DA_INVIARE],
  [StatoPreventivo.DA_INVIARE]: [StatoPreventivo.INVIATO, StatoPreventivo.BOZZA],
  [StatoPreventivo.INVIATO]: [
    StatoPreventivo.APPROVATO,
    StatoPreventivo.RIFIUTATO,
    StatoPreventivo.IN_REVISIONE,
  ],
  [StatoPreventivo.IN_REVISIONE]: [StatoPreventivo.DA_INVIARE, StatoPreventivo.BOZZA],
  [StatoPreventivo.SCADUTO]: [StatoPreventivo.ARCHIVIATO], // Rinnova gestito separatamente
  [StatoPreventivo.APPROVATO]: [StatoPreventivo.CONCLUSO],
  [StatoPreventivo.RIFIUTATO]: [StatoPreventivo.ARCHIVIATO],
  [StatoPreventivo.CONCLUSO]: [], // readonly
  [StatoPreventivo.ARCHIVIATO]: [], // readonly
};

interface PreventivoStatoBadgeProps {
  stato: StatoPreventivo;
  /** Callback per cambio stato - riceve nuovo stato e opzionalmente il dettaglio modifica */
  onStatusChange?: (newStatus: StatoPreventivo, dettaglioModifica?: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

/**
 * PreventivoStatoBadge - Wrapper specifico per stati preventivi noleggio
 * 
 * Utilizza StatusBadge centralizzato con:
 * - Configurazione label custom (es. IN_REVISIONE → "Da Modificare")
 * - Transizioni permesse specifiche per workflow preventivi
 * - Dialog per dettaglio modifica quando si imposta IN_REVISIONE
 */
export function PreventivoStatoBadge({
  stato,
  onStatusChange,
  disabled = false,
  className,
}: PreventivoStatoBadgeProps) {
  const [dettaglioDialogOpen, setDettaglioDialogOpen] = useState(false);

  // Handler interno che intercetta IN_REVISIONE per mostrare dialog
  const handleStatusChange = async (newStatus: StatoPreventivo): Promise<void> => {
    if (!onStatusChange) return;
    
    // Se il nuovo stato è IN_REVISIONE, apriamo il dialog per chiedere il motivo
    if (newStatus === StatoPreventivo.IN_REVISIONE) {
      setDettaglioDialogOpen(true);
      return;
    }
    
    // Per tutti gli altri stati, procediamo normalmente
    await onStatusChange(newStatus);
  };

  // Handler conferma dal dialog dettaglio
  const handleDettaglioConfirm = async (dettaglio: string) => {
    if (!onStatusChange) return;
    await onStatusChange(StatoPreventivo.IN_REVISIONE, dettaglio);
  };

  return (
    <>
      <StatusBadge
        value={stato}
        config={PREVENTIVO_STATUS_CONFIG}
        allowedTransitions={TRANSIZIONI_PERMESSE[stato]}
        onStatusChange={handleStatusChange}
        disabled={disabled}
        className={className}
      />
      
      <DettaglioModificaDialog
        open={dettaglioDialogOpen}
        onOpenChange={setDettaglioDialogOpen}
        onConfirm={handleDettaglioConfirm}
      />
    </>
  );
}
