import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileCheck, FileWarning, Eye, Plus, Send, CheckCircle2, Archive, XCircle, RefreshCw, FileUp, Edit3 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PreventivoNoleggio, StatoPreventivo } from "@/types/preventiviNoleggio";
import { Badge } from "@/components/ui/badge";
import { PreventivoUploadDialog } from "./PreventivoUploadDialog";
import { getNoleggioPublicUrl, NOLEGGIO_BUCKET } from "@/utils/noleggioStorage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DocumentoFirmatoDialog } from "@/components/pdf/DocumentoFirmatoDialog";


interface PreventivoStatusButtonProps {
    preventivo: PreventivoNoleggio;
    onStatusChange: (status: StatoPreventivo) => Promise<void>;
    onGeneratePDF: () => void;
    onViewPDF: () => void;
    onConvert: () => void;
    onArchive: () => void;
    onUpdateSuccess: () => void;
}

export function PreventivoStatusButton({
    preventivo,
    onStatusChange,
    onGeneratePDF,
    onViewPDF,
    onConvert,
    onArchive,
    onUpdateSuccess,
}: PreventivoStatusButtonProps) {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [firmatoDialogOpen, setFirmatoDialogOpen] = useState(false);


    // Colori e icone in base allo stato
    const getStatusConfig = (stato: StatoPreventivo) => {
        switch (stato) {
            case "bozza":
                return {
                    icon: <Plus className="h-4 w-4" />,
                    className: "border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-700",
                    label: "Bozza",
                };
            case "da_inviare":
                return {
                    icon: <Send className="h-4 w-4" />,
                    className: "border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700",
                    label: "Da Inviare",
                };
            case "in_revisione":
                return {
                    icon: <Edit3 className="h-4 w-4" />,
                    className: "border-purple-300 text-purple-600 hover:bg-purple-50 hover:text-purple-700",
                    label: "In Revisione",
                };
            case "inviato":
                return {
                    icon: <Send className="h-4 w-4" />,
                    className: "border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700",
                    label: "Inviato - Attesa Firma",
                };
            case "scaduto":
                return {
                    icon: <FileWarning className="h-4 w-4" />,
                    className: "border-amber-400 text-amber-600 hover:bg-amber-50 hover:text-amber-700",
                    label: "Scaduto - Richiede Attenzione",
                };
            case "approvato":
                return {
                    icon: <CheckCircle2 className="h-4 w-4" />,
                    className: "border-green-300 text-green-600 hover:bg-green-50 hover:text-green-700",
                    label: "Approvato - Converti",
                };
            case "rifiutato":
                return {
                    icon: <XCircle className="h-4 w-4" />,
                    className: "border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700",
                    label: "Rifiutato",
                };
            case "concluso":
                return {
                    icon: <FileCheck className="h-4 w-4" />,
                    className: "border-cyan-300 text-cyan-600 hover:bg-cyan-50 hover:text-cyan-700",
                    label: "Convertito in Noleggio",
                };
            case "archiviato":
                return {
                    icon: <Archive className="h-4 w-4" />,
                    className: "text-muted-foreground",
                    label: "Archiviato",
                };
            default:
                return {
                    icon: <Plus className="h-4 w-4" />,
                    className: "",
                    label: stato,
                };
        }
    };

    // --- LOGICA DATA-AWARE (INTEGRITY CHECK) ---
    const hasFirmato = !!preventivo.pdf_firmato_path;
    const config = getStatusConfig(preventivo.stato);

    const handleStatusUpdate = async (next: StatoPreventivo) => {
        setPopoverOpen(false);
        await onStatusChange(next);
    };



    // Flusso Sola Lettura
    if (preventivo.stato === "concluso" || preventivo.stato === "archiviato") {
        return (
            <>
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className={config.className} title={config.label}>
                            {config.icon}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2" align="end">
                        <div className="flex flex-col gap-1">
                            <Button variant="ghost" size="sm" className="justify-start w-full" onClick={() => { setPopoverOpen(false); onViewPDF(); }}>
                                <Eye className="h-4 w-4 mr-2" />
                                Vedi Preventivo
                            </Button>
                            {preventivo.pdf_firmato_path && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="justify-start w-full text-green-600"
                                    onClick={() => {
                                        setPopoverOpen(false);
                                        setFirmatoDialogOpen(true);
                                    }}
                                >
                                    <FileCheck className="h-4 w-4 mr-2" />
                                    Vedi Firmato
                                </Button>
                            )}
                            <Badge variant="outline" className="justify-center py-1 mt-1 uppercase text-[10px]">
                                {config.label}
                            </Badge>
                        </div>
                    </PopoverContent>
                </Popover>

                <DocumentoFirmatoDialog
                    open={firmatoDialogOpen}
                    onOpenChange={setFirmatoDialogOpen}
                    filePath={preventivo.pdf_firmato_path}
                    bucket={NOLEGGIO_BUCKET}
                    title={`Preventivo Firmato ${preventivo.codice || ""}`}
                    fileName={`preventivo_firmato_${preventivo.codice || "doc"}.pdf`}
                />
            </>
        );
    }

    return (
        <>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className={config.className}
                        title={config.label}
                    >
                        {config.icon}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="end">
                    <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-bold text-muted-foreground px-2 py-1 uppercase tracking-wider border-b mb-1">
                            Stato: {preventivo.stato.replace('_', ' ')}
                        </p>

                        {/* --- BOZZA: Solo anteprima/genera --- */}
                        {preventivo.stato === "bozza" && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="justify-start w-full font-bold text-slate-600 hover:text-slate-700 hover:bg-slate-50"
                                    onClick={() => {
                                        setPopoverOpen(false);
                                        onGeneratePDF();
                                    }}
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Visualizza Anteprima
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="justify-start w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    onClick={() => handleStatusUpdate(StatoPreventivo.DA_INVIARE)}
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    Segna come Pronto
                                </Button>
                            </>
                        )}

                        {/* --- DA_INVIARE: Stato principale workflow --- */}
                        {preventivo.stato === "da_inviare" && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="justify-start w-full font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    onClick={() => {
                                        setPopoverOpen(false);
                                        onGeneratePDF();
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Genera/Vedi PDF
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="justify-start w-full text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                    onClick={() => handleStatusUpdate(StatoPreventivo.INVIATO)}
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    Segna come Inviato
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="justify-start w-full text-slate-500"
                                    onClick={() => handleStatusUpdate(StatoPreventivo.BOZZA)}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Salva come Bozza
                                </Button>
                            </>
                        )}

                        {/* --- IN_REVISIONE --- */}
                        {preventivo.stato === "in_revisione" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="justify-start w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50 font-bold"
                                onClick={() => {
                                    setPopoverOpen(false);
                                    onGeneratePDF();
                                }}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Visualizza/Modifica
                            </Button>
                        )}

                        {preventivo.stato === "inviato" && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="justify-start w-full text-orange-600 hover:text-orange-700 hover:bg-orange-50 font-bold"
                                    onClick={() => {
                                        setPopoverOpen(false);
                                        setUploadDialogOpen(true);
                                    }}
                                >
                                    <FileUp className="h-4 w-4 mr-2" />
                                    Carica Firmato
                                </Button>
                                <Button variant="ghost" size="sm" className="justify-start w-full" onClick={() => { setPopoverOpen(false); onViewPDF(); }}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Vedi Preventivo
                                </Button>
                            </>
                        )}

                        {preventivo.stato === "scaduto" && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="justify-start w-full text-amber-600 hover:text-amber-700 hover:bg-amber-50 font-bold"
                                    onClick={() => handleStatusUpdate(StatoPreventivo.INVIATO)}
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Riattiva (Re-Invia)
                                </Button>
                                <Button variant="ghost" size="sm" className="justify-start w-full" onClick={() => { setPopoverOpen(false); onViewPDF(); }}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Vedi Preventivo
                                </Button>
                            </>
                        )}

                        {preventivo.stato === "approvato" && (
                            <>
                                {hasFirmato && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="justify-start w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                        onClick={() => {
                                            setPopoverOpen(false);
                                            setFirmatoDialogOpen(true);
                                        }}
                                    >
                                        <FileCheck className="h-4 w-4 mr-2" />
                                        Vedi Firmato
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="justify-start w-full text-green-600 hover:text-green-700 hover:bg-green-50 font-bold"
                                    onClick={() => {
                                        setPopoverOpen(false);
                                        onConvert();
                                    }}
                                >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Converti in Noleggio
                                </Button>
                            </>
                        )}

                        <div className="h-px bg-muted my-1" />

                        {(preventivo.stato === "inviato" || preventivo.stato === "scaduto") && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="justify-start w-full text-purple-600"
                                onClick={() => handleStatusUpdate(StatoPreventivo.IN_REVISIONE)}
                            >
                                <Edit3 className="h-4 w-4 mr-2" />
                                Richiedi Modifica
                            </Button>
                        )}

                        {preventivo.stato !== "rifiutato" && preventivo.stato !== "approvato" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="justify-start w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleStatusUpdate(StatoPreventivo.RIFIUTATO)}
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Rifiutato dal cliente
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            size="sm"
                            className="justify-start w-full text-muted-foreground"
                            onClick={() => {
                                setPopoverOpen(false);
                                onArchive();
                            }}
                        >
                            <Archive className="h-4 w-4 mr-2" />
                            Archivia
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            <PreventivoUploadDialog
                open={uploadDialogOpen}
                onOpenChange={setUploadDialogOpen}
                preventivoId={preventivo.id_preventivo}
                existingFilePath={preventivo.pdf_firmato_path}
                onUploadSuccess={onUpdateSuccess}
            />

            <DocumentoFirmatoDialog
                open={firmatoDialogOpen}
                onOpenChange={setFirmatoDialogOpen}
                filePath={preventivo.pdf_firmato_path}
                bucket={NOLEGGIO_BUCKET}
                title={`Preventivo Firmato ${preventivo.codice || ""}`}
                fileName={`preventivo_firmato_${preventivo.codice || "doc"}.pdf`}
            />
        </>
    );
}
