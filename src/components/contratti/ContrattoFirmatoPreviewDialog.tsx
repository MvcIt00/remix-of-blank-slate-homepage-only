import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ContrattoFirmatoPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filePath: string;
  fileName?: string;
}

export function ContrattoFirmatoPreviewDialog({
  open,
  onOpenChange,
  filePath,
  fileName,
}: ContrattoFirmatoPreviewDialogProps) {
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open && filePath) {
      loadPdf();
    }
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [open, filePath]);

  const loadPdf = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from("contratti")
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      setPdfUrl(url);
    } catch (error) {
      console.error("Error loading PDF:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare l'anteprima del contratto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.storage
        .from("contratti")
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "contratto_firmato.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading contract:", error);
      toast({
        title: "Errore",
        description: "Errore nel download del contratto",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{fileName || "Anteprima Contratto Firmato"}</DialogTitle>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Scarica
          </Button>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full rounded-md border"
              title="Anteprima contratto"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Impossibile visualizzare l'anteprima
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
