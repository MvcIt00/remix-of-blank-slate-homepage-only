import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface DocumentoFirmatoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filePath: string | null;
    bucket: string;
    title?: string;
    fileName?: string;
}

/**
 * 🏛️ DocumentoFirmatoDialog (Enterprise Component)
 * Visualizza un documento PDF firmato recuperato tramite Signed URL.
 * Sostituisce l'apertura in nuovi tab e il download forzato in RAM (Blob).
 */
export function DocumentoFirmatoDialog({
    open,
    onOpenChange,
    filePath,
    bucket,
    title = "Anteprima Documento Firmato",
    fileName,
}: DocumentoFirmatoDialogProps) {
    const [loading, setLoading] = useState(false);
    const [signedUrl, setSignedUrl] = useState<string | null>(null);

    useEffect(() => {
        if (open && filePath) {
            loadSignedUrl();
        } else if (!open) {
            setSignedUrl(null);
        }
    }, [open, filePath]);

    const loadSignedUrl = async () => {
        if (!filePath) return;
        setLoading(true);
        try {
            const { data, error } = await supabase.storage
                .from(bucket)
                .createSignedUrl(filePath, 60 * 5); // 5 minuti di validità

            if (error) throw error;
            if (!data?.signedUrl) throw new Error("Errore generazione Signed URL");

            setSignedUrl(data.signedUrl);
        } catch (error) {
            console.error("Error loading signed URL:", error);
            toast({
                title: "Errore caricamento",
                description: "Impossibile recuperare il documento firmato.",
                variant: "destructive",
            });
            onOpenChange(false);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!signedUrl) return;
        const a = document.createElement("a");
        a.href = signedUrl;
        a.download = fileName || "documento_firmato.pdf";
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0">
                    <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
                    <div className="flex items-center gap-2">
                        {signedUrl && (
                            <>
                                <Button variant="outline" size="sm" onClick={handleDownload} title="Scarica PDF">
                                    <Download className="h-4 w-4 mr-2" />
                                    Scarica
                                </Button>
                                <Button variant="ghost" size="sm" asChild title="Apri in nuova finestra">
                                    <a href={signedUrl} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </Button>
                            </>
                        )}
                    </div>
                </DialogHeader>

                <div className="flex-1 bg-muted/30 relative">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground animate-pulse">Recupero documento sicuro...</p>
                        </div>
                    ) : signedUrl ? (
                        <iframe
                            src={`${signedUrl}#toolbar=1`}
                            className="w-full h-full border-none"
                            title={title}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            Seleziona un file per iniziare l'anteprima
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
