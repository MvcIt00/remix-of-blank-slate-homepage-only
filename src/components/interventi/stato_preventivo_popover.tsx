import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Check } from "lucide-react";

type StatoPreventivo = "non preventivato" | "bozza" | "inviato" | "approvato" | "rifiutato";

interface StatoPreventivoPopoverProps {
  statoCorrente: StatoPreventivo | null;
  interventoId?: string;
  prevInterventoId?: string;
  onStatoChange?: () => void;
  hasPreventivoCreato?: boolean;
}

const STATI_CONFIG: Record<StatoPreventivo, { label: string; className: string }> = {
  "non preventivato": { label: "Non Preventivato", className: "bg-gray-500 hover:bg-gray-600" },
  bozza: { label: "Bozza", className: "bg-slate-500 hover:bg-slate-600" },
  inviato: { label: "Inviato", className: "bg-blue-500 hover:bg-blue-600" },
  approvato: { label: "Approvato", className: "bg-green-500 hover:bg-green-600" },
  rifiutato: { label: "Rifiutato", className: "bg-red-500 hover:bg-red-600" },
};

export const StatoPreventivoPopover = ({
  statoCorrente,
  interventoId,
  prevInterventoId,
  onStatoChange,
  hasPreventivoCreato = false,
}: StatoPreventivoPopoverProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Escludi "bozza" se un preventivo è già stato creato
  const statiDisponibili = Object.entries(STATI_CONFIG).filter(([key]) => {
    if (hasPreventivoCreato && key === "bozza") return false;
    return true;
  });

  const handleCambiaStato = async (nuovoStato: StatoPreventivo) => {
    setLoading(true);

    try {
      // Mappa "non preventivato" a null per il DB
      const dbValue = nuovoStato === "non preventivato" ? null : nuovoStato;
      
      // Aggiorna lo stato in "Interventi"
      if (interventoId) {
        const { error } = await supabase
          .from("Interventi")
          .update({ stato_preventivo: dbValue } as any)
          .eq("id_intervento", interventoId);
        if (error) throw error;
      }

      // Aggiorna lo stato in "prev_interventi"
      if (prevInterventoId) {
        const { error } = await supabase
          .from("prev_interventi")
          .update({ stato_preventivo: dbValue } as any)
          .eq("id_intervento", prevInterventoId);
        if (error) throw error;
      }

      toast({
        title: "Stato aggiornato",
        description: `Lo stato è stato cambiato in "${STATI_CONFIG[nuovoStato].label}".`,
      });

      setOpen(false);
      onStatoChange?.();
    } catch (error) {
      console.error("Errore nell'aggiornamento dello stato:", error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare lo stato",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const stato = statoCorrente || "bozza";
  const config = STATI_CONFIG[stato];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {/* 🔧 Fix: il trigger deve essere un elemento focusable (Button) */}
        <Button
          type="button"
          variant="ghost"
          className={`h-auto px-2 py-1 text-sm rounded-full text-white border-transparent cursor-pointer ${config.className}`}
        >
          {config.label}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-56 p-2 z-50" align="start">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground px-2 py-1">Cambia stato</p>

          {statiDisponibili.map(([key, value]) => (
            <Button
              key={key}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-left"
              onClick={() => handleCambiaStato(key as StatoPreventivo)}
              disabled={loading || key === stato}
            >
              <div className="flex items-center gap-2 w-full">
                <div className={`h-3 w-3 rounded-full ${value.className}`} />
                <span className="flex-1">{value.label}</span>
                {key === stato && <Check className="h-4 w-4" />}
              </div>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
