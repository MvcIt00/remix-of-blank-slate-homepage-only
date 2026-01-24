import { StatusBadge, StatusConfig } from "@/components/ui/status-badge";
import { StatoPreventivo } from "@/types/preventiviNoleggio";

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
  onStatusChange?: (newStatus: StatoPreventivo) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

/**
 * PreventivoStatoBadge - Wrapper specifico per stati preventivi noleggio
 * 
 * Utilizza StatusBadge centralizzato con:
 * - Configurazione label custom (es. IN_REVISIONE → "Da Modificare")
 * - Transizioni permesse specifiche per workflow preventivi
 */
export function PreventivoStatoBadge({
  stato,
  onStatusChange,
  disabled = false,
  className,
}: PreventivoStatoBadgeProps) {
  return (
    <StatusBadge
      value={stato}
      config={PREVENTIVO_STATUS_CONFIG}
      allowedTransitions={TRANSIZIONI_PERMESSE[stato]}
      onStatusChange={onStatusChange}
      disabled={disabled}
      className={className}
    />
  );
}
