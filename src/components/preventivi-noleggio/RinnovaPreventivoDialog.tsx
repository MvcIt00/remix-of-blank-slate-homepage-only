import { useState } from "react";
import { format, addDays } from "date-fns";
import { it } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PreventivoNoleggio } from "@/types/preventiviNoleggio";

interface RinnovaPreventivoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preventivo: PreventivoNoleggio | null;
  onConfirm: (nuovaDataScadenza: string) => Promise<void>;
}

/**
 * RinnovaPreventivoDialog - Rinnova un preventivo scaduto
 * 
 * Invece di duplicare il record:
 * - Imposta nuova data_scadenza
 * - Riporta lo stato a "inviato"
 * - Mantiene continuità commerciale (AX05)
 */
export function RinnovaPreventivoDialog({
  open,
  onOpenChange,
  preventivo,
  onConfirm,
}: RinnovaPreventivoDialogProps) {
  const [dataScadenza, setDataScadenza] = useState<Date | undefined>(
    addDays(new Date(), 30)
  );
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!dataScadenza || !preventivo) return;
    
    setLoading(true);
    try {
      await onConfirm(format(dataScadenza, "yyyy-MM-dd"));
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rinnova Preventivo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {preventivo && (
            <div className="text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Preventivo:</span>{" "}
                {preventivo.codice || "BOZZA"}
              </p>
              <p>
                <span className="font-medium text-foreground">Cliente:</span>{" "}
                {preventivo.Anagrafiche?.ragione_sociale ?? "-"}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Nuova data di scadenza</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dataScadenza && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataScadenza ? (
                    format(dataScadenza, "PPP", { locale: it })
                  ) : (
                    <span>Seleziona data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dataScadenza}
                  onSelect={setDataScadenza}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <p className="text-xs text-muted-foreground">
            Il preventivo tornerà allo stato "Inviato" con la nuova scadenza.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annulla
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!dataScadenza || loading}
          >
            {loading ? "Rinnovo..." : "Rinnova e Invia"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
