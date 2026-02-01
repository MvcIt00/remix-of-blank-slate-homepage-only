import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
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

    const invalidate = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["emails-ricevute"] });
        queryClient.invalidateQueries({ queryKey: ["emails-inviate"] });
    }, [queryClient]);

    const archive = useCallback(async (id: string, direzione: 'ricevuta' | 'inviata') => {
        const table = direzione === 'ricevuta' ? 'emails_ricevute' : 'emails_inviate';
        const queryKey = direzione === 'ricevuta' ? ["emails-ricevute", accountId] : ["emails-inviate", accountId];

        // Optimistic Update
        queryClient.setQueryData(queryKey, (old: any[] | undefined) =>
            old?.filter(e => e.id !== id)
        );

        const { error } = await supabase
            .from(table as any)
            .update({ stato: 'archiviata' } as any)
            .eq('id', id);

        if (error) {
            toast.error(`Errore archiviazione: ${error.message}`);
            invalidate(); // Rollback/Refetch on error
        } else {
            toast.success("Email archiviata");
        }
    }, [accountId, queryClient, invalidate]);

    const trash = useCallback(async (id: string, direzione: 'ricevuta' | 'inviata') => {
        const table = direzione === 'ricevuta' ? 'emails_ricevute' : 'emails_inviate';
        const queryKey = direzione === 'ricevuta' ? ["emails-ricevute", accountId] : ["emails-inviate", accountId];

        // Optimistic Update
        queryClient.setQueryData(queryKey, (old: any[] | undefined) =>
            old?.filter(e => e.id !== id)
        );

        const { error } = await supabase
            .from(table as any)
            .update({ stato: 'eliminata' } as any)
            .eq('id', id);

        if (error) {
            toast.error(`Errore eliminazione: ${error.message}`);
            invalidate();
        } else {
            toast.success("Email spostata nel cestino");
        }
    }, [accountId, queryClient, invalidate]);

    const markRead = useCallback(async (id: string) => {
        const queryKey = ["emails-ricevute", accountId];

        // Optimistic Update
        queryClient.setQueryData(queryKey, (old: any[] | undefined) =>
            old?.map(e => e.id === id ? { ...e, stato: 'letta', data_lettura: new Date().toISOString() } : e)
        );

        const { error } = await supabase
            .from('emails_ricevute' as any)
            .update({ stato: 'letta', data_lettura: new Date().toISOString() } as any)
            .eq('id', id);

        if (error) {
            toast.error(error.message);
            invalidate();
        }
    }, [accountId, queryClient, invalidate]);

    const markMultipleAsRead = useCallback(async (ids: string[]) => {
        if (ids.length === 0) return;
        const queryKey = ["emails-ricevute", accountId];

        // Optimistic Update
        queryClient.setQueryData(queryKey, (old: any[] | undefined) =>
            old?.map(e => ids.includes(e.id) ? { ...e, stato: 'letta', data_lettura: new Date().toISOString() } : e)
        );

        const { error } = await supabase
            .from('emails_ricevute' as any)
            .update({ stato: 'letta', data_lettura: new Date().toISOString() } as any)
            .in('id', ids);

        if (error) {
            toast.error(error.message);
            invalidate();
        }
    }, [accountId, queryClient, invalidate]);

    const markUnread = useCallback(async (id: string) => {
        const queryKey = ["emails-ricevute", accountId];

        // Optimistic Update
        queryClient.setQueryData(queryKey, (old: any[] | undefined) =>
            old?.map(e => e.id === id ? { ...e, stato: 'non_letta' } : e)
        );

        const { error } = await supabase
            .from('emails_ricevute' as any)
            .update({ stato: 'non_letta' } as any)
            .eq('id', id);

        if (error) {
            toast.error(error.message);
            invalidate();
        } else {
            toast.success("Segnata come non letta");
        }
    }, [accountId, queryClient, invalidate]);

    const prepareReply = useCallback((email: any, thread?: EmailThread) => {
        const to = email.direzione === 'ricevuta' ? email.da_email : email.a_emails?.[0]?.email;
        const subject = email.oggetto?.toLowerCase().startsWith("re:") ? email.oggetto : `Re: ${email.oggetto || ""}`;

        setComposerDefaults({
            to,
            subject,
            threadId: thread?.id.startsWith('sub-') ? undefined : thread?.id
        });
        setComposerOpen(true);
    }, [setComposerDefaults, setComposerOpen]);

    const prepareForward = useCallback((email: any) => {
        const subject = email.oggetto?.toLowerCase().startsWith("fwd:") ? email.oggetto : `Fwd: ${email.oggetto || ""}`;
        const header = `\n\n---------- Messaggio Inoltrato ----------\nDa: ${email.da_nome} <${email.da_email}>\nData: ${new Date(email.data_creazione).toLocaleString('it-IT')}\nOggetto: ${email.oggetto}\n\n`;

        setComposerDefaults({
            subject,
            body: header + (email.corpo_text || "")
        });
        setComposerOpen(true);
    }, [setComposerDefaults, setComposerOpen]);

    const retrySend = useCallback(async (email: any) => {
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
    }, [invalidate]);

    const deleteSentEmail = useCallback(async (id: string) => {
        const queryKey = ["emails-inviate", accountId];

        // Optimistic Update
        queryClient.setQueryData(queryKey, (old: any[] | undefined) =>
            old?.filter(e => e.id !== id)
        );

        const { error } = await supabase
            .from('emails_inviate' as any)
            .delete()
            .eq('id', id);

        if (error) {
            toast.error(`Errore eliminazione: ${error.message}`);
            invalidate();
        } else {
            toast.success("Messaggio rimosso");
        }
    }, [accountId, queryClient, invalidate]);

    return useMemo(() => ({
        archive,
        trash,
        markRead,
        markMultipleAsRead,
        markUnread,
        prepareReply,
        prepareForward,
        retrySend,
        deleteSentEmail
    }), [
        archive,
        trash,
        markRead,
        markMultipleAsRead,
        markUnread,
        prepareReply,
        prepareForward,
        retrySend,
        deleteSentEmail
    ]);
}
