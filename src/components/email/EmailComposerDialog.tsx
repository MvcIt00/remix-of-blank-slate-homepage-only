import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Send, Paperclip, X } from "lucide-react";

const emailSchema = z.object({
    to: z.string().email("Email destinatario non valida"),
    subject: z.string().min(1, "Oggetto obbligatorio"),
    body: z.string().min(1, "Corpo email obbligatorio"),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface EmailComposerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultValues?: {
        to?: string;
        subject?: string;
        body?: string;
        id_anagrafica?: string;
        id_noleggio?: string;
        id_preventivo?: string;
        threadId?: string;
    };
    onEmailSent?: () => void;
    accountId?: string;
    targetAccountId?: string;
}

export function EmailComposerDialog({
    open,
    onOpenChange,
    defaultValues,
    onEmailSent,
    accountId,
    targetAccountId,
}: EmailComposerDialogProps) {
    const [isSending, setIsSending] = useState(false);
    const [attachments, setAttachments] = useState<File[]>([]);
    const queryClient = useQueryClient();

    // Recupera account configurato per i parametri (SMTP host, port, etc)
    const { data: account } = useQuery({
        queryKey: ["email-account", accountId],
        queryFn: async () => {
            if (!accountId) return null;
            const { data, error } = await supabase
                .from("account_email" as any)
                .select("*")
                .eq("id", accountId)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: open && !!accountId,
    });

    const form = useForm<EmailFormData>({
        resolver: zodResolver(emailSchema),
        defaultValues: {
            to: "",
            subject: "",
            body: "",
        },
    });

    // Applica defaultValues quando cambiano (AX06 - Context First)
    useEffect(() => {
        if (defaultValues) {
            if (defaultValues.to) form.setValue("to", defaultValues.to);
            if (defaultValues.subject) form.setValue("subject", defaultValues.subject);
            if (defaultValues.body) form.setValue("body", defaultValues.body);
        }
    }, [defaultValues, form]);

    // Reset form quando si chiude
    useEffect(() => {
        if (!open) {
            form.reset();
            setAttachments([]);
        }
    }, [open, form]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setAttachments((prev) => [...prev, ...files]);
        e.target.value = "";
    };

    const removeAttachment = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: EmailFormData) => {
        if (!(account as any)?.id) {
            toast.error("Nessun account email configurato");
            return;
        }

        setIsSending(true);
        try {
            // Prepara allegati in base64
            const attachmentsData = await Promise.all(
                attachments.map(async (file) => {
                    const buffer = await file.arrayBuffer();
                    const base64 = btoa(
                        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
                    );
                    return {
                        filename: file.name,
                        content: base64,
                        contentType: file.type,
                        encoding: "base64",
                    };
                })
            );

            // Invia via Edge Function SMTP
            const { data: result, error } = await supabase.functions.invoke("email-smtp-send", {
                body: {
                    accountId: (account as any).id,
                    targetAccountId: targetAccountId,
                    to: data.to,
                    subject: data.subject,
                    text: data.body,
                    html: data.body.replace(/\n/g, "<br>"),
                    attachments: attachmentsData.length > 0 ? attachmentsData : undefined,
                    id_anagrafica: defaultValues?.id_anagrafica,
                    id_noleggio: defaultValues?.id_noleggio,
                    id_preventivo: defaultValues?.id_preventivo,
                    threadId: defaultValues?.threadId,
                },
            });

            if (error) throw error;
            if (result?.error) throw new Error(result.error);

            if (result.success) {
                toast.success("Email inviata con successo via SMTP");
                // Invalida cache per aggiornare lista inviate
                queryClient.invalidateQueries({ queryKey: ["emails-inviate"] });
                onOpenChange(false);
                onEmailSent?.();
            } else {
                throw new Error(result.error || "Errore invio");
            }
        } catch (error: any) {
            console.error("Errore invio email:", error);
            toast.error(`Errore: ${error.message}`);
        } finally {
            setIsSending(false);
        }
    };

    if (!account) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nuova Email</DialogTitle>
                    </DialogHeader>
                    <div className="py-8 text-center text-muted-foreground">
                        <p>Nessun account email configurato.</p>
                        <p className="text-sm">Configura un account IMAP/SMTP per inviare email.</p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5" />
                        Nuova Email
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Da: {(account as any).email} (via SMTP: {(account as any).smtp_host})
                    </p>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="to"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>A</FormLabel>
                                    <FormControl>
                                        <Input placeholder="destinatario@esempio.it" type="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Oggetto</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Oggetto dell'email..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="body"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Messaggio</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Scrivi il corpo dell'email..."
                                            className="min-h-[200px] resize-y"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Allegati */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Button type="button" variant="outline" size="sm" asChild>
                                    <label className="cursor-pointer">
                                        <Paperclip className="mr-2 h-4 w-4" />
                                        Allega file
                                        <input
                                            type="file"
                                            multiple
                                            className="hidden"
                                            onChange={handleFileSelect}
                                        />
                                    </label>
                                </Button>
                                {attachments.length > 0 && (
                                    <span className="text-sm text-muted-foreground">
                                        {attachments.length} file
                                    </span>
                                )}
                            </div>

                            {attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {attachments.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm"
                                        >
                                            <span className="truncate max-w-[150px]">{file.name}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-4 w-4 p-0"
                                                onClick={() => removeAttachment(index)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSending}
                            >
                                Annulla
                            </Button>
                            <Button type="submit" disabled={isSending}>
                                {isSending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="mr-2 h-4 w-4" />
                                )}
                                Invia via SMTP
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
