import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PreventiviDataTable } from "./PreventiviDataTable";
import { ModificaPreventivoDialog } from "./ModificaPreventivoDialog";
import { ConfermaPreventivoDialog } from "./ConfermaPreventivoDialog";
import { PreventivoPreviewDialog } from "./PreventivoPreviewDialog";
import { PreventivoNoleggio, StatoPreventivo } from "@/types/preventiviNoleggio";
import { usePreventiviNoleggio } from "@/hooks/usePreventiviNoleggio";
import { toast } from "@/hooks/use-toast";

interface PreventiviFilteredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: PreventivoNoleggio[];
  title: string;
  loading?: boolean;
}

export function PreventiviFilteredDialog({
  open,
  onOpenChange,
  data,
  title,
  loading = false,
}: PreventiviFilteredDialogProps) {
  const {
    aggiornaPreventivo,
    aggiornaStato,
    eliminaPreventivo,
    archiviaPreventivo,
    convertiInNoleggio,
  } = usePreventiviNoleggio();

  const [preventivoDaModificare, setPreventivoDaModificare] = useState<PreventivoNoleggio | null>(null);
  const [preventivoSelezionato, setPreventivoSelezionato] = useState<PreventivoNoleggio | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [preventivoPerPDF, setPreventivoPerPDF] = useState<PreventivoNoleggio | null>(null);

  const handleStatusChange = async (id: string, stato: StatoPreventivo) => {
    await aggiornaStato(id, stato);
    toast({ title: "Stato aggiornato", description: `Il preventivo è ora ${stato}` });
  };

  const handleDelete = async (preventivo: PreventivoNoleggio) => {
    await eliminaPreventivo(preventivo.id_preventivo);
    toast({ title: "Preventivo eliminato" });
  };

  const handleArchive = async (preventivo: PreventivoNoleggio) => {
    await archiviaPreventivo(preventivo.id_preventivo);
    toast({ title: "Preventivo archiviato" });
  };

  const handleConvert = async (preventivo: PreventivoNoleggio) => {
    await convertiInNoleggio(preventivo);
    toast({ title: "Preventivo convertito", description: "Noleggio attivo creato" });
  };

  const getPreviewData = () => {
    if (!preventivoPerPDF) return null;

    return {
      datiOwner: preventivoPerPDF.dati_azienda || {
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
        iban: null,
      },
      datiCliente: {
        ragione_sociale: preventivoPerPDF.Anagrafiche?.ragione_sociale ?? "",
        partita_iva: preventivoPerPDF.Anagrafiche?.partita_iva ?? null,
        indirizzo: preventivoPerPDF.Sedi?.indirizzo ?? null,
        citta: preventivoPerPDF.Sedi?.citta ?? null,
        cap: preventivoPerPDF.Sedi?.cap ?? null,
        provincia: preventivoPerPDF.Sedi?.provincia ?? null,
        telefono: preventivoPerPDF.Anagrafiche?.telefono ?? null,
        email: preventivoPerPDF.Anagrafiche?.email ?? null,
        pec: preventivoPerPDF.Anagrafiche?.pec ?? null,
        codice_univoco: preventivoPerPDF.Anagrafiche?.codice_univoco ?? null,
      },
      datiMezzo: {
        marca: preventivoPerPDF.Mezzi?.marca ?? null,
        modello: preventivoPerPDF.Mezzi?.modello ?? null,
        matricola: preventivoPerPDF.Mezzi?.matricola ?? null,
        id_interno: null,
        anno: preventivoPerPDF.Mezzi?.anno ? String(preventivoPerPDF.Mezzi.anno) : null,
        categoria: null,
        ore_moto: preventivoPerPDF.Mezzi?.ore ?? null,
      },
      datiPreventivo: {
        codice_preventivo: preventivoPerPDF.codice ?? "BOZZA",
        data_creazione: preventivoPerPDF.created_at ?? new Date().toISOString(),
        data_inizio: preventivoPerPDF.data_inizio ?? null,
        data_fine: preventivoPerPDF.data_fine ?? null,
        tempo_indeterminato: preventivoPerPDF.tempo_indeterminato ?? false,
        canone_noleggio: preventivoPerPDF.prezzo_noleggio ?? null,
        tipo_canone: preventivoPerPDF.tipo_canone ?? "giornaliero",
        costo_trasporto: null,
        note: preventivoPerPDF.note ?? null,
        validita_giorni: 30,
      },
    };
  };

  const previewData = getPreviewData();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <PreventiviDataTable
            data={data}
            loading={loading}
            onStatusChange={handleStatusChange}
            onEdit={setPreventivoDaModificare}
            onDelete={handleDelete}
            onGeneratePDF={(p) => {
              setPreventivoPerPDF(p);
              setPreviewOpen(true);
            }}
            onConvert={(p) => {
              setPreventivoSelezionato(p);
              setConfirmOpen(true);
            }}
            onArchive={handleArchive}
            emptyMessage="Nessun preventivo in questa categoria"
          />
        </DialogContent>
      </Dialog>

      <ConfermaPreventivoDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        preventivo={preventivoSelezionato}
        onConfirm={handleConvert}
      />

      <ModificaPreventivoDialog
        open={!!preventivoDaModificare}
        onOpenChange={(open) => !open && setPreventivoDaModificare(null)}
        preventivo={preventivoDaModificare}
        onSave={async (values) => {
          if (!preventivoDaModificare) return;
          await aggiornaPreventivo(preventivoDaModificare.id_preventivo, values);
          toast({ title: "Preventivo aggiornato" });
          setPreventivoDaModificare(null);
        }}
      />

      {previewData && (
        <PreventivoPreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          datiOwner={previewData.datiOwner}
          datiCliente={previewData.datiCliente}
          datiMezzo={previewData.datiMezzo}
          datiPreventivo={previewData.datiPreventivo}
          onSave={async () => {
            setPreviewOpen(false);
          }}
        />
      )}
    </>
  );
}
