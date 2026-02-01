import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
    Mail,
    Send,
    RefreshCw,
    Plus,
    ChevronDown,
    ChevronRight,
    Paperclip,
    Settings,
    Reply,
    ReplyAll,
    Forward,
    Trash2,
    Archive,
    MailOpen,
    ArrowUpRight,
    ArrowDownLeft,
    MessagesSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { EmailComposerDialog } from "./EmailComposerDialog";
import { EmailAccountConfigDialog } from "./EmailAccountConfigDialog";
import { useEmailThreads } from "@/hooks/useEmailThreads";

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
}

export function EmailClientPage() {
    const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
    const [activeFolder, setActiveFolder] = useState<"inbox" | "sent">("inbox");
    const [inboxExpanded, setInboxExpanded] = useState(true);
    const [sentExpanded, setSentExpanded] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [composerOpen, setComposerOpen] = useState(false);
    const [composerDefaults, setComposerDefaults] = useState<{
        to?: string;
        subject?: string;
        body?: string;
    }>({});
    const [accountDialogOpen, setAccountDialogOpen] = useState(false);
    const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());

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

    // Fetch email ricevute
    const { data: emailsRicevute = [], refetch: refetchRicevute } = useQuery({
        queryKey: ["emails-ricevute"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("emails_ricevute" as any)
                .select("*")
                .neq("stato", "archiviata")
                .order("data_ricezione_server", { ascending: false })
                .limit(100);
            if (error) throw error;
            return (data as any[]).map(e => ({ ...e, direzione: 'ricevuta' })) as Email[];
        },
        enabled: !!account,
    });

    // Fetch email inviate
    const { data: emailsInviate = [], refetch: refetchInviate } = useQuery({
        queryKey: ["emails-inviate"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("emails_inviate" as any)
                .select("*")
                .neq("stato", "archiviata")
                .order("data_creazione", { ascending: false })
                .limit(100);
            if (error) throw error;
            return (data as any[]).map(e => ({ ...e, direzione: 'inviata' })) as Email[];
        },
        enabled: !!account,
    });

    // Email selezionata
    const selectedEmail = [...emailsRicevute, ...emailsInviate].find(
        (e) => e.id === selectedEmailId
    );

    // Raggruppa email per thread
    const threads = useEmailThreads(emailsRicevute, emailsInviate);

    // Toggle espansione thread
    const toggleThread = (threadId: string) => {
        setExpandedThreads(prev => {
            const next = new Set(prev);
            if (next.has(threadId)) next.delete(threadId);
            else next.add(threadId);
            return next;
        });
    };

    // Sync IMAP
    const syncEmails = async () => {
        if (!account?.id) {
            toast.error("Configura prima un account email");
            return;
        }
        setIsSyncing(true);
        try {
            const { data, error } = await supabase.functions.invoke("email-imap-fetch", {
                body: { accountId: account.id, limit: 30 },
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

    // Mark as read al click
    const handleSelectEmail = async (email: Email) => {
        setSelectedEmailId(email.id);

        if (email.direzione === "ricevuta" && email.stato === "non_letta") {
            await supabase
                .from("emails_ricevute" as any)
                .update({
                    stato: "letta",
                    data_lettura: new Date().toISOString(),
                })
                .eq("id", email.id);
            refetchRicevute();
        }
    };

    // === AZIONI EMAIL (Thunderbird-style) ===

    // Rispondi al mittente
    const handleReply = (email: Email) => {
        const quotedBody = `\n\n--- Messaggio originale ---\nDa: ${email.da_nome || email.da_email}\nData: ${format(new Date(email.data_ricezione_server || email.data_creazione), "dd/MM/yyyy HH:mm")}\nOggetto: ${email.oggetto}\n\n${email.corpo_text || ""}`;

        setComposerDefaults({
            to: email.da_email,
            subject: email.oggetto?.startsWith("Re:") ? email.oggetto : `Re: ${email.oggetto || ""}`,
            body: quotedBody,
        });
        setComposerOpen(true);
    };

    // Rispondi a tutti
    const handleReplyAll = (email: Email) => {
        // Includi mittente + tutti i destinatari originali (escludendo il nostro account)
        const allRecipients = [
            email.da_email,
            ...(email.a_emails?.map((r) => r.email) || [])
        ].filter((e) => e !== account?.email_address);

        const quotedBody = `\n\n--- Messaggio originale ---\nDa: ${email.da_nome || email.da_email}\nA: ${email.a_emails?.map((r) => r.email).join(", ") || ""}\nData: ${format(new Date(email.data_ricezione_server || email.data_creazione), "dd/MM/yyyy HH:mm")}\nOggetto: ${email.oggetto}\n\n${email.corpo_text || ""}`;

        setComposerDefaults({
            to: allRecipients.join(", "),
            subject: email.oggetto?.startsWith("Re:") ? email.oggetto : `Re: ${email.oggetto || ""}`,
            body: quotedBody,
        });
        setComposerOpen(true);
    };

    // Inoltra
    const handleForward = (email: Email) => {
        const forwardBody = `\n\n--- Messaggio inoltrato ---\nDa: ${email.da_nome || email.da_email}\nData: ${format(new Date(email.data_ricezione_server || email.data_creazione), "dd/MM/yyyy HH:mm")}\nOggetto: ${email.oggetto}\nA: ${email.a_emails?.map((r) => r.email).join(", ") || ""}\n\n${email.corpo_text || ""}`;

        setComposerDefaults({
            to: "",
            subject: email.oggetto?.startsWith("Fwd:") ? email.oggetto : `Fwd: ${email.oggetto || ""}`,
            body: forwardBody,
        });
        setComposerOpen(true);
    };

    // Elimina
    const handleDelete = async (email: Email) => {
        const table = email.direzione === "ricevuta" ? "emails_ricevute" : "emails_inviate";

        const { error } = await supabase
            .from(table as any)
            .update({ stato: "eliminata" })
            .eq("id", email.id);

        if (error) {
            toast.error("Errore durante l'eliminazione");
            return;
        }

        toast.success("Email spostata nel cestino");
        setSelectedEmailId(null);
        if (email.direzione === "ricevuta") {
            refetchRicevute();
        } else {
            refetchInviate();
        }
    };

    // Archivia
    const handleArchive = async (email: Email) => {
        const table = email.direzione === "ricevuta" ? "emails_ricevute" : "emails_inviate";

        const { error } = await supabase
            .from(table as any)
            .update({ stato: "archiviata" })
            .eq("id", email.id);

        if (error) {
            toast.error("Errore durante l'archiviazione");
            return;
        }

        toast.success("Email archiviata");
        setSelectedEmailId(null);
        if (email.direzione === "ricevuta") {
            refetchRicevute();
        } else {
            refetchInviate();
        }
    };

    // Segna come non letto
    const handleMarkUnread = async (email: Email) => {
        if (email.direzione !== "ricevuta") {
            toast.info("Solo le email ricevute possono essere segnate come non lette");
            return;
        }

        const { error } = await supabase
            .from("emails_ricevute" as any)
            .update({ stato: "non_letta", data_lettura: null })
            .eq("id", email.id);

        if (error) {
            toast.error("Errore durante l'aggiornamento");
            return;
        }

        toast.success("Email segnata come non letta");
        refetchRicevute();
    };

    // Formatta data
    const formatEmailDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return format(date, "HH:mm");
        }
        return format(date, "dd MMM", { locale: it });
    };

    // Snippet del corpo
    const getSnippet = (email: Email) => {
        const text = email.corpo_text || "";
        return text.substring(0, 80).replace(/\s+/g, " ").trim() + (text.length > 80 ? "..." : "");
    };

    // Conteggio non lette
    const unreadCount = emailsRicevute.filter((e) => e.stato === "non_letta").length;

    if (!account) {
        return (
            <div className="h-full flex items-center justify-center bg-muted/30">
                <div className="text-center space-y-4">
                    <Mail className="mx-auto h-16 w-16 text-muted-foreground/50" />
                    <h3 className="text-lg font-medium">Nessun account email</h3>
                    <p className="text-sm text-muted-foreground">
                        Configura un account IMAP/SMTP per iniziare
                    </p>
                    <Button onClick={() => setAccountDialogOpen(true)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Configura Account
                    </Button>
                </div>
                <EmailAccountConfigDialog
                    open={accountDialogOpen}
                    onOpenChange={setAccountDialogOpen}
                />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-120px)] flex bg-background border rounded-lg overflow-hidden">
            {/* Sidebar - Lista Email */}
            <div className="w-80 border-r flex flex-col bg-muted/20">
                {/* Toolbar */}
                <div className="p-3 border-b flex items-center gap-2 bg-background">
                    <Button
                        size="sm"
                        onClick={() => setComposerOpen(true)}
                        className="flex-1"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Nuova
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={syncEmails}
                        disabled={isSyncing}
                    >
                        <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setAccountDialogOpen(true)}
                    >
                        <Settings className="h-4 w-4" />
                    </Button>
                </div>

                {/* Cartelle */}
                <ScrollArea className="flex-1">
                    {/* In Arrivo */}
                    <div>
                        <button
                            onClick={() => setInboxExpanded(!inboxExpanded)}
                            className={cn(
                                "w-full px-3 py-2 flex items-center gap-2 hover:bg-muted/50 transition-colors",
                                activeFolder === "inbox" && "bg-primary/10"
                            )}
                        >
                            {inboxExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <Mail className="h-4 w-4" />
                            <span className="font-medium text-sm">In arrivo</span>
                            {unreadCount > 0 && (
                                <Badge variant="default" className="ml-auto text-xs">
                                    {unreadCount}
                                </Badge>
                            )}
                        </button>

                        {inboxExpanded && (
                            <div className="space-y-px">
                                {threads.map(thread => {
                                    const isExpanded = expandedThreads.has(thread.id);

                                    return (
                                        <div key={thread.id} className={cn(
                                            "group transition-all rounded-md mx-1 my-0.5",
                                            isExpanded && "bg-muted/40 shadow-sm"
                                        )}>
                                            {/* Thread header (latest email) */}
                                            <div className="relative">
                                                <EmailListItem
                                                    email={thread.latest}
                                                    isSelected={selectedEmailId === thread.latest.id}
                                                    onClick={() => {
                                                        const isCurrentlySelected = selectedEmailId === thread.latest.id;
                                                        handleSelectEmail(thread.latest);
                                                        if (!isCurrentlySelected || !isExpanded) {
                                                            if (!isExpanded) toggleThread(thread.id);
                                                        } else {
                                                            toggleThread(thread.id);
                                                        }
                                                    }}
                                                    formatDate={formatEmailDate}
                                                    getSnippet={getSnippet}
                                                />
                                                {thread.count > 1 && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); toggleThread(thread.id); }}
                                                        className={cn(
                                                            "absolute right-2 top-2 flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold transition-all z-10 border shadow-sm",
                                                            isExpanded
                                                                ? "bg-primary text-primary-foreground border-primary"
                                                                : "bg-background hover:bg-muted border-muted-foreground/20"
                                                        )}
                                                    >
                                                        <MessagesSquare className="h-3 w-3" />
                                                        <span>{thread.count}</span>
                                                        <ChevronDown className={cn(
                                                            "h-3 w-3 transition-transform duration-200",
                                                            isExpanded ? "rotate-0" : "-rotate-90"
                                                        )} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Thread emails (quando espanso) */}
                                            {isExpanded && thread.count > 1 && (
                                                <div className="ml-6 border-l-2 border-primary/20 space-y-px pb-1">
                                                    {thread.emails.slice(0, -1).reverse().map(email => (
                                                        <div key={email.id} className="relative opacity-90 scale-[0.98] origin-left transition-all">
                                                            <EmailListItem
                                                                email={email}
                                                                isSelected={selectedEmailId === email.id}
                                                                onClick={() => handleSelectEmail(email)}
                                                                formatDate={formatEmailDate}
                                                                getSnippet={getSnippet}
                                                                isSent={email.direzione === 'inviata'}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {threads.length === 0 && (
                                    <p className="px-4 py-3 text-sm text-muted-foreground">
                                        Nessuna email
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <Separator className="my-1" />

                    {/* Inviate */}
                    <div>
                        <button
                            onClick={() => setSentExpanded(!sentExpanded)}
                            className={cn(
                                "w-full px-3 py-2 flex items-center gap-2 hover:bg-muted/50 transition-colors",
                                activeFolder === "sent" && "bg-primary/10"
                            )}
                        >
                            {sentExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <Send className="h-4 w-4" />
                            <span className="font-medium text-sm">Inviate</span>
                            <span className="ml-auto text-xs text-muted-foreground">
                                {emailsInviate.length}
                            </span>
                        </button>

                        {sentExpanded && (
                            <div className="space-y-px">
                                {emailsInviate.map((email) => (
                                    <EmailListItem
                                        key={email.id}
                                        email={email}
                                        isSelected={selectedEmailId === email.id}
                                        onClick={() => handleSelectEmail(email)}
                                        formatDate={formatEmailDate}
                                        getSnippet={getSnippet}
                                        isSent
                                    />
                                ))}
                                {emailsInviate.length === 0 && (
                                    <p className="px-4 py-3 text-sm text-muted-foreground">
                                        Nessuna email inviata
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Preview Pane */}
            <div className="flex-1 flex flex-col bg-background">
                {selectedEmail ? (
                    <EmailPreview
                        email={selectedEmail}
                        onReply={handleReply}
                        onReplyAll={handleReplyAll}
                        onForward={handleForward}
                        onDelete={handleDelete}
                        onArchive={handleArchive}
                        onMarkUnread={handleMarkUnread}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <Mail className="mx-auto h-12 w-12 opacity-30 mb-3" />
                            <p>Seleziona un'email per visualizzarla</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Dialogs */}
            <EmailComposerDialog
                open={composerOpen}
                onOpenChange={(open) => {
                    setComposerOpen(open);
                    if (!open) setComposerDefaults({});
                }}
                defaultValues={composerDefaults}
                onEmailSent={() => {
                    refetchInviate();
                    setComposerOpen(false);
                    setComposerDefaults({});
                }}
            />
            <EmailAccountConfigDialog
                open={accountDialogOpen}
                onOpenChange={setAccountDialogOpen}
            />
        </div>
    );
}

// Componente EmailListItem
interface EmailListItemProps {
    email: Email;
    isSelected: boolean;
    onClick: () => void;
    formatDate: (date: string) => string;
    getSnippet: (email: Email) => string;
    isSent?: boolean;
}

function EmailListItem({
    email,
    isSelected,
    onClick,
    formatDate,
    getSnippet,
    isSent
}: EmailListItemProps) {
    const isUnread = email.direzione === "ricevuta" && email.stato === "non_letta";
    const displayDate = isSent
        ? email.data_invio_effettiva || email.data_creazione
        : email.data_ricezione_server || email.data_creazione;

    const senderName = isSent
        ? (email.a_emails?.[0]?.name || email.a_emails?.[0]?.email || "Destinatario")
        : (email.da_nome || email.da_email || "Sconosciuto");

    const initial = senderName.charAt(0).toUpperCase();

    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full text-left px-3 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 transition-all relative border-l-4",
                isSelected
                    ? "bg-primary/10 border-l-primary"
                    : "border-l-transparent",
                isUnread && "bg-primary/5 font-semibold"
            )}
        >
            <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                    <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold",
                        isSent ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                    )}>
                        {initial}
                    </div>
                    {/* Direction Dot */}
                    <div className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background shadow-sm",
                        isSent ? "bg-blue-500 shadow-blue-500/50" : "bg-orange-500 shadow-orange-500/50"
                    )} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                            {isSent ? <ArrowUpRight className="h-3 w-3 shrink-0 opacity-60" /> : <ArrowDownLeft className="h-3 w-3 shrink-0 opacity-60" />}
                            <span className={cn(
                                "text-sm truncate",
                                isUnread ? "text-foreground" : "text-muted-foreground"
                            )}>
                                {senderName}
                            </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap uppercase tracking-tighter">
                            {formatDate(displayDate)}
                        </span>
                    </div>

                    <h4 className={cn(
                        "text-xs truncate font-medium mt-0.5",
                        isUnread ? "text-foreground" : "text-foreground/80"
                    )}>
                        {email.oggetto || "(Nessun oggetto)"}
                    </h4>

                    <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5 opacity-80">
                        {getSnippet(email)}
                    </p>
                </div>
            </div>
        </button>
    );
}

// Componente EmailPreview con Toolbar Azioni
interface EmailPreviewProps {
    email: Email;
    onReply: (email: Email) => void;
    onReplyAll: (email: Email) => void;
    onForward: (email: Email) => void;
    onDelete: (email: Email) => void;
    onArchive: (email: Email) => void;
    onMarkUnread: (email: Email) => void;
}

function EmailPreview({
    email,
    onReply,
    onReplyAll,
    onForward,
    onDelete,
    onArchive,
    onMarkUnread
}: EmailPreviewProps) {
    const displayDate = email.direzione === "inviata"
        ? email.data_invio_effettiva || email.data_creazione
        : email.data_ricezione_server || email.data_creazione;

    const recipients = email.a_emails?.map((r) => r.email).join(", ") || "";
    const isReceived = email.direzione === "ricevuta";

    return (
        <>
            {/* Toolbar Azioni */}
            <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReply(email)}
                    className="gap-1.5"
                >
                    <Reply className="h-4 w-4" />
                    <span className="hidden sm:inline">Rispondi</span>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReplyAll(email)}
                    className="gap-1.5"
                >
                    <ReplyAll className="h-4 w-4" />
                    <span className="hidden sm:inline">Rispondi a tutti</span>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onForward(email)}
                    className="gap-1.5"
                >
                    <Forward className="h-4 w-4" />
                    <span className="hidden sm:inline">Inoltra</span>
                </Button>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(email)}
                    className="gap-1.5 text-destructive hover:text-destructive"
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Elimina</span>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onArchive(email)}
                    className="gap-1.5"
                >
                    <Archive className="h-4 w-4" />
                    <span className="hidden sm:inline">Archivia</span>
                </Button>

                {isReceived && (
                    <>
                        <Separator orientation="vertical" className="h-6 mx-1" />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMarkUnread(email)}
                            className="gap-1.5"
                        >
                            <MailOpen className="h-4 w-4" />
                            <span className="hidden sm:inline">Non letto</span>
                        </Button>
                    </>
                )}
            </div>

            {/* Header */}
            <div className="p-4 border-b">
                <h2 className="text-xl font-semibold mb-3">
                    {email.oggetto || "(Nessun oggetto)"}
                </h2>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <p className="text-sm">
                            <span className="text-muted-foreground">Da:</span>{" "}
                            <span className="font-medium">
                                {email.da_nome || email.da_email}
                            </span>
                            {email.da_nome && (
                                <span className="text-muted-foreground ml-1">
                                    &lt;{email.da_email}&gt;
                                </span>
                            )}
                        </p>
                        {recipients && (
                            <p className="text-sm">
                                <span className="text-muted-foreground">A:</span>{" "}
                                {recipients}
                            </p>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                            {format(new Date(displayDate), "dd MMMM yyyy", { locale: it })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {format(new Date(displayDate), "HH:mm")}
                        </p>
                    </div>
                </div>
            </div>

            {/* Body */}
            <ScrollArea className="flex-1 p-4">
                <div className="prose prose-sm max-w-none">
                    {email.corpo_html ? (
                        <div
                            dangerouslySetInnerHTML={{ __html: email.corpo_html }}
                            className="email-body"
                        />
                    ) : (
                        <p className="whitespace-pre-wrap">{email.corpo_text}</p>
                    )}
                </div>
            </ScrollArea>
        </>
    );
}
