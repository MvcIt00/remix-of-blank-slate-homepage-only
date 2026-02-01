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
        <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/20 border-r border-slate-200 dark:border-slate-800">
            {/* Search Header */}
            <div className="p-4 border-b bg-white dark:bg-background/50 sticky top-0 z-20">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black dark:text-white transition-colors group-focus-within:text-primary" />
                    <Input
                        placeholder="Cerca conversazione..."
                        className="pl-9 h-9 bg-slate-100/50 border-transparent focus:bg-white focus:border-primary/30 transition-all rounded-xl text-[13px] text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                    {filteredThreads.map((thread) => {
                        const isSelected = selectedThreadId === thread.id;
                        const lastEmail = thread.latest;
                        const hasUnread = thread.emails.some(e => e.direzione === 'ricevuta' && e.stato === 'non_letta');

                        return (
                            <div key={thread.id} className="flex flex-col">
                                {/* Thread Header - Click to open Chat View */}
                                <div
                                    onClick={() => {
                                        onSelectThread(thread.id);
                                        onSelectEmail(null); // Reset sub-selection to show Chat View
                                    }}
                                    className={cn(
                                        "p-4 cursor-pointer transition-all duration-200 hover:bg-white group relative",
                                        isSelected && !selectedEmailId ? "bg-white dark:bg-slate-800/40 shadow-sm z-10" : "bg-transparent"
                                    )}
                                >
                                    {/* Selection Indicator */}
                                    {isSelected && !selectedEmailId && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                                    )}

                                    <div className="flex justify-between items-start mb-1.5">
                                        <div className="flex items-center gap-2 min-w-0">
                                            {isSelected ? (
                                                <ChevronDown className="h-3.5 w-3.5 text-primary shrink-0" />
                                            ) : (
                                                <ChevronRight className="h-3.5 w-3.5 text-black/40 dark:text-white/40 shrink-0 group-hover:text-black dark:group-hover:text-white" />
                                            )}
                                            <span className={cn(
                                                "text-[15.5px] font-bold truncate tracking-tight",
                                                hasUnread ? "text-black dark:text-white" : "text-black/90 dark:text-white/90"
                                            )}>
                                                {lastEmail.da_nome || lastEmail.da_email}
                                            </span>
                                        </div>
                                        <span className="text-[11px] whitespace-nowrap text-black dark:text-white ml-2 font-bold uppercase tracking-tight">
                                            {formatThreadDate(lastEmail.dataOrd)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-2">
                                        <p className={cn(
                                            "text-[13px] truncate flex-1 leading-snug",
                                            hasUnread ? "font-black text-black dark:text-white" : "text-black/80 dark:text-white/80 font-medium"
                                        )}>
                                            {lastEmail.oggetto || "(Nessun oggetto)"}
                                        </p>
                                        {thread.count > 1 && (
                                            <div className="h-4.5 min-w-[18px] px-1 rounded-full bg-slate-200 dark:bg-slate-700 border border-black/10 flex items-center justify-center text-[10px] font-black text-black dark:text-white">
                                                {thread.count}
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-[12px] text-black/70 dark:text-white/70 truncate mt-1 line-clamp-1 italic font-medium">
                                        {lastEmail.corpo_text?.slice(0, 60)}...
                                    </p>
                                </div>

                                {/* Expanded Email List - Only if selected */}
                                {isSelected && (
                                    <div className="bg-slate-50/80 dark:bg-slate-950/20 py-2 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300">
                                        {thread.emails.map((email) => {
                                            const isEmailSelected = selectedEmailId === email.id;
                                            return (
                                                <div
                                                    key={email.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSelectEmail(email.id);
                                                    }}
                                                    className={cn(
                                                        "px-8 py-2.5 cursor-pointer transition-colors hover:bg-primary/5 group relative",
                                                        isEmailSelected ? "bg-primary/10 text-primary" : "text-black dark:text-white"
                                                    )}
                                                >
                                                    {/* Dot indicator for the specific selected email */}
                                                    {isEmailSelected && (
                                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                                                    )}

                                                    <div className="flex flex-col gap-0.5 min-w-0">
                                                        <div className="flex justify-between items-center gap-2">
                                                            <span className={cn(
                                                                "text-[12px] font-black truncate flex items-center gap-1.5",
                                                                isEmailSelected ? "text-primary" : "text-black dark:text-white"
                                                            )}>
                                                                {email.direzione === 'inviata' ? (
                                                                    <Forward className="h-3 w-3 text-emerald-500" />
                                                                ) : (
                                                                    <Reply className="h-3 w-3 text-blue-500" />
                                                                )}
                                                                {format(new Date(email.dataOrd), "d MMM, HH:mm", { locale: it })}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] truncate text-black dark:text-white font-medium">
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
