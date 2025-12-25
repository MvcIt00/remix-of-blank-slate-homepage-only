import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { pdf } from "@react-pdf/renderer";
import { Download, Printer, Save, Loader2, AlertTriangle, RotateCcw } from "lucide-react";
import { ContrattoPDF, DatiCliente, DatiMezzo, DatiContratto } from "./ContrattoPDF";
import { DatiAziendaOwner } from "@/components/pdf";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { mergePdfs } from "@/utils/pdf-merger";
import { NOLEGGIO_BUCKET, getNoleggioPath } from "@/utils/noleggioStorage";

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
  const [generating, setGenerating] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [mergedPdfBlob, setMergedPdfBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    tipo_tariffa: existingContract?.tipo_tariffa || noleggioData.tipo_canone || "mensile",
    canone_mensile: existingContract?.canone_mensile || noleggioData.prezzo_noleggio || 0,
  };

  const revokeMergedUrl = () => {
    setMergedPdfUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const generateFullPdf = async () => {
    setGenerating(true);
    setError(null);
    revokeMergedUrl();
    setMergedPdfBlob(null);

    try {
      // 1. Genera la pagina dinamica (Contratto)
      const dynamicBlob = await pdf(
        <ContrattoPDF
          datiOwner={datiOwner}
          datiCliente={datiCliente}
          datiMezzo={datiMezzo}
          datiContratto={datiContrattoPreview}
        />
      ).toBlob();

      const dynamicBuffer = await dynamicBlob.arrayBuffer();

      // 2. Scarica il PDF statico (Condizioni Generali) dal silo noleggio via Facade
      const { data: staticFile, error: storageError } = await supabase.storage
        .from(NOLEGGIO_BUCKET)
        .download(getNoleggioPath("STATIC_ASSETS", "condizioni_generali_noleggio.pdf"));

      if (storageError) {
        console.error("❌ Errore download PDF statico:", storageError);
        console.warn("Dettagli errore:", JSON.stringify(storageError, null, 2));
        // Fallback: se manca lo statico, mostriamo solo il dinamico
        const url = URL.createObjectURL(dynamicBlob);
        setMergedPdfUrl(url);
        setMergedPdfBlob(dynamicBlob);
        return;
      }

      const staticBuffer = await staticFile.arrayBuffer();

      // 3. Merge
      const mergedBlob = await mergePdfs([dynamicBuffer, staticBuffer]);
      const url = URL.createObjectURL(mergedBlob);

      setMergedPdfUrl(url);
      setMergedPdfBlob(mergedBlob);
    } catch (err: any) {
      console.error("Error merging PDFs:", err);
      setError("Impossibile generare il PDF completo: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (open) {
      generateFullPdf();
    }
    return () => {
      revokeMergedUrl();
      setMergedPdfBlob(null);
      setError(null);
    };
  }, [open]);

  const handleDownload = () => {
    if (!mergedPdfUrl) return;
    const a = document.createElement("a");
    a.href = mergedPdfUrl;
    a.download = `contratto_${datiContrattoPreview.codice_contratto.replace(/\//g, "-")}.pdf`;
    a.click();
  };

  const handlePrint = () => {
    if (!mergedPdfUrl) return;
    const printWindow = window.open(mergedPdfUrl, "_blank");
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleSaveAndRegister = async () => {
    if (!mergedPdfBlob) {
      toast({
        title: "Errore",
        description: "PDF non ancora generato",
        variant: "destructive",
      });
      return;
    }

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

      // 2. Crea il contratto
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

      // 3. LOGICA 'ZERO-DRAFT': NON salviamo più il PDF fisico della bozza.
      // Il PDF verrà rigenerato on-the-fly ogni volta partendo dai dati del contratto nel DB.

      toast({
        title: "Successo",
        description: "Dati contratto registrati con successo. La bozza sarà disponibile per l'anteprima.",
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
          <DialogTitle>{existingContract ? "Visualizza Contratto" : "Anteprima Contratto"}</DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload} disabled={generating || !!error}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} disabled={generating || !!error}>
              <Printer className="h-4 w-4 mr-1" />
              Stampa
            </Button>
            {!existingContract && (
              <Button size="sm" onClick={handleSaveAndRegister} disabled={saving || generating || !!error}>
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

        <div className="flex-1 p-4 bg-muted/30 overflow-hidden relative">
          {generating ? (
            <div className="h-full flex flex-col items-center justify-center bg-white rounded-md border">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-sm font-medium text-muted-foreground animate-pulse">
                Unione documenti in corso...
              </p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center bg-destructive/5 rounded-md border border-destructive/20 p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold text-destructive mb-2">Errore Generazione PDF</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md">{error}</p>
              <Button variant="outline" onClick={generateFullPdf}>
                Riprova
              </Button>
            </div>
          ) : mergedPdfUrl ? (
            <iframe
              src={mergedPdfUrl}
              className="w-full h-full rounded-md border bg-white shadow-sm"
              title="Anteprima Contratto Completo"
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
