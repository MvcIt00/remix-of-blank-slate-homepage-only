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

  // Render azioni contestuali per stato
  const renderAzioni = (p: PreventivoNoleggio) => {
    switch (filterStato) {
      case StatoPreventivo.BOZZA:
        return (
          <>
            <Button size="sm" variant="default" onClick={() => handleModificaEInvia(p)}>
              <FileEdit className="h-4 w-4 mr-1" /> Completa e Invia
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleModifica(p)}>
              <Pencil className="h-4 w-4 mr-1" /> Completa
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setDeleteConfirm(p)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        );
      
      case StatoPreventivo.DA_INVIARE:
        return (
          <>
            <Button size="sm" variant="default" onClick={() => handleSegnaInviato(p)}>
              <Send className="h-4 w-4 mr-1" /> Segna Inviato
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleModifica(p)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="secondary" onClick={() => handleModificaEInvia(p)}>
              <FileEdit className="h-4 w-4 mr-1" /> Modifica e Invia
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setDeleteConfirm(p)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        );
      
      case StatoPreventivo.INVIATO:
        return (
          <>
            <Button size="sm" variant="default" onClick={() => handleAccettato(p)}>
              <CheckCircle className="h-4 w-4 mr-1" /> Accettato
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleRifiutato(p)}>
              <XCircle className="h-4 w-4 mr-1" /> Rifiutato
            </Button>
            <Button size="sm" variant="secondary" onClick={() => handleInRevisione(p)}>
              <RotateCcw className="h-4 w-4 mr-1" /> In Revisione
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setDeleteConfirm(p)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        );
      
      case StatoPreventivo.IN_REVISIONE:
        return (
          <>
            <Button size="sm" variant="default" onClick={() => handleModificaEInvia(p)}>
              <FileEdit className="h-4 w-4 mr-1" /> Modifica e Invia
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleTornaABozza(p)}>
              <RotateCcw className="h-4 w-4 mr-1" /> Torna a Bozza
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setDeleteConfirm(p)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        );
      
      case StatoPreventivo.SCADUTO:
        return (
          <>
            <Button size="sm" variant="default" onClick={() => handleRinnova(p)}>
              <RefreshCw className="h-4 w-4 mr-1" /> Rinnova
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleArchivia(p)}>
              <Archive className="h-4 w-4 mr-1" /> Archivia
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setDeleteConfirm(p)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        );
      
      case StatoPreventivo.APPROVATO:
        return (
          <>
            {!p.convertito_in_noleggio_id && (
              <Button size="sm" variant="default" onClick={() => {
                setPreventivoSelezionato(p);
                setConfirmOpen(true);
              }}>
                <CheckCircle className="h-4 w-4 mr-1" /> Converti in Noleggio
              </Button>
            )}
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
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
            <div className="space-y-3">
              {filteredPreventivi.map((p) => (
                <div
                  key={p.id_preventivo}
                  className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                >
                  {/* Riga info */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-muted-foreground">
                          {p.codice || "BOZZA"}
                        </span>
                        <span className="font-medium truncate">
                          {p.Anagrafiche?.ragione_sociale ?? "Cliente"}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground flex gap-2 flex-wrap">
                        <span>
                          {p.Mezzi?.marca} {p.Mezzi?.modello}
                          {p.Mezzi?.matricola && ` (${p.Mezzi.matricola})`}
                        </span>
                        <span>•</span>
                        <span>
                          {p.prezzo_noleggio ? `€${p.prezzo_noleggio}` : "-"} / {p.tipo_canone ?? "mese"}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setPreventivoPerPDF(p);
                        setPreviewOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Azioni rapide contestuali */}
                  <div className="flex flex-wrap items-center gap-2">
                    {renderAzioni(p)}
                  </div>
                </div>
              ))}
            </div>
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
          
          // Se "Modifica e Invia", imposta stato INVIATO
          // Se da IN_REVISIONE, torna a DA_INVIARE (a meno che non sia Modifica e Invia)
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
