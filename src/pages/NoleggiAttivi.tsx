import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Truck, Edit, Check, Trash2, History, FileText, Archive } from "lucide-react";
import { TableActions } from "@/components/ui/table-actions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ModificaNoleggioForm } from "@/components/form/modifica_noleggio_form";
import { useNavigate } from "react-router-dom";
import { MezzoClickable } from "@/components/mezzo-clickable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { TerminaNoleggioDialog } from "@/components/noleggi/termina_noleggio_dialog";
import { ContrattoStatusButton } from "@/components/contratti";


interface ContrattoFirmato {
  id_documento: string;
  file_path: string;
  nome_file_originale: string | null;
  created_at: string;
}

interface Noleggio {
  id_noleggio: string;
  id_mezzo: string;
  id_anagrafica: string;
  sede_operativa: string | null;
  data_inizio: string | null;
  data_fine: string | null;
  tempo_indeterminato: boolean | null;
  prezzo_noleggio: number | null;
  prezzo_trasporto: number | null;
  tipo_canone: "giornaliero" | "mensile" | null;
  is_terminato: boolean;
  stato_noleggio: "futuro" | "attivo" | "scaduto" | "archiviato" | "terminato" | null;
  note: string | null;
  Mezzi: {
    marca: string | null;
    modello: string | null;
    matricola: string | null;
  } | null;
  Anagrafiche: {
    ragione_sociale: string | null;
    richiede_contratto_noleggio: boolean | null;
  } | null;
  Sedi: {
    nome_sede: string | null;
    indirizzo: string | null;
    citta: string | null;
  } | null;
  contratti_noleggio: { id_contratto: string; created_at: string }[] | null;
  documenti_noleggio: ContrattoFirmato[] | null;
}

