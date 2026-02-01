import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EmailThread } from "./useEmailThreads";

export interface EmailManagementActions {
    archive: (id: string, direzione: 'ricevuta' | 'inviata') => Promise<void>;
    trash: (id: string, direzione: 'ricevuta' | 'inviata') => Promise<void>;
    markRead: (id: string) => Promise<void>;
    markMultipleAsRead: (ids: string[]) => Promise<void>;
    markUnread: (id: string) => Promise<void>;
    prepareReply: (email: any, thread?: EmailThread) => void;
    prepareForward: (email: any) => void;
    retrySend: (email: any) => Promise<void>;
    deleteSentEmail: (id: string) => Promise<void>;
}

export function useEmailManagement(
    accountId: string | undefined,
    setComposerOpen: (open: boolean) => void,
    setComposerDefaults: (defaults: any) => void
): EmailManagementActions {
    const queryClient = useQueryClient();

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["emails_ricevute"] });
        queryClient.invalidateQueries({ queryKey: ["emails_inviate"] });
    };

    const archive = async (id: string, direzione: 'ricevuta' | 'inviata') => {
        const table = direzione === 'ricevuta' ? 'emails_ricevute' : 'emails_inviate';
        const { error } = await supabase
            .from(table as any)
            .update({ stato: 'archiviata' } as any)
            .eq('id', id);

        if (error) {
            toast.error(`Errore archiviazione: ${error.message}`);
        } else {
            toast.success("Email archiviata");
            invalidate();
        }
    };

    const trash = async (id: string, direzione: 'ricevuta' | 'inviata') => {
        const table = direzione === 'ricevuta' ? 'emails_ricevute' : 'emails_inviate';
        const { error } = await supabase
            .from(table as any)
            .update({ stato: 'eliminata' } as any)
            .eq('id', id);

        if (error) {
            toast.error(`Errore eliminazione: ${error.message}`);
        } else {
            toast.success("Email spostata nel cestino");
            invalidate();
        }
    };

    const markRead = async (id: string) => {
        const { error } = await supabase
            .from('emails_ricevute' as any)
            .update({ stato: 'letta', data_lettura: new Date().toISOString() } as any)
            .eq('id', id);

        if (error) toast.error(error.message);
        else invalidate();
    };

    const markMultipleAsRead = async (ids: string[]) => {
        if (ids.length === 0) return;
        const { error } = await supabase
            .from('emails_ricevute' as any)
            .update({ stato: 'letta', data_lettura: new Date().toISOString() } as any)
            .in('id', ids);

        if (error) toast.error(error.message);
        else invalidate();
    };

    const markUnread = async (id: string) => {
        const { error } = await supabase
            .from('emails_ricevute' as any)
            .update({ stato: 'non_letta' } as any)
            .eq('id', id);

        if (error) toast.error(error.message);
        else {
            toast.success("Segnata come non letta");
            invalidate();
        }
    };

    const prepareReply = (email: any, thread?: EmailThread) => {
        const to = email.direzione === 'ricevuta' ? email.da_email : email.a_emails?.[0]?.email;
        const subject = email.oggetto?.toLowerCase().startsWith("re:") ? email.oggetto : `Re: ${email.oggetto || ""}`;

        setComposerDefaults({
            to,
            subject,
            threadId: thread?.id.startsWith('sub-') ? undefined : thread?.id
        });
        setComposerOpen(true);
    };

    const prepareForward = (email: any) => {
        const subject = email.oggetto?.toLowerCase().startsWith("fwd:") ? email.oggetto : `Fwd: ${email.oggetto || ""}`;
        const header = `\n\n---------- Messaggio Inoltrato ----------\nDa: ${email.da_nome} <${email.da_email}>\nData: ${new Date(email.data_creazione).toLocaleString('it-IT')}\nOggetto: ${email.oggetto}\n\n`;

        setComposerDefaults({
            subject,
            body: header + (email.corpo_text || "")
        });
        setComposerOpen(true);
    };

    const retrySend = async (email: any) => {
        const toastId = toast.loading("Ri-tentativo invio in corso...");
        try {
            const { data, error } = await supabase.functions.invoke("email-smtp-send", {
                body: {
                    accountId: email.id_account,
                    to: email.a_emails.map((a: any) => a.email),
                    subject: email.oggetto,
                    text: email.corpo_text,
                    html: email.corpo_html,
                    threadId: email.id_conversazione,
                    inReplyTo: email.in_reply_to,
                    references: email.references_chain || [],
                    id_anagrafica: email.id_anagrafica,
                    id_noleggio: email.id_noleggio,
                    id_preventivo: email.id_preventivo
                },
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            toast.success("Email inviata correttamente", { id: toastId });
            invalidate();
        } catch (error: any) {
            console.error("Retry Error:", error);
            toast.error(`Errore ri-invio: ${error.message}`, { id: toastId });
        }
    };

    const deleteSentEmail = async (id: string) => {
        const { error } = await supabase
            .from('emails_inviate' as any)
            .delete()
            .eq('id', id);

        if (error) {
            toast.error(`Errore eliminazione: ${error.message}`);
        } else {
            toast.success("Messaggio rimosso");
            invalidate();
        }
    };

    return {
        archive,
        trash,
        markRead,
        markMultipleAsRead,
        markUnread,
        prepareReply,
        prepareForward,
        retrySend,
        deleteSentEmail
    };
}
