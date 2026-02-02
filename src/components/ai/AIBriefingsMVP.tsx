/** ⚠️ ARCHITETTURA NON CONVENZIONALE - LEGGERE [/docs/AI_BRIEFINGS_MVP_IMPLEMENTATION.md] PRIMA DI MODIFICARE ⚠️ */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Loader2,
    Sparkles,
    AlertCircle,
    Bot,
    RefreshCw,
    ExternalLink,
    Check,
    MessageSquareText
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Types
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

    if (!activeAccount) {
        return (
            <div className="h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-slate-50/50 border-2 border-dashed rounded-3xl m-4">
                <div className="text-center space-y-3 p-8">
                    <div className="h-16 w-16 mx-auto bg-slate-200/50 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold tracking-tight text-slate-900">Seleziona un account</h3>
                    <p className="text-sm text-slate-500 max-w-[240px]">L'intelligenza artificiale ha bisogno di un contesto email per generare briefing.</p>
                </div>
            </div>
        );
    }

    const { data: briefings = [], isLoading, error, refetch } = useQuery({
        queryKey: ["ai-briefings-mvp", activeAccount?.id],
        queryFn: async () => {
            const { data, error } = await (supabase
                .from("ai_briefings" as any)
                .select(`
                    *,
                    ai_knowledge_base!inner (
                        source_email_id,
                        extraction_raw,
                        emails_ricevute!inner ( id_account )
                    )
                `)
                .eq("ai_knowledge_base.emails_ricevute.id_account", activeAccount.id)
                .order("created_at", { ascending: false })
                .limit(20) as any);

            if (error) throw error;
            return (data || []) as unknown as AIBriefing[];
        },
        enabled: !!activeAccount,
    });

    const processEmails = async () => {
        setIsProcessing(true);
        try {
            const { data: processedEmailIds } = await (supabase
                .from("ai_knowledge_base" as any)
                .select("source_email_id") as any);

            const processedIds = new Set((processedEmailIds || []).map((r: any) => r.source_email_id));

            const { data: allEmails, error: fetchError } = await (supabase
                .from("emails_ricevute" as any)
                .select("id")
                .eq("id_account", activeAccount.id)
                .order("data_ricezione_server", { ascending: false })
                .limit(50) as any);

            if (fetchError) throw fetchError;

            const unprocessedEmails = (allEmails || [])
                .filter((email: any) => !processedIds.has(email.id))
                .slice(0, 10);

            if (unprocessedEmails.length === 0) {
                alert("Nessuna nuova email da analizzare.");
                setIsProcessing(false);
                return;
            }

            const { data, error } = await supabase.functions.invoke("ai-extract-facts-mvp", {
                body: { email_ids: unprocessedEmails.map((e: any) => e.id) }
            });

            if (error) throw new Error(error.message);
            queryClient.invalidateQueries({ queryKey: ["ai-briefings-mvp", activeAccount.id] });
        } catch (err: any) {
            alert(`Errore: ${err.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const markRead = useMutation({
        mutationFn: async (briefing_id: string) => {
            await supabase
                .from("ai_briefings" as any)
                .update({ read_at: new Date().toISOString() } as any)
                .eq("id", briefing_id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ai-briefings-mvp"] });
        }
    });

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col bg-white border shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden m-2 lg:m-4 animate-in fade-in duration-500">
            <header className="px-6 py-5 border-b bg-white/80 backdrop-blur-xl flex items-center justify-between shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-200">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <h2 className="text-[17px] font-black tracking-tight text-slate-900">Briefing Collega AI</h2>
                            <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-none text-[10px] font-bold h-4 px-1.5 rounded-md uppercase tracking-widest">v1.1</Badge>
                        </div>
                        <p className="text-[12px] font-medium text-slate-500 uppercase tracking-tight">
                            {briefings.filter(b => !b.read_at).length} priorità in sospeso
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-xl border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
                        onClick={() => refetch()}
                        disabled={isLoading}
                    >
                        <RefreshCw className={cn("h-4 w-4 text-slate-600", isLoading && "animate-spin")} />
                    </Button>
                    <Button
                        onClick={processEmails}
                        disabled={isProcessing}
                        className="h-9 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[12px] rounded-xl px-4 shadow-sm active:scale-95 transition-all"
                    >
                        {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                        Sincronizza
                    </Button>
                </div>
            </header>

            <ScrollArea className="flex-1 bg-slate-50/30">
                <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
                    {briefings.length === 0 && !isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-slate-200 rounded-full blur-2xl opacity-30 animate-pulse" />
                                <div className="relative h-24 w-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center border border-slate-100">
                                    <MessageSquareText className="h-10 w-10 text-slate-300" />
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Coda svuotata</h3>
                            <p className="text-sm text-slate-500 mt-2 max-w-[280px] text-center leading-relaxed">Nessuna notifica automatica generata. Il tuo assistente è in attesa di nuove email.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-6">
                            {briefings.map((briefing, index) => (
                                <BriefingBubble
                                    key={briefing.id}
                                    briefing={briefing}
                                    index={index}
                                    onMarkRead={() => markRead.mutate(briefing.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}

function BriefingBubble({ briefing, index, onMarkRead }: { briefing: AIBriefing, index: number, onMarkRead: () => void }) {
    const isRead = !!briefing.read_at;

    return (
        <div
            className={cn(
                "flex items-start gap-3 group animate-in fade-in slide-in-from-bottom-3 duration-500",
                isRead && "opacity-40 grayscale"
            )}
            style={{ animationDelay: `${index * 80}ms` }}
        >
            <div className="h-9 w-9 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0 mt-1 transition-transform group-hover:scale-110">
                <Bot className="h-4 w-4 text-slate-400" />
            </div>

            <div className="flex flex-col max-w-[90%] items-start space-y-1.5">
                <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                        Assistente
                        {briefing.priority === 'urgent' && <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        {format(new Date(briefing.created_at), "HH:mm", { locale: it })}
                    </span>
                </div>

                <div className={cn(
                    "relative bg-white border border-slate-200/80 p-4 rounded-3xl rounded-tl-none shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)]",
                    "group-hover:shadow-lg group-hover:shadow-slate-200/30 transition-all duration-300",
                    "w-full cursor-default"
                )}>
                    <div className="absolute -top-3 -right-2 text-2xl drop-shadow-sm select-none transition-transform group-hover:rotate-12">
                        {briefing.icon}
                    </div>

                    <div className="space-y-1">
                        <h4 className="font-bold text-[14px] lg:text-[15px] text-slate-900 leading-tight tracking-tight">
                            {briefing.title}
                        </h4>
                        <p className="text-[13px] lg:text-[14.5px] text-slate-600 leading-relaxed font-medium">
                            {briefing.message}
                        </p>
                    </div>

                    <div className="absolute -bottom-3 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                        {!isRead && (
                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-7 px-3 rounded-full bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-bold border-2 border-white shadow-md transition-all active:scale-90"
                                onClick={onMarkRead}
                            >
                                <Check className="h-3 w-3 mr-1" />
                                Fatto
                            </Button>
                        )}
                        <Button
                            variant="secondary"
                            size="sm"
                            className="h-7 px-3 rounded-full bg-white text-slate-600 hover:text-slate-900 border-2 border-slate-100 shadow-md text-[10px] font-bold transition-all active:scale-90"
                            onClick={() => alert("Apri contesto email...")}
                        >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Email
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
