import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { MezzoClickable } from "@/components/mezzo-clickable";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { TableActions } from "@/components/ui/table-actions";
import { Edit, Trash2 } from "lucide-react";
import { BaseSelector } from "@/components/ui/base-selector";

interface Anagrafica {
  id_anagrafica: string;
  ragione_sociale: string;
  partita_iva: string | null;
}

interface Mezzo {
  id_mezzo: string;
  marca: string | null;
  modello: string | null;
  matricola: string | null;
  id_interno: string | null;
  stato_funzionamento: "funzionante" | "intervenire" | "ritirare" | null;
  stato_funzionamento_descrizione: string | null;
  id_sede_assegnata: string | null;
}

interface Sede {
  id_sede: string;
  nome_sede: string | null;
  citta: string | null;
  indirizzo: string | null;
}

interface MezziPerSede {
  sede: Sede;
  mezzi: Mezzo[];
}

// Popover stato
const StatoPopover = ({
  mezzo,
  onUpdate,
}: {
  mezzo: Mezzo;
  onUpdate: (stato: string, descrizione: string) => void;
}) => {
  const [nuovoStato, setNuovoStato] = useState(mezzo.stato_funzionamento || "");
  const [descrizione, setDescrizione] = useState(mezzo.stato_funzionamento_descrizione || "");
  const [open, setOpen] = useState(false);

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

          <Button
            onClick={() => {
              onUpdate(nuovoStato, descrizione);
              setOpen(false);
            }}
            className="w-full"
          >
            Salva
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const ParcoMacchine = () => {
  const [selectedAnagrafica, setSelectedAnagrafica] = useState<Anagrafica | null>(null);
  const [loading, setLoading] = useState(false);
  const [mezziPerSede, setMezziPerSede] = useState<MezziPerSede[]>([]);


  // Carica mezzi e sedi quando viene selezionata un'anagrafica
  useEffect(() => {
    const loadMezziPerSede = async () => {
      if (!selectedAnagrafica) {
        setMezziPerSede([]);
        return;
      }

      setLoading(true);

      const { data: sedi, error: sediError } = await supabase
        .from("Sedi")
        .select("id_sede, nome_sede, citta, indirizzo")
        .eq("id_anagrafica", selectedAnagrafica.id_anagrafica)
        .eq("is_cancellato", false);

      if (sediError) {
        console.error("Errore nel caricamento sedi:", sediError);
        setLoading(false);
        return;
      }

      const { data: mezzi, error: mezziError } = await supabase
        .from("Mezzi")
        .select(
          "id_mezzo, marca, modello, matricola, id_interno, stato_funzionamento, stato_funzionamento_descrizione, id_sede_assegnata",
        )
        .eq("id_anagrafica", selectedAnagrafica.id_anagrafica)
        .eq("is_cancellato", false);

      if (mezziError) {
        console.error("Errore nel caricamento mezzi:", mezziError);
        setLoading(false);
        return;
      }

      const grouped: MezziPerSede[] = (sedi || []).map((sede) => ({
        sede,
        mezzi: (mezzi || []).filter((m) => m.id_sede_assegnata === sede.id_sede),
      }));

      const mezziSenzaSede = (mezzi || []).filter((m) => !m.id_sede_assegnata);
      if (mezziSenzaSede.length > 0) {
        grouped.push({
          sede: {
            id_sede: "null",
            nome_sede: "Nessuna sede assegnata",
            citta: null,
            indirizzo: null,
          },
          mezzi: mezziSenzaSede,
        });
      }

      setMezziPerSede(grouped);
      setLoading(false);
    };

    loadMezziPerSede();
  }, [selectedAnagrafica]);

  const handleSelectAnagrafica = (anagrafica: Anagrafica) => {
    setSelectedAnagrafica(anagrafica);
  };

  const handleUpdateStato = async (mezzoId: string, nuovoStato: string, descrizione: string) => {
    const { error } = await supabase
      .from("Mezzi")
      .update({
        stato_funzionamento: nuovoStato as Mezzo["stato_funzionamento"],
        stato_funzionamento_descrizione: descrizione,
      })
      .eq("id_mezzo", mezzoId);

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

      // Ricarica i dati
      if (selectedAnagrafica) {
        setSelectedAnagrafica({ ...selectedAnagrafica });
      }
    }
  };
  const columns: DataTableColumn<Mezzo>[] = [
    {
      key: "displayName",
      label: "Mezzo",
      render: (_, mezzo) => {
        const displayName =
          mezzo.marca && mezzo.modello
            ? `${mezzo.marca} ${mezzo.modello}`
            : mezzo.marca || mezzo.modello || "-";
        return (
          <MezzoClickable mezzoId={mezzo.id_mezzo}>
            <span className="underline-offset-4 hover:underline cursor-pointer font-medium">
              {displayName}
            </span>
          </MezzoClickable>
        );
      },
    },
    { key: "matricola", label: "Matricola" },
    { key: "id_interno", label: "ID Interno" },
    {
      key: "stato_funzionamento",
      label: "Stato",
      render: (_, mezzo) => (
        <StatoPopover
          mezzo={mezzo}
          onUpdate={(stato, descrizione) => handleUpdateStato(mezzo.id_mezzo, stato, descrizione)}
        />
      ),
    },
  ];

  const handleEdit = (mezzo: Mezzo) => {
    // Navigate or open dialog - for now we use Tooltip and consistency
    toast({ title: "Modifica mezzo", description: `Funzionalità per ${mezzo.matricola} in arrivo o usa la card` });
  };

  const handleDelete = async (mezzoId: string) => {
    if (confirm("Sei sicuro di voler eliminare questo mezzo?")) {
      const { error } = await supabase.from("Mezzi").update({ is_cancellato: true }).eq("id_mezzo", mezzoId);
      if (error) {
        toast({ title: "Errore", description: "Errore nell'eliminazione", variant: "destructive" });
      } else {
        toast({ title: "Mezzo eliminato" });
        if (selectedAnagrafica) setSelectedAnagrafica({ ...selectedAnagrafica });
      }
    }
  };

  const renderActions = (mezzo: Mezzo) => (
    <TableActions
      onEdit={() => handleEdit(mezzo)}
      onDelete={() => handleDelete(mezzo.id_mezzo)}
    />
  );

  return (
    <div className="space-y-6">
      <BaseSelector
        onSearch={async (term) => {
          const { data, error } = await supabase
            .from("Anagrafiche")
            .select("id_anagrafica, ragione_sociale, partita_iva")
            .eq("is_cancellato", false)
            .or(`ragione_sociale.ilike.%${term}%,partita_iva.ilike.%${term}%`)
            .limit(10);

          if (error) {
            console.error("Search error:", error);
            return null;
          }
          return data;
        }}
        onSelect={handleSelectAnagrafica}
        getDisplayValue={(a) => a.ragione_sociale}
        getId={(a) => a.id_anagrafica}
        placeholder="Cerca anagrafica per ragione sociale o P.IVA..."
        renderItem={(anagrafica) => (
          <div className="flex flex-col">
            <span className="font-medium">{anagrafica.ragione_sociale}</span>
            {anagrafica.partita_iva && (
              <span className="text-xs text-muted-foreground">P.IVA: {anagrafica.partita_iva}</span>
            )}
          </div>
        )}
      />

      {selectedAnagrafica && (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Caricamento mezzi...</div>
          ) : mezziPerSede.length > 0 ? (
            mezziPerSede.map((gruppo) => (
              <div key={gruppo.sede.id_sede} className="space-y-3">
                <div className="border-b pb-2">
                  <h3 className="text-lg font-semibold">{gruppo.sede.nome_sede || "Sede senza nome"}</h3>
                  {gruppo.sede.citta && (
                    <p className="text-sm text-muted-foreground">
                      {gruppo.sede.citta}
                      {gruppo.sede.indirizzo && ` - ${gruppo.sede.indirizzo}`}
                    </p>
                  )}
                </div>

                {gruppo.mezzi.length > 0 ? (
                  <DataTable
                    data={gruppo.mezzi}
                    columns={columns}
                    actions={renderActions}
                    searchPlaceholder="Cerca in questa sede..."
                  />
                ) : (
                  <p className="text-sm text-muted-foreground py-4">Nessun mezzo assegnato a questa sede</p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">Nessun mezzo trovato per questa anagrafica</div>
          )}
        </div>
      )}
    </div>
  );
};
