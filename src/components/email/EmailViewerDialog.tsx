import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Mail, Paperclip, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

interface EmailViewerDialogProps {
    emailId: string;
    direzione: 'ricevuta' | 'inviata';
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onMarkAsRead?: () => void;
}

export function EmailViewerDialog({
    emailId,
    direzione,
    open,
    onOpenChange,
    onMarkAsRead,
}: EmailViewerDialogProps) {
    const queryClient = useQueryClient();
    const hasMarkedAsRead = useRef(false);

    const { data: email, isLoading } = useQuery({
        queryKey: ["email", emailId, direzione],
        queryFn: async () => {
            const tableName = direzione === 'ricevuta' ? 'emails_ricevute' : 'emails_inviate';
            const attachmentFk = direzione === 'ricevuta' ? 'id_email_ricevuta' : 'id_email_inviata';

            const { data, error } = await supabase
                .from(tableName as any)
                .select(`
                    *,
                    allegati:allegati_email(${attachmentFk})
                `)
                .eq("id", emailId)
                .single();

            if (error) throw error;
            return { ...data, direzione } as any;
        },
        enabled: !!emailId && open,
    });

    // Marca come letta in un effect separato (non dentro queryFn!)
    useEffect(() => {
        async function markAsRead() {
            if (!email || hasMarkedAsRead.current) return;
            if (email.direzione !== "ricevuta") return;
            if (email.stato_ricevuta === "letta") return;

            hasMarkedAsRead.current = true;

            // Update con nuovo campo ENUM
            const { error } = await supabase
                .from("emails_ricevute")
                .update({
                    stato: "letta",
                    data_lettura: new Date().toISOString(),
                })
                .eq("id", emailId);

            if (!error) {
                // Invalida SUBITO la query per aggiornare la lista
                await queryClient.invalidateQueries({ queryKey: ["emails-ricevute"] });
                // Callback opzionale per refresh aggiuntivo
                onMarkAsRead?.();
            }
        }

        if (open && email) {
            markAsRead();
        }
    }, [email, emailId, open, onMarkAsRead, queryClient]);

    // Reset flag quando cambia email
    useEffect(() => {
        hasMarkedAsRead.current = false;
    }, [emailId]);

    const handleDownloadAttachment = async (attachment: any) => {
        if (!attachment.storage_path) return;

        const { data, error } = await supabase.storage
            .from(attachment.storage_bucket || "email-attachments")
            .download(attachment.storage_path);

        if (error) {
            console.error("Errore download:", error);
            return;
        }

        const url = URL.createObjectURL(data);
        const a = document.createElement("a");
        a.href = url;
        a.download = attachment.nome_file;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Caricamento...</DialogTitle>
                    </DialogHeader>
                    <Skeleton className="h-64 w-full" />
                </DialogContent>
            </Dialog>
        );
    }

    if (!email) return null;

    const destinatari = email.a_emails?.map((d: any) => d.email).join(", ") || "";
    const displayDate = email.data_invio_effettiva || email.data_rice_server || email.data_creazione || email.data_ricezione_server;

    // Determina stato leggibile
    const statoDisplay = email.direzione === "ricevuta"
        ? (email.stato === "letta" ? "Letta" : "Non letta")
        : (email.stato || "Inviata");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        {email.oggetto || "(Nessun oggetto)"}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Email da {email.da_nome || email.da_email}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Header email */}
                    <div className="space-y-2">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium">
                                    {email.direzione === "ricevuta" ? "Da" : "A"}:{" "}
                                    <span className="font-normal">
                                        {email.direzione === "ricevuta"
                                            ? `${email.da_nome || ""} <${email.da_email}>`
                                            : destinatari}
                                    </span>
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(displayDate), "dd MMMM yyyy 'alle' HH:mm", {
                                        locale: it,
                                    })}
                                </p>
                            </div>
                            <Badge variant={email.stato_ricevuta === "letta" || email.direzione === "inviata" ? "secondary" : "default"}>
                                {statoDisplay}
                            </Badge>
                        </div>

                        <div className="text-xs text-muted-foreground">
                            {email.direzione === "ricevuta" ? "Ricevuta via IMAP" : "Inviata via SMTP"}
                        </div>
                    </div>

                    <Separator />

                    {/* Corpo email */}
                    <div className="prose prose-sm max-w-none">
                        {email.corpo_html ? (
                            <div
                                dangerouslySetInnerHTML={{ __html: email.corpo_html }}
                                className="whitespace-pre-wrap"
                            />
                        ) : (
                            <p className="whitespace-pre-wrap">{email.corpo_text}</p>
                        )}
                    </div>

                    {/* Allegati */}
                    {email.allegati && email.allegati.length > 0 && (
                        <>
                            <Separator />
                            <div>
                                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <Paperclip className="h-4 w-4" />
                                    Allegati ({email.allegati.length})
                                </h4>
                                <div className="space-y-2">
                                    {email.allegati.map((att: any) => (
                                        <div
                                            key={att.id}
                                            className="flex items-center justify-between p-2 rounded-md border"
                                        >
                                            <div>
                                                <p className="text-sm font-medium">{att.nome_file}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {att.dimensione_bytes
                                                        ? `${(att.dimensione_bytes / 1024).toFixed(1)} KB`
                                                        : ""}
                                                </p>
                                            </div>
                                            {att.storage_path && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDownloadAttachment(att)}
                                                >
                                                    <Download className="h-4 w-4 mr-1" />
                                                    Scarica
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
