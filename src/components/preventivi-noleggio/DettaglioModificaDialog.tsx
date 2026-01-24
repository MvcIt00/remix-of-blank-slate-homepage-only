import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface DettaglioModificaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (dettaglio: string) => Promise<void>;
  title?: string;
  placeholder?: string;
}

/**
 * DettaglioModificaDialog - Dialog per inserire il motivo di una richiesta modifica
 * 
 * Utilizzato quando un operatore imposta un preventivo in stato "Da Modificare" (IN_REVISIONE)
 * Il dettaglio viene salvato nella colonna dettaglio_modifica del DB
 */
export function DettaglioModificaDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Motivo della modifica richiesta",
  placeholder = "Descrivi cosa deve essere modificato..."
}: DettaglioModificaDialogProps) {
  const [dettaglio, setDettaglio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!dettaglio.trim()) {
      setError("Inserisci un motivo per la modifica");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await onConfirm(dettaglio.trim());
      setDettaglio("");
      onOpenChange(false);
    } catch (e) {
      setError("Errore durante il salvataggio");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setDettaglio("");
      setError(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          <Label htmlFor="dettaglio">
            Descrivi il motivo della modifica richiesta
          </Label>
          <Textarea
            id="dettaglio"
            value={dettaglio}
            onChange={(e) => setDettaglio(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className="resize-none"
            autoFocus
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={loading}
          >
            Annulla
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || !dettaglio.trim()}
          >
            {loading ? "Salvataggio..." : "Conferma"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
