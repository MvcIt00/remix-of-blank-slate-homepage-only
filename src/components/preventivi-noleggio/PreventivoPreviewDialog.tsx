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
  // Props opzionali per modalità "upload su Storage" (quando si modifica record esistente)
  preventivoId?: string;
  statoCorrente?: StatoPreventivo;
  versioneCorrente?: number;
  pdfBozzaPath?: string | null;
  // Callback compatibile con entrambe le modalità
  onSave?: (uploadedPath?: string) => Promise<void>;
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
      // MODALITÀ 1: Upload su Storage (se preventivoId presente)
      if (preventivoId) {
        const path = await uploadPreventivoPDF(
          currentBlob,
          preventivoId,
          datiPreventivo.codice_preventivo
        );
        await onSave?.(path);
      }
      // MODALITÀ 2: Preview-only (per flow "Nuovo Preventivo")
      else {
        await onSave?.();
      }

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Errore",
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

  // Etichetta dinamica basata sulla modalità
  const saveLabel = preventivoId ? "Salva PDF" : "Salva Preventivo";

  const saveAction = onSave ? (
    <Button size="sm" onClick={handleSave} disabled={saving || !currentBlob}>
      {saving ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <Save className="h-4 w-4 mr-1" />
      )}
      {saveLabel}
    </Button>
  ) : null;

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
