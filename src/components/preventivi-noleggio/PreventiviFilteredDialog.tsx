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
import { Eye, Pencil, Trash2, Archive, RefreshCw, Send, Check, X, MessageSquare, History } from "lucide-react";
import { ModificaPreventivoDialog } from "./ModificaPreventivoDialog";
import { PreventivoPreviewDialog } from "./PreventivoPreviewDialog";
import { ConfermaPreventivoDialog } from "./ConfermaPreventivoDialog";
import { RinnovaPreventivoDialog } from "./RinnovaPreventivoDialog";
import { DettaglioModificaDialog } from "./DettaglioModificaDialog";
import { DettaglioModificaDisplay } from "./DettaglioModificaDisplay";
import { VersioniPDFDialog } from "./VersioniPDFDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
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
    convertiInNoleggio,
    eliminaPreventivo,
    archiviaPreventivo,
    rinnovaPreventivo,
    incrementaVersione,
  } = usePreventiviNoleggio();

  const [preventivoDaModificare, setPreventivoDaModificare] = useState<PreventivoNoleggio | null>(null);
  const [preventivoPerPDF, setPreventivoPerPDF] = useState<PreventivoNoleggio | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [preventivoSelezionato, setPreventivoSelezionato] = useState<PreventivoNoleggio | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<PreventivoNoleggio | null>(null);
  const [rinnovaOpen, setRinnovaOpen] = useState(false);
  const [preventivoDaRinnovare, setPreventivoDaRinnovare] = useState<PreventivoNoleggio | null>(null);
  const [dettaglioModificaOpen, setDettaglioModificaOpen] = useState(false);
  const [preventivoPerDettaglio, setPreventivoPerDettaglio] = useState<PreventivoNoleggio | null>(null);
  const [versioniDialogOpen, setVersioniDialogOpen] = useState(false);
  const [preventivoPerVersioni, setPreventivoPerVersioni] = useState<PreventivoNoleggio | null>(null);

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

  // Handler azioni
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

  const handleRinnova = async (nuovaDataScadenza: string) => {
    if (!preventivoDaRinnovare) return;
    await rinnovaPreventivo(preventivoDaRinnovare.id_preventivo, nuovaDataScadenza);
    toast({ title: "Preventivo rinnovato", description: "Stato: Inviato" });
    setPreventivoDaRinnovare(null);
    setRinnovaOpen(false);
  };

  // Handler per cambio stato rapido
  const handleCambiaStato = async (p: PreventivoNoleggio, nuovoStato: StatoPreventivo) => {
    await aggiornaPreventivo(p.id_preventivo, { stato: nuovoStato });

    const messaggi: Partial<Record<StatoPreventivo, string>> = {
      [StatoPreventivo.INVIATO]: "Preventivo segnato come inviato",
      [StatoPreventivo.APPROVATO]: "Preventivo approvato",
      [StatoPreventivo.RIFIUTATO]: "Preventivo rifiutato",
      [StatoPreventivo.IN_REVISIONE]: "Preventivo in revisione",
    };

    toast({ title: messaggi[nuovoStato] || "Stato aggiornato" });
  };

  // Azioni contestuali per stato (secondo matrice operativa)
  const renderAzioni = (p: PreventivoNoleggio) => {
    const actions: Array<{
      icon: React.ReactNode;
      label: string;
      onClick: () => void;
      variant?: "default" | "outline" | "ghost" | "destructive";
    }> = [];

    // === BOZZA ===
    if (p.stato === StatoPreventivo.BOZZA) {
      actions.push({
        icon: <Pencil className="h-4 w-4" />,
        label: "Completa",
        onClick: () => setPreventivoDaModificare(p),
        variant: "ghost"
      });
      actions.push({
        icon: <Eye className="h-4 w-4" />,
        label: "Anteprima",
        onClick: () => { setPreventivoPerPDF(p); setPreviewOpen(true); },
        variant: "ghost"
      });
    }

    // === DA_INVIARE ===
    if (p.stato === StatoPreventivo.DA_INVIARE) {
      actions.push({
        icon: <Send className="h-4 w-4" />,
        label: "Segna Inviato",
        onClick: () => handleCambiaStato(p, StatoPreventivo.INVIATO),
        variant: "default"
      });
      actions.push({
        icon: <Eye className="h-4 w-4" />,
        label: "Anteprima",
        onClick: () => { setPreventivoPerPDF(p); setPreviewOpen(true); },
        variant: "ghost"
      });
      actions.push({
        icon: <Pencil className="h-4 w-4" />,
        label: "Modifica",
        onClick: () => setPreventivoDaModificare(p),
        variant: "ghost"
      });
    }

    // === INVIATO ===
    if (p.stato === StatoPreventivo.INVIATO) {
      actions.push({
        icon: <Check className="h-4 w-4" />,
        label: "Approvato",
        onClick: () => handleCambiaStato(p, StatoPreventivo.APPROVATO),
        variant: "default"
      });
      actions.push({
        icon: <X className="h-4 w-4" />,
        label: "Rifiutato",
        onClick: () => handleCambiaStato(p, StatoPreventivo.RIFIUTATO),
        variant: "ghost"
      });
      actions.push({
        icon: <MessageSquare className="h-4 w-4" />,
        label: "Da Modificare",
        onClick: () => {
          setPreventivoPerDettaglio(p);
          setDettaglioModificaOpen(true);
        },
        variant: "ghost"
      });
      actions.push({
        icon: <Eye className="h-4 w-4" />,
        label: "Anteprima",
        onClick: () => { setPreventivoPerPDF(p); setPreviewOpen(true); },
        variant: "ghost"
      });
    }

    // === IN_REVISIONE (Da Modificare) ===
    if (p.stato === StatoPreventivo.IN_REVISIONE) {
      actions.push({
        icon: <Pencil className="h-4 w-4" />,
        label: "Modifica",
        onClick: () => setPreventivoDaModificare(p),
        variant: "default" // Azione primaria
      });
      actions.push({
        icon: <Eye className="h-4 w-4" />,
        label: "Anteprima",
        onClick: () => { setPreventivoPerPDF(p); setPreviewOpen(true); },
        variant: "ghost"
      });
    }

    // === SCADUTO ===
    if (p.stato === StatoPreventivo.SCADUTO) {
      actions.push({
        icon: <RefreshCw className="h-4 w-4" />,
        label: "Rinnova",
        onClick: () => {
          setPreventivoDaRinnovare(p);
          setRinnovaOpen(true);
        },
        variant: "default" // Azione primaria
      });
      actions.push({
        icon: <Archive className="h-4 w-4" />,
        label: "Archivia",
        onClick: () => handleArchivia(p),
        variant: "ghost"
      });
      actions.push({
        icon: <Eye className="h-4 w-4" />,
        label: "Anteprima",
        onClick: () => { setPreventivoPerPDF(p); setPreviewOpen(true); },
        variant: "ghost"
      });
    }

    // === VERSIONI (se ha storico) ===
    if (p.storico_pdf && p.storico_pdf.length > 0) {
      actions.push({
        icon: <History className="h-4 w-4" />,
        label: `Versioni (${p.storico_pdf.length + 1})`,
        onClick: () => {
          setPreventivoPerVersioni(p);
          setVersioniDialogOpen(true);
        },
        variant: "ghost"
      });
    }

    // === ELIMINA (sempre presente per tutti i 5 stati operativi) ===
    actions.push({
      icon: <Trash2 className="h-4 w-4" />,
      label: "Elimina",
      onClick: () => setDeleteConfirm(p),
      variant: "destructive"
    });

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
            <>
              {/* Header FUORI da ScrollArea per allineamento perfetto */}
              <div className={cn(
                "grid gap-2 px-3 py-2 text-xs font-medium text-muted-foreground border-b",
                filterStato === StatoPreventivo.IN_REVISIONE
                  ? "grid-cols-[90px_minmax(100px,1fr)_minmax(120px,1.2fr)_minmax(140px,1fr)_80px_100px]"
                  : "grid-cols-[90px_minmax(120px,1.2fr)_minmax(150px,1.5fr)_80px_100px]"
              )}>
                <span>Codice</span>
                <span>Cliente</span>
                <span>Mezzo</span>
                {filterStato === StatoPreventivo.IN_REVISIONE && <span>Motivo</span>}
                <span>Canone</span>
                <span className="text-right">Azioni</span>
              </div>

              {/* ScrollArea SOLO per le righe dati */}
              <ScrollArea className="flex-1">
                <div className="divide-y">
                  {filteredPreventivi.map((p) => (
                    <div
                      key={p.id_preventivo}
                      className={cn(
                        "grid gap-2 px-3 py-2 items-center hover:bg-muted/30 transition-colors",
                        filterStato === StatoPreventivo.IN_REVISIONE
                          ? "grid-cols-[90px_minmax(100px,1fr)_minmax(120px,1.2fr)_minmax(140px,1fr)_80px_100px]"
                          : "grid-cols-[90px_minmax(120px,1.2fr)_minmax(150px,1.5fr)_80px_100px]"
                      )}
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
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate text-sm">
                          {p.Mezzi?.marca} {p.Mezzi?.modello}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {p.Mezzi?.matricola && `Matr: ${p.Mezzi.matricola}`}
                          {(p.Mezzi as any)?.id_interno && ` • Int: ${(p.Mezzi as any).id_interno}`}
                        </span>
                      </div>

                      {/* Motivo (solo IN_REVISIONE) */}
                      {filterStato === StatoPreventivo.IN_REVISIONE && (
                        <DettaglioModificaDisplay
                          dettaglio={p.dettaglio_modifica}
                          variant="snippet"
                          maxLength={50}
                        />
                      )}

                      {/* Canone */}
                      <span className="text-sm">
                        {p.prezzo_noleggio ? `€${p.prezzo_noleggio}` : "-"}
                      </span>

                      {/* Azioni inline */}
                      <div className="flex items-center justify-end">
                        {renderAzioni(p)}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog modifica */}
      <ModificaPreventivoDialog
        open={!!preventivoDaModificare}
        onOpenChange={(open) => {
          if (!open) setPreventivoDaModificare(null);
        }}
        preventivo={preventivoDaModificare}
        onSave={async (values) => {
          if (!preventivoDaModificare) return;

          // LOGICA VERSIONAMENTO
          if (preventivoDaModificare.stato === StatoPreventivo.IN_REVISIONE) {
            // 1. Archivia versione corrente (V1) e incrementa (V2)
            await incrementaVersione(
              preventivoDaModificare.id_preventivo,
              preventivoDaModificare.pdf_bozza_path || preventivoDaModificare.pdf_firmato_path
            );
            // dopo incrementaVersione lo stato è resettato a DA_INVIARE dal backend/hook
          }

          // 2. Salva le modifiche ai dati
          let nuovoStato = preventivoDaModificare.stato;
          // Se era bozza passa a da inviare. Se era revisione è già stato resettato a da inviare dal incrementaVersione
          // o lo forziamo qui per sicurezza
          if ([StatoPreventivo.IN_REVISIONE, StatoPreventivo.BOZZA].includes(preventivoDaModificare.stato)) {
            nuovoStato = StatoPreventivo.DA_INVIARE;
          }

          await aggiornaPreventivo(preventivoDaModificare.id_preventivo, {
            ...values,
            stato: nuovoStato,
            dettaglio_modifica: null // Reset motivo modifica
          });

          toast({ title: "Preventivo aggiornato" });
          setPreventivoDaModificare(null);
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

      {/* Rinnova preventivo scaduto */}
      <RinnovaPreventivoDialog
        open={rinnovaOpen}
        onOpenChange={setRinnovaOpen}
        preventivo={preventivoDaRinnovare}
        onConfirm={handleRinnova}
      />

      {/* Dialog per inserire dettaglio modifica */}
      <DettaglioModificaDialog
        open={dettaglioModificaOpen}
        onOpenChange={setDettaglioModificaOpen}
        onConfirm={async (dettaglio) => {
          if (!preventivoPerDettaglio) return;
          await aggiornaPreventivo(preventivoPerDettaglio.id_preventivo, {
            stato: StatoPreventivo.IN_REVISIONE,
            dettaglio_modifica: dettaglio
          });
          toast({ title: "Preventivo in revisione", description: "Motivo registrato" });
          setPreventivoPerDettaglio(null);
          setDettaglioModificaOpen(false);
        }}
      />

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

      {/* Storico versioni PDF */}
      {preventivoPerVersioni && (
        <VersioniPDFDialog
          open={versioniDialogOpen}
          onOpenChange={(open) => {
            setVersioniDialogOpen(open);
            if (!open) setPreventivoPerVersioni(null);
          }}
          codice={preventivoPerVersioni.codice || "Preventivo"}
          versioneCorrente={preventivoPerVersioni.versione}
          storico={preventivoPerVersioni.storico_pdf || []}
          pdfCorrentePath={null} // PDF corrente non salvato in questo contesto
        />
      )}
    </>
  );
}
