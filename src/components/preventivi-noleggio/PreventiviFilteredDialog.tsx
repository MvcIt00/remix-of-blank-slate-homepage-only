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
import { Eye, Pencil, Trash2, Archive, RefreshCw } from "lucide-react";
import { ModificaPreventivoDialog } from "./ModificaPreventivoDialog";
import { PreventivoPreviewDialog } from "./PreventivoPreviewDialog";
import { ConfermaPreventivoDialog } from "./ConfermaPreventivoDialog";
import { RinnovaPreventivoDialog } from "./RinnovaPreventivoDialog";
import { PreventivoStatoBadge } from "./PreventivoStatoBadge";
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
    rinnovaPreventivo,
  } = usePreventiviNoleggio();
  
  const [preventivoDaModificare, setPreventivoDaModificare] = useState<PreventivoNoleggio | null>(null);
  const [preventivoPerPDF, setPreventivoPerPDF] = useState<PreventivoNoleggio | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [preventivoSelezionato, setPreventivoSelezionato] = useState<PreventivoNoleggio | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<PreventivoNoleggio | null>(null);
  const [rinnovaOpen, setRinnovaOpen] = useState(false);
  const [preventivoDaRinnovare, setPreventivoDaRinnovare] = useState<PreventivoNoleggio | null>(null);

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

  // Handler cambio stato via badge - ora supporta dettaglio per IN_REVISIONE
  const handleStatusChange = async (p: PreventivoNoleggio, newStatus: StatoPreventivo, dettaglio?: string): Promise<void> => {
    await aggiornaStato(p.id_preventivo, newStatus, dettaglio);
    toast({ title: "Stato aggiornato", description: `Preventivo ora: ${newStatus}` });
  };

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

  // Azioni contestuali inline (solo azioni operative, non cambio stato)
  const renderAzioni = (p: PreventivoNoleggio) => {
    const actions: Array<{
      icon: React.ReactNode;
      label: string;
      onClick: () => void;
      variant?: "default" | "outline" | "ghost" | "destructive";
    }> = [];

    // Anteprima sempre presente
    actions.push({
      icon: <Eye className="h-4 w-4" />,
      label: "Anteprima",
      onClick: () => {
        setPreventivoPerPDF(p);
        setPreviewOpen(true);
      },
      variant: "ghost"
    });

    // Modifica per stati editabili
    if ([StatoPreventivo.BOZZA, StatoPreventivo.DA_INVIARE, StatoPreventivo.IN_REVISIONE].includes(p.stato)) {
      actions.push({
        icon: <Pencil className="h-4 w-4" />,
        label: "Modifica",
        onClick: () => setPreventivoDaModificare(p),
        variant: "ghost"
      });
    }

    // Rinnova per scaduti
    if (p.stato === StatoPreventivo.SCADUTO) {
      actions.push({
        icon: <RefreshCw className="h-4 w-4" />,
        label: "Rinnova",
        onClick: () => {
          setPreventivoDaRinnovare(p);
          setRinnovaOpen(true);
        }
      });
      actions.push({
        icon: <Archive className="h-4 w-4" />,
        label: "Archivia",
        onClick: () => handleArchivia(p),
        variant: "ghost"
      });
    }

    // Converti per approvati
    if (p.stato === StatoPreventivo.APPROVATO && !p.convertito_in_noleggio_id) {
      actions.push({
        icon: <Eye className="h-4 w-4" />,
        label: "Converti in Noleggio",
        onClick: () => {
          setPreventivoSelezionato(p);
          setConfirmOpen(true);
        }
      });
    }

    // Archivia per rifiutati
    if (p.stato === StatoPreventivo.RIFIUTATO) {
      actions.push({
        icon: <Archive className="h-4 w-4" />,
        label: "Archivia",
        onClick: () => handleArchivia(p),
        variant: "ghost"
      });
    }

    // Elimina per stati non definitivi
    if (![StatoPreventivo.CONCLUSO, StatoPreventivo.ARCHIVIATO].includes(p.stato)) {
      actions.push({
        icon: <Trash2 className="h-4 w-4" />,
        label: "Elimina",
        onClick: () => setDeleteConfirm(p),
        variant: "destructive"
      });
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
              {/* Header riga - layout ottimizzato con allineamento verticale */}
              <div className="grid grid-cols-[90px_1.2fr_1.5fr_80px_100px_auto] gap-2 px-3 py-2 text-xs font-medium text-muted-foreground border-b sticky top-0 bg-background z-10 items-center">
                <span className="truncate">Codice</span>
                <span className="truncate">Cliente</span>
                <span className="truncate">Mezzo</span>
                <span className="truncate">Canone</span>
                <span className="truncate">Stato</span>
                <span className="text-right">Azioni</span>
              </div>

              {/* Lista righe */}
              <div className="divide-y">
                {filteredPreventivi.map((p) => (
                  <div
                    key={p.id_preventivo}
                    className="grid grid-cols-[90px_1.2fr_1.5fr_80px_100px_auto] gap-2 px-3 py-2 items-center hover:bg-muted/30 transition-colors"
                  >
                    {/* Codice */}
                    <span className="font-mono text-xs font-bold text-muted-foreground truncate">
                      {p.codice || "BOZZA"}
                    </span>

                    {/* Cliente */}
                    <span className="font-medium truncate text-sm">
                      {p.Anagrafiche?.ragione_sociale ?? "Cliente"}
                    </span>

                    {/* Mezzo - layout migliorato con interno */}
                    <div className="flex flex-col text-sm min-w-0">
                      <span className="font-medium truncate">
                        {p.Mezzi?.marca} {p.Mezzi?.modello}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {p.Mezzi?.matricola && `Matr: ${p.Mezzi.matricola}`}
                        {(p.Mezzi as any)?.id_interno && ` • Int: ${(p.Mezzi as any).id_interno}`}
                      </span>
                    </div>

                    {/* Canone */}
                    <span className="text-sm">
                      {p.prezzo_noleggio ? `€${p.prezzo_noleggio}` : "-"}
                    </span>

                    {/* Stato Badge cliccabile con supporto dettaglio */}
                    <PreventivoStatoBadge
                      stato={p.stato}
                      onStatusChange={(newStatus, dettaglio) => handleStatusChange(p, newStatus, dettaglio)}
                    />

                    {/* Azioni inline */}
                    <div className="flex items-center justify-end">
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
          if (!open) setPreventivoDaModificare(null);
        }}
        preventivo={preventivoDaModificare}
        onSave={async (values) => {
          if (!preventivoDaModificare) return;
          
          // Se era in revisione o bozza, dopo modifica va a da_inviare
          let nuovoStato = preventivoDaModificare.stato;
          if ([StatoPreventivo.IN_REVISIONE, StatoPreventivo.BOZZA].includes(preventivoDaModificare.stato)) {
            nuovoStato = StatoPreventivo.DA_INVIARE;
          }
          
          await aggiornaPreventivo(preventivoDaModificare.id_preventivo, { 
            ...values, 
            stato: nuovoStato 
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
