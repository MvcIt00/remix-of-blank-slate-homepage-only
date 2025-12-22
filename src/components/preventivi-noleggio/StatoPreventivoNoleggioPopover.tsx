import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { StatoPreventivo } from "@/types/preventiviNoleggio";

const statoLabels: Record<StatoPreventivo, string> = {
  [StatoPreventivo.BOZZA]: "Bozza",
  [StatoPreventivo.INVIATO]: "Inviato",
  [StatoPreventivo.APPROVATO]: "Approvato",
  [StatoPreventivo.RIFIUTATO]: "Rifiutato",
  [StatoPreventivo.CONCLUSO]: "Concluso",
  [StatoPreventivo.ARCHIVIATO]: "Archiviato",
};

const nextStates: Record<StatoPreventivo, StatoPreventivo[]> = {
  [StatoPreventivo.BOZZA]: [StatoPreventivo.INVIATO, StatoPreventivo.APPROVATO, StatoPreventivo.RIFIUTATO],
  [StatoPreventivo.INVIATO]: [StatoPreventivo.BOZZA, StatoPreventivo.APPROVATO, StatoPreventivo.RIFIUTATO],
  [StatoPreventivo.APPROVATO]: [StatoPreventivo.BOZZA, StatoPreventivo.INVIATO, StatoPreventivo.RIFIUTATO],
  [StatoPreventivo.RIFIUTATO]: [StatoPreventivo.BOZZA, StatoPreventivo.INVIATO, StatoPreventivo.APPROVATO],
  [StatoPreventivo.CONCLUSO]: [StatoPreventivo.BOZZA, StatoPreventivo.INVIATO, StatoPreventivo.APPROVATO, StatoPreventivo.RIFIUTATO],
  [StatoPreventivo.ARCHIVIATO]: [StatoPreventivo.BOZZA, StatoPreventivo.INVIATO, StatoPreventivo.APPROVATO, StatoPreventivo.RIFIUTATO],
};

interface StatoPreventivoNoleggioPopoverProps {
  stato: StatoPreventivo;
  onChange: (stato: StatoPreventivo) => Promise<void>;
  disabled?: boolean;
}

export function StatoPreventivoNoleggioPopover({
  stato,
  onChange,
  disabled,
}: StatoPreventivoNoleggioPopoverProps) {
  const options = nextStates[stato] || [];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || options.length === 0}>
          <Badge variant={
            stato === StatoPreventivo.RIFIUTATO
              ? "destructive"
              : stato === StatoPreventivo.APPROVATO
                ? "default"
                : stato === StatoPreventivo.CONCLUSO
                  ? "outline"
                  : "secondary"
          }>
            {statoLabels[stato]}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 space-y-2">
        <p className="text-sm font-semibold">Cambia stato</p>
        {options.length === 0 && (
          <p className="text-sm text-muted-foreground">Nessuna transizione disponibile</p>
        )}
        {options.map((next) => (
          <Button
            key={next}
            variant="ghost"
            size="sm"
            className="w-full justify-between"
            onClick={() => onChange(next)}
          >
            {statoLabels[next]}
            <Check className="h-4 w-4" />
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
