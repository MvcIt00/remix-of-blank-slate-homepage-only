import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
    Mail,
    RefreshCw,
    Settings,
    Plus,
    Layout
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { EmailComposerDialog } from "./EmailComposerDialog";
import { EmailAccountConfigDialog } from "./EmailAccountConfigDialog";
import { useEmailThreads, EmailThread } from "@/hooks/useEmailThreads";
import { useEmailManagement } from "@/hooks/useEmailManagement";
import { EmailActionsToolbar } from "./EmailActionsToolbar";
import { ConversationSidebar } from "./ConversationSidebar";
import { ConversationChatView } from "./ConversationChatView";
import { ConversationInput } from "./ConversationInput";
import { EmailClassicView } from "./EmailClassicView";

interface Email {
    id: string;
    oggetto: string;
    da_email: string;
    da_nome: string | null;
    a_emails: { email: string; name?: string }[];
    corpo_text: string | null;
    corpo_html: string | null;
    direzione: "ricevuta" | "inviata";
    stato: string;
    data_creazione: string;
    data_ricezione_server: string | null;
    data_invio_effettiva: string | null;
    id_conversazione?: string;
    message_id?: string;
    in_reply_to?: string;
}

export function EmailClientPage() {
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
    const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [composerOpen, setComposerOpen] = useState(false);
    const [composerDefaults, setComposerDefaults] = useState<{
        to?: string;
        subject?: string;
        body?: string;
        threadId?: string;
    }>({});
    const [accountDialogOpen, setAccountDialogOpen] = useState(false);
    const [isQuickSending, setIsQuickSending] = useState(false);

    // Fetch account email
    const { data: account } = useQuery({
        queryKey: ["email-account"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("account_email" as any)
                .select("*")
                .eq("stato", "attivo")
                .maybeSingle();
            if (error) throw error;
            return data;
        },
    });

    // Fetch emails
    const { data: emailsRicevute = [], refetch: refetchRicevute } = useQuery({
        queryKey: ["emails-ricevute"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("emails_ricevute" as any)
                .select("*, allegati:allegati_email(*)")
                .neq("stato", "archiviata")
                .order("data_ricezione_server", { ascending: false })
                .limit(200);
            if (error) throw error;
            return (data as any[]).map(e => ({ ...e, direzione: 'ricevuta' })) as Email[];
        },
        enabled: !!account,
    });

    const { data: emailsInviate = [], refetch: refetchInviate } = useQuery({
        queryKey: ["emails-inviate"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("emails_inviate" as any)
                .select("*, allegati:allegati_email(*)")
                .neq("stato", "archiviata")
                .order("data_creazione", { ascending: false })
                .limit(200);
            if (error) throw error;
            return (data as any[]).map(e => ({ ...e, direzione: 'inviata' })) as Email[];
        },
        enabled: !!account,
    });

    // Thread logic
    const threads = useEmailThreads(emailsRicevute, emailsInviate);
    const selectedThread = useMemo(() =>
        threads.find(t => t.id === selectedThreadId),
        [threads, selectedThreadId]);

    const selectedEmail = useMemo(() => {
        if (!selectedThread || !selectedEmailId) return null;
        return selectedThread.emails.find(e => e.id === selectedEmailId);
    }, [selectedThread, selectedEmailId]);

    const emailManagement = useEmailManagement(
        (account as any)?.id,
        setComposerOpen,
        setComposerDefaults
    );

    // Auto-read logic
    useEffect(() => {
        if (!selectedThread) return;

        // Se un'email singola è selezionata (Classic View)
        if (selectedEmailId) {
            const email = selectedThread.emails.find(e => e.id === selectedEmailId);
            if (email && email.direzione === 'ricevuta' && email.stato === 'non_letta') {
                emailManagement.markRead(email.id);
            }
        } else {
            // Chat View: segna come lette tutte le non lette del thread
            const unreadIds = selectedThread.emails
                .filter(e => e.direzione === 'ricevuta' && e.stato === 'non_letta')
                .map(e => e.id);

            if (unreadIds.length > 0) {
                emailManagement.markMultipleAsRead(unreadIds);
            }
        }
    }, [selectedThreadId, selectedEmailId, selectedThread?.id, emailManagement]);

    // Sync IMAP
    const syncEmails = async () => {
        const accId = (account as any)?.id;
        if (!accId) {
            toast.error("Configura prima un account email");
            return;
        }
        setIsSyncing(true);
        try {
            const accId = (account as any)?.id;
            const { data, error } = await supabase.functions.invoke("email-imap-fetch", {
                body: { accountId: accId, limit: 30 },
            });
            if (error) throw error;
            if (data.success) {
                if (data.count > 0) {
                    toast.success(`${data.count} nuove email`);
                } else {
                    toast.info("Nessuna nuova email");
                }
                await refetchRicevute();
            }
        } catch (error: any) {
            toast.error(`Errore: ${error.message}`);
        } finally {
            setIsSyncing(false);
        }
    };

    // Quick Send
    const handleQuickSend = async (content: string) => {
        if (!selectedThread || !account) return;

        setIsQuickSending(true);
        try {
            const accId = (account as any)?.id;
            const lastEmail = selectedThread.latest;
            const to = lastEmail.direzione === 'ricevuta' ? lastEmail.da_email : lastEmail.a_emails?.[0]?.email;

            if (!to) throw new Error("Destinatario non trovato");

            const { data, error } = await supabase.functions.invoke("email-smtp-send", {
                body: {
                    accountId: accId,
                    to: [to],
                    subject: lastEmail.oggetto?.startsWith("Re:") ? lastEmail.oggetto : `Re: ${lastEmail.oggetto || ""}`,
                    text: content,
                    html: content.replace(/\n/g, "<br>"),
                    threadId: selectedThread.id.startsWith('sub-') ? null : selectedThread.id,
                    inReplyTo: lastEmail.message_id,
                    references: (lastEmail as any).references_chain || []
                },
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            toast.success("Email inviata correttamente");
            refetchInviate();
        } catch (error: any) {
            console.error("Errore Invio:", error);
            toast.error(`Errore invio: ${error.message}`);
        } finally {
            setIsQuickSending(false);
        }
    };

    // Open full composer
    const handleExpandComposer = () => {
        if (!selectedThread) return;
        const lastEmail = selectedThread.latest;

        setComposerDefaults({
            to: lastEmail.direzione === 'ricevuta' ? lastEmail.da_email : lastEmail.a_emails?.[0]?.email,
            subject: lastEmail.oggetto?.startsWith("Re:") ? lastEmail.oggetto : `Re: ${lastEmail.oggetto || ""}`,
            threadId: selectedThread.id.startsWith('sub-') ? undefined : selectedThread.id
        });
        setComposerOpen(true);
    };

    if (!account) {
        return (
            <div className="h-full flex items-center justify-center bg-muted/30">
                <div className="text-center space-y-4">
                    <Mail className="mx-auto h-16 w-16 text-muted-foreground/50" />
                    <h3 className="text-lg font-medium">Nessun account email</h3>
                    <p className="text-sm text-muted-foreground">Configura un account per iniziare</p>
                    <Button onClick={() => setAccountDialogOpen(true)}>
                        <Settings className="h-4 w-4 mr-2" /> Impostazioni Account
                    </Button>
                </div>
                <EmailAccountConfigDialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen} />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-140px)] flex bg-background border rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            {/* Sidebar */}
            <div className="w-85 lg:w-96 flex flex-col shrink-0">
                <div className="p-4 border-b flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <h1 className="font-bold text-lg tracking-tight">Messaggi</h1>
                    </div>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={syncEmails} disabled={isSyncing}>
                            <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setAccountDialogOpen(true)}>
                            <Settings className="h-4 w-4" />
                        </Button>
                        <Button size="icon" className="h-8 w-8 rounded-full shadow-md hover:shadow-primary/20" onClick={() => { setComposerDefaults({}); setComposerOpen(true); }}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden">
                    <ConversationSidebar
                        threads={threads}
                        selectedThreadId={selectedThreadId}
                        selectedEmailId={selectedEmailId}
                        onSelectThread={setSelectedThreadId}
                        onSelectEmail={setSelectedEmailId}
                    />
                </div>
            </div>

            {/* Conversation Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50/30 dark:bg-slate-950/10">
                {selectedThread ? (
                    <div className="flex-1 flex flex-col overflow-hidden relative">
                        {/* Switch View Controls - Optional visual hook */}
                        <div className="absolute top-4 right-4 z-20 flex gap-2">
                            <Button
                                variant={!selectedEmailId ? "default" : "outline"}
                                size="sm"
                                className="h-8 px-3 text-[10px] font-bold uppercase tracking-tight shadow-sm"
                                onClick={() => setSelectedEmailId(null)}
                            >
                                <Layout className="h-3 w-3 mr-2" /> Chat View
                            </Button>
                        </div>

                        <div className="flex-1 overflow-hidden">
                            {selectedEmailId && selectedEmail ? (
                                <EmailClassicView
                                    email={selectedEmail}
                                    onBack={() => setSelectedEmailId(null)}
                                    actions={emailManagement}
                                />
                            ) : (
                                <div className="h-full flex flex-col">
                                    <div className="flex-1 overflow-hidden">
                                        <ConversationChatView
                                            thread={selectedThread}
                                            actions={emailManagement}
                                        />
                                    </div>
                                    <ConversationInput
                                        onSend={handleQuickSend}
                                        onExpand={handleExpandComposer}
                                        isSending={isQuickSending}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center p-8">
                        <div className="text-center max-w-xs space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="h-20 w-20 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <Mail className="h-10 w-10 text-muted-foreground/30" />
                            </div>
                            <h3 className="text-xl font-semibold tracking-tight">Nessuna conversazione</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Seleziona una conversazione dalla lista per vedere la cronologia dei messaggi.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Dialogs */}
            <EmailComposerDialog
                open={composerOpen}
                onOpenChange={(open) => { setComposerOpen(open); if (!open) setComposerDefaults({}); }}
                defaultValues={composerDefaults}
                onEmailSent={() => { refetchInviate(); setComposerOpen(false); setComposerDefaults({}); }}
            />
            <EmailAccountConfigDialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen} />
        </div>
    );
}
