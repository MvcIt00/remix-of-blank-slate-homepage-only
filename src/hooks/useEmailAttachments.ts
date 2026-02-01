/** ⚠️ ARCHITETTURA NON CONVENZIONALE - LEGGERE [src/components/email/README.md] PRIMA DI MODIFICARE ⚠️ */
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export interface EmailAttachment {
    id: string;
    id_email_ricevuta: string | null;
    id_email_inviata: string | null;
    nome_file: string;
    tipo_mime: string;
    dimensione_bytes: number;
    storage_path: string;
    content_id: string | null;
    is_inline: boolean | null;
    creato_il: string;
}

/**
 * Hook per recuperare gli allegati di una specifica email
 */
export function useEmailAttachments(emailId: string, direzione: 'ricevuta' | 'inviata') {
    return useQuery({
        queryKey: ["email-attachments", emailId],
        queryFn: async () => {
            if (!emailId) return [];

            const column = direzione === 'ricevuta' ? 'id_email_ricevuta' : 'id_email_inviata';

            const { data, error } = await supabase
                .from("allegati_email" as any)
                .select("*")
                .eq(column, emailId);

            if (error) throw error;
            return data as any as EmailAttachment[];
        },
        enabled: !!emailId,
        staleTime: 1000 * 60 * 5, // 5 minuti di cache
    });
}

/**
 * Hook per recuperare tutti gli allegati di una conversazione (vista aggregata)
 */
export function useConversationAttachments(emailIds: string[]) {
    return useQuery({
        queryKey: ["conversation-attachments", emailIds.join(',')],
        queryFn: async () => {
            if (!emailIds.length) return [];

            const { data, error } = await supabase
                .from("allegati_email" as any)
                .select("*")
                .or(`id_email_ricevuta.in.(${emailIds.join(',')}),id_email_inviata.in.(${emailIds.join(',')})`);

            if (error) throw error;
            return data as any as EmailAttachment[];
        },
        enabled: emailIds.length > 0,
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Utility per generare URL di download/preview sicuro
 */
export async function getAttachmentUrl(storagePath: string) {
    const { data, error } = await supabase.storage
        .from("email-attachments")
        .createSignedUrl(storagePath, 60 * 60); // 1 ora di validità

    if (error) throw error;
    return data.signedUrl;
}
