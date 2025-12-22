import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Building2, Edit, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { TableActions } from "@/components/ui/table-actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { TrasformaInPreventivoDialog } from "@/components/interventi/trasforma_preventivo_dialog";
import { VisualizzaPreventivoDialog } from "@/components/interventi/visualizza_preventivo_dialog";
import { StatoPreventivoPopover } from "@/components/interventi/stato_preventivo_popover";
import { useNavigate } from "react-router-dom";

interface InterventoCreato {
  id_intervento: string;
  codice_intervento: string;
  descrizione_intervento: string | null;
  created_at: string;
  stato_intervento: string | null;
  stato_preventivo: string | null;
  Mezzi: {
    id_mezzo: string;
    marca: string | null;
    modello: string | null;
    matricola: string | null;
    id_interno: string | null;
    ubicazione: string | null;
  };
  prev_interventi: Array<{
    stato_preventivo: string | null;
  }>;
}

const PreventiviAssistenza = () => {
  const navigate = useNavigate();
  const [interventi, setInterventi] = useState<InterventoCreato[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStato, setFiltroStato] = useState<string>("tutti");

  const fetchInterventi = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("Interventi")
      .select(`
        id_intervento,
        codice_intervento,
        descrizione_intervento,
        created_at,
        stato_intervento,
        stato_preventivo,
        Mezzi!inner (
          id_mezzo,
          marca,
          modello,
          matricola,
          id_interno,
          ubicazione
        ),
        prev_interventi (
          stato_preventivo
        )
      `)
      .eq("is_cancellato", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Errore nel caricamento interventi:", error);
    } else {
      setInterventi(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchInterventi();
  }, []);

  const handleEliminaIntervento = async (id: string) => {
    const { error } = await supabase
      .from("Interventi")
      .update({ is_cancellato: true })
      .eq("id_intervento", id);

    if (error) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'intervento",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Intervento eliminato",
        description: "L'intervento è stato eliminato con successo",
      });
      fetchInterventi();
    }
  };

  const interventiFiltered = interventi.filter((intervento) => {
    if (filtroStato === "tutti") return true;

    // Check stato in prev_interventi first (higher priority - quote stato)
    if (intervento.prev_interventi && intervento.prev_interventi.length > 0) {
      return intervento.prev_interventi[0]?.stato_preventivo === filtroStato;
    }

    // Otherwise check stato directly in Interventi (intervention stato)
    return intervento.stato_preventivo === filtroStato;
  });

  const columns: DataTableColumn<InterventoCreato>[] = [
    { key: "codice_intervento", label: "Codice" },
    {
      key: "mezzo",
      label: "Mezzo",
      render: (_, row) =>
        row.Mezzi.marca && row.Mezzi.modello
          ? `${row.Mezzi.marca} ${row.Mezzi.modello}`
          : row.Mezzi.marca || row.Mezzi.modello || "-",
    },
    { key: "Mezzi.matricola", label: "Matricola" },
    { key: "Mezzi.id_interno", label: "ID Interno" },
    { key: "Mezzi.ubicazione", label: "Ubicazione", className: "max-w-xs truncate" },
    {
      key: "stato_intervento",
      label: "Stato Intervento",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${value === "aperto"
              ? "bg-blue-100 text-blue-800"
              : value === "in lavorazione"
                ? "bg-yellow-100 text-yellow-800"
                : value === "chiuso"
                  ? "bg-gray-100 text-gray-800"
                  : value === "preventivazione"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-gray-100 text-gray-800"
            }`}
        >
          {value || "-"}
        </span>
      ),
    },
    {
      key: "stato_preventivo",
      label: "Stato Preventivo",
      render: (_, intervento) => {
        const hasPrevIntervento = intervento.prev_interventi && intervento.prev_interventi.length > 0;
        const stato = hasPrevIntervento
          ? intervento.prev_interventi[0]?.stato_preventivo
          : intervento.stato_preventivo;
        return (
          <StatoPreventivoPopover
            statoCorrente={stato as any}
            interventoId={intervento.id_intervento}
            prevInterventoId={hasPrevIntervento ? intervento.id_intervento : undefined}
            onStatoChange={fetchInterventi}
            hasPreventivoCreato={hasPrevIntervento}
          />
        );
      },
    },
  ];

  const renderActions = (row: InterventoCreato) => (
    <TableActions
      onEdit={() => navigate(`/interventi/${row.id_intervento}/modifica`)}
      onDelete={() => {
        if (confirm(`Sei sicuro di voler eliminare l'intervento ${row.codice_intervento}?`)) {
          handleEliminaIntervento(row.id_intervento);
        }
      }}
    />
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Preventivi Assistenza</h1>
                <p className="text-sm text-muted-foreground">Gestione preventivi e interventi</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => window.location.href = "/"}>
              <Building2 className="h-4 w-4 mr-2" />
              Torna alla Home
            </Button>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filtra per stato:</span>
              <Select value={filtroStato} onValueChange={setFiltroStato}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tutti gli stati" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tutti">Tutti</SelectItem>
                  <SelectItem value="non preventivato">Non Preventivato</SelectItem>
                  <SelectItem value="bozza">Bozza</SelectItem>
                  <SelectItem value="inviato">Inviato</SelectItem>
                  <SelectItem value="approvato">Approvato</SelectItem>
                  <SelectItem value="rifiutato">Rifiutato</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Caricamento...</div>
          ) : interventiFiltered.length > 0 ? (
            <DataTable
              data={interventiFiltered}
              columns={columns}
              actions={renderActions}
              searchPlaceholder="Cerca codice, mezzo o ubicazione..."
            />
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {filtroStato === "tutti"
                  ? "Nessun intervento creato al momento"
                  : "Nessun intervento con questo stato"}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PreventiviAssistenza;
