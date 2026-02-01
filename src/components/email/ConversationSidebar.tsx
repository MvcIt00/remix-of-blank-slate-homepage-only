import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Search, ChevronDown, ChevronRight, Mail, Reply, Forward } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { EmailThread } from "@/hooks/useEmailThreads";
import { useState } from "react";

interface ConversationSidebarProps {
    threads: EmailThread[];
    selectedThreadId: string | null;
    selectedEmailId: string | null;
    onSelectThread: (id: string | null) => void;
    onSelectEmail: (id: string | null) => void;
}

export function ConversationSidebar({
    threads,
    selectedThreadId,
    selectedEmailId,
    onSelectThread,
    onSelectEmail
}: ConversationSidebarProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedThreadIds, setExpandedThreadIds] = useState<Set<string>>(new Set());

    const toggleExpand = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newSet = new Set(expandedThreadIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedThreadIds(newSet);
    };

    const filteredThreads = threads.filter(thread => {
        const lastEmail = thread.latest;
        const searchStr = `${lastEmail.da_nome || ""} ${lastEmail.da_email} ${lastEmail.oggetto || ""}`.toLowerCase();
        return searchStr.includes(searchQuery.toLowerCase());
    });

    const formatThreadDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        if (date.toDateString() === now.toDateString()) {
            return format(date, "HH:mm");
        }
        return format(date, "d MMM", { locale: it });
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/20 border-r border-slate-200 dark:border-slate-800 focus-within:ring-0">
            {/* Search Header */}
            <div className="p-4 border-b bg-white dark:bg-background/50 sticky top-0 z-20">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black dark:text-white transition-colors group-focus-within:text-primary" />
                    <Input
                        placeholder="Cerca conversazione..."
                        className="pl-9 h-9 bg-slate-100/50 border-transparent focus:bg-white focus:border-primary/30 transition-all rounded-xl text-[13px] text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50 shadow-none ring-0 outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <ScrollArea className="flex-1 px-2.5 py-4">
                <div className="space-y-2">
                    {filteredThreads.map((thread) => {
                        const isSelected = selectedThreadId === thread.id;
                        const isExpanded = expandedThreadIds.has(thread.id);
                        const lastEmail = thread.latest;
                        const hasUnread = thread.emails.some(e => e.direzione === 'ricevuta' && e.stato === 'non_letta');

                        return (
                            <div key={thread.id} className="flex flex-col pr-1">
                                {/* Thread Card */}
                                <div
                                    onClick={() => {
                                        if (isSelected) {
                                            const newSet = new Set(expandedThreadIds);
                                            if (newSet.has(thread.id)) newSet.delete(thread.id);
                                            else newSet.add(thread.id);
                                            setExpandedThreadIds(newSet);
                                        } else {
                                            onSelectThread(thread.id);
                                            onSelectEmail(null);
                                        }
                                    }}
                                    className={cn(
                                        "p-2.5 cursor-pointer transition-all duration-300 rounded-xl group relative border",
                                        isSelected
                                            ? "bg-white dark:bg-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.08)] border-primary/30 ring-1 ring-primary/10"
                                            : "bg-white/40 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                                    )}
                                >
                                    {/* Unread Indicator Dot - Più discreto */}
                                    {hasUnread && (
                                        <div className="absolute left-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                                    )}

                                    {/* Message Counter - Top Right */}
                                    {thread.count > 1 && (
                                        <div className="absolute top-2.5 right-2 h-4 min-w-[16px] px-1 rounded bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-[9px] font-black text-black/60 dark:text-white/60">
                                            {thread.count}
                                        </div>
                                    )}

                                    <div className="flex justify-between items-start mb-1 pr-6">
                                        <div className="flex items-center gap-2 min-w-0">
                                            {/* Dedicated Expansion Toggle */}
                                            <button
                                                onClick={(e) => toggleExpand(e, thread.id)}
                                                className={cn(
                                                    "h-5 w-5 rounded-md flex items-center justify-center transition-colors shrink-0",
                                                    isExpanded ? "bg-primary/20 text-primary" : "bg-slate-100 dark:bg-slate-800 text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white"
                                                )}
                                            >
                                                {isExpanded ? (
                                                    <ChevronDown className="h-3 w-3" />
                                                ) : (
                                                    <ChevronRight className="h-3 w-3" />
                                                )}
                                            </button>
                                            <span className={cn(
                                                "text-[14px] font-bold truncate tracking-tight text-black dark:text-white",
                                                hasUnread ? "opacity-100" : "opacity-90"
                                            )}>
                                                {lastEmail.da_nome || lastEmail.da_email}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pl-7 pr-1">
                                        <p className={cn(
                                            "text-[12.5px] truncate leading-tight",
                                            hasUnread ? "font-black text-black dark:text-white" : "text-black/70 dark:text-white/70 font-semibold"
                                        )}>
                                            {lastEmail.oggetto || "(Nessun oggetto)"}
                                        </p>

                                        <p className="text-[11px] text-black/40 dark:text-white/40 truncate mt-0.5 font-medium">
                                            {lastEmail.corpo_text?.slice(0, 50)}...
                                        </p>
                                    </div>

                                    <div className="absolute bottom-2 right-2 text-[9px] text-black/30 dark:text-white/30 font-bold uppercase">
                                        {formatThreadDate(lastEmail.dataOrd)}
                                    </div>
                                </div>

                                {/* Expanded Email List - Independent Logic */}
                                {isExpanded && (
                                    <div className="mt-2 ml-4 space-y-1 relative border-l-2 border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-left-2 duration-300">
                                        {thread.emails.map((email, idx) => {
                                            const isEmailSelected = selectedEmailId === email.id;
                                            return (
                                                <div
                                                    key={email.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSelectThread(thread.id);
                                                        onSelectEmail(email.id);
                                                    }}
                                                    className={cn(
                                                        "pl-6 pr-4 py-2.5 cursor-pointer transition-all duration-200 flex items-center gap-3 relative group",
                                                        isEmailSelected
                                                            ? "bg-primary/10 text-primary font-bold"
                                                            : "hover:bg-primary/5 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white"
                                                    )}
                                                >
                                                    {/* Connectivity visual indicator */}
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-[2px] bg-slate-200 dark:border-slate-800" />

                                                    <div className={cn(
                                                        "h-6 w-6 rounded-md flex items-center justify-center shrink-0 border",
                                                        isEmailSelected ? "bg-primary text-white border-primary" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                                    )}>
                                                        {email.direzione === 'inviata' ? (
                                                            <Forward className="h-3 w-3" />
                                                        ) : (
                                                            <Reply className="h-3 w-3" />
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col min-w-0 overflow-hidden">
                                                        <span className="text-[11px] font-bold uppercase tracking-tight opacity-70 mb-0.5">
                                                            {format(new Date(email.dataOrd), "d MMM, HH:mm", { locale: it })}
                                                        </span>
                                                        <p className="text-[12px] truncate font-medium">
                                                            {email.corpo_text || "(Nessun contenuto)"}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {filteredThreads.length === 0 && (
                        <div className="p-10 text-center text-muted-foreground">
                            <Mail className="h-10 w-10 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">Nessuna conversazione trovata</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
