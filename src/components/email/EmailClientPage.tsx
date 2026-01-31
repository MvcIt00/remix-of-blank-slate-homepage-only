import { useState, useEffect } from "react";
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
    Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { EmailComposerDialog } from "./EmailComposerDialog";
import { EmailAccountConfigDialog } from "./EmailAccountConfigDialog";

interface Email {
    id: string;
    oggetto: string;
    da_email: string;
    da_nome: string | null;
    a_emails: { email: string; name?: string }[];
    corpo_text: string | null;
    corpo_html: string | null;
    direzione: "ricevuta" | "inviata";
    stato_ricevuta: "non_letta" | "letta" | "archiviata" | null;
    stato_inviata: "bozza" | "in_coda" | "inviata" | "archiviata" | null;
    data_creazione: string;
    data_ricezione: string | null;
    data_invio_effettiva: string | null;
}

export function EmailClientPage() {
    const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
    const [activeFolder, setActiveFolder] = useState<"inbox" | "sent">("inbox");
    const [inboxExpanded, setInboxExpanded] = useState(true);
    const [sentExpanded, setSentExpanded] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [composerOpen, setComposerOpen] = useState(false);
    const [accountDialogOpen, setAccountDialogOpen] = useState(false);

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
                .from("messaggi_email" as any)
                .select("*")
                .eq("direzione", "ricevuta")
                .neq("stato_ricevuta", "archiviata")
                .order("data_creazione", { ascending: false })
                .limit(100);
            if (error) throw error;
            return data as Email[];
        },
        enabled: !!account,
    });

    // Fetch email inviate
    const { data: emailsInviate = [], refetch: refetchInviate } = useQuery({
        queryKey: ["emails-inviate"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("messaggi_email" as any)
                .select("*")
                .eq("direzione", "inviata")
                .neq("stato_inviata", "archiviata")
                .order("data_creazione", { ascending: false })
                .limit(100);
            if (error) throw error;
            return data as Email[];
        },
        enabled: !!account,
    });

    // Email selezionata
    const selectedEmail = [...emailsRicevute, ...emailsInviate].find(
        (e) => e.id === selectedEmailId
    );

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

        if (email.direzione === "ricevuta" && email.stato_ricevuta === "non_letta") {
            await supabase
                .from("messaggi_email" as any)
                .update({
                    stato: "letta",
                    stato_ricevuta: "letta",
                    data_lettura: new Date().toISOString(),
                })
                .eq("id", email.id);
            refetchRicevute();
        }
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
    const unreadCount = emailsRicevute.filter((e) => e.stato_ricevuta === "non_letta").length;

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
                                {emailsRicevute.map((email) => (
                                    <EmailListItem
                                        key={email.id}
                                        email={email}
                                        isSelected={selectedEmailId === email.id}
                                        onClick={() => handleSelectEmail(email)}
                                        formatDate={formatEmailDate}
                                        getSnippet={getSnippet}
                                    />
                                ))}
                                {emailsRicevute.length === 0 && (
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
                    <EmailPreview email={selectedEmail} />
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
                onOpenChange={setComposerOpen}
                onEmailSent={() => {
                    refetchInviate();
                    setComposerOpen(false);
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
    const isUnread = email.direzione === "ricevuta" && email.stato_ricevuta === "non_letta";
    const displayDate = isSent
        ? email.data_invio_effettiva || email.data_creazione
        : email.data_ricezione || email.data_creazione;

    // Per email inviate mostra i destinatari
    const sender = isSent
        ? `A: ${email.a_emails?.[0]?.email || "Destinatario"}`
        : email.da_nome || email.da_email;

    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-l-2",
                isSelected
                    ? "bg-primary/5 border-l-primary"
                    : "border-l-transparent",
                isUnread && "bg-primary/5"
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <span className={cn(
                    "text-sm truncate",
                    isUnread ? "font-semibold" : "font-normal"
                )}>
                    {sender}
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(displayDate)}
                </span>
            </div>
            <p className={cn(
                "text-sm truncate mt-0.5",
                isUnread ? "font-medium" : "font-normal text-muted-foreground"
            )}>
                {email.oggetto || "(Nessun oggetto)"}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
                {getSnippet(email)}
            </p>
        </button>
    );
}

// Componente EmailPreview
interface EmailPreviewProps {
    email: Email;
}

function EmailPreview({ email }: EmailPreviewProps) {
    const displayDate = email.direzione === "inviata"
        ? email.data_invio_effettiva || email.data_creazione
        : email.data_ricezione || email.data_creazione;

    const recipients = email.a_emails?.map((r) => r.email).join(", ") || "";

    return (
        <>
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
