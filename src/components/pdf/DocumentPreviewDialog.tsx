/**
 * DIALOG CENTRALIZZATO PER ANTEPRIMA PDF
 * 
 * Componente riutilizzabile per visualizzare qualsiasi documento PDF
 * con layout consistente: header con azioni, corpo con iframe PDF
 */

import { ReactElement, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { pdf, BlobProvider } from "@react-pdf/renderer";
import { Download, Printer, Loader2 } from "lucide-react";

interface DocumentPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  pdfDocument: ReactElement;
  fileName?: string;
  actions?: ReactElement;
  onBlobReady?: (blob: Blob) => void; // Callback quando il blob PDF è pronto
}

// Wrapper component per notificare il parent quando il blob è pronto
// Necessario per rispettare le regole degli hooks (non si può usare useEffect direttamente nel render di BlobProvider)
function BlobNotifier({ blob, onBlobReady }: { blob: Blob | null; onBlobReady?: (blob: Blob) => void }) {
  useEffect(() => {
    if (blob && onBlobReady) {
      onBlobReady(blob);
    }
  }, [blob, onBlobReady]);

  return null;
}

export function DocumentPreviewDialog({
  open,
  onOpenChange,
  title,
  pdfDocument,
  fileName = "documento.pdf",
  actions,
  onBlobReady,
}: DocumentPreviewDialogProps) {
  const handleDownload = async () => {
    const blob = await pdf(pdfDocument).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b flex-row items-center justify-between">
          <DialogTitle>{title}</DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1" />
              Stampa
            </Button>
            {actions}
          </div>
        </DialogHeader>

        <div className="flex-1 p-4 bg-muted/30 overflow-hidden">
          <BlobProvider document={pdfDocument}>
            {({ blob, url, loading, error }) => {
              // Notifica il parent quando il blob è pronto
              if (blob && !loading && !error) {
                return (
                  <>
                    <BlobNotifier blob={blob} onBlobReady={onBlobReady} />
                    <iframe
                      src={url!}
                      className="w-full h-full rounded-md border bg-white"
                      title={title}
                    />
                  </>
                );
              }
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
              return null;
            }}
          </BlobProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
