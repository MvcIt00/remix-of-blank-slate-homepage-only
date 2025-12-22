import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TrasformaInPreventivoDialogProps {
  intervento: {
    id_intervento: string;
    codice_intervento: string;
    Mezzi: {
      id_mezzo: string;
    };
  };
  onSuccess?: () => void;
}

export const TrasformaInPreventivoDialog = ({ intervento, onSuccess }: TrasformaInPreventivoDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nomePreventivo, setNomePreventivo] = useState(
    `Preventivo ${intervento.codice_intervento}`
  );

  const handleTrasformaInPreventivo = async () => {
    if (!nomePreventivo.trim()) {
      toast({
        title: "Errore",
        description: "Il nome del preventivo è obbligatorio",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Recupera l'anagrafica dal mezzo
      const { data: mezzoData, error: mezzoError } = await supabase
        .from("Mezzi")
        .select("id_anagrafica")
        .eq("id_mezzo", intervento.Mezzi.id_mezzo)
        .single();

      if (mezzoError) throw mezzoError;

      // 1. Crea il preventivo (tabella madre)
      const { data: preventivoData, error: preventivoError } = await supabase
        .from("Preventivi")
        .insert({
          id_anagrafica: mezzoData.id_anagrafica,
        })
        .select()
        .single();

      if (preventivoError) throw preventivoError;

      // 2. Crea il record in prev_interventi  
      const { error: prevInterventoError } = await supabase
        .from("prev_interventi")
        .insert([{
          id_preventivo: preventivoData.id_preventivo,
          id_intervento: intervento.id_intervento,
          stato_preventivo: "bozza" as const,
          nome_preventivo: nomePreventivo,
        }]);

      if (prevInterventoError) throw prevInterventoError;

      // 3. Update stato_preventivo e stato_intervento in Interventi table
      const { error: updateInterventoError } = await supabase
        .from("Interventi")
        .update({ 
          stato_preventivo: "bozza",
          stato_intervento: "preventivazione"
        })
        .eq("id_intervento", intervento.id_intervento);

      if (updateInterventoError) throw updateInterventoError;

      toast({
        title: "Preventivo creato",
        description: `Il preventivo "${nomePreventivo}" è stato creato con successo`,
      });

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Errore nella creazione del preventivo:", error);
      toast({
        title: "Errore",
        description: "Impossibile creare il preventivo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          <FileText className="h-4 w-4 mr-1" />
          Crea Preventivo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trasforma in Preventivo</DialogTitle>
          <DialogDescription>
            Trasforma l'intervento {intervento.codice_intervento} in un preventivo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome Preventivo *</Label>
            <Input
              value={nomePreventivo}
              onChange={(e) => setNomePreventivo(e.target.value)}
              placeholder="Nome del preventivo..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleTrasformaInPreventivo} disabled={loading}>
              {loading ? "Creazione..." : "Crea Preventivo"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
