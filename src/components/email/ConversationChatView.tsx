/** ⚠️ ARCHITETTURA NON CONVENZIONALE - LEGGERE [src/components/email/README.md] PRIMA DI MODIFICARE ⚠️ */
import { useRef, useEffect, useState } from "react";

import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Paperclip, Loader2, Smile, Send, MoreVertical, Reply, CornerUpRight, Trash2, Clock, Check, CheckCheck, User, Calendar, Mail, ArrowLeft, Archive, Bot, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmailThread } from "@/hooks/useEmailThreads";
import { EmailManagementActions } from "@/hooks/useEmailManagement";
import { EmailActionsToolbar } from "./EmailActionsToolbar";
import { cleanEmailBody, CleanedEmail } from "@/lib/emailUtils";
import { EmailAttachmentGallery } from "./EmailAttachmentGallery";
import { useEmailAttachments, useConversationAttachments } from "@/hooks/useEmailAttachments";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetDescription
} from "@/components/ui/sheet";


interface ConversationChatViewProps {
    thread: EmailThread;
    actions: EmailManagementActions;
}

export function ConversationChatView({ thread, actions }: ConversationChatViewProps) {
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

                    <ConversationFilesDrawer thread={thread} />
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
                                actions={actions}
                            />
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}

// Componente per il caricamento asincrono degli allegati (per non bloccare il render della bolla)
function AttachmentSection({ email, isSent }: { email: any, isSent: boolean }) {
    const { data: attachments, isLoading } = useEmailAttachments(
        email.id,
        email.direzione || (isSent ? 'inviata' : 'ricevuta')
    );

    if (isLoading) return (
        <div className="mt-4 flex items-center gap-2 animate-pulse">
            <Paperclip className="h-3 w-3 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-tight">Caricamento allegati...</span>
        </div>
    );

    if (!attachments || attachments.length === 0) return null;

    return <EmailAttachmentGallery attachments={attachments} isSent={isSent} />;
}

// Componente per la vista aggregata di tutti i file nel thread
function ConversationFilesDrawer({ thread }: { thread: EmailThread }) {
    const emailIds = thread.emails.map(e => e.id);
    const { data: attachments, isLoading } = useConversationAttachments(emailIds);

    const hasAttachments = attachments && attachments.length > 0;

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-8 w-8 rounded-full transition-colors relative",
                        hasAttachments ? "text-primary hover:bg-primary/10" : "text-muted-foreground opacity-50 cursor-not-allowed"
                    )}
                    disabled={!hasAttachments}
                >
                    <Paperclip className="h-4 w-4" />
                    {hasAttachments && (
                        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-background">
                            {attachments.length}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[350px] sm:w-[450px] p-0 flex flex-col">
                <SheetHeader className="p-6 pb-2">
                    <SheetTitle className="text-xl font-bold flex items-center gap-2">
                        <Paperclip className="h-5 w-5 text-primary" />
                        File della Conversazione
                    </SheetTitle>
                    <SheetDescription>
                        Tutti gli allegati scambiati in questo thread.
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 p-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <p className="text-xs uppercase font-bold tracking-widest">Analisi thread...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <EmailAttachmentGallery
                                attachments={attachments || []}
                                className="grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-2"
                            />
                        </div>
                    )}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}



// Componente interno per la singola bolla con stato locale per espansione
function MessageBubble({ email, isSent, showDateSeparator, formatSectionDate, formatMessageDate, actions }: any) {
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
                        <span className="text-[11px] font-bold text-black dark:text-white">
                            {isSent ? "Sistema (Tu)" : (email.da_nome || email.da_email)}
                        </span>
                        <Separator orientation="vertical" className="h-2 bg-black/20 dark:bg-white/20" />
                        <span className="text-[11px] text-black/60 dark:text-white/60 font-medium uppercase tracking-tight">
                            {format(new Date(email.dataOrd), "d MMM yyyy 'alle' HH:mm", { locale: it })}
                        </span>

                        <div className="flex-1" />

                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <EmailActionsToolbar email={email} actions={actions} variant="compact" />
                        </div>
                    </div>

                    <div className={cn(
                        "relative p-3 lg:p-4 rounded-2xl shadow-sm transition-all duration-200 w-full",
                        isSent
                            ? (email.stato === 'inviata' ? "bg-primary text-primary-foreground rounded-tr-none hover:shadow-md" : "bg-destructive/10 text-destructive border border-destructive/20 rounded-tr-none")
                            : "bg-white dark:bg-muted/50 border border-muted-foreground/10 rounded-tl-none hover:shadow-md dark:hover:bg-muted"
                    )}>
                        {isSent && email.stato !== 'inviata' && (
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-destructive/10">
                                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-tight">
                                    <Bot className="h-3 w-3" />
                                    <span>Invio Fallito</span>
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="h-6 px-2 text-[10px] uppercase font-black"
                                        onClick={() => actions.retrySend(email)}
                                    >
                                        Riprova
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-6 px-2 text-[10px] uppercase font-bold border-destructive/20 text-destructive hover:bg-destructive/10"
                                        onClick={() => actions.deleteSentEmail(email.id)}
                                    >
                                        Elimina
                                    </Button>
                                </div>
                            </div>
                        )}
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
                        {email.ha_allegati && (
                            <AttachmentSection email={email} isSent={isSent} />
                        )}


                    </div>
                </div>
            </div>
        </div>
    );
}
