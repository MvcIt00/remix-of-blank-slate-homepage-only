/**
 * VersioniPDFDialog - Dialog per visualizzare lo storico versioni PDF
 * Mostra tutte le versioni archiviate + versione corrente
 */
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Download, FileText, Clock, History } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StoricoPDFEntry } from "@/types/preventiviNoleggio";
import { getNoleggioPublicUrl } from "@/utils/noleggioStorage";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface VersioniPDFDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    codice: string;
    versioneCorrente: number;
    storico: StoricoPDFEntry[];
    pdfCorrentePath?: string | null;
    onViewVersion?: (path: string) => void;
}

interface VersionEntry {
    versione: number;
    path: string;
    created_at: string;
    isCurrent: boolean;
}

export function VersioniPDFDialog({
    open,
    onOpenChange,
    codice,
    versioneCorrente,
    storico,
    pdfCorrentePath,
    onViewVersion,
}: VersioniPDFDialogProps) {
    // Costruisce lista completa: storico + versione corrente
    const allVersions: VersionEntry[] = [
        // Versioni precedenti (dallo storico)
        ...storico.map((entry) => ({
            versione: entry.versione,
            path: entry.path,
            created_at: entry.created_at,
            isCurrent: false,
        })),
        // Versione corrente (se ha PDF)
        ...(pdfCorrentePath
            ? [
                {
                    versione: versioneCorrente,
                    path: pdfCorrentePath,
                    created_at: new Date().toISOString(),
                    isCurrent: true,
                },
            ]
            : []),
    ].sort((a, b) => b.versione - a.versione); // Ordine decrescente

    // Estrai codice base senza -Vx
    const codiceBase = codice?.replace(/-V\d+$/, "") || "Preventivo";

    const handleView = (path: string) => {
        if (onViewVersion) {
            onViewVersion(path);
        } else {
            // Fallback: apri in nuova tab
            const url = getNoleggioPublicUrl(path);
            window.open(url, "_blank");
        }
    };

    const handleDownload = (path: string, versione: number) => {
        const url = getNoleggioPublicUrl(path);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${codiceBase}-V${versione}.pdf`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-blue-600" />
                        Storico Versioni - {codiceBase}
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-80 pr-2">
                    <div className="space-y-2">
                        {allVersions.length === 0 ? (
                            <div className="text-center py-8">
                                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    Nessuna versione PDF disponibile
                                </p>
                            </div>
                        ) : (
                            allVersions.map((entry) => (
                                <div
                                    key={entry.versione}
                                    className={cn(
                                        "flex items-center justify-between p-3 rounded-lg border transition-colors",
                                        entry.isCurrent
                                            ? "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800"
                                            : "bg-muted/30 hover:bg-muted/50"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                "px-2 py-1 rounded text-xs font-bold",
                                                entry.isCurrent
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                                            )}
                                        >
                                            V{entry.versione}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">
                                                {entry.isCurrent
                                                    ? "Versione Corrente"
                                                    : `Versione ${entry.versione}`}
                                            </span>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {format(new Date(entry.created_at), "d MMM yyyy, HH:mm", {
                                                    locale: it,
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleView(entry.path)}
                                            title="Visualizza"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleDownload(entry.path, entry.versione)}
                                            title="Scarica"
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>

                {/* Info footer */}
                {allVersions.length > 0 && (
                    <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                        {allVersions.length} versione{allVersions.length !== 1 ? "i" : ""}{" "}
                        disponibil{allVersions.length !== 1 ? "i" : "e"}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