export default function NoleggiAttivi() {
  const navigate = useNavigate();
  const [noleggi, setNoleggi] = useState<Noleggio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModificaForm, setShowModificaForm] = useState(false);
  const [noleggioSelezionato, setNoleggioSelezionato] = useState<Noleggio | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noleggioToDelete, setNoleggioToDelete] = useState<string | null>(null);
  const [terminaDialogOpen, setTerminaDialogOpen] = useState(false);
  const [noleggioToTerminate, setNoleggioToTerminate] = useState<Noleggio | null>(null);

  useEffect(() => {
    loadNoleggi();
  }, []);

  async function loadNoleggi() {
    setLoading(true);
    try {
      // Fetch all non-archived noleggi
      const { data: allNoleggi, error: allError } = await supabase
        .from("Noleggi")
        .select(
          `
          *,
          Mezzi (marca, modello, matricola),
          Anagrafiche (ragione_sociale, richiede_contratto_noleggio),
          Sedi (nome_sede, indirizzo, citta),
          contratti_noleggio (id_contratto, created_at)
        `
        )
        .eq("is_cancellato", false)
        .neq("stato_noleggio", "archiviato")
        .order("created_at", { ascending: false });

      if (allError) throw allError;

      // Fetch documents separately
      const { data: documenti } = await supabase
        .from("documenti_noleggio")
        .select("*")
        .eq("tipo_documento", "contratto_firmato")
        .eq("is_cancellato", false);

      // Merge documents with noleggi
      const noleggiWithDocs = (allNoleggi || []).map((noleggio: any) => {
        const doc = documenti?.find((d) => d.id_noleggio === noleggio.id_noleggio);
        return {
          ...noleggio,
          documenti_noleggio: doc ? [doc] : null,
        };
      });

      setNoleggi(noleggiWithDocs as Noleggio[]);
    } catch (error) {
      console.error("Error loading noleggi:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i noleggi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function calcolaStato(noleggio: Noleggio): {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  } {
    if (noleggio.stato_noleggio === "terminato" || noleggio.is_terminato) {
      return { label: "Terminato", variant: "secondary" };
    }

    if (noleggio.stato_noleggio === "archiviato") {
      return { label: "Archiviato", variant: "outline" };
    }

    if (!noleggio.data_inizio) {
      return { label: "Futuro", variant: "secondary" };
    }

    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    const dataInizio = new Date(noleggio.data_inizio);
    dataInizio.setHours(0, 0, 0, 0);

    if (dataInizio > oggi) {
      return { label: "Futuro", variant: "secondary" };
    }

    if (noleggio.tempo_indeterminato || !noleggio.data_fine) {
      return { label: "Attivo", variant: "default" };
    }

    const dataFine = new Date(noleggio.data_fine);
    dataFine.setHours(0, 0, 0, 0);

    if (dataFine < oggi) {
      return { label: "Scaduto", variant: "destructive" };
    }

    return { label: "Attivo", variant: "default" };
  }

  function handleModifica(noleggio: Noleggio) {
    setNoleggioSelezionato(noleggio);
    setShowModificaForm(true);
  }

  function handleTermina(noleggio: Noleggio) {
    setNoleggioToTerminate(noleggio);
    setTerminaDialogOpen(true);
  }

  function confirmDelete(id_noleggio: string) {
    setNoleggioToDelete(id_noleggio);
    setDeleteDialogOpen(true);
  }

  async function handleArchivia(id_noleggio: string) {
    try {
      const { error } = await supabase
        .from("Noleggi")
        .update({ stato_noleggio: "archiviato" })
        .eq("id_noleggio", id_noleggio);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Noleggio archiviato con successo",
      });

      loadNoleggi();
    } catch (error) {
      console.error("Error archiving noleggio:", error);
      toast({
        title: "Errore",
        description: "Errore nell'archiviazione del noleggio",
        variant: "destructive",
      });
    }
  }

  async function handleDelete() {
    if (!noleggioToDelete) return;

    try {
      const { error } = await supabase.from("Noleggi").delete().eq("id_noleggio", noleggioToDelete);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Noleggio eliminato con successo",
      });

      setDeleteDialogOpen(false);
      setNoleggioToDelete(null);
      loadNoleggi();
    } catch (error) {
      console.error("Error deleting noleggio:", error);
      toast({
        title: "Errore",
        description: "Errore nell'eliminazione del noleggio",
        variant: "destructive",
      });
    }
  }

  function formatDate(date: string | null): string {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("it-IT");
  }

  function formatPrezzo(prezzo: number | null, tipo: "giornaliero" | "mensile" | null): string {
    if (!prezzo) return "-";
    const suffix = tipo === "giornaliero" ? "/gg" : "/mese";
    return `€ ${prezzo.toFixed(2)}${suffix}`;
  }

  const columns: DataTableColumn<Noleggio>[] = [
    {
      key: "Mezzi.marca",
      label: "Mezzo",
      sortable: true,
      render: (_, row) => (
        <MezzoClickable mezzoId={row.id_mezzo} className="font-medium">
          {row.Mezzi?.marca} {row.Mezzi?.modello}
          <br />
          <span className="text-xs text-muted-foreground">{row.Mezzi?.matricola}</span>
        </MezzoClickable>
      ),
    },
    {
      key: "Anagrafiche.ragione_sociale",
      label: "Cliente",
      sortable: true,
      render: (_, row) => row.Anagrafiche?.ragione_sociale || "-",
    },
    {
      key: "Sedi.nome_sede",
      label: "Sede Operativa",
      sortable: true,
      render: (_, row) => {
        const nomeSede = row.Sedi?.nome_sede || "-";
        const indirizzo = row.Sedi?.indirizzo?.trim();
        const citta = row.Sedi?.citta?.trim();
        const secondaRiga = indirizzo && citta ? `${indirizzo} - ${citta}` : indirizzo || citta || null;

        return (
          <>
            {nomeSede}
            <br />
            <span className="text-xs text-muted-foreground">{secondaRiga || "-"}</span>
          </>
        );
      },
    },
    {
      key: "data_inizio",
      label: "Data Inizio",
      sortable: true,
      render: (value) => formatDate(value),
    },
    {
      key: "data_fine",
      label: "Data Fine",
      sortable: true,
      render: (value, row) => {
        if (row.tempo_indeterminato) {
          return <Badge variant="outline">Indeterminato</Badge>;
        }
        return formatDate(value);
      },
    },
    {
      key: "prezzo_noleggio",
      label: "Canone",
      sortable: true,
      render: (value, row) => formatPrezzo(value, row.tipo_canone),
    },
    {
      key: "prezzo_trasporto",
      label: "Trasporto",
      sortable: true,
      render: (value) => (value ? `€ ${value.toFixed(2)}` : "-"),
    },
    {
      key: "is_terminato",
      label: "Stato",
      sortable: true,
      render: (_, row) => {
        const stato = calcolaStato(row);
        return <Badge variant={stato.variant}>{stato.label}</Badge>;
      },
    },
    {
      key: "documenti_noleggio",
      label: "Contratto",
      sortable: false,
      render: (_, row) => {
        const contrattoFirmato = row.documenti_noleggio?.[0] || null;
        const richiedeContratto = row.Anagrafiche?.richiede_contratto_noleggio !== false;
        const hasDraft = (row.contratti_noleggio && row.contratti_noleggio.length > 0) || false;

        return (
          <ContrattoStatusButton
            noleggioId={row.id_noleggio}
            contrattoFirmato={contrattoFirmato}
            richiedeContratto={richiedeContratto}
            hasDraftContract={hasDraft}
            onUploadSuccess={loadNoleggi}
          />
        );
      },
    },
  ];

  const renderActions = (noleggio: Noleggio) => (
    <TableActions
      onEdit={() => handleModifica(noleggio)}
      onComplete={!noleggio.is_terminato ? () => handleTermina(noleggio) : undefined}
      onArchive={noleggio.is_terminato ? () => handleArchivia(noleggio.id_noleggio) : undefined}
      onDelete={() => confirmDelete(noleggio.id_noleggio)}
    />
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Gestione Noleggi</h1>
              <p className="text-muted-foreground">Visualizza e gestisci i contratti di noleggio</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Noleggi Registrati</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={noleggi}
              columns={columns}
              actions={renderActions}
              loading={loading}
              searchPlaceholder="Cerca noleggi..."
              emptyMessage="Nessun noleggio registrato"
              rowClassName={(row) => (row.is_terminato ? "opacity-60 bg-muted/30" : "")}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={showModificaForm} onOpenChange={setShowModificaForm}>
        <DialogContent className="max-w-4xl">
          {noleggioSelezionato && (
            <ModificaNoleggioForm
              noleggio={noleggioSelezionato}
              onClose={() => {
                setShowModificaForm(false);
                setNoleggioSelezionato(null);
              }}
              onSuccess={() => {
                setShowModificaForm(false);
                setNoleggioSelezionato(null);
                loadNoleggi();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <TerminaNoleggioDialog
        open={terminaDialogOpen}
        onOpenChange={setTerminaDialogOpen}
        noleggioId={noleggioToTerminate?.id_noleggio || ""}
        noteEsistenti={noleggioToTerminate?.note}
        onSuccess={() => {
          setNoleggioToTerminate(null);
          loadNoleggi();
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo noleggio? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNoleggioToDelete(null)}>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
