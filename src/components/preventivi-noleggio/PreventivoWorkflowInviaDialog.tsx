import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Send, Loader2, AlertCircle, CheckCircle2, Download, Eye } from "lucide-react";
import { PreventivoNoleggio, StatoPreventivo } from "@/types/preventiviNoleggio";
import { PreventivoPDF } from "./PreventivoPDF";
import { pdf } from "@react-pdf/renderer";
import { uploadPreventivoPDF, createNoleggioSignedUrl } from "@/utils/noleggioStorage";
import { toast } from "@/hooks/use-toast";
import { usePreventiviNoleggio } from "@/hooks/usePreventiviNoleggio";

interface PreventivoWorkflowInviaDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    preventivo: PreventivoNoleggio | null;
    getPreviewData: (p: PreventivoNoleggio) => any;
    onSuccess?: () => void;
}

export function PreventivoWorkflowInviaDialog({
    open,
    onOpenChange,
    preventivo,
    getPreviewData,
    onSuccess
}: PreventivoWorkflowInviaDialogProps) {
    const [generating, setGenerating] = useState(false);
    const [sending, setSending] = useState(false);
    const [localPdfPath, setLocalPdfPath] = useState<string | null>(null);
    const [signedUrl, setSignedUrl] = useState<string | null>(null);

    const { aggiornaPreventivo, refresh } = usePreventiviNoleggio();

    // Reset local state when dialog opens or preventivo changes
    useEffect(() => {
        if (open) {
            setLocalPdfPath(null);
            setSignedUrl(null);
        }
    }, [open, preventivo?.id_preventivo]);

    if (!preventivo) return null;

    const effectivePath = localPdfPath || preventivo.pdf_bozza_path || preventivo.pdf_firmato_path;
    const hasPDF = !!effectivePath;

    const handleGeneratePDF = async () => {
        setGenerating(true);
        try {
            const data = getPreviewData(preventivo);

            // Generazione HEADLESS del PDF
            const doc = (
                <PreventivoPDF
                    datiOwner={data.datiOwner}
                    datiCliente={data.datiCliente}
                    datiMezzo={data.datiMezzo}
                    datiPreventivo={data.datiPreventivo}
                />
            );

            const blob = await pdf(doc).toBlob();

            // Upload su Storage
            const path = await uploadPreventivoPDF(
                blob,
                preventivo.id_preventivo,
                preventivo.codice || "BOZZA"
            );

            // Aggiorna DB con il path
            await aggiornaPreventivo(preventivo.id_preventivo, {
                pdf_bozza_path: path
            });

            setLocalPdfPath(path);

            // Genera Signed URL per visualizzazione/download immediato
            const url = await createNoleggioSignedUrl(path);
            setSignedUrl(url);

            // Forza refresh (async background)
            refresh();

            toast({ title: "PDF Generato", description: "Documento creato con successo." });
        } catch (error) {
            console.error(error);
            toast({
                title: "Errore generazione",
                description: "Impossibile creare il PDF in background.",
                variant: "destructive"
            });
        } finally {
            setGenerating(false);
        }
    };

    const handleViewPDF = async () => {
        try {
            const url = signedUrl || (effectivePath ? await createNoleggioSignedUrl(effectivePath) : null);
            if (url) window.open(url, '_blank');
        } catch (error) {
            toast({ title: "Errore", description: "Impossibile aprire il file.", variant: "destructive" });
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const url = signedUrl || (effectivePath ? await createNoleggioSignedUrl(effectivePath) : null);
            if (url) {
                const link = document.createElement('a');
                link.href = url;
                link.download = `Preventivo_${preventivo.codice || 'Bozza'}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            toast({ title: "Errore", description: "Impossibile scaricare il file.", variant: "destructive" });
        }
    };

    const handleSetInviato = async () => {
        setSending(true);
        try {
            await aggiornaPreventivo(preventivo.id_preventivo, {
                stato: StatoPreventivo.INVIATO
            });
            await refresh();
            toast({ title: "Stato Aggiornato", description: "Preventivo segnato come INVIATO." });
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            toast({
                title: "Errore",
                description: "Impossibile aggiornare lo stato.",
                variant: "destructive"
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5 text-blue-500" />
                        Invia Preventivo
                    </DialogTitle>
                    <DialogDescription>
                        Workflow guidato per l'invio del documento al cliente.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    {/* Step 1: Verifica PDF */}
                    <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                        {hasPDF ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                        ) : (
                            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                        )}
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Documento PDF</p>
                            <p className="text-xs text-muted-foreground">
                                {hasPDF
                                    ? "Il PDF per la versione corrente è pronto."
                                    : "Manca il PDF per la versione corrente. È necessario generarlo prima di procedere."}
                            </p>
                        </div>
                    </div>

                    {!hasPDF ? (
                        <Button
                            className="w-full"
                            variant="outline"
                            onClick={handleGeneratePDF}
                            disabled={generating}
                        >
                            {generating ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <FileText className="h-4 w-4 mr-2" />
                            )}
                            {generating ? "Generazione in corso..." : "Genera PDF Ora"}
                        </Button>
                    ) : (
                        <div className="grid grid-cols-2 gap-2 animate-in fade-in zoom-in-95 duration-300">
                            <Button variant="secondary" size="sm" onClick={handleViewPDF}>
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizza
                            </Button>
                            <Button variant="secondary" size="sm" onClick={handleDownloadPDF}>
                                <Download className="h-4 w-4 mr-2" />
                                Scarica
                            </Button>
                        </div>
                    )}

                    {/* Step 2: Azione Finale */}
                    {hasPDF && (
                        <div className="pt-4 border-t animate-in fade-in slide-in-from-top-4 duration-500">
                            <p className="text-xs text-muted-foreground mb-3 px-1 italic">
                                Una volta impostato come 'Inviato', il preventivo potrà essere accettato o rifiutato dal cliente.
                            </p>
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20"
                                onClick={handleSetInviato}
                                disabled={sending}
                            >
                                {sending ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4 mr-2" />
                                )}
                                Segna come INVIATO
                            </Button>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Annulla
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
