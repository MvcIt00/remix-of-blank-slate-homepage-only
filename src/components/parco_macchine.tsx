import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TableActions } from "@/components/ui/table-actions";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { MezzoClickable } from "@/components/mezzo-clickable";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { BaseSelector } from "@/components/ui/base-selector";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { MezzoCompleto } from "@/types/database_views";
import { Loader2 } from "lucide-react";

interface Anagrafica {
  id_anagrafica: string;
  ragione_sociale: string;
  partita_iva: string | null;
}

// Popover stato refactored
const StatoPopover = ({
  mezzo,
  onUpdate,
}: {
  mezzo: MezzoCompleto;
  onUpdate: (mezzoId: string, stato: string, descrizione: string) => void;
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
              onUpdate(mezzo.id_mezzo, nuovoStato, descrizione);
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
  const queryClient = useQueryClient();

  // Query per recuperare i mezzi dell'anagrafica selezionata (VIEW OTTIMIZZATA)
  const { data: mezzi = [], isLoading } = useQuery({
    queryKey: ["mezzi_completi", selectedAnagrafica?.id_anagrafica],
    queryFn: async () => {
      if (!selectedAnagrafica) return [];

      const { data, error } = await supabase
        .from("vw_mezzi_completi" as any)
        .select("*")
        .eq("id_anagrafica", selectedAnagrafica.id_anagrafica)
        .eq("is_cancellato", false);

      if (error) throw error;
      return data as unknown as MezzoCompleto[];
    },
    enabled: !!selectedAnagrafica,
  });

  // Mutation per aggiornare lo stato
  const updateStatoMutation = useMutation({
    mutationFn: async ({ id, stato, descrizione }: { id: string; stato: string; descrizione: string }) => {
      const { error } = await supabase
        .from("Mezzi")
        .update({
          stato_funzionamento: stato as any, // TS Enum mismatch workaround
          stato_funzionamento_descrizione: descrizione
        })
        .eq("id_mezzo", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Stato aggiornato", description: "Lo stato del mezzo è stato salvato correttamente." });
      queryClient.invalidateQueries({ queryKey: ["mezzi_completi"] });
    },
    onError: () => {
      toast({ title: "Errore", description: "Impossibile aggiornare lo stato.", variant: "destructive" });
    }
  });

  // Mutation per "eliminare" (logic delete)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("Mezzi").update({ is_cancellato: true }).eq("id_mezzo", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Mezzo eliminato" });
      queryClient.invalidateQueries({ queryKey: ["mezzi_completi"] });
    },
    onError: () => {
      toast({ title: "Errore", description: "Errore durante l'eliminazione", variant: "destructive" });
    }
  });

  // Raggruppamento Client-Side (Velocissimo con useMemo)
  const groupedMezzi = useMemo(() => {
    if (!mezzi.length) return [];

    // Raggruppa per ID Sede
    const groups: Record<string, { nome: string, indirizzo: string, mezzi: MezzoCompleto[] }> = {};
    const noSedeKey = "no_sede";

    mezzi.forEach(m => {
      const key = m.id_sede_assegnata || noSedeKey;
      if (!groups[key]) {
        groups[key] = {
          nome: m.nome_sede_ubicazione || "Nessuna sede assegnata",
          indirizzo: m.sede_ubicazione_indirizzo ? `${m.sede_ubicazione_indirizzo}${m.sede_ubicazione_citta ? `, ${m.sede_ubicazione_citta}` : ''}` : "",
          mezzi: []
        };
      }
      groups[key].mezzi.push(m);
    });

    return Object.values(groups);
  }, [mezzi]);


  const columns: DataTableColumn<MezzoCompleto>[] = [
    {
      key: "matricola", // Usiamo matricola come chiave principale o fallback
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
          onUpdate={(id, stato, desc) => updateStatoMutation.mutate({ id, stato, descrizione: desc })}
        />
      ),
    },
  ];

  const renderActions = (mezzo: MezzoCompleto) => (
    <TableActions
      onEdit={() => toast({ title: "Modifica", description: "Funzionalità coming soon" })}
      onDelete={() => {
        if (confirm("Sei sicuro di voler eliminare questo mezzo?")) {
          deleteMutation.mutate(mezzo.id_mezzo);
        }
      }}
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

          if (error) return null;
          return data;
        }}
        onSelect={(item) => setSelectedAnagrafica(item)}
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
        <div className="space-y-8 animate-in fade-in duration-500">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : groupedMezzi.length > 0 ? (
            groupedMezzi.map((gruppo, idx) => (
              <div key={idx} className="space-y-4">
                <div className="flex flex-col border-l-4 border-primary pl-4">
                  <h3 className="text-xl font-bold text-foreground">{gruppo.nome}</h3>
                  {gruppo.indirizzo && (
                    <p className="text-sm text-muted-foreground">{gruppo.indirizzo}</p>
                  )}
                </div>

                <DataTable
                  data={gruppo.mezzi}
                  columns={columns}
                  actions={renderActions}
                  searchPlaceholder={`Cerca mezzi in ${gruppo.nome}...`}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
              <p className="text-muted-foreground">Nessun mezzo trovato per questa anagrafica.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
