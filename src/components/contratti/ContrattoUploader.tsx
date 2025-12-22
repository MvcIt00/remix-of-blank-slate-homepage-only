/**
 * Componente per upload del contratto firmato
 */

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ContrattoUploaderProps {
  contrattoId: string;
  codiceContratto: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ContrattoUploader({
  contrattoId,
  codiceContratto,
  onSuccess,
  onCancel,
}: ContrattoUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type !== "application/pdf") {
        toast({ title: "Seleziona un file PDF", variant: "destructive" });
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        toast({ title: "File troppo grande (max 10MB)", variant: "destructive" });
        return;
      }
      setFile(selected);
    }
  }

  async function handleUpload() {
    if (!file) return;

    setUploading(true);
    try {
      // Nome file: codice_contratto_firmato_timestamp.pdf
      const fileName = `${codiceContratto}_firmato_${Date.now()}.pdf`;
      const filePath = `firmati/${fileName}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from("contratti")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Aggiorna record contratto
      const { error: updateError } = await supabase
        .from("contratti_noleggio")
        .update({
          pdf_firmato_path: filePath,
          stato_contratto: "firmato",
          data_firma: new Date().toISOString(),
        })
        .eq("id_contratto", contrattoId);

      if (updateError) throw updateError;

      toast({ title: "Contratto firmato caricato con successo" });
      onSuccess();
    } catch (error) {
      console.error("Errore upload:", error);
      toast({ title: "Errore nel caricamento", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card className="border-dashed">
      <CardContent className="p-4">
        <div className="space-y-3">
          <p className="text-sm font-medium">Carica il contratto firmato (PDF)</p>

          {!file ? (
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Clicca o trascina il file PDF qui
              </p>
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <FileText className="h-8 w-8 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onCancel}>
              Annulla
            </Button>
            <Button
              size="sm"
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              {uploading ? "Caricamento..." : "Carica"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
