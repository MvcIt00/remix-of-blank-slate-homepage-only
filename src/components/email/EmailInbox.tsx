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

interface Conversation {
    id: string;
    subject_normalized: string;
    ultimo_mittente: string;
    anteprima_testo: string;
    data_ultimo_messaggio: string;
    count_messaggi: number;
    ha_non_lette: boolean;
    direzione?: 'ricevuta' | 'inviata'; // Per compatibilità temporanea
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
                .from("account_email")
                .select("*")
                .eq("stato", "attivo")
                .limit(1)
                .maybeSingle();

            if (error) throw error;
            return data as any;
        },
    });

    const { data: conversazioni = [], isLoading: loadingConversazioni, refetch: refetchConversazioni } = useQuery({
        queryKey: ["emails-conversazioni"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("vw_conversazioni_email_list" as any)
                .select("*")
                .limit(100);

            if (error) throw error;
            return (data as unknown) as Conversation[];
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
                await refetchConversazioni();
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

    const handleOpenConversation = (conv: Conversation) => {
        // Al momento il viewer apre un singolo messaggio
        // Dovremmo evolverlo per aprire la conversazione.
        // Per ora cerchiamo l'ultimo messaggio della conversazione.
        toast.info("Apertura conversazione: " + conv.subject_normalized);
    };

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

    const convDaLeggere = conversazioni.filter(c => c.ha_non_lette);
    const convLette = conversazioni.filter(c => !c.ha_non_lette);

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Badge variant="outline">{account.email}</Badge>
                    <Badge variant="secondary" className="text-xs">
                        Threading: Attivo (v20.2)
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

            {/* Conversazioni con nuovi messaggi */}
            <Card>
                <CardHeader className="py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-600" />
                        In Arrivo ({convDaLeggere.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loadingConversazioni ? (
                        <div className="p-4 space-y-2">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : convDaLeggere.length === 0 ? (
                        <p className="p-4 text-sm text-muted-foreground">Nessun nuovo messaggio</p>
                    ) : (
                        <div className="divide-y">
                            {convDaLeggere.map((conv) => (
                                <ConversationRow key={conv.id} conv={conv} onClick={() => handleOpenConversation(conv)} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Archivio Conversazioni */}
            <Card>
                <CardHeader className="py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <MailOpen className="h-4 w-4 text-gray-500" />
                        Lette ({convLette.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loadingConversazioni ? (
                        <Skeleton className="h-12 w-full m-4" />
                    ) : convLette.length === 0 ? (
                        <p className="p-4 text-sm text-muted-foreground">Nessuna conversazione letta</p>
                    ) : (
                        <div className="divide-y max-h-[500px] overflow-y-auto">
                            {convLette.map((conv) => (
                                <ConversationRow key={conv.id} conv={conv} onClick={() => handleOpenConversation(conv)} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// Componente riga conversazione
function ConversationRow({
    conv,
    onClick,
}: {
    conv: Conversation;
    onClick: () => void;
}) {
    const isUnread = conv.ha_non_lette;

    return (
        <div
            onClick={onClick}
            className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${isUnread ? "bg-blue-50/50 font-medium" : ""
                }`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className={`text-sm truncate ${isUnread ? "font-semibold" : ""}`}>
                            {conv.ultimo_mittente}
                        </p>
                        {conv.count_messaggi > 1 && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1">
                                {conv.count_messaggi}
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm font-medium truncate">{conv.subject_normalized}</p>
                    <p className="text-xs text-muted-foreground truncate">{conv.anteprima_testo}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(conv.data_ultimo_messaggio), { addSuffix: true, locale: it })}
                </span>
            </div>
        </div>
    );
}
