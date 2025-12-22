import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Check } from "lucide-react";

type StatoIntervento = "aperto" | "in lavorazione" | "chiuso" | "preventivazione";

interface StatoInterventoPopoverProps {
  statoCorrente: StatoIntervento | null;
  interventoId: string;
  onStatoChange?: () => void;
}

const STATI_CONFIG: Record<StatoIntervento, { label: string; className: string }> = {
  aperto: { label: "Aperto", className: "bg-cyan-500 hover:bg-cyan-600" },
  "in lavorazione": { label: "In Lavorazione", className: "bg-blue-500 hover:bg-blue-600" },
  chiuso: { label: "Chiuso", className: "bg-gray-500 hover:bg-gray-600" },
  preventivazione: { label: "Preventivazione", className: "bg-purple-500 hover:bg-purple-600" },
};

export const StatoInterventoPopover = ({
  statoCorrente,
  interventoId,
  onStatoChange,
}: StatoInterventoPopoverProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCambiaStato = async (nuovoStato: StatoIntervento) => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from("Interventi")
        .update({ stato_intervento: nuovoStato })
        .eq("id_intervento", interventoId);

      if (error) throw error;

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

  const stato = statoCorrente || "aperto";
  const config = STATI_CONFIG[stato];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
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

          {Object.entries(STATI_CONFIG).map(([key, value]) => (
            <Button
              key={key}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-left"
              onClick={() => handleCambiaStato(key as StatoIntervento)}
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
