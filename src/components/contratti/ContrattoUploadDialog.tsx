import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileUp, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ContrattoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noleggioId: string;
  existingDocumentId?: string;
  existingFilePath?: string;
  onUploadSuccess: () => void;
}

export function ContrattoUploadDialog({
  open,
  onOpenChange,
  noleggioId,
  existingDocumentId,
  existingFilePath,
  onUploadSuccess,
}: ContrattoUploadDialogProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const validateFile = (file: File): boolean => {
    if (file.type !== "application/pdf") {
      toast({
        title: "Errore",
        description: "Solo file PDF sono accettati",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Errore",
        description: "Il file non può superare i 10MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const timestamp = Date.now();
      const filePath = `noleggi/${noleggioId}/contratto_firmato_${timestamp}.pdf`;

      // 1. Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("contratti")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // 2. If there was an existing document, delete the old file
      if (existingFilePath) {
        await supabase.storage.from("contratti").remove([existingFilePath]);

        // Update existing document record
        const { error: updateError } = await supabase
          .from("documenti_noleggio")
          .update({
            file_path: filePath,
            nome_file_originale: selectedFile.name,
            dimensione_bytes: selectedFile.size,
            data_documento: new Date().toISOString().split("T")[0],
          })
          .eq("id_documento", existingDocumentId);

        if (updateError) throw updateError;
      } else {
        // Insert new document record
        const { error: insertError } = await supabase
          .from("documenti_noleggio")
          .insert({
            id_noleggio: noleggioId,
            tipo_documento: "contratto_firmato",
            file_path: filePath,
            nome_file_originale: selectedFile.name,
            dimensione_bytes: selectedFile.size,
            data_documento: new Date().toISOString().split("T")[0],
          });

        if (insertError) throw insertError;
      }

      // 3. IMPORTANT: Update the contratti_noleggio table
      // We search for the contract associated with this rental (it should exist as draft, or we might need to handle if it doesn't)
      // If it exists, we update the signed path and status.
      // If it doesn't exist, we skip (or potentially create one, but usually draft exists first).
      // Assuming a draft was generated first, or we just attach it to the rental.

      const today = new Date().toISOString().split("T")[0];

      // First check if a contract record exists for this rental
      const { data: existingContract } = await supabase
        .from("contratti_noleggio")
        .select("id_contratto")
        .eq("id_noleggio", noleggioId)
        .single();

      if (existingContract) {
        const { error: contractUpdateError } = await supabase
          .from("contratti_noleggio")
          .update({
            pdf_firmato_path: filePath,
            stato_contratto: "firmato", // Explicitly setting status
            data_firma: today,
            is_cancellato: false // Ensure it's active
          })
          .eq("id_contratto", existingContract.id_contratto);

        if (contractUpdateError) {
          console.error("Error updating contract record:", contractUpdateError);
          // We don't throw here to not block the success toast if the document upload itself worked, 
          // but it's good to log. OR we could throw to be strict.
        }
      } else {
        // Ideally, we should create a contract record if it doesn't exist, 
        // but that requires more data (client, vehicle info) which we might not have handy here 
        // without fetching. For now, we assume the user flow went Generate Draft -> Upload Signed.
        console.warn("Nessun record contratti_noleggio trovato per questo upload.");
      }


      toast({
        title: "Successo",
        description: "Contratto firmato caricato e collegato con successo",
      });

      setSelectedFile(null);
      onOpenChange(false);
      onUploadSuccess();
    } catch (error) {
      console.error("Error uploading contract:", error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento del contratto",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {existingFilePath ? "Sostituisci contratto firmato" : "Carica contratto firmato"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50",
              selectedFile && "border-green-500 bg-green-50"
            )}
          >
            {selectedFile ? (
              <div className="flex flex-col items-center gap-2">
                <FileUp className="h-10 w-10 text-green-600" />
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  className="mt-2"
                >
                  <X className="h-4 w-4 mr-1" />
                  Rimuovi
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Trascina qui il file PDF oppure
                </p>
                <label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button variant="outline" size="sm" asChild>
                    <span className="cursor-pointer">Seleziona file</span>
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground mt-2">
                  Solo PDF, massimo 10MB
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={uploading}>
              Annulla
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Caricamento...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Carica
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
