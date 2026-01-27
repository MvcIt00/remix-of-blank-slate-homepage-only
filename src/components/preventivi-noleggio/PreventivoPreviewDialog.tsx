import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import { DocumentPreviewDialog } from "@/components/pdf";
import { PreventivoPDF, DatiClientePreventivo, DatiMezzoPreventivo, DatiPreventivo } from "./PreventivoPDF";
import { DatiAziendaOwner } from "@/components/pdf";
import { uploadPreventivoPDF } from "@/utils/noleggioStorage";
import { toast } from "@/hooks/use-toast";
import { StatoPreventivo } from "@/types/preventiviNoleggio";

interface PreventivoPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  datiOwner: DatiAziendaOwner;
  datiCliente: DatiClientePreventivo;
  datiMezzo: DatiMezzoPreventivo;
  datiPreventivo: DatiPreventivo;
  preventivoId: string;           // ID per upload
  statoCorrente: StatoPreventivo; // Per logica versionamento
  versioneCorrente: number;       // Versione attuale
  pdfBozzaPath: string | null;    // Path attuale (per archiviazione)
  onSave: (uploadedPath: string) => Promise<void>; // Passa il path del PDF caricato
}

export function PreventivoPreviewDialog({
  open,
  onOpenChange,
  datiOwner,
  datiCliente,
  datiMezzo,
  datiPreventivo,
  preventivoId,
  statoCorrente,
  versioneCorrente,
  pdfBozzaPath,
  onSave,
}: PreventivoPreviewDialogProps) {
  const [saving, setSaving] = useState(false);
  const [currentBlob, setCurrentBlob] = useState<Blob | null>(null);

  const handleSave = async () => {
    if (!currentBlob) {
      toast({
        title: "Errore",
        description: "PDF non ancora generato",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Upload su Storage
      const path = await uploadPreventivoPDF(
        currentBlob,
        preventivoId,
        datiPreventivo.codice_preventivo
      );

      // Callback al parent con il path
      await onSave(path);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Errore upload",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const pdfDocument = (
    <PreventivoPDF
      datiOwner={datiOwner}
      datiCliente={datiCliente}
      datiMezzo={datiMezzo}
      datiPreventivo={datiPreventivo}
    />
  );

  const saveAction = (
    <Button size="sm" onClick={handleSave} disabled={saving || !currentBlob}>
      {saving ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <Save className="h-4 w-4 mr-1" />
      )}
      Salva Preventivo
    </Button>
  );

  return (
    <DocumentPreviewDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Anteprima Preventivo Noleggio"
      pdfDocument={pdfDocument}
      fileName={`preventivo-${datiPreventivo.codice_preventivo}.pdf`}
      actions={saveAction}
      onBlobReady={setCurrentBlob}
    />
  );
}

export type { DatiClientePreventivo, DatiMezzoPreventivo, DatiPreventivo };
