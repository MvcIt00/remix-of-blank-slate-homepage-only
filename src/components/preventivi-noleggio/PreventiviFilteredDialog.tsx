import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePreventiviNoleggio } from "@/hooks/usePreventiviNoleggio";
import { PreventivoNoleggio, StatoPreventivo } from "@/types/preventiviNoleggio";
import { toast } from "@/hooks/use-toast";
import { Eye, Pencil, Trash2, Send, CheckCircle, XCircle, RotateCcw, Archive, FileEdit, RefreshCw } from "lucide-react";
import { ModificaPreventivoDialog } from "./ModificaPreventivoDialog";
import { PreventivoPreviewDialog } from "./PreventivoPreviewDialog";
import { ConfermaPreventivoDialog } from "./ConfermaPreventivoDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PreventiviFilteredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filterStato: StatoPreventivo;
  title: string;
}

export function PreventiviFilteredDialog({
  open,
  onOpenChange,
  filterStato,
  title,
}: PreventiviFilteredDialogProps) {
  const { 
    preventivi, 
    aggiornaPreventivo, 
    aggiornaStato, 
    convertiInNoleggio,
    eliminaPreventivo,
    archiviaPreventivo,
    duplicaPreventivo
  } = usePreventiviNoleggio();
  
  const [preventivoDaModificare, setPreventivoDaModificare] = useState<PreventivoNoleggio | null>(null);
  const [modificaEInvia, setModificaEInvia] = useState(false);
  const [preventivoPerPDF, setPreventivoPerPDF] = useState<PreventivoNoleggio | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [preventivoSelezionato, setPreventivoSelezionato] = useState<PreventivoNoleggio | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<PreventivoNoleggio | null>(null);

  const filteredPreventivi = useMemo(() => {
    return preventivi.filter(p => p.stato === filterStato && !p.is_archiviato);
  }, [preventivi, filterStato]);

  const getPreviewData = (preventivo: PreventivoNoleggio) => ({
    datiOwner: preventivo.dati_azienda || {
      ragione_sociale: "Mvc Toscana Carrelli",
      indirizzo: "Viale magri 115",
      citta: "Livorno",
      cap: null,
      provincia: null,
      partita_iva: "000000001",
      email: "info@toscanacarrelli.it",
      telefono: "0586.000000",
      pec: null,
      codice_univoco: null,
      iban: null
    },
    datiCliente: {
      ragione_sociale: preventivo.Anagrafiche?.ragione_sociale ?? "",
      partita_iva: preventivo.Anagrafiche?.partita_iva ?? null,
      indirizzo: preventivo.Sedi?.indirizzo ?? null,
      citta: preventivo.Sedi?.citta ?? null,
      cap: preventivo.Sedi?.cap ?? null,
      provincia: preventivo.Sedi?.provincia ?? null,
      telefono: preventivo.Anagrafiche?.telefono ?? null,
      email: preventivo.Anagrafiche?.email ?? null,
      pec: preventivo.Anagrafiche?.pec ?? null,
      codice_univoco: preventivo.Anagrafiche?.codice_univoco ?? null
    },
    datiMezzo: {
      marca: preventivo.Mezzi?.marca ?? null,
      modello: preventivo.Mezzi?.modello ?? null,
      matricola: preventivo.Mezzi?.matricola ?? null,
      id_interno: null,
      anno: preventivo.Mezzi?.anno ? String(preventivo.Mezzi.anno) : null,
      categoria: null,
      ore_moto: preventivo.Mezzi?.ore ?? null,
    },
    datiPreventivo: {
      codice_preventivo: preventivo.codice ?? "BOZZA",
      data_creazione: preventivo.created_at ?? new Date().toISOString(),
      data_inizio: preventivo.data_inizio ?? null,
      data_fine: preventivo.data_fine ?? null,
      tempo_indeterminato: preventivo.tempo_indeterminato ?? false,
      canone_noleggio: preventivo.prezzo_noleggio ?? null,
      tipo_canone: preventivo.tipo_canone ?? "giornaliero",
      costo_trasporto: null,
      note: preventivo.note ?? null,
      validita_giorni: 30
    }
  });

  // Handler azioni rapide
  const handleSegnaInviato = async (p: PreventivoNoleggio) => {
    await aggiornaStato(p.id_preventivo, StatoPreventivo.INVIATO);
    toast({ title: "Preventivo segnato come inviato" });
  };

  const handleAccettato = async (p: PreventivoNoleggio) => {
    await aggiornaStato(p.id_preventivo, StatoPreventivo.APPROVATO);
    toast({ title: "Preventivo approvato" });
  };

  const handleRifiutato = async (p: PreventivoNoleggio) => {
    await aggiornaStato(p.id_preventivo, StatoPreventivo.RIFIUTATO);
    toast({ title: "Preventivo rifiutato" });
  };

  const handleInRevisione = async (p: PreventivoNoleggio) => {
    await aggiornaStato(p.id_preventivo, StatoPreventivo.IN_REVISIONE);
    toast({ title: "Preventivo in revisione" });
  };

  const handleTornaABozza = async (p: PreventivoNoleggio) => {
    await aggiornaStato(p.id_preventivo, StatoPreventivo.BOZZA);
    toast({ title: "Preventivo tornato a bozza" });
  };

  const handleRinnova = async (p: PreventivoNoleggio) => {
    await duplicaPreventivo(p.id_preventivo);
    toast({ title: "Preventivo rinnovato", description: "Creata nuova bozza" });
  };

  const handleArchivia = async (p: PreventivoNoleggio) => {
    await archiviaPreventivo(p.id_preventivo);
    toast({ title: "Preventivo archiviato" });
  };

  const handleElimina = async () => {
    if (!deleteConfirm) return;
    await eliminaPreventivo(deleteConfirm.id_preventivo);
    toast({ title: "Preventivo eliminato" });
    setDeleteConfirm(null);
  };

  const handleModificaEInvia = (p: PreventivoNoleggio) => {
    setPreventivoDaModificare(p);
    setModificaEInvia(true);
  };

  const handleModifica = (p: PreventivoNoleggio) => {
    setPreventivoDaModificare(p);
    setModificaEInvia(false);
  };

  // Render azioni inline contestuali per stato (icon buttons con tooltip)
  const renderAzioni = (p: PreventivoNoleggio) => {
    const actions: Array<{
      icon: React.ReactNode;
      label: string;
      onClick: () => void;
      variant?: "default" | "outline" | "ghost" | "destructive";
    }> = [];

    switch (filterStato) {
      case StatoPreventivo.BOZZA:
        actions.push(
          { icon: <FileEdit className="h-4 w-4" />, label: "Completa e Invia", onClick: () => handleModificaEInvia(p) },
          { icon: <Pencil className="h-4 w-4" />, label: "Completa", onClick: () => handleModifica(p), variant: "ghost" },
          { icon: <Trash2 className="h-4 w-4" />, label: "Elimina", onClick: () => setDeleteConfirm(p), variant: "destructive" }
        );
        break;
      
      case StatoPreventivo.DA_INVIARE:
        actions.push(
          { icon: <Send className="h-4 w-4" />, label: "Segna Inviato", onClick: () => handleSegnaInviato(p) },
          { icon: <FileEdit className="h-4 w-4" />, label: "Modifica e Invia", onClick: () => handleModificaEInvia(p), variant: "ghost" },
          { icon: <Pencil className="h-4 w-4" />, label: "Modifica", onClick: () => handleModifica(p), variant: "ghost" },
          { icon: <Trash2 className="h-4 w-4" />, label: "Elimina", onClick: () => setDeleteConfirm(p), variant: "destructive" }
        );
        break;
      
      case StatoPreventivo.INVIATO:
        actions.push(
          { icon: <CheckCircle className="h-4 w-4" />, label: "Accettato", onClick: () => handleAccettato(p) },
          { icon: <XCircle className="h-4 w-4" />, label: "Rifiutato", onClick: () => handleRifiutato(p), variant: "ghost" },
          { icon: <RotateCcw className="h-4 w-4" />, label: "In Revisione", onClick: () => handleInRevisione(p), variant: "ghost" },
          { icon: <Trash2 className="h-4 w-4" />, label: "Elimina", onClick: () => setDeleteConfirm(p), variant: "destructive" }
        );
        break;
      
      case StatoPreventivo.IN_REVISIONE:
        actions.push(
          { icon: <FileEdit className="h-4 w-4" />, label: "Modifica e Invia", onClick: () => handleModificaEInvia(p) },
          { icon: <RotateCcw className="h-4 w-4" />, label: "Torna a Bozza", onClick: () => handleTornaABozza(p), variant: "ghost" },
          { icon: <Trash2 className="h-4 w-4" />, label: "Elimina", onClick: () => setDeleteConfirm(p), variant: "destructive" }
        );
        break;
      
      case StatoPreventivo.SCADUTO:
        actions.push(
          { icon: <RefreshCw className="h-4 w-4" />, label: "Rinnova", onClick: () => handleRinnova(p) },
          { icon: <Archive className="h-4 w-4" />, label: "Archivia", onClick: () => handleArchivia(p), variant: "ghost" },
          { icon: <Trash2 className="h-4 w-4" />, label: "Elimina", onClick: () => setDeleteConfirm(p), variant: "destructive" }
        );
        break;
      
      case StatoPreventivo.APPROVATO:
        if (!p.convertito_in_noleggio_id) {
          actions.push(
            { icon: <CheckCircle className="h-4 w-4" />, label: "Converti in Noleggio", onClick: () => {
              setPreventivoSelezionato(p);
              setConfirmOpen(true);
            }}
          );
        }
        break;
    }

    return (
      <div className="flex items-center gap-1">
        {actions.map((action, idx) => (
          <Tooltip key={idx}>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant={action.variant || "default"}
                className="h-7 w-7"
                onClick={action.onClick}
              >
                {action.icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{action.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              {title}
              <Badge variant="secondary">{filteredPreventivi.length}</Badge>
            </DialogTitle>
          </DialogHeader>

          {filteredPreventivi.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nessun preventivo in questo stato
            </p>
          ) : (
            <ScrollArea className="flex-1 -mx-6 px-6">
              {/* Header riga */}
              <div className="grid grid-cols-[100px_1fr_180px_100px_1fr] gap-2 px-3 py-2 text-xs font-medium text-muted-foreground border-b sticky top-0 bg-background z-10">
                <span>Codice</span>
                <span>Cliente</span>
                <span>Mezzo</span>
                <span>Canone</span>
                <span className="text-right">Azioni</span>
              </div>

              {/* Lista righe */}
              <div className="divide-y">
                {filteredPreventivi.map((p) => (
                  <div
                    key={p.id_preventivo}
                    className="grid grid-cols-[100px_1fr_180px_100px_1fr] gap-2 px-3 py-2 items-center hover:bg-muted/30 transition-colors"
                  >
                    {/* Codice */}
                    <span className="font-mono text-xs font-bold text-muted-foreground truncate">
                      {p.codice || "BOZZA"}
                    </span>

                    {/* Cliente */}
                    <span className="font-medium truncate text-sm">
                      {p.Anagrafiche?.ragione_sociale ?? "Cliente"}
                    </span>

                    {/* Mezzo */}
                    <span className="text-sm text-muted-foreground truncate">
                      {p.Mezzi?.marca} {p.Mezzi?.modello}
                      {p.Mezzi?.matricola && ` (${p.Mezzi.matricola})`}
                    </span>

                    {/* Canone */}
                    <span className="text-sm">
                      {p.prezzo_noleggio ? `€${p.prezzo_noleggio}` : "-"}
                    </span>

                    {/* Azioni inline */}
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              setPreventivoPerPDF(p);
                              setPreviewOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Anteprima</p>
                        </TooltipContent>
                      </Tooltip>

                      {renderAzioni(p)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog modifica */}
      <ModificaPreventivoDialog
        open={!!preventivoDaModificare}
        onOpenChange={(open) => {
          if (!open) {
            setPreventivoDaModificare(null);
            setModificaEInvia(false);
          }
        }}
        preventivo={preventivoDaModificare}
        onSave={async (values) => {
          if (!preventivoDaModificare) return;
          
          let nuovoStato = preventivoDaModificare.stato;
          if (modificaEInvia) {
            nuovoStato = StatoPreventivo.INVIATO;
          } else if (preventivoDaModificare.stato === StatoPreventivo.IN_REVISIONE) {
            nuovoStato = StatoPreventivo.DA_INVIARE;
          } else if (preventivoDaModificare.stato === StatoPreventivo.BOZZA) {
            nuovoStato = StatoPreventivo.DA_INVIARE;
          }
          
          await aggiornaPreventivo(preventivoDaModificare.id_preventivo, { 
            ...values, 
            stato: nuovoStato 
          });
          
          toast({ 
            title: modificaEInvia ? "Preventivo aggiornato e inviato" : "Preventivo aggiornato"
          });
          setPreventivoDaModificare(null);
          setModificaEInvia(false);
        }}
      />

      {/* Preview PDF */}
      {preventivoPerPDF && (
        <PreventivoPreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          {...getPreviewData(preventivoPerPDF)}
          onSave={async () => setPreviewOpen(false)}
        />
      )}

      {/* Conferma conversione noleggio */}
      <ConfermaPreventivoDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        preventivo={preventivoSelezionato}
        onConfirm={async (p) => {
          await convertiInNoleggio(p);
          toast({ title: "Preventivo convertito", description: "Noleggio attivo creato" });
        }}
      />

      {/* Conferma eliminazione */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare questo preventivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione è irreversibile. Il preventivo verrà eliminato definitivamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleElimina} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
