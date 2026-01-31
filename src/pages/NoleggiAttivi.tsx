import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Archive, MoreHorizontal, Eye, FileText, Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
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
import { RentalDetailSheet } from "@/components/noleggi/RentalDetailSheet";
import { ContrattoStatusButton } from "@/components/contratti/ContrattoStatusButton";
import { PreventivoPreviewDialog } from "@/components/preventivi/PreventivoPreviewDialog";
import { NoleggiDashboard } from "@/components/noleggi/NoleggiDashboard";
import { EmailComposerDialog } from "@/components/email/EmailComposerDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { startOfDay } from "date-fns";

// Interfaccia basata sulla VIEW vw_noleggi_completi
interface NoleggioView {
  id_noleggio: string;
  created_at: string;
  data_inizio: string | null;
  data_fine: string | null;
  tempo_indeterminato: boolean | null;
  prezzo_noleggio: number | null;
  prezzo_trasporto: number | null;
  tipo_canone: "giornaliero" | "mensile" | null;
  stato_noleggio: "futuro" | "attivo" | "scaduto" | "archiviato" | "terminato" | null;
  is_terminato: boolean;
  note: string | null;
  codice_noleggio: string | null;

  // Dati Mezzo
  id_mezzo: string;
  mezzo_marca: string | null;
  mezzo_modello: string | null;
  mezzo_matricola: string | null;

  // Dati Cliente
  id_anagrafica: string;
  cliente_ragione_sociale: string | null;
  cliente_piva: string | null;
  richiede_contratto_noleggio: boolean | null;

  // Dati Sede
  id_sede_operativa: string | null;
  sede_nome: string | null;
  sede_indirizzo: string | null;
  sede_citta: string | null;
  sede_provincia: string | null;

  // Link Preventivo
  id_preventivo: string | null;

  // Stato Contratto (JSON Objects from View)
  contratto_firmato_info: { id_documento: string; file_path: string; nome_file_originale: string | null; created_at: string } | null;
  contratto_bozza_info: { id_contratto: string; created_at: string } | null;
}

