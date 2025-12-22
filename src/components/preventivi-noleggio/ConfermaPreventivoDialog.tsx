import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PreventivoNoleggio } from "@/types/preventiviNoleggio";

interface ConfermaPreventivoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preventivo: PreventivoNoleggio | null;
  onConfirm: (preventivo: PreventivoNoleggio) => Promise<void>;
}

export function ConfermaPreventivoDialog({
  open,
  onOpenChange,
  preventivo,
  onConfirm,
}: ConfermaPreventivoDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!preventivo) return null;

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(preventivo);
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Conferma e attiva noleggio</DialogTitle>
          <DialogDescription>
            Confermando, il preventivo verrà convertito in un noleggio attivo e marcato come convertito.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-sm">
          <p><strong>Cliente:</strong> {preventivo.Anagrafiche?.ragione_sociale ?? preventivo.id_anagrafica}</p>
          <p><strong>Mezzo:</strong> {preventivo.Mezzi?.matricola ?? preventivo.id_mezzo}</p>
          <p>
            <strong>Periodo:</strong>{" "}
            {preventivo.tempo_indeterminato
              ? "Tempo indeterminato"
              : `${preventivo.data_inizio ?? "-"} → ${preventivo.data_fine ?? "-"}`}
          </p>
          <p><strong>Canone:</strong> {preventivo.prezzo_noleggio ?? "N/D"} {preventivo.tipo_canone ?? ""}</p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annulla</Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? "Conversione..." : "Conferma e attiva"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
