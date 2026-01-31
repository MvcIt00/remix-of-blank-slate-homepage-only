import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Mail, Server, Lock } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const accountSchema = z.object({
    email: z.string().email("Email non valida"),
    password: z.string().min(1, "Password obbligatoria"),
    nome_account: z.string().optional(),
    // IMAP
    imap_host: z.string().min(1, "Server IMAP obbligatorio"),
    imap_port: z.coerce.number().min(1).max(65535).default(993),
    imap_ssl: z.boolean().default(true),
    // SMTP
    smtp_host: z.string().min(1, "Server SMTP obbligatorio"),
    smtp_port: z.coerce.number().min(1).max(65535).default(465),
    smtp_ssl: z.boolean().default(true),
    smtp_auth: z.boolean().default(true),
});

type AccountFormData = z.infer<typeof accountSchema>;

// Preset comuni per provider email
const EMAIL_PRESETS: Record<string, Partial<AccountFormData>> = {
    libero: {
        imap_host: "imapmail.libero.it",
        imap_port: 993,
        imap_ssl: true,
        smtp_host: "smtp.libero.it",
        smtp_port: 465,
        smtp_ssl: true,
    },
    gmail: {
        imap_host: "imap.gmail.com",
        imap_port: 993,
        imap_ssl: true,
        smtp_host: "smtp.gmail.com",
        smtp_port: 587,
        smtp_ssl: true,
    },
    outlook: {
        imap_host: "outlook.office365.com",
        imap_port: 993,
        imap_ssl: true,
        smtp_host: "smtp.office365.com",
        smtp_port: 587,
        smtp_ssl: true,
    },
    aruba: {
        imap_host: "imaps.pec.aruba.it",
        imap_port: 993,
        imap_ssl: true,
        smtp_host: "smtps.pec.aruba.it",
        smtp_port: 465,
        smtp_ssl: true,
    },
};

interface EmailAccountConfigDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EmailAccountConfigDialog({
    open,
    onOpenChange,
}: EmailAccountConfigDialogProps) {
    const [isSaving, setIsSaving] = useState(false);
    const queryClient = useQueryClient();

    // Carica account esistente
    const { data: account } = useQuery({
        queryKey: ["email-account"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("account_email" as any)
                .select("*")
                .limit(1)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: open,
    });

    const form = useForm<AccountFormData>({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            email: "",
            password: "",
            nome_account: "",
            imap_host: "imapmail.libero.it",
            imap_port: 993,
            imap_ssl: true,
            smtp_host: "smtp.libero.it",
            smtp_port: 465,
            smtp_ssl: true,
            smtp_auth: true,
        },
    });

    // Popola form con dati esistenti
    useEffect(() => {
        if (account) {
            form.reset({
                email: account.email || "",
                password: "", // Non pre-popolare la password per sicurezza
                nome_account: account.nome_account || "",
                imap_host: account.imap_host || "imapmail.libero.it",
                imap_port: account.imap_port || 993,
                imap_ssl: account.imap_ssl !== false,
                smtp_host: account.smtp_host || "smtp.libero.it",
                smtp_port: account.smtp_port || 465,
                smtp_ssl: account.smtp_ssl !== false,
                smtp_auth: account.smtp_auth !== false,
            });
        }
    }, [account, form]);

    // Applica preset provider
    const applyPreset = (provider: string) => {
        const preset = EMAIL_PRESETS[provider];
        if (preset) {
            Object.entries(preset).forEach(([key, value]) => {
                form.setValue(key as any, value);
            });
            toast.info(`Impostazioni ${provider} applicate`);
        }
    };

    const onSubmit = async (data: AccountFormData) => {
        setIsSaving(true);
        try {
            // Cripta password (base64 per MVP - in prod usare AES)
            const passwordEncrypted = btoa(data.password);

            const accountData = {
                email: data.email,
                nome_account: data.nome_account || data.email,
                password_encrypted: passwordEncrypted,
                imap_host: data.imap_host,
                imap_port: data.imap_port,
                imap_ssl: data.imap_ssl,
                smtp_host: data.smtp_host,
                smtp_port: data.smtp_port,
                smtp_ssl: data.smtp_ssl,
                smtp_auth: data.smtp_auth,
                stato: "attivo",
            };

            if (account?.id) {
                // Aggiorna esistente
                const { error } = await supabase
                    .from("account_email" as any)
                    .update(accountData)
                    .eq("id", account.id);

                if (error) throw error;
            } else {
                // Crea nuovo
                const { error } = await supabase
                    .from("account_email" as any)
                    .insert(accountData);

                if (error) throw error;
            }

            queryClient.invalidateQueries({ queryKey: ["email-account"] });
            toast.success("Configurazione IMAP/SMTP salvata");
            onOpenChange(false);
        } catch (error: any) {
            console.error("Errore salvataggio:", error);
            toast.error(`Errore: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Configurazione Account Email IMAP/SMTP
                    </DialogTitle>
                    <DialogDescription>
                        Configura la connessione al tuo server di posta tramite protocolli standard IMAP e SMTP.
                    </DialogDescription>
                </DialogHeader>

                {/* Preset rapidi */}
                <div className="flex gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Preset:</span>
                    {Object.keys(EMAIL_PRESETS).map((provider) => (
                        <Button
                            key={provider}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => applyPreset(provider)}
                        >
                            {provider.charAt(0).toUpperCase() + provider.slice(1)}
                        </Button>
                    ))}
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Credenziali */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                Credenziali
                            </h4>

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Account</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="testimap2026app@libero.it"
                                                type="email"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="••••••••"
                                                type="password"
                                                autoComplete="new-password"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                            La password verrà salvata in modo sicuro
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="nome_account"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome Account (opzionale)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Account Principale" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Separator />

                        {/* Impostazioni IMAP */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium flex items-center gap-2">
                                <Server className="h-4 w-4" />
                                Server IMAP (Ricezione)
                            </h4>

                            <div className="grid grid-cols-2 gap-3">
                                <FormField
                                    control={form.control}
                                    name="imap_host"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Server IMAP</FormLabel>
                                            <FormControl>
                                                <Input placeholder="imapmail.libero.it" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="imap_port"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Porta</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="993" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="imap_ssl"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormLabel className="!mt-0">Usa SSL/TLS</FormLabel>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Separator />

                        {/* Impostazioni SMTP */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium flex items-center gap-2">
                                <Server className="h-4 w-4" />
                                Server SMTP (Invio)
                            </h4>

                            <div className="grid grid-cols-2 gap-3">
                                <FormField
                                    control={form.control}
                                    name="smtp_host"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Server SMTP</FormLabel>
                                            <FormControl>
                                                <Input placeholder="smtp.libero.it" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="smtp_port"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Porta</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="465" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex gap-4">
                                <FormField
                                    control={form.control}
                                    name="smtp_ssl"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center gap-2">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormLabel className="!mt-0">Usa SSL/TLS</FormLabel>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="smtp_auth"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center gap-2">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormLabel className="!mt-0">Autenticazione SMTP</FormLabel>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSaving}
                            >
                                Annulla
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Salva Configurazione
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
