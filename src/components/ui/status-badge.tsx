import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface StatusConfig {
  label: string;
  className?: string;
}

export interface StatusBadgeProps<T extends string> {
  /** Valore corrente dello stato */
  value: T;
  /** Configurazione label/stile per ogni stato possibile */
  config: Record<T, StatusConfig>;
  /** Stati verso cui è permessa la transizione (se vuoto = readonly) */
  allowedTransitions?: T[];
  /** Callback cambio stato */
  onStatusChange?: (newStatus: T) => Promise<void>;
  /** Disabilita interazione */
  disabled?: boolean;
  /** Classi aggiuntive per il badge */
  className?: string;
}

/**
 * StatusBadge - Componente centralizzato per gestire stati di entità
 * 
 * Utilizzo generico: qualsiasi enum di stato del sistema
 * - Click apre popover con transizioni permesse
 * - Stile minimale: bordo rettangolare, testo senza icone
 * - Riutilizzabile per Preventivi, Noleggi, Trasporti, Interventi, etc.
 */
export function StatusBadge<T extends string>({
  value,
  config,
  allowedTransitions = [],
  onStatusChange,
  disabled = false,
  className,
}: StatusBadgeProps<T>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentConfig = config[value];
  const isReadonly = allowedTransitions.length === 0 || disabled || !onStatusChange;

  const handleTransition = async (newStatus: T) => {
    if (!onStatusChange || loading) return;
    
    setLoading(true);
    try {
      await onStatusChange(newStatus);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  // Badge base - stile minimale con bordo
  const badgeContent = (
    <Badge
      variant="outline"
      className={cn(
        "cursor-pointer select-none font-medium text-xs px-2 py-1 rounded-sm",
        "border-border hover:bg-muted/50 transition-colors",
        isReadonly && "cursor-default opacity-75",
        loading && "opacity-50",
        currentConfig?.className,
        className
      )}
    >
      {currentConfig?.label ?? value}
    </Badge>
  );

  // Se readonly, ritorna solo il badge senza popover
  if (isReadonly) {
    return badgeContent;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {badgeContent}
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-1 z-50 bg-popover border shadow-md" 
        align="start"
        sideOffset={4}
      >
        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted-foreground px-2 py-1">
            Cambia stato:
          </p>
          {allowedTransitions.map((status) => (
            <Button
              key={status}
              variant="ghost"
              size="sm"
              className="justify-start h-8 text-sm font-normal hover:bg-accent"
              disabled={loading || status === value}
              onClick={() => handleTransition(status)}
            >
              {config[status]?.label ?? status}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
