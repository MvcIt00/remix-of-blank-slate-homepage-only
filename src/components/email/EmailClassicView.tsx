import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Paperclip, User, Mail, Calendar, ArrowLeft, Trash2, Archive } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmailClassicViewProps {
    email: any;
    onBack?: () => void;
}

export function EmailClassicView({ email, onBack }: EmailClassicViewProps) {
    if (!email) return null;

    const formattedDate = format(new Date(email.dataOrd || email.data_creazione), "EEEE d MMMM yyyy 'alle' HH:mm", { locale: it });

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-950 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Toolbar */}
            <div className="p-3 border-b flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 lg:hidden">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold uppercase tracking-tight">
                            <Archive className="h-3.5 w-3.5 mr-1.5" /> Archivia
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold uppercase tracking-tight text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Elimina
                        </Button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-6 text-[10px] font-bold uppercase">Classic View</Badge>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="max-w-4xl mx-auto p-6 lg:p-10 space-y-8">
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
                    {email.allegati?.length > 0 && (
                        <div className="pt-10">
                            <div className="flex items-center gap-2 mb-4">
                                <Paperclip className="h-5 w-5 text-primary" />
                                <h3 className="font-bold text-sm uppercase tracking-wider">Allegati ({email.allegati.length})</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {email.allegati.map((file: any) => (
                                    <div
                                        key={file.id}
                                        className="group p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex items-center gap-3"
                                    >
                                        <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                            <Paperclip className="h-5 w-5 text-slate-500 group-hover:text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100">
                                                {file.nome}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold">
                                                File {file.estensione || 'Binario'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="h-20" /> {/* Spacer */}
                </div>
            </ScrollArea>
        </div>
    );
}
