import { useState } from "react";
import { Button } from "@/components/ui/button";
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

interface RiattivaNoleggioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noleggioId: string;
  storicoId: string;
  onSuccess?: () => void;
}

export function RiattivaNoleggioDialog({
  open,
  onOpenChange,
  noleggioId,
  storicoId,
  onSuccess,
}: RiattivaNoleggioDialogProps) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!noleggioId || !storicoId) return;

    setLoading(true);
    try {
      // 1. Get the original data from storico record
      const { data: storicoRecord, error: fetchError } = await supabase
        .from("noleggi_storico")
        .select("data_inizio, data_fine, tempo_indeterminato, note")
        .eq("id_storico", storicoId)
        .single();

      if (fetchError) throw fetchError;

      // 2. Restore the noleggio to its original state
      const { error: updateError } = await supabase
        .from("Noleggi")
        .update({
          is_terminato: false,
          data_terminazione_effettiva: null,
          data_inizio: storicoRecord.data_inizio,
          data_fine: storicoRecord.data_fine,
          tempo_indeterminato: storicoRecord.tempo_indeterminato,
          note: storicoRecord.note,
        })
        .eq("id_noleggio", noleggioId);

      if (updateError) throw updateError;

      // 3. Delete the storico record (it was a mistake, so remove it)
      const { error: deleteError } = await supabase
        .from("noleggi_storico")
        .delete()
        .eq("id_storico", storicoId);

      if (deleteError) throw deleteError;

      toast({
        title: "Successo",
        description: "Noleggio ripristinato con successo",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error restoring noleggio:", error);
      toast({
        title: "Errore",
        description: "Impossibile ripristinare il noleggio",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ripristina Noleggio</DialogTitle>
          <DialogDescription>
            Stai per annullare la terminazione di questo noleggio. Il noleggio tornerà attivo con i dati originali e la riga verrà rimossa dallo storico.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Questa operazione è pensata per correggere errori di terminazione. 
            Il noleggio verrà ripristinato esattamente come era prima della terminazione.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? "Ripristino..." : "Ripristina Noleggio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