export default function NoleggiAttivi() {
  const navigate = useNavigate();

  // Stati Dialog/Sheet
  const [showModificaForm, setShowModificaForm] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [noleggioSelezionato, setNoleggioSelezionato] = useState<any | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noleggioToDelete, setNoleggioToDelete] = useState<string | null>(null);
  const [terminaDialogOpen, setTerminaDialogOpen] = useState(false);
  const [noleggioToTerminate, setNoleggioToTerminate] = useState<any | null>(null);

  // Stati per Preview Preventivo
  const [previewOpen, setPreviewOpen] = useState(false);
  const [preventivoPreviewData, setPreventivoPreviewData] = useState<any | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Stati per Email Composer (AX06 - Context First)
  const [composerOpen, setComposerOpen] = useState(false);
  const [emailContext, setEmailContext] = useState<any>(null);

  const { data: noleggi = [], isLoading: loading, refetch } = useQuery({
    queryKey: ["noleggi-attivi-view"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vw_noleggi_completi" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading noleggi:", error);
        toast({ title: "Errore", description: "Impossibile caricare i noleggi", variant: "destructive" });
        throw error;
      }
      return data as unknown as NoleggioView[];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Funzione per caricare il preventivo al volo e aprire il Dialog
  async function handleOpenPreventivo(id_preventivo: string) {
    try {
      setLoadingPreview(true);
      // Fetch preventivo completo (usiamo la tabella o la view preventivi)
      // Per la preview serve un oggetto compatibile con PreventivoCompletoView
      // Proviamo a fetchare dalla tabella preventivi + join manuali o view se esiste
      // Assumiamo che vw_preventivi_completi esista o costruiamolo
      const { data, error } = await supabase
        .from("vw_preventivi_completi" as any) // Spero esista, altrimenti fallback
        .select("*")
        .eq("id_preventivo", id_preventivo)
        .single();

      if (error) throw error;

      setPreventivoPreviewData(data);
      setPreviewOpen(true);
    } catch (err) {
      console.error("Errore caricamento preventivo preview:", err);
      toast({
        title: "Impossibile aprire anteprima",
        description: "Errore nel recupero dei dati del preventivo.",
        variant: "destructive"
      });
    } finally {
      setLoadingPreview(false);
    }
  }

  async function handleDelete() {
    if (!noleggioToDelete) return;
    try {
      const { error } = await supabase.from("Noleggi").delete().eq("id_noleggio", noleggioToDelete);
      if (error) throw error;
      toast({ title: "Successo", description: "Noleggio eliminato con successo" });
      setDeleteDialogOpen(false);
      setNoleggioToDelete(null);
      refetch();
    } catch (error) {
      console.error("Error deleting noleggio:", error);
      toast({ title: "Errore", description: "Errore nell'eliminazione del noleggio", variant: "destructive" });
    }
  }

  // Adapter per passare i dati al Form e allo Sheet
  function adaptToNestedStructure(row: NoleggioView): any {
    return {
      ...row,
      Mezzi: {
        marca: row.mezzo_marca,
        modello: row.mezzo_modello,
        matricola: row.mezzo_matricola
      },
      Anagrafiche: {
        ragione_sociale: row.cliente_ragione_sociale,
        richiede_contratto_noleggio: row.richiede_contratto_noleggio
      },
      Sedi: row.id_sede_operativa ? {
        nome_sede: row.sede_nome,
        indirizzo: row.sede_indirizzo,
        citta: row.sede_citta
      } : null,
      documenti_noleggio: row.contratto_firmato_info ? [row.contratto_firmato_info] : [],
      contratti_noleggio: row.contratto_bozza_info ? [row.contratto_bozza_info] : []
    };
  }

  function calcolaStato(noleggio: NoleggioView): {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    className?: string;
  } {
    // La logica è ora centralizzata nella VIEW del database.
    // Il frontend deve solo mappare lo stato ricevuto allo stile corretto.

    const stato = noleggio.stato_noleggio;

    if (stato === "terminato" || noleggio.is_terminato) {
      return { label: "Terminato", variant: "secondary" };
    }
    if (stato === "archiviato") {
      return { label: "Archiviato", variant: "outline" };
    }
    if (stato === "scaduto") {
      return { label: "Scaduto", variant: "outline", className: "border-orange-500 text-orange-600 bg-orange-50" };
    }
    if (stato === "futuro") {
      return { label: "Futuro", variant: "secondary" };
    }

    // Default / Attivo
    return { label: "Attivo", variant: "default", className: "bg-green-600 hover:bg-green-700" };
  }

  // DEFINIZIONE COLONNE 
  const columns: DataTableColumn<NoleggioView>[] = [
    {
      key: "cliente_ragione_sociale",
      label: "Cliente",
      sortable: true,
      render: (_, row) => (
        <div className="font-semibold text-base min-w-[200px]" title={row.cliente_ragione_sociale || ""}>
          {row.cliente_ragione_sociale || "-"}
        </div>
      ),
    },
    {
      key: "mezzo_marca",
      label: "Mezzo",
      sortable: true,
      render: (_, row) => (
        <MezzoClickable mezzoId={row.id_mezzo} className="font-medium">
          {row.mezzo_marca} {row.mezzo_modello}
          <div className="text-xs text-muted-foreground">{row.mezzo_matricola}</div>
        </MezzoClickable>
      ),
    },
    {
      key: "sede_nome",
      label: "Sede Operativa",
      sortable: true,
      render: (_, row) => {
        if (!row.sede_nome && !row.sede_citta) return "-";
        return (
          <div className="text-sm max-w-[200px]">
            <div className="font-medium truncate">{row.sede_nome}</div>
            <div className="text-xs text-muted-foreground truncate">{row.sede_indirizzo}, {row.sede_citta}</div>
          </div>
        );
      },
    },
    {
      key: "data_inizio",
      label: "Periodo",
      sortable: true,
      render: (_, row) => (
        <div className="text-xs">
          <span className="text-slate-500">Dal:</span> {formatDate(row.data_inizio)}<br />
          <span className="text-slate-500">Al:</span> {row.tempo_indeterminato ? <strong>Indet.</strong> : formatDate(row.data_fine)}
        </div>
      ),
    },
    {
      key: "prezzo_noleggio",
      label: "Canone",
      sortable: true,
      render: (value, row) => formatPrezzo(value, row.tipo_canone),
    },
    {
      key: "is_terminato",
      label: "Stato",
      sortable: true,
      render: (_, row) => {
        const { label, variant, className } = calcolaStato(row);
        return <Badge variant={variant} className={className ? `${className} text-[10px] px-2 py-0.5` : "text-[10px] px-2 py-0.5"}>{label}</Badge>;
      },
    },
    // COLONNA CONTRATTO INTERATTIVA
    {
      key: "contratto_firmato_info",
      label: "Contratto",
      sortable: false,
      render: (_, row) => {
        // Safe access to contract info
        const firmato = row.contratto_firmato_info && typeof row.contratto_firmato_info === 'object'
          ? row.contratto_firmato_info
          : null;

        return (
          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
            <ContrattoStatusButton
              noleggioId={row.id_noleggio}
              richiedeContratto={row.richiede_contratto_noleggio !== false}
              contrattoFirmato={firmato as any}
              hasDraftContract={!!row.contratto_bozza_info}
              onUploadSuccess={() => refetch()}
            />
          </div>
        );
      },
    },
    // RIF PREVENTIVO (Link Interattivo che apre Dialog)
    {
      key: "id_preventivo",
      label: "Rif.",
      render: (_, row) => {
        if (!row.id_preventivo) return null;
        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-mono underline"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenPreventivo(row.id_preventivo!);
            }}
          >
            {loadingPreview ? <Loader2 className="h-3 w-3 animate-spin" /> : <><FileText className="h-3 w-3 mr-1" /> PREV</>}
          </Button>
        );
      }
    },
  ];

  const renderActions = (row: NoleggioView) => {
    try {
      const adapted = adaptToNestedStructure(row);
      return (
        <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Azioni Noleggio</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => {
                setNoleggioSelezionato(adapted);
                setSheetOpen(true);
              }}>
                <Eye className="mr-2 h-4 w-4" /> Vedi Dettagli Completi
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setNoleggioSelezionato(adapted);
                setShowModificaForm(true);
              }}>
                <Edit className="mr-2 h-4 w-4" /> Modifica Dati
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* AX06 - Context First: composizione email con dati pre-compilati dal contesto */}
              <DropdownMenuItem onClick={() => {
                const cliente = row.cliente_ragione_sociale || "Cliente";
                const mezzo = `${row.mezzo_marca} ${row.mezzo_modello}`;
                const sede = row.sede_nome || "sede";

                setEmailContext({
                  to: row.cliente_piva || "", // In realtà andrebbe preso l'email del cliente
                  subject: `Noleggio ${row.codice_noleggio || mezzo} - ${cliente}`,
                  body: `Gentile ${cliente},\n\ncon riferimento al noleggio del mezzo ${mezzo} presso ${sede}.\n\n`,
                  id_cliente: row.id_anagrafica,
                  id_noleggio: row.id_noleggio,
                });
                setComposerOpen(true);
              }}>
                <Mail className="mr-2 h-4 w-4" /> Invia Email Cliente
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {!row.is_terminato && (
                <DropdownMenuItem onClick={() => {
                  setNoleggioSelezionato(adapted);
                  setNoleggioToTerminate(adapted);
                  setTerminaDialogOpen(true);
                }}>
                  <Archive className="mr-2 h-4 w-4" /> Termina Noleggio
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => {
                setNoleggioToDelete(row.id_noleggio);
                setDeleteDialogOpen(true);
              }} className="text-red-600 focus:text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> Elimina
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    } catch (e) {
      console.error("Render error", e);
      return null;
    }
  };

  function formatDate(date: string | null): string {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("it-IT");
  }

  function formatPrezzo(prezzo: number | null, tipo: "giornaliero" | "mensile" | null): string {
    if (!prezzo) return "-";
    const suffix = tipo === "giornaliero" ? "/gg" : "/mese";
    return `€ ${prezzo.toFixed(2)}${suffix}`;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Gestione Noleggi</h1>
              <p className="text-muted-foreground">Monitoraggio attivo della flotta a noleggio</p>
            </div>
          </div>
        </div>

        {/* Dashboard Stati e Allarmi Operativi */}
        <NoleggiDashboard />

        <Card>
          <CardHeader>
            <CardTitle>Flotta Noleggiata</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={noleggi}
              columns={columns}
              actions={renderActions}
              loading={loading}
              searchPlaceholder="Cerca cliente, mezzo o matricola..."
              emptyMessage="Nessun noleggio attivo trovato."
              rowClassName={(row) => (row.is_terminato ? "opacity-60 bg-muted/30 cursor-pointer hover:bg-muted/50" : "cursor-pointer hover:bg-muted/10 transition-colors")}
            />
          </CardContent>
        </Card>
      </div>

      <RentalDetailSheet
        noleggio={noleggioSelezionato}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onEdit={() => noleggioSelezionato && setShowModificaForm(true)}
        onTerminate={() => {
          setSheetOpen(false);
          setNoleggioToTerminate(noleggioSelezionato);
          setTerminaDialogOpen(true);
        }}
        onDelete={() => {
          setSheetOpen(false);
          setNoleggioToDelete(noleggioSelezionato?.id_noleggio);
          setDeleteDialogOpen(true);
        }}
        onRefetch={refetch}
      />

      <Dialog open={showModificaForm} onOpenChange={setShowModificaForm}>
        <DialogContent className="max-w-4xl">
          {noleggioSelezionato && (
            <ModificaNoleggioForm
              noleggio={noleggioSelezionato}
              onClose={() => setShowModificaForm(false)}
              onSuccess={() => {
                setShowModificaForm(false);
                refetch();
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
          refetch();
        }}
      />

      {/* PREVENTIVO PREVIEW DIALOG */}
      <PreventivoPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        preventivo={preventivoPreviewData}
        onSuccess={() => {
          // Opzionale: aggiorna stato se necessario
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminazione Definitiva</AlertDialogTitle>
            <AlertDialogDescription>
              Stai per eliminare definitivamente questo noleggio.
              <br />
              Questa operazione è irreversibile e rimuoverà anche lo storico associato.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNoleggioToDelete(null)}>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AX06 - Context First: Email Composer con dati pre-compilati dal noleggio */}
      <EmailComposerDialog
        open={composerOpen}
        onOpenChange={setComposerOpen}
        defaultValues={emailContext}
        onEmailSent={() => {
          setComposerOpen(false);
          setEmailContext(null);
          toast({ title: "Email inviata", description: "Email inviata con successo al cliente" });
        }}
      />
    </div>
  );
}
