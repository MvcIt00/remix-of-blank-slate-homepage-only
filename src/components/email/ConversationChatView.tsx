import { useRef, useEffect, useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Paperclip, User, Bot, Mail, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmailThread } from "@/hooks/useEmailThreads";
import { cleanEmailBody, CleanedEmail } from "@/lib/emailUtils";

interface ConversationChatViewProps {
    thread: EmailThread;
}

export function ConversationChatView({ thread }: ConversationChatViewProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when thread changes or messages are added
    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [thread]);

    const formatMessageDate = (dateStr: string) => {
        return format(new Date(dateStr), "HH:mm", { locale: it });
    };

    const formatSectionDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        if (date.toDateString() === now.toDateString()) return "Oggi";
        return format(date, "EEEE d MMMM", { locale: it });
    };

    return (
        <div className="flex flex-col h-full bg-background relative overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b bg-background/80 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {thread.latest.da_nome?.charAt(0) || thread.latest.da_email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-semibold text-[15.5px] leading-none mb-1">
                            {thread.latest.da_nome || thread.latest.da_email}
                        </h3>
                        <p className="text-[12px] text-muted-foreground truncate max-w-[300px]">
                            {thread.latest.oggetto || "(Nessun oggetto)"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[11px] font-normal py-0 px-2.5 h-6 bg-muted/30">
                        {thread.count} messaggi
                    </Badge>
                </div>
            </div>

            {/* Chat Area */}
            <ScrollArea ref={scrollRef} className="flex-1 p-4 lg:p-6 bg-slate-50/50 dark:bg-slate-950/20">
                <div className="max-w-4xl mx-auto space-y-8">
                    {thread.emails.map((email, index) => {
                        return (
                            <MessageBubble
                                key={email.id}
                                email={email}
                                isSent={email.direzione === "inviata"}
                                showDateSeparator={index === 0 ||
                                    new Date(thread.emails[index - 1].dataOrd).toDateString() !== new Date(email.dataOrd).toDateString()
                                }
                                formatSectionDate={formatSectionDate}
                                formatMessageDate={formatMessageDate}
                            />
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}

// Componente interno per la singola bolla con stato locale per espansione
function MessageBubble({ email, isSent, showDateSeparator, formatSectionDate, formatMessageDate }: any) {
    const [showFull, setShowFull] = useState(false);

    // Puliamo il corpo del messaggio
    const cleaned = cleanEmailBody(
        email.corpo_html || email.corpo_text,
        !!email.corpo_html
    );

    return (
        <div className="space-y-4">
            {showDateSeparator && (
                <div className="flex justify-center my-6">
                    <span className="px-3 py-1.5 rounded-full bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border border-muted-foreground/10">
                        {formatSectionDate(email.dataOrd)}
                    </span>
                </div>
            )}

            <div className={cn(
                "flex items-end gap-2 group",
                isSent ? "flex-row-reverse" : "flex-row"
            )}>
                {/* Avatar/Icon */}
                <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm",
                    isSent ? "bg-primary text-primary-foreground border-primary" : "bg-white dark:bg-muted text-foreground border-muted-foreground/20"
                )}>
                    {isSent ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>

                {/* Bubble */}
                <div className={cn(
                    "flex flex-col max-w-[85%] lg:max-w-[70%]",
                    isSent ? "items-end" : "items-start"
                )}>
                    <div className={cn(
                        "flex items-center gap-2 mb-1 px-1",
                        isSent ? "flex-row-reverse" : "flex-row text-left"
                    )}>
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                            {isSent ? "Sistema (Tu)" : (email.da_nome || email.da_email)}
                        </span>
                        <Separator orientation="vertical" className="h-2 bg-muted-foreground/30" />
                        <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-tight">
                            {format(new Date(email.dataOrd), "d MMM yyyy 'alle' HH:mm", { locale: it })}
                        </span>
                    </div>

                    <div className={cn(
                        "relative p-3 lg:p-4 rounded-2xl shadow-sm transition-all duration-200 w-full",
                        isSent
                            ? "bg-primary text-primary-foreground rounded-tr-none hover:shadow-md"
                            : "bg-white dark:bg-muted/50 border border-muted-foreground/10 rounded-tl-none hover:shadow-md dark:hover:bg-muted"
                    )}>
                        {/* HTML or Text Content - PULITO */}
                        <div className={cn(
                            "text-[15.5px] leading-relaxed prose prose-sm max-w-none break-words",
                            isSent ? "text-primary-foreground prose-invert" : "text-foreground prose-neutral"
                        )}>
                            {email.corpo_html ? (
                                <div
                                    dangerouslySetInnerHTML={{ __html: showFull ? cleaned.original : cleaned.content }}
                                    className="email-content [&_img]:max-w-full [&_img]:h-auto [&_p]:mb-2"
                                />
                            ) : (
                                <p className="whitespace-pre-wrap">{showFull ? cleaned.original : cleaned.content}</p>
                            )}
                        </div>

                        {/* Pulsante "Mostra Altro" se pulito */}
                        {cleaned.isCleaned && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowFull(!showFull)}
                                className={cn(
                                    "mt-2 h-7 px-2.5 text-[11px] font-bold hover:bg-black/5 uppercase tracking-tighter shrink-0",
                                    isSent ? "text-primary-foreground/70 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {showFull ? (
                                    <><ChevronUp className="h-3 w-3 mr-1" /> Nascondi cronologia</>
                                ) : (
                                    <><ChevronDown className="h-3 w-3 mr-1" /> Mostra intera email</>
                                )}
                            </Button>
                        )}

                        {/* Attachments */}
                        {email.allegati?.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {email.allegati.map((file: any) => (
                                    <button
                                        key={file.id}
                                        className={cn(
                                            "flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-colors",
                                            isSent
                                                ? "bg-white/10 hover:bg-white/20 text-white"
                                                : "bg-muted hover:bg-muted/80 text-foreground border border-muted-foreground/10"
                                        )}
                                    >
                                        <Paperclip className="h-3 w-3" />
                                        <span className="truncate max-w-[120px]">{file.nome}</span>
                                    </button>
                                ))}
                            </div>
                        )}


                    </div>
                </div>
            </div>
        </div>
    );
}
