import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BlobProvider } from "@react-pdf/renderer";
import { PreventivoPDF } from "./PreventivoPDF";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, Download, Save, Send } from "lucide-react";
import { PreventivoCompletoView, OwnerInfo } from "@/types/database_views";
import { useQuery } from "@tanstack/react-query";
import { DatiAziendaOwner } from "../pdf/LetterheadPDF";
import { NOLEGGIO_BUCKET, getNoleggioPath } from "@/utils/noleggioStorage";

interface PreventivoPreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    preventivo: PreventivoCompletoView | null;
    onSuccess?: () => void;
}

export function PreventivoPreviewDialog({
    open,
    onOpenChange,
    preventivo,
    onSuccess
}: PreventivoPreviewDialogProps) {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    // Fetch Owner Data (Toscana Carrelli)
    const { data: ownerData } = useQuery({
        queryKey: ["owner-info"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("vw_anagrafiche_owners" as any)
                .select("*")
                .limit(1)
                .single();

            if (error) throw error;
            return data as unknown as OwnerInfo;
        },
        enabled: open
    });

    if (!preventivo || !ownerData) return null;

    const datiOwner: DatiAziendaOwner = {
        ragione_sociale: ownerData.ragione_sociale,
        partita_iva: ownerData.partita_iva,
        indirizzo: ownerData.sede_legale_indirizzo,
        citta: ownerData.sede_legale_citta,
        cap: ownerData.sede_legale_cap,
        provincia: ownerData.sede_legale_provincia,
        telefono: ownerData.contatto_telefono,
        email: ownerData.contatto_email,
        pec: ownerData.pec,
        codice_univoco: ownerData.codice_univoco,
        iban: ownerData.iban
    };

    const handleRegisterPDF = async (blob: Blob) => {
        try {
            setIsSaving(true);

            // 1. LOGICA 'ZERO-DRAFT': NON salviamo più il PDF fisico della bozza.
            // Il sistema è ora "Data-Driven": la bozza si rigenera on-the-fly dai dati del DB.

            toast({
                title: "Preventivo Disponibile",
                description: "Dati preventivo allineati. La bozza è pronta per l'invio.",
            });

            onSuccess?.();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Errore durante il salvataggio del preventivo:", error);
            toast({
                variant: "destructive",
                title: "Errore salvataggio",
                description: error.message || "Impossibile salvare il file PDF.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-4 border-bottom bg-muted/30">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Anteprima Preventivo {preventivo.codice}
                        </DialogTitle>
                        <div className="flex items-center gap-2 pr-6">
                            <BlobProvider
                                document={
                                    <PreventivoPDF
                                        datiOwner={datiOwner}
                                        datiCliente={{
                                            ragione_sociale: preventivo.cliente_ragione_sociale || "N/D",
                                            piva: preventivo.cliente_piva || "",
                                            email: preventivo.cliente_email || ""
                                        }}
                                        datiMezzo={{
                                            marca: preventivo.marca || "N/D",
                                            modello: preventivo.modello || "N/D",
                                            matricola: preventivo.matricola || "N/D"
                                        }}
                                        datiPreventivo={{
                                            codice_preventivo: preventivo.codice || "BOZZA",
                                            data_creazione: preventivo.created_at,
                                            tempo_indeterminato: preventivo.tempo_indeterminato,
                                            prezzo_noleggio: preventivo.prezzo_noleggio,
                                            prezzo_trasporto: preventivo.prezzo_trasporto,
                                            tipo_canone: preventivo.tipo_canone,
                                            note: preventivo.note || ""
                                        }}
                                    />
                                }
                            >
                                {({ blob, url, loading }) => (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={loading || !url}
                                            onClick={() => {
                                                if (url) {
                                                    const link = document.createElement("a");
                                                    link.href = url;
                                                    link.download = `Preventivo_${preventivo.codice || "Bozza"}.pdf`;
                                                    link.click();
                                                }
                                            }}
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Scarica
                                        </Button>
                                        <Button
                                            size="sm"
                                            disabled={loading || isSaving || !blob}
                                            onClick={() => blob && handleRegisterPDF(blob)}
                                        >
                                            {isSaving ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4 mr-2" />
                                            )}
                                            Registra ed Invia
                                        </Button>
                                    </>
                                )}
                            </BlobProvider>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 bg-secondary/20 p-4 overflow-hidden h-full">
                    <BlobProvider
                        document={
                            <PreventivoPDF
                                datiOwner={datiOwner}
                                datiCliente={{
                                    ragione_sociale: preventivo.cliente_ragione_sociale || "N/D",
                                    piva: preventivo.cliente_piva || "",
                                    email: preventivo.cliente_email || ""
                                }}
                                datiMezzo={{
                                    marca: preventivo.marca || "N/D",
                                    modello: preventivo.modello || "N/D",
                                    matricola: preventivo.matricola || "N/D"
                                }}
                                datiPreventivo={{
                                    codice_preventivo: preventivo.codice || "BOZZA",
                                    data_creazione: preventivo.created_at,
                                    tempo_indeterminato: preventivo.tempo_indeterminato,
                                    prezzo_noleggio: preventivo.prezzo_noleggio,
                                    prezzo_trasporto: preventivo.prezzo_trasporto,
                                    tipo_canone: preventivo.tipo_canone,
                                    note: preventivo.note || ""
                                }}
                            />
                        }
                    >
                        {({ url, loading }) => (
                            <div className="w-full h-full flex items-center justify-center bg-white rounded-lg shadow-inner overflow-hidden">
                                {loading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                        <p className="text-sm text-muted-foreground">Generazione anteprima...</p>
                                    </div>
                                ) : url ? (
                                    <iframe src={url} className="w-full h-full border-none" title="PDF Preview" />
                                ) : (
                                    <p>Errore caricamento anteprima</p>
                                )}
                            </div>
                        )}
                    </BlobProvider>
                </div>
            </DialogContent>
        </Dialog>
    );
}
