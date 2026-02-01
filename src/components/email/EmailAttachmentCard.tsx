/** ⚠️ ARCHITETTURA NON CONVENZIONALE - LEGGERE [src/components/email/README.md] PRIMA DI MODIFICARE ⚠️ */
import { FileIcon, FileText, Image as ImageIcon, Archive, Download, ExternalLink, Loader2 } from "lucide-react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmailAttachment, getAttachmentUrl } from "@/hooks/useEmailAttachments";
import { toast } from "sonner";

interface EmailAttachmentCardProps {
    attachment: EmailAttachment;
    variant?: "default" | "compact";
    isSent?: boolean;
}

export function EmailAttachmentCard({ attachment, variant = "default", isSent }: EmailAttachmentCardProps) {
    const [isDownloading, setIsDownloading] = useState(false);

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

    if (variant === "compact") {
        return (
            <button
                onClick={handleDownload}
                disabled={isDownloading}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all group",
                    isSent
                        ? "bg-white/10 hover:bg-white/20 text-white"
                        : "bg-muted hover:bg-muted/80 text-foreground border border-muted-foreground/10"
                )}
            >
                {isDownloading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                    getFileIcon(attachment.tipo_mime)
                )}
                <span className="truncate max-w-[120px]">{attachment.nome_file}</span>
                <Download className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
            </button>
        );
    }

    return (
        <div
            className={cn(
                "group relative p-3 rounded-xl border transition-all flex items-center gap-3",
                isSent
                    ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary/40 hover:shadow-sm"
            )}
        >
            <div className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                isSent ? "bg-white/10" : "bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/5"
            )}>
                {getFileIcon(attachment.tipo_mime)}
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
