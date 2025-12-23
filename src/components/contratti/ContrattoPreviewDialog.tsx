import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { pdf, BlobProvider } from "@react-pdf/renderer";
import { Download, Printer, Save, Loader2 } from "lucide-react";
import { ContrattoPDF, DatiCliente, DatiMezzo, DatiContratto } from "./ContrattoPDF";
import { DatiAziendaOwner } from "@/components/pdf";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ContrattoPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  datiOwner: DatiAziendaOwner;
  datiCliente: DatiCliente;
  datiMezzo: DatiMezzo;
  noleggioData: {
    id_mezzo: string;
    id_anagrafica: string;
    id_anagrafica_fornitore: string | null;
    sede_operativa?: string;
    data_inizio?: string;
    data_fine?: string;
    tempo_indeterminato: boolean;
    prezzo_noleggio?: number;
    prezzo_trasporto?: number;
    tipo_canone?: string;
    note?: string;
  };
  onSuccess: () => void;
  existingNoleggioId?: string;
  existingContract?: any;
}

export function ContrattoPreviewDialog({
  open,
  onOpenChange,
  datiOwner,
  datiCliente,
  datiMezzo,
  noleggioData,
  onSuccess,
  existingNoleggioId,
  existingContract,
}: ContrattoPreviewDialogProps) {
  const [saving, setSaving] = useState(false);

  const datiContrattoPreview: DatiContratto = {
    codice_contratto: existingContract?.codice_contratto || "ANTEPRIMA",
    data_inizio: existingContract?.data_inizio || noleggioData.data_inizio || new Date().toISOString().split("T")[0],
    data_fine: existingContract?.data_fine || (noleggioData.tempo_indeterminato ? null : (noleggioData.data_fine || null)),
    tempo_indeterminato: existingContract?.tempo_indeterminato ?? noleggioData.tempo_indeterminato,
    canone_noleggio: existingContract?.canone_noleggio ?? (noleggioData.prezzo_noleggio || null),
    tipo_canone: existingContract?.tipo_canone ?? (noleggioData.tipo_canone || null),
    costo_trasporto: existingContract?.costo_trasporto ?? (noleggioData.prezzo_trasporto || null),
    deposito_cauzionale: existingContract?.deposito_cauzionale ?? null,
    modalita_pagamento: existingContract?.modalita_pagamento ?? null,
    termini_pagamento: existingContract?.termini_pagamento ?? null,
    clausole_speciali: existingContract?.clausole_speciali ?? null,
    data_creazione: existingContract?.data_creazione || new Date().toISOString(),
  };

  const pdfDocument = (
    <ContrattoPDF
      datiOwner={datiOwner}
      datiCliente={datiCliente}
      datiMezzo={datiMezzo}
      datiContratto={datiContrattoPreview}
    />
  );

  const handleDownload = async () => {
    const blob = await pdf(pdfDocument).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contratto_anteprima.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = async () => {
    const blob = await pdf(pdfDocument).toBlob();
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, "_blank");
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleSaveAndRegister = async () => {
    setSaving(true);
    try {
      let noleggioId = existingNoleggioId;

      // 1. Crea il noleggio SE NON ESISTE
      if (!noleggioId) {
        const noleggioInsert = {
          id_mezzo: noleggioData.id_mezzo,
          id_anagrafica: noleggioData.id_anagrafica,
          sede_operativa: noleggioData.sede_operativa || null,
          data_inizio: noleggioData.data_inizio || null,
          data_fine: noleggioData.tempo_indeterminato ? null : (noleggioData.data_fine || null),
          tempo_indeterminato: noleggioData.tempo_indeterminato,
          prezzo_noleggio: noleggioData.prezzo_noleggio || null,
          prezzo_trasporto: noleggioData.prezzo_trasporto || null,
          tipo_canone: noleggioData.tipo_canone as "giornaliero" | "mensile" | undefined,
          note: noleggioData.note || null,
        };

        const { data: noleggio, error: noleggioError } = await supabase
          .from("Noleggi")
          .insert(noleggioInsert)
          .select()
          .single();

        if (noleggioError) throw noleggioError;
        noleggioId = noleggio.id_noleggio;
      }

      if (!noleggioId) throw new Error("ID Noleggio mancante");

      // 2. Crea il contratto (il codice_contratto viene generato dal DB)
      const contrattoInsert = {
        id_noleggio: noleggioId,
        id_anagrafica_cliente: noleggioData.id_anagrafica,
        id_anagrafica_fornitore: noleggioData.id_anagrafica_fornitore || "",
        dati_cliente: datiCliente as unknown as Record<string, unknown>,
        dati_fornitore: datiOwner as unknown as Record<string, unknown>,
        dati_mezzo: datiMezzo as unknown as Record<string, unknown>,
        data_inizio: noleggioData.data_inizio || new Date().toISOString().split("T")[0],
        data_fine: noleggioData.tempo_indeterminato ? null : (noleggioData.data_fine || null),
        tempo_indeterminato: noleggioData.tempo_indeterminato,
        canone_noleggio: noleggioData.prezzo_noleggio || null,
        tipo_canone: noleggioData.tipo_canone as "giornaliero" | "mensile" | undefined,
        costo_trasporto: noleggioData.prezzo_trasporto || null,
      };

      const { data: contratto, error: contrattoError } = await supabase
        .from("contratti_noleggio")
        .insert(contrattoInsert as any)
        .select()
        .single();

      if (contrattoError) throw contrattoError;

      // 3. Genera PDF finale
      const datiContrattoFinale: DatiContratto = {
        ...datiContrattoPreview,
        codice_contratto: contratto.codice_contratto,
        data_creazione: contratto.data_creazione || new Date().toISOString(),
      };

      const pdfBlob = await pdf(
        <ContrattoPDF
          datiOwner={datiOwner}
          datiCliente={datiCliente}
          datiMezzo={datiMezzo}
          datiContratto={datiContrattoFinale}
        />
      ).toBlob();

      // 4. Upload PDF nell'area 'generati' con il nome ufficiale
      const fileName = `generati/${contratto.codice_contratto.replace(/\//g, "-")}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("contratti")
        .upload(fileName, pdfBlob, {
          upsert: true,
          contentType: 'application/pdf'
        });

      if (uploadError) throw uploadError;

      // 5. Aggiorna path
      await supabase
        .from("contratti_noleggio")
        .update({ pdf_bozza_path: fileName })
        .eq("id_contratto", contratto.id_contratto);

      toast({
        title: "Successo",
        description: "Contratto registrato con successo",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error saving:", error);
      toast({
        title: "Errore",
        description: "Errore nella registrazione",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b flex-row items-center justify-between">
          <DialogTitle>{existingContract ? "Visualizza Bozza Contratto" : "Anteprima Contratto"}</DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1" />
              Stampa
            </Button>
            {!existingContract && (
              <Button size="sm" onClick={handleSaveAndRegister} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Salva e Registra
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 p-4 bg-muted/30 overflow-hidden">
          <BlobProvider document={pdfDocument}>
            {({ blob, url, loading, error }) => {
              if (loading) {
                return (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Generazione PDF...</span>
                  </div>
                );
              }
              if (error) {
                return (
                  <div className="h-full flex items-center justify-center text-destructive">
                    Errore nella generazione del PDF: {error.message}
                  </div>
                );
              }
              if (url) {
                return (
                  <iframe
                    src={url}
                    className="w-full h-full rounded-md border bg-white"
                    title="Anteprima Contratto"
                  />
                );
              }
              return null;
            }}
          </BlobProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
