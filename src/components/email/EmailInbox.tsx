import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { Mail, MailOpen, Send, RefreshCw, Loader2 } from "lucide-react";
import { EmailViewerDialog } from "./EmailViewerDialog";
import { toast } from "sonner";

interface Email {
    id: string;
    oggetto: string;
    da_email: string;
    da_nome: string;
    a_emails: any[];
    direzione: 'ricevuta' | 'inviata';
    stato: string;
    corpo_text: string;
    corpo_html: string;
    data_ricezione_server?: string;
    data_invio_effettiva?: string;
    data_creazione: string;
}

export function EmailInbox() {
    const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const queryClient = useQueryClient();

    // Recupera account configurato
    const { data: account } = useQuery({
        queryKey: ["email-account"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("account_email" as any)
                .select("*")
                .eq("stato", "attivo")
                .limit(1)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
    });

    const { data: emailsRicevute = [], isLoading: loadingRicevute, refetch: refetchRicevute } = useQuery({
        queryKey: ["emails-ricevute"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("emails_ricevute" as any)
                .select("*")
                .neq("stato", "archiviata")
                .order("data_ricezione_server", { ascending: false })
                .limit(50);

            if (error) throw error;
            return (data as any[]).map(e => ({ ...e, direzione: 'ricevuta' })) as Email[];
        },
        enabled: !!account,
    });

    const { data: emailsInviate = [], isLoading: loadingInviate, refetch: refetchInviate } = useQuery({
        queryKey: ["emails-inviate"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("emails_inviate" as any)
                .select("*")
                .neq("stato", "archiviata")
                .order("data_creazione", { ascending: false })
                .limit(50);

            if (error) throw error;
            return (data as any[]).map(e => ({ ...e, direzione: 'inviata' })) as Email[];
        },
        enabled: !!account,
    });

    // Sincronizza email via IMAP
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
                toast.success(`Sincronizzate ${data.count} email`);
                // Refresh esplicito delle query
                await refetchRicevute();
                await refetchInviate();
            } else {
                throw new Error(data.error || "Errore sincronizzazione");
            }
        } catch (error: any) {
            console.error("Errore sync:", error);
            toast.error(`Errore: ${error.message}`);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleOpenEmail = async (email: Email) => {
        setSelectedEmailId(email.id);
        setViewerOpen(true);

        // Mark as read SUBITO al click (se email ricevuta e non letta)
        if (email.direzione === "ricevuta" && email.stato === "non_letta") {
            await supabase
                .from("emails_ricevute" as any)
                .update({
                    stato: "letta",
                    data_lettura: new Date().toISOString(),
                })
                .eq("id", email.id);

            // Refresh immediato della lista
            refetchRicevute();
        }
    };

    // Quando chiudiamo il viewer, refresh la lista
    useEffect(() => {
        if (!viewerOpen && selectedEmailId) {
            // Refresh esplicito dopo chiusura dialog
            refetchRicevute();
        }
    }, [viewerOpen, selectedEmailId, refetchRicevute]);

    const emailsDaLeggere = emailsRicevute.filter((e) => e.stato === "non_letta");
    const emailsLette = emailsRicevute.filter((e) => e.stato === "letta");

    if (!account) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    <Mail className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>Nessun account email configurato.</p>
                    <p className="text-sm">Clicca "Configura" per aggiungere un account IMAP/SMTP.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Badge variant="outline">{account.email}</Badge>
                    <Badge variant="secondary" className="text-xs">
                        IMAP: {account.imap_host}
                    </Badge>
                </div>
                <Button onClick={syncEmails} disabled={isSyncing} variant="outline" size="sm">
                    {isSyncing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Sincronizza
                </Button>
            </div>

            {/* Da Leggere - stato_ricevuta = 'non_letta' */}
            <Card>
                <CardHeader className="py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-600" />
                        Da Leggere ({emailsDaLeggere.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loadingRicevute ? (
                        <div className="p-4 space-y-2">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : emailsDaLeggere.length === 0 ? (
                        <p className="p-4 text-sm text-muted-foreground">Nessuna email da leggere</p>
                    ) : (
                        <div className="divide-y">
                            {emailsDaLeggere.map((email) => (
                                <EmailRow key={email.id} email={email} onClick={() => handleOpenEmail(email)} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Lette - stato_ricevuta = 'letta' */}
            <Card>
                <CardHeader className="py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <MailOpen className="h-4 w-4 text-gray-500" />
                        Lette ({emailsLette.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loadingRicevute ? (
                        <Skeleton className="h-12 w-full m-4" />
                    ) : emailsLette.length === 0 ? (
                        <p className="p-4 text-sm text-muted-foreground">Nessuna email letta</p>
                    ) : (
                        <div className="divide-y max-h-[300px] overflow-y-auto">
                            {emailsLette.slice(0, 20).map((email) => (
                                <EmailRow key={email.id} email={email} onClick={() => handleOpenEmail(email)} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Inviate - direzione = 'inviata' */}
            <Card>
                <CardHeader className="py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Send className="h-4 w-4 text-green-600" />
                        Inviate ({emailsInviate.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loadingInviate ? (
                        <Skeleton className="h-12 w-full m-4" />
                    ) : emailsInviate.length === 0 ? (
                        <p className="p-4 text-sm text-muted-foreground">Nessuna email inviata</p>
                    ) : (
                        <div className="divide-y max-h-[300px] overflow-y-auto">
                            {emailsInviate.slice(0, 20).map((email) => (
                                <EmailRow key={email.id} email={email} onClick={() => handleOpenEmail(email)} isOutgoing />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Viewer Dialog */}
            {selectedEmailId && (
                <EmailViewerDialog
                    emailId={selectedEmailId}
                    direzione={emailsRicevute.find(e => e.id === selectedEmailId) ? 'ricevuta' : 'inviata'}
                    open={viewerOpen}
                    onOpenChange={setViewerOpen}
                    onMarkAsRead={() => refetchRicevute()}
                />
            )}
        </div>
    );
}

// Componente riga email
function EmailRow({
    email,
    onClick,
    isOutgoing = false,
}: {
    email: Email;
    onClick: () => void;
    isOutgoing?: boolean;
}) {
    const displayDate = email.data_invio_effettiva || email.data_ricezione_server || email.data_creazione;
    const isUnread = email.stato === "non_letta" && !isOutgoing;

    return (
        <div
            onClick={onClick}
            className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${isUnread ? "bg-blue-50/50 font-medium" : ""
                }`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <p className={`text-sm truncate ${isUnread ? "font-semibold" : ""}`}>
                        {isOutgoing
                            ? `A: ${email.a_emails?.[0]?.email || "Destinatario"}`
                            : email.da_nome || email.da_email}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{email.oggetto}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(displayDate), { addSuffix: true, locale: it })}
                </span>
            </div>
        </div>
    );
}
