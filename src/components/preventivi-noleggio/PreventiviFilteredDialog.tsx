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
import { Eye, Pencil, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModificaPreventivoDialog } from "./ModificaPreventivoDialog";
import { PreventivoPreviewDialog } from "./PreventivoPreviewDialog";
import { ConfermaPreventivoDialog } from "./ConfermaPreventivoDialog";

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
  const { preventivi, aggiornaPreventivo, aggiornaStato, convertiInNoleggio } = usePreventiviNoleggio();
  
  const [preventivoDaModificare, setPreventivoDaModificare] = useState<PreventivoNoleggio | null>(null);
  const [preventivoPerPDF, setPreventivoPerPDF] = useState<PreventivoNoleggio | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [preventivoSelezionato, setPreventivoSelezionato] = useState<PreventivoNoleggio | null>(null);

  const filteredPreventivi = useMemo(() => {
    return preventivi.filter(p => p.stato === filterStato);
  }, [preventivi, filterStato]);

  const canEdit = [StatoPreventivo.BOZZA, StatoPreventivo.DA_INVIARE, StatoPreventivo.IN_REVISIONE].includes(filterStato);

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
            <div className="space-y-2">
              {filteredPreventivi.map((p) => (
                <div
                  key={p.id_preventivo}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                >
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

                  <div className="flex items-center gap-1">
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

                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPreventivoDaModificare(p)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {filterStato === StatoPreventivo.DA_INVIARE && (
                          <DropdownMenuItem
                            onClick={async () => {
                              await aggiornaStato(p.id_preventivo, StatoPreventivo.INVIATO);
                              toast({ title: "Preventivo segnato come inviato" });
                            }}
                          >
                            Segna come Inviato
                          </DropdownMenuItem>
                        )}
                        {filterStato === StatoPreventivo.INVIATO && (
                          <>
                            <DropdownMenuItem
                              onClick={async () => {
                                await aggiornaStato(p.id_preventivo, StatoPreventivo.APPROVATO);
                                toast({ title: "Preventivo approvato" });
                              }}
                            >
                              Segna come Approvato
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={async () => {
                                await aggiornaStato(p.id_preventivo, StatoPreventivo.RIFIUTATO);
                                toast({ title: "Preventivo rifiutato" });
                              }}
                            >
                              Segna come Rifiutato
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={async () => {
                                await aggiornaStato(p.id_preventivo, StatoPreventivo.IN_REVISIONE);
                                toast({ title: "Preventivo in revisione" });
                              }}
                            >
                              Richiedi Revisione
                            </DropdownMenuItem>
                          </>
                        )}
                        {filterStato === StatoPreventivo.APPROVATO && !p.convertito_in_noleggio_id && (
                          <DropdownMenuItem
                            onClick={() => {
                              setPreventivoSelezionato(p);
                              setConfirmOpen(true);
                            }}
                          >
                            Converti in Noleggio
                          </DropdownMenuItem>
                        )}
                        {filterStato === StatoPreventivo.SCADUTO && (
                          <DropdownMenuItem
                            onClick={async () => {
                              await aggiornaStato(p.id_preventivo, StatoPreventivo.INVIATO);
                              toast({ title: "Preventivo riattivato" });
                            }}
                          >
                            Riattiva (Re-Invia)
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ModificaPreventivoDialog
        open={!!preventivoDaModificare}
        onOpenChange={(open) => !open && setPreventivoDaModificare(null)}
        preventivo={preventivoDaModificare}
        onSave={async (values) => {
          if (!preventivoDaModificare) return;
          const updates = preventivoDaModificare.stato === StatoPreventivo.IN_REVISIONE
            ? { ...values, stato: StatoPreventivo.DA_INVIARE }
            : values;
          await aggiornaPreventivo(preventivoDaModificare.id_preventivo, updates);
          toast({ title: "Preventivo aggiornato" });
          setPreventivoDaModificare(null);
        }}
      />

      {preventivoPerPDF && (
        <PreventivoPreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          {...getPreviewData(preventivoPerPDF)}
          onSave={async () => setPreviewOpen(false)}
        />
      )}

      <ConfermaPreventivoDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        preventivo={preventivoSelezionato}
        onConfirm={async (p) => {
          await convertiInNoleggio(p);
          toast({ title: "Preventivo convertito", description: "Noleggio attivo creato" });
        }}
      />
    </>
  );
}
