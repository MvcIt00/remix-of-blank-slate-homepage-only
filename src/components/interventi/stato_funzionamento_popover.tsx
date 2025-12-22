import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface Mezzo {
  id_mezzo: string;
  stato_funzionamento: "funzionante" | "intervenire" | "ritirare" | null;
  stato_funzionamento_descrizione: string | null;
}

interface StatoFunzionamentoPopoverProps {
  mezzo: Mezzo;
  onUpdate?: () => void;
}

export const StatoFunzionamentoPopover = ({ mezzo, onUpdate }: StatoFunzionamentoPopoverProps) => {
  const [nuovoStato, setNuovoStato] = useState(mezzo.stato_funzionamento || "");
  const [descrizione, setDescrizione] = useState(mezzo.stato_funzionamento_descrizione || "");
  const [open, setOpen] = useState(false);

  const handleUpdate = async () => {
    const { error } = await supabase
      .from("Mezzi")
      .update({
        stato_funzionamento: nuovoStato as any,
        stato_funzionamento_descrizione: descrizione,
      })
      .eq("id_mezzo", mezzo.id_mezzo);

    if (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare lo stato del mezzo",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Stato aggiornato",
        description: "Lo stato del mezzo è stato modificato con successo",
      });
      setOpen(false);
      onUpdate?.();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={
            mezzo.stato_funzionamento === "funzionante"
              ? "default"
              : mezzo.stato_funzionamento === "ritirare"
              ? "destructive"
              : "secondary"
          }
          size="sm"
          className="h-8 rounded-full px-3 text-xs cursor-pointer hover:opacity-80"
        >
          {mezzo.stato_funzionamento || "Non definito"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium">Modifica Stato Funzionamento</h4>

          <div className="space-y-2">
            <Label>Stato</Label>
            <Select value={nuovoStato} onValueChange={setNuovoStato}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="funzionante">Funzionante</SelectItem>
                <SelectItem value="intervenire">Intervenire</SelectItem>
                <SelectItem value="ritirare">Ritirare</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Descrizione</Label>
            <Textarea
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)}
              placeholder="Descrizione dello stato..."
              rows={3}
            />
          </div>

          <Button onClick={handleUpdate} className="w-full">
            Salva
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
