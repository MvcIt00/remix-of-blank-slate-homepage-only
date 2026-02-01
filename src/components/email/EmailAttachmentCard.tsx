/** ⚠️ ARCHITETTURA NON CONVENZIONALE - LEGGERE [src/components/email/README.md] PRIMA DI MODIFICARE ⚠️ */
import { FileIcon, FileText, Image as ImageIcon, Archive, Download, ExternalLink, Loader2 } from "lucide-react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmailAttachment, getAttachmentUrl } from "@/hooks/useEmailAttachments";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface EmailAttachmentCardProps {
    attachment: EmailAttachment;
    variant?: "default" | "compact" | "hero";
    isSent?: boolean;
}

export function EmailAttachmentCard({ attachment, variant = "default", isSent }: EmailAttachmentCardProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    // Caricamento anteprima se immagine
    useEffect(() => {
        if (attachment.tipo_mime.startsWith("image/")) {
            getAttachmentUrl(attachment.storage_path)
                .then(setPreviewUrl)
                .catch(console.error);
        }
    }, [attachment.storage_path, attachment.tipo_mime]);

    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith("image/")) return <ImageIcon className="h-5 w-5 text-blue-500" />;
        if (mimeType.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />;
        if (mimeType.includes("zip") || mimeType.includes("rar")) return <Archive className="h-5 w-5 text-amber-500" />;
        return <FileIcon className="h-5 w-5 text-slate-500" />;
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const url = await getAttachmentUrl(attachment.storage_path);

            // Creiamo un anchor element temporaneo per il download
            const link = document.createElement("a");
            link.href = url;
            link.download = attachment.nome_file;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(`Download di ${attachment.nome_file} avviato`);
        } catch (error: any) {
            console.error("Errore download allegato:", error);
            toast.error("Impossibile scaricare l'allegato");
        } finally {
            setIsDownloading(false);
        }
    };

    if (variant === "hero") {
        const isImage = attachment.tipo_mime.startsWith("image/");

        if (isImage) {
            return (
                <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
                    <DialogTrigger asChild>
                        <div
                            className={cn(
                                "group relative rounded-2xl overflow-hidden transition-all duration-300 cursor-zoom-in shadow-sm hover:shadow-md",
                                isSent ? "bg-white/5" : "bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                            )}
                        >
                            <div className="aspect-[4/3] sm:aspect-video w-full max-w-[500px] flex items-center justify-center overflow-hidden">
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        alt={attachment.nome_file}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
                                        <span className="text-[10px] uppercase font-black tracking-widest opacity-20">Loading Media</span>
                                    </div>
                                )}
                            </div>

                            <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/50 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                {formatSize(attachment.dimensione_bytes)} • {attachment.tipo_mime.split('/')[1]}
                            </div>
                        </div>
                    </DialogTrigger>

                    <DialogContent className="max-w-[95vw] sm:max-w-4xl p-0 overflow-hidden bg-black/95 border-none shadow-2xl flex flex-col items-center justify-center">
                        <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                            {previewUrl && (
                                <img
                                    src={previewUrl}
                                    className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-lg"
                                    alt={attachment.nome_file}
                                />
                            )}

                            <div className="mt-4 flex flex-col items-center gap-2 text-white pb-6 w-full px-6">
                                <div className="text-center w-full">
                                    <h3 className="text-md font-bold truncate max-w-md mx-auto">{attachment.nome_file}</h3>
                                    <p className="text-[10px] opacity-60 uppercase font-black tracking-widest">
                                        {formatSize(attachment.dimensione_bytes)} • {attachment.tipo_mime}
                                    </p>
                                </div>

                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownload();
                                    }}
                                    disabled={isDownloading}
                                    className="bg-white text-black hover:bg-white/90 rounded-full px-6 h-10 text-xs font-bold flex gap-2 mt-2"
                                >
                                    {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                    Scarica
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            );
        }

        // Layout Documento Hero (Stile WhatsApp PDF/Doc)
        return (
            <button
                onClick={handleDownload}
                disabled={isDownloading}
                className={cn(
                    "group relative flex items-center gap-4 p-4 rounded-2xl transition-all w-full max-w-[400px] text-left overflow-hidden border",
                    isSent
                        ? "bg-white/10 border-white/10 hover:bg-white/15 shadow-lg shadow-black/5"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary/40 hover:shadow-md"
                )}
            >
                <div className={cn(
                    "h-14 w-14 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-inner",
                    isSent ? "bg-white/10" : "bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/5"
                )}>
                    {isDownloading ? (
                        <Loader2 className="h-7 w-7 animate-spin text-primary" />
                    ) : (
                        <div className="transform transition-transform group-hover:scale-110">
                            {getFileIcon(attachment.tipo_mime)}
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <p className={cn(
                        "text-[14px] font-bold truncate mb-0.5",
                        isSent ? "text-white" : "text-slate-900 dark:text-white"
                    )}>
                        {attachment.nome_file}
                    </p>
                    <div className={cn(
                        "flex items-center gap-2 text-[11px] font-black uppercase tracking-widest opacity-60",
                        isSent ? "text-white/70" : "text-muted-foreground"
                    )}>
                        <span>{formatSize(attachment.dimensione_bytes)}</span>
                        <span className="h-1 w-1 rounded-full bg-current opacity-30" />
                        <span>{attachment.tipo_mime.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                    </div>
                </div>

                <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4",
                    isSent ? "bg-white/10 text-white" : "bg-primary/10 text-primary"
                )}>
                    <Download className="h-4 w-4" />
                </div>
            </button>
        );
    }

    if (variant === "compact") {
        return (
            <button
                onClick={handleDownload}
                disabled={isDownloading}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all group overflow-hidden",
                    isSent
                        ? "bg-white/10 hover:bg-white/20 text-white"
                        : "bg-muted hover:bg-muted/80 text-foreground border border-muted-foreground/10"
                )}
            >
                <div className="h-4 w-4 shrink-0 flex items-center justify-center">
                    {isDownloading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : previewUrl ? (
                        <img src={previewUrl} className="h-full w-full object-cover rounded-sm" alt="" />
                    ) : (
                        getFileIcon(attachment.tipo_mime)
                    )}
                </div>
                <span className="truncate max-w-[120px]">{attachment.nome_file}</span>
                <Download className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
            </button>
        );
    }

    return (
        <div
            className={cn(
                "group relative p-3 rounded-xl border transition-all flex items-center gap-3 overflow-hidden",
                isSent
                    ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary/40 hover:shadow-sm"
            )}
        >
            <div className={cn(
                "h-12 w-12 rounded-lg flex items-center justify-center shrink-0 transition-colors overflow-hidden border",
                isSent ? "bg-white/10 border-white/5" : "bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/5 border-transparent"
            )}>
                {previewUrl ? (
                    <img src={previewUrl} className="h-full w-full object-cover" alt={attachment.nome_file} />
                ) : (
                    getFileIcon(attachment.tipo_mime)
                )}
            </div>

            <div className="flex-1 min-w-0 pr-8">
                <p className="text-[13px] font-semibold truncate leading-tight mb-0.5">
                    {attachment.nome_file}
                </p>
                <p className={cn(
                    "text-[10px] uppercase font-bold tracking-tight opacity-60",
                    isSent ? "text-white/70" : "text-muted-foreground"
                )}>
                    {formatSize(attachment.dimensione_bytes)} • {attachment.tipo_mime.split('/')[1]?.toUpperCase() || 'FILE'}
                </p>
            </div>

            <Button
                variant="ghost"
                size="icon"
                className={cn(
                    "absolute right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                    isSent ? "hover:bg-white/10 text-white" : "hover:bg-primary/10 text-primary"
                )}
                onClick={handleDownload}
                disabled={isDownloading}
            >
                {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Download className="h-4 w-4" />
                )}
            </Button>
        </div>
    );
}
