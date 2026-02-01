/** ⚠️ ARCHITETTURA NON CONVENZIONALE - LEGGERE [src/components/email/README.md] PRIMA DI MODIFICARE ⚠️ */
import { EmailAttachment } from "@/hooks/useEmailAttachments";

import { EmailAttachmentCard } from "./EmailAttachmentCard";
import { cn } from "@/lib/utils";

interface EmailAttachmentGalleryProps {
    attachments: EmailAttachment[];
    isSent?: boolean;
    className?: string;
}

export function EmailAttachmentGallery({ attachments, isSent, className }: EmailAttachmentGalleryProps) {
    if (!attachments || attachments.length === 0) return null;

    const count = attachments.length;

    // Logica di layout dinamica
    // 1-2 allegati: Griglia a 1 o 2 colonne larghe
    // 3-4 allegati: Griglia 2x2
    // 5+ allegati: Griglia 3 colonne o lista compatta

    const getGridCols = () => {
        if (count === 1) return "grid-cols-1";
        if (count === 2) return "grid-cols-1 sm:grid-cols-2";
        if (count >= 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
        return "grid-cols-1";
    };

    return (
        <div className={cn("mt-4 space-y-2", className)}>
            <div className={cn("grid gap-3", getGridCols())}>
                {attachments.map((att) => (
                    <EmailAttachmentCard
                        key={att.id}
                        attachment={att}
                        isSent={isSent}
                    />
                ))}
            </div>

            {count > 4 && (
                <p className={cn(
                    "text-[10px] uppercase font-black tracking-widest px-1 pt-1",
                    isSent ? "text-white/50" : "text-muted-foreground/60"
                )}>
                    {count} Allegati Totali
                </p>
            )}
        </div>
    );
}
