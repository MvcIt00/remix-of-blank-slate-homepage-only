/**
 * AI Briefings MVP Component
 * 
 * Purpose: Display AI-generated briefings from emails
 * 
 * Safety features:
 * - Manual trigger only (no auto-refresh to prevent API spam)
 * - Loading states to prevent UI freeze
 * - Error handling with user-friendly messages
 * - Disabled button during processing
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { useState } from "react";

// Types (TODO: regenerate Supabase types after migration)
interface AIBriefing {
    id: string;
    title: string;
    message: string;
    priority: string;
    icon: string;
    read_at: string | null;
    created_at: string;
    ai_knowledge_base?: {
        source_email_id: string;
        extraction_raw: any;
    };
}

export function AIBriefingsMVP({ activeAccount }: { activeAccount?: any }) {
    const queryClient = useQueryClient();
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastProcessResult, setLastProcessResult] = useState<any>(null);

    // If no active account, show message
    if (!activeAccount) {
        return (
            <Card className="p-12 text-center">
                <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nessun account configurato</h3>
                <p className="text-sm text-muted-foreground">
                    Configura un account email per iniziare a usare AI Briefings.
                </p>
            </Card>
        );
    }

    // Fetch briefings (manual refresh only) - FILTERED BY ACCOUNT
    const { data: briefings = [], isLoading, error, refetch } = useQuery({
        queryKey: ["ai-briefings-mvp", activeAccount?.id],
        queryFn: async () => {
            // Query briefings with JOIN through ai_knowledge_base to emails_ricevute
            // to filter by account
            const { data, error } = await supabase
                .from("ai_briefings" as any) // TODO: regenerate types
                .select(`
                    *,
                    ai_knowledge_base!inner (
                        source_email_id,
                        extraction_raw,
                        emails_ricevute!inner (
                            id_account
                        )
                    )
                `)
                .eq("ai_knowledge_base.emails_ricevute.id_account", activeAccount.id)
                .order("created_at", { ascending: false })
                .limit(20);

            if (error) throw error;
            return (data || []) as AIBriefing[];
        },
        enabled: !!activeAccount,
        refetchInterval: false, // IMPORTANT: NO auto-refresh
        refetchOnWindowFocus: false
    });

    // Manual trigger: process last 10 unprocessed emails
    const processEmails = async () => {
        setIsProcessing(true);
        setLastProcessResult(null);

        try {
            // 1. Get last 10 unprocessed emails FOR CURRENT ACCOUNT
            const { data: processedEmailIds } = await supabase
                .from("ai_knowledge_base" as any)
                .select("source_email_id");

            const processedIds = new Set((processedEmailIds || []).map((r: any) => r.source_email_id));

            const { data: allEmails, error: fetchError } = await supabase
                .from("emails_ricevute")
                .select("id")
                .eq("id_account", activeAccount.id) // ← FILTER BY ACCOUNT
                .order("data_ricezione_server", { ascending: false })
                .limit(50); // Get more, filter client-side

            if (fetchError) throw fetchError;

            // Filter unprocessed
            const unprocessedEmails = (allEmails || [])
                .filter((email: any) => !processedIds.has(email.id))
                .slice(0, 10);

            if (unprocessedEmails.length === 0) {
                alert("✅ Nessuna email nuova da processare! Tutte le email recenti sono già state analizzate.");
                setIsProcessing(false);
                return;
            }

            const email_ids = unprocessedEmails.map((e: any) => e.id);

            // 2. Call Edge Function
            const { data, error } = await supabase.functions.invoke("ai-extract-facts-mvp", {
                body: { email_ids }
            });

            if (error) {
                console.error("Edge Function error:", error);
                throw new Error(error.message || "Errore durante l'analisi");
            }

            // 3. Show result
            setLastProcessResult(data);

            const { successful = 0, skipped = 0, processed = 0 } = data;

            if (successful === 0) {
                alert(`⚠️ Processate ${processed} email, ma nessuna conteneva informazioni rilevanti.\n\nMotivi: ${skipped} email saltate (già processate, vuote, o irrilevanti)`);
            } else {
                alert(`✅ Analisi completata!\n\nProcessate: ${processed} email\nBriefing generati: ${successful}\nSaltate: ${skipped}`);
            }

            // 4. Refresh briefings
            queryClient.invalidateQueries({ queryKey: ["ai-briefings-mvp", activeAccount.id] });

        } catch (err: any) {
            console.error("Error processing emails:", err);
            alert(`❌ Errore: ${err.message}\n\nVerifica che OPENAI_API_KEY sia configurata correttamente.`);
        } finally {
            setIsProcessing(false);
        }
    };

    // Mark as read
    const markRead = useMutation({
        mutationFn: async (briefing_id: string) => {
            const { error } = await supabase
                .from("ai_briefings" as any)
                .update({ read_at: new Date().toISOString() })
                .eq("id", briefing_id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ai-briefings-mvp"] });
        }
    });

    const unreadCount = briefings.filter(b => !b.read_at).length;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-purple-500" />
                        AI Briefings
                        <Badge variant="outline" className="ml-2">BETA</Badge>
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {unreadCount > 0 && `${unreadCount} non letti • `}
                        {briefings.length} totali
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={() => refetch()}
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                    >
                        Aggiorna Lista
                    </Button>

                    <Button
                        onClick={processEmails}
                        disabled={isProcessing}
                        size="lg"
                    >
                        {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        🤖 Analizza Ultime Email
                    </Button>
                </div>
            </div>

            {/* Error state */}
            {error && (
                <Card className="p-4 border-red-200 bg-red-50">
                    <div className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="w-5 h-5" />
                        <p className="font-semibold">Errore caricamento briefings</p>
                    </div>
                    <p className="text-sm text-red-600 mt-1">{(error as Error).message}</p>
                </Card>
            )}

            {/* Loading state */}
            {isLoading ? (
                <div className="text-center p-12">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-3">Caricamento briefings...</p>
                </div>
            ) : briefings.length === 0 ? (
                /* Empty state */
                <Card className="p-12 text-center">
                    <Sparkles className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nessun briefing disponibile</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Clicca "Analizza Ultime Email" per generare briefing dalle email recenti.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        L'AI analizzerà le ultime 10 email non ancora processate ed estrarrà<br />
                        solo le informazioni rilevanti per te.
                    </p>
                </Card>
            ) : (
                /* Briefings list */
                <div className="space-y-3">
                    {briefings.map(briefing => (
                        <BriefingCard
                            key={briefing.id}
                            briefing={briefing}
                            onMarkRead={() => markRead.mutate(briefing.id)}
                        />
                    ))}
                </div>
            )}

            {/* Debug info (MVP only) */}
            {lastProcessResult && (
                <Card className="p-3 bg-gray-50 border-gray-200">
                    <details>
                        <summary className="text-xs font-mono cursor-pointer text-gray-600">
                            Debug: Ultimo risultato processing
                        </summary>
                        <pre className="text-xs mt-2 overflow-auto">
                            {JSON.stringify(lastProcessResult, null, 2)}
                        </pre>
                    </details>
                </Card>
            )}
        </div>
    );
}

