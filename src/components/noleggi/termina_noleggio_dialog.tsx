import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface TerminaNoleggioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noleggioId: string;
  noteEsistenti?: string | null;
  onSuccess: () => void;
}

export function TerminaNoleggioDialog({
  open,
  onOpenChange,
  noleggioId,
  noteEsistenti,
  onSuccess,
}: TerminaNoleggioDialogProps) {
  const today = new Date().toISOString().split("T")[0];
  const [dataTerminazione, setDataTerminazione] = useState(today);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  // Sync note state when dialog opens with new rental
  useEffect(() => {
    if (open) {
      setNote(noteEsistenti || "");
      setDataTerminazione(new Date().toISOString().split("T")[0]);
    }
  }, [open, noteEsistenti]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("Noleggi")
        .update({
          is_terminato: true,
          stato_noleggio: "terminato",
          data_terminazione_effettiva: dataTerminazione,
          note: note || null,
        })
        .eq("id_noleggio", noleggioId);

      if (error) throw error;

      // 2. Aggiorna lo stato del preventivo se esiste
      await supabase
        .from("prev_noleggi")
        .update({ stato: "concluso" })
        .eq("convertito_in_noleggio_id", noleggioId);

      toast({
        title: "Successo",
        description: "Noleggio terminato con successo",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error terminating noleggio:", error);
      toast({
        title: "Errore",
        description: "Errore nella terminazione del noleggio",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Termina Noleggio</DialogTitle>
          <DialogDescription>
            Indica la data effettiva di terminazione del noleggio e aggiungi eventuali note finali.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="data-terminazione">Data Terminazione Effettiva</Label>
            <Input
              id="data-terminazione"
              type="date"
              value={dataTerminazione}
              onChange={(e) => setDataTerminazione(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              La data in cui il noleggio è effettivamente terminato
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              placeholder="Inserisci eventuali note finali sul noleggio..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              Es: "Mezzo ritirato 3 giorni dopo per motivi logistici"
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Annulla
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? "Terminazione..." : "Conferma Terminazione"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
