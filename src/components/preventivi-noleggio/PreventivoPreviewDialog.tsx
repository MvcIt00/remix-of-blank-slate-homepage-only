import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import { DocumentPreviewDialog } from "@/components/pdf";
import { PreventivoPDF, DatiClientePreventivo, DatiMezzoPreventivo, DatiPreventivo } from "./PreventivoPDF";
import { DatiAziendaOwner } from "@/components/pdf";

interface PreventivoPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  datiOwner: DatiAziendaOwner;
  datiCliente: DatiClientePreventivo;
  datiMezzo: DatiMezzoPreventivo;
  datiPreventivo: DatiPreventivo;
  onSave: () => Promise<void>;
}

export function PreventivoPreviewDialog({
  open,
  onOpenChange,
  datiOwner,
  datiCliente,
  datiMezzo,
  datiPreventivo,
  onSave,
}: PreventivoPreviewDialogProps) {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
      onOpenChange(false);
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
    <Button size="sm" onClick={handleSave} disabled={saving}>
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
    />
  );
}

export type { DatiClientePreventivo, DatiMezzoPreventivo, DatiPreventivo };
