import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Eye, FileText } from "lucide-react";
import { DocumentoFirmatoDialog } from "@/components/pdf/DocumentoFirmatoDialog";
import { PreventivoNoleggio } from "@/types/preventiviNoleggio";
import { NOLEGGIO_BUCKET } from "@/utils/noleggioStorage";

interface VersionePreviewButtonProps {
    preventivo: PreventivoNoleggio;
    onGeneratePreview?: (preventivo: PreventivoNoleggio) => void;
}

export function VersionePreviewButton({ preventivo, onGeneratePreview }: VersionePreviewButtonProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedPath, setSelectedPath] = useState<string | null>(null);

    // Costruisce lista versioni: storico_pdf + versione attuale sempre inclusa
    const versioni = useMemo(() => {
        const list: Array<{ versione: number, path?: string, isCurrent: boolean, needsGeneration: boolean }> = [];

        // Aggiungi storico (sempre path esistente)
        if (preventivo.storico_pdf && Array.isArray(preventivo.storico_pdf)) {
            preventivo.storico_pdf.forEach(entry => {
                list.push({
                    versione: entry.versione,
                    path: entry.path,
                    isCurrent: false,
                    needsGeneration: false
                });
            });
        }

        // Aggiungi versione corrente (bozza o firmato)
        const currentPath = preventivo.pdf_bozza_path || preventivo.pdf_firmato_path;
        list.push({
            versione: preventivo.versione,
            path: currentPath || undefined,
            isCurrent: true,
            needsGeneration: !currentPath
        });

        return list.sort((a, b) => b.versione - a.versione);
    }, [preventivo]);

    const handleAction = (v: { versione: number, path?: string, needsGeneration: boolean }) => {
        if (v.needsGeneration) {
            onGeneratePreview?.(preventivo);
        } else if (v.path) {
            setSelectedPath(v.path);
            setDialogOpen(true);
        }
    };

    const handleDirectClick = () => {
        if (versioni.length === 1) {
            handleAction(versioni[0]);
        }
    };

    // Se non ci sono versioni (teoricamente impossibile ora con la versione corrente aggiunta), ma per sicurezza:
    if (versioni.length === 0) return null;

    const needsMainGeneration = versioni.find(v => v.isCurrent)?.needsGeneration;

    if (versioni.length === 1) {
        // Caso 1 sola versione: Click diretto
        return (
            <>
                <Button variant="ghost" size="icon" className="h-7 w-7 relative" onClick={handleDirectClick} title="Anteprima">
                    <Eye className="h-4 w-4" />
                    {needsMainGeneration && (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-500 border border-white" />
                    )}
                </Button>
                <DocumentoFirmatoDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    filePath={selectedPath}
                    bucket={NOLEGGIO_BUCKET}
                    title={`Anteprima Preventivo ${preventivo.codice}`}
                    fileName={`${preventivo.codice}.pdf`}
                />
            </>
        );
    }

    // Caso N versioni: Popover + lista
    return (
        <>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 relative" title="Versioni ed Anteprima">
                        <Eye className="h-4 w-4" />
                        <Badge className="absolute -top-1 -right-1 h-3.5 w-3.5 p-0 text-[9px] flex items-center justify-center bg-blue-600 hover:bg-blue-600">
                            {versioni.length}
                        </Badge>
                        {needsMainGeneration && (
                            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-500 border border-white" />
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="end">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-2">
                            Seleziona versione
                        </p>
                        {versioni.map(v => (
                            <Button
                                key={v.versione}
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-xs h-8"
                                onClick={() => handleAction(v)}
                            >
                                <FileText className="h-3.5 w-3.5 mr-2 text-blue-500" />
                                <span className="flex-1 text-left">
                                    V{v.versione} {v.isCurrent && "(Corrente)"}
                                </span>
                                {v.needsGeneration && (
                                    <Badge variant="outline" className="text-[8px] px-1 h-4 border-amber-500 text-amber-600">
                                        Nuova
                                    </Badge>
                                )}
                            </Button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>

            <DocumentoFirmatoDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                filePath={selectedPath}
                bucket={NOLEGGIO_BUCKET}
                title={`Anteprima Preventivo ${preventivo.codice}`}
                fileName={`${preventivo.codice}.pdf`}
            />
        </>
    );
}
