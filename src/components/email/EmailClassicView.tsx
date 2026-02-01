/** ⚠️ ARCHITETTURA NON CONVENZIONALE - LEGGERE [src/components/email/README.md] PRIMA DI MODIFICARE ⚠️ */
import { format } from "date-fns";

import { it } from "date-fns/locale";
import { Paperclip, User, Mail, Calendar, ArrowLeft, Trash2, Archive, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmailManagementActions } from "@/hooks/useEmailManagement";
import { EmailActionsToolbar } from "./EmailActionsToolbar";
import { EmailAttachmentGallery } from "./EmailAttachmentGallery";
import { useEmailAttachments } from "@/hooks/useEmailAttachments";


interface EmailClassicViewProps {
    email: any;
    onBack?: () => void;
    actions: EmailManagementActions;
}

// Componente helper per EmailClassicView
function AttachmentSection({ email, isSent }: { email: any, isSent: boolean }) {
    const { data: attachments, isLoading } = useEmailAttachments(
        email.id,
        email.direzione || (isSent ? 'inviata' : 'ricevuta')
    );

    if (isLoading) return (
        <div className="flex items-center gap-2 animate-pulse py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-medium">Recupero allegati in corso...</span>
        </div>
    );

    if (!attachments || attachments.length === 0) return null;

    return <EmailAttachmentGallery attachments={attachments} isSent={isSent} />;
}


export function EmailClassicView({ email, onBack, actions }: EmailClassicViewProps) {
    if (!email) return null;

    const formattedDate = format(new Date(email.dataOrd || email.data_creazione), "EEEE d MMMM yyyy 'alle' HH:mm", { locale: it });

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-950 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Toolbar */}
            <div className="p-3 border-b flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 lg:hidden text-black dark:text-white">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <EmailActionsToolbar email={email} actions={actions} showText variant="default" />
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-6 text-[10px] font-bold uppercase">Classic View</Badge>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="max-w-4xl mx-auto p-6 lg:p-10 space-y-8">
                    {/* Failed Alert */}
                    {email.direzione === 'inviata' && email.stato !== 'inviata' && (
                        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                                    <Mail className="h-5 w-5 text-destructive" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-destructive text-sm uppercase">Invio Non Completato</h4>
                                    <p className="text-xs text-destructive/80 font-medium">Questo messaggio non è stato ancora inviato correttamente al destinatario.</p>
                                </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button
                                    variant="destructive"
                                    className="flex-1 sm:flex-none font-black uppercase text-[11px] h-9"
                                    onClick={() => actions.retrySend(email)}
                                >
                                    Riprova Invio
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 sm:flex-none font-bold uppercase text-[11px] h-9 border-destructive/30 text-destructive hover:bg-destructive/10"
                                    onClick={() => {
                                        if (confirm("Sei sicuro di voler eliminare questa bozza fallita?")) {
                                            actions.deleteSentEmail(email.id);
                                            onBack?.();
                                        }
                                    }}
                                >
                                    Elimina
                                </Button>
                            </div>
                        </div>
                    )}
                    {/* Headers */}
                    <div className="space-y-6">
                        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            {email.oggetto || "(Nessun oggetto)"}
                        </h1>

                        <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                                <User className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        {email.da_nome || email.da_email}
                                        <span className="text-xs font-normal text-muted-foreground font-mono">
                                            &lt;{email.da_email}&gt;
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white dark:bg-slate-800 px-2 py-1 rounded-md border shadow-sm">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {formattedDate}
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    <span className="font-medium mr-1">A:</span>
                                    {Array.isArray(email.a_emails)
                                        ? email.a_emails.map((a: any) => a.email).join(", ")
                                        : email.a_emails}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Body */}
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        {email.corpo_html ? (
                            <div
                                dangerouslySetInnerHTML={{ __html: email.corpo_html }}
                                className="email-content-classic [&_img]:max-w-full [&_img]:h-auto [&_a]:text-primary [&_a]:no-underline hover:[&_a]:underline"
                            />
                        ) : (
                            <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed font-sans text-base">
                                {email.corpo_text}
                            </p>
                        )}
                    </div>

                    {/* Attachments Section */}
                    {email.ha_allegati && (
                        <div className="pt-10">
                            <div className="flex items-center gap-2 mb-6">
                                <Paperclip className="h-5 w-5 text-primary" />
                                <h3 className="font-bold text-sm uppercase tracking-wider">Allegati Email</h3>
                            </div>
                            <AttachmentSection email={email} isSent={email.direzione === 'inviata'} />
                        </div>
                    )}

                    <div className="h-20" /> {/* Spacer */}
                </div>
            </ScrollArea>
        </div>
    );
}