// Briefing Card Component
interface BriefingCardProps {
    briefing: AIBriefing;
    onMarkRead: () => void;
}

function BriefingCard({ briefing, onMarkRead }: BriefingCardProps) {
    const priorityStyles: Record<string, string> = {
        urgent: "border-l-red-500 bg-red-50",
        high: "border-l-orange-500 bg-orange-50",
        medium: "border-l-blue-500 bg-blue-50",
        low: "border-l-green-500 bg-green-50"
    };

    const isRead = !!briefing.read_at;

    return (
        <Card className={`
            p-4 border-l-4 transition-all
            ${priorityStyles[briefing.priority] || priorityStyles.medium}
            ${isRead ? 'opacity-60' : 'shadow-md'}
        `}>
            <div className="flex gap-3">
                {/* Icon */}
                <div className="text-3xl flex-shrink-0">{briefing.icon}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Header badges */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant={briefing.priority === 'urgent' ? 'destructive' : 'default'}>
                            {briefing.priority.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                            {new Date(briefing.created_at).toLocaleString('it-IT', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                        {isRead && <Badge variant="outline" className="text-xs">Letto</Badge>}
                    </div>

                    {/* Title & Message */}
                    <h3 className="font-semibold text-base mb-1 line-clamp-2">{briefing.title}</h3>
                    <p className="text-sm text-gray-700 line-clamp-3">{briefing.message}</p>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                        {!isRead && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onMarkRead}
                            >
                                Segna Letto ✓
                            </Button>
                        )}

                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                                // TODO: Navigate to email (Phase 2)
                                alert("TODO: Aprire email originale");
                            }}
                        >
                            Vedi Email
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
