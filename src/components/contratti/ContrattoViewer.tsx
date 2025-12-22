/**
 * Componente per visualizzare lo stato del contratto e gestire upload/download
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Download, 
  Upload, 
  Check, 
  Clock, 
  Send,
  AlertCircle 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ContrattoUploader } from "./ContrattoUploader";

interface Contratto {
  id_contratto: string;
  codice_contratto: string;
  stato_contratto: string;
  pdf_bozza_path: string | null;
  pdf_firmato_path: string | null;
  data_creazione: string;
  data_invio: string | null;
  data_firma: string | null;
}

interface ContrattoViewerProps {
  contratto: Contratto;
  onUpdate: () => void;
}

const STATO_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  bozza: { label: "Bozza", variant: "secondary", icon: <FileText className="h-3 w-3" /> },
  inviato: { label: "Inviato", variant: "default", icon: <Send className="h-3 w-3" /> },
  firmato: { label: "Firmato", variant: "default", icon: <Check className="h-3 w-3" /> },
  attivo: { label: "Attivo", variant: "default", icon: <Check className="h-3 w-3" /> },
  annullato: { label: "Annullato", variant: "destructive", icon: <AlertCircle className="h-3 w-3" /> },
};

export function ContrattoViewer({ contratto, onUpdate }: ContrattoViewerProps) {
  const [loading, setLoading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  const statoConfig = STATO_CONFIG[contratto.stato_contratto] || STATO_CONFIG.bozza;

  async function handleDownloadBozza() {
    if (!contratto.pdf_bozza_path) {
      toast({ title: "Nessuna bozza disponibile", variant: "destructive" });
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from("contratti")
        .download(contratto.pdf_bozza_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${contratto.codice_contratto}_bozza.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Errore download:", error);
      toast({ title: "Errore nel download", variant: "destructive" });
    }
  }

  async function handleDownloadFirmato() {
    if (!contratto.pdf_firmato_path) {
      toast({ title: "Nessun contratto firmato disponibile", variant: "destructive" });
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from("contratti")
        .download(contratto.pdf_firmato_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${contratto.codice_contratto}_firmato.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Errore download:", error);
      toast({ title: "Errore nel download", variant: "destructive" });
    }
  }

  async function handleSegnaInviato() {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("contratti_noleggio")
        .update({
          stato_contratto: "inviato",
          data_invio: new Date().toISOString(),
        })
        .eq("id_contratto", contratto.id_contratto);

      if (error) throw error;

      toast({ title: "Contratto segnato come inviato" });
      onUpdate();
    } catch (error) {
      console.error("Errore aggiornamento:", error);
      toast({ title: "Errore nell'aggiornamento", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function handleUploadSuccess() {
    setShowUploader(false);
    onUpdate();
  }

  const formatData = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("it-IT");
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {contratto.codice_contratto}
          </CardTitle>
          <Badge variant={statoConfig.variant} className="flex items-center gap-1">
            {statoConfig.icon}
            {statoConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timeline */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>Creato: {formatData(contratto.data_creazione)}</span>
          </div>
          {contratto.data_invio && (
            <div className="flex items-center gap-2">
              <Send className="h-3 w-3" />
              <span>Inviato: {formatData(contratto.data_invio)}</span>
            </div>
          )}
          {contratto.data_firma && (
            <div className="flex items-center gap-2">
              <Check className="h-3 w-3" />
              <span>Firmato: {formatData(contratto.data_firma)}</span>
            </div>
          )}
        </div>

        {/* Azioni */}
        <div className="flex flex-wrap gap-2">
          {contratto.pdf_bozza_path && (
            <Button variant="outline" size="sm" onClick={handleDownloadBozza}>
              <Download className="h-3 w-3 mr-1" />
              Scarica Bozza
            </Button>
          )}

          {contratto.stato_contratto === "bozza" && (
            <Button variant="outline" size="sm" onClick={handleSegnaInviato} disabled={loading}>
              <Send className="h-3 w-3 mr-1" />
              Segna come Inviato
            </Button>
          )}

          {(contratto.stato_contratto === "inviato" || contratto.stato_contratto === "bozza") && (
            <Button variant="default" size="sm" onClick={() => setShowUploader(true)}>
              <Upload className="h-3 w-3 mr-1" />
              Carica Firmato
            </Button>
          )}

          {contratto.pdf_firmato_path && (
            <Button variant="default" size="sm" onClick={handleDownloadFirmato}>
              <Download className="h-3 w-3 mr-1" />
              Scarica Firmato
            </Button>
          )}
        </div>

        {/* Upload dialog */}
        {showUploader && (
          <ContrattoUploader
            contrattoId={contratto.id_contratto}
            codiceContratto={contratto.codice_contratto}
            onSuccess={handleUploadSuccess}
            onCancel={() => setShowUploader(false)}
          />
        )}
      </CardContent>
    </Card>
  );
}
