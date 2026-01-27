import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContattoWhatsApp {
    id_contatto: string;
    nome: string;
    telefono: string;
}

interface TrasportoWhatsAppData {
    id_trasporto: string;
    vettore_nome: string | null;
    sede_partenza_nome: string | null;
    sede_partenza_indirizzo: string | null;
    sede_partenza_citta: string | null;
    sede_partenza_provincia: string | null;
    sede_arrivo_nome: string | null;
    sede_arrivo_indirizzo: string | null;
    sede_arrivo_citta: string | null;
    sede_arrivo_provincia: string | null;
    data_programmata: string | null;
    note: string | null;
    created_by_email: string | null;
}

export function useWhatsAppTrasporto(idTrasporto: string | null) {
    const queryClient = useQueryClient();
    const [selectedContatto, setSelectedContatto] = useState<string | null>(null);

    // Fetch trasporto data
    const { data: trasportoData, isLoading: trasportoLoading } = useQuery({
        queryKey: ['trasporto-whatsapp', idTrasporto],
        queryFn: async () => {
            if (!idTrasporto) return null;

            const { data, error } = await supabase
                .from('trasporti')
                .select(`
          id_trasporto,
          id_vettore,
          data_programmata,
          note,
          vettore:Anagrafiche!id_vettore(ragione_sociale),
          sede_partenza:Sedi!id_sede_partenza(nome_sede, indirizzo, citta, provincia),
          sede_arrivo:Sedi!id_sede_arrivo(nome_sede, indirizzo, citta, provincia),
          created_by_user:created_by(email)
        `)
                .eq('id_trasporto', idTrasporto)
                .single();

            if (error) throw error;

            return {
                id_trasporto: data.id_trasporto,
                vettore_nome: (data.vettore as any)?.ragione_sociale || null,
                sede_partenza_nome: (data.sede_partenza as any)?.nome_sede || null,
                sede_partenza_indirizzo: (data.sede_partenza as any)?.indirizzo || null,
                sede_partenza_citta: (data.sede_partenza as any)?.citta || null,
                sede_partenza_provincia: (data.sede_partenza as any)?.provincia || null,
                sede_arrivo_nome: (data.sede_arrivo as any)?.nome_sede || null,
                sede_arrivo_indirizzo: (data.sede_arrivo as any)?.indirizzo || null,
                sede_arrivo_citta: (data.sede_arrivo as any)?.citta || null,
                sede_arrivo_provincia: (data.sede_arrivo as any)?.provincia || null,
                data_programmata: data.data_programmata,
                note: data.note,
                created_by_email: (data.created_by_user as any)?.email || null,
            } as TrasportoWhatsAppData;
        },
        enabled: !!idTrasporto,
    });

    // Fetch contatti vettore
    const { data: contatti = [], isLoading: contattiLoading } = useQuery({
        queryKey: ['contatti-vettore', trasportoData?.id_trasporto],
        queryFn: async () => {
            if (!trasportoData) return [];

            // Get id_vettore from trasporti table
            const { data: trasporto } = await supabase
                .from('trasporti')
                .select('id_vettore')
                .eq('id_trasporto', trasportoData.id_trasporto)
                .single();

            if (!trasporto?.id_vettore) return [];

            const { data, error } = await supabase
                .from('an_contatti')
                .select('id_contatto, nome, telefono')
                .eq('id_anagrafica', trasporto.id_vettore)
                .eq('is_cancellato', false)
                .not('telefono', 'is', null);

            if (error) return [];
            return data as ContattoWhatsApp[];
        },
        enabled: !!trasportoData,
    });

    // Fetch numero preferito
    const { data: numeroPreferito } = useQuery({
        queryKey: ['numero-preferito', trasportoData?.id_trasporto],
        queryFn: async () => {
            if (!trasportoData) return null;

            const { data: trasporto } = await supabase
                .from('trasporti')
                .select('id_vettore')
                .eq('id_trasporto', trasportoData.id_trasporto)
                .single();

            if (!trasporto?.id_vettore) return null;

            const { data, error } = await supabase
                .from('frn_trasporti')
                .select('id_contatto_whatsapp')
                .eq('id_anagrafica', trasporto.id_vettore)
                .single();

            if (error || !data?.id_contatto_whatsapp) return null;
            return data.id_contatto_whatsapp;
        },
        enabled: !!trasportoData && contatti.length > 0,
    });

    // Pre-select numero preferito or first contact
    useEffect(() => {
        if (numeroPreferito) {
            setSelectedContatto(numeroPreferito);
        } else if (contatti.length > 0 && !selectedContatto) {
            setSelectedContatto(contatti[0].id_contatto);
        }
    }, [numeroPreferito, contatti, selectedContatto]);

    // Format WhatsApp message
    const formatMessage = (): string => {
        if (!trasportoData) return '';

        const dataStr = trasportoData.data_programmata
            ? new Date(trasportoData.data_programmata).toLocaleString('it-IT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })
            : 'Non specificata';

        const sedePartenza = trasportoData.sede_partenza_nome
            ? `${trasportoData.sede_partenza_nome} - ${trasportoData.sede_partenza_indirizzo || ''}, ${trasportoData.sede_partenza_citta || ''} (${trasportoData.sede_partenza_provincia || ''})`
            : 'N/D';

        const sedeArrivo = trasportoData.sede_arrivo_nome
            ? `${trasportoData.sede_arrivo_nome} - ${trasportoData.sede_arrivo_indirizzo || ''}, ${trasportoData.sede_arrivo_citta || ''} (${trasportoData.sede_arrivo_provincia || ''})`
            : 'N/D';

        const idShort = trasportoData.id_trasporto.substring(0, 8);

        let message = `🚚 *Nuovo Trasporto Assegnato*\n\n`;
        message += `*ID:* ${idShort}\n`;
        message += `*Da:* ${sedePartenza}\n`;
        message += `*A:* ${sedeArrivo}\n`;
        message += `*Data:* ${dataStr}\n`;
        if (trasportoData.note) {
            message += `*Note:* ${trasportoData.note}\n`;
        }
        message += `\n_Richiesto da: ${trasportoData.created_by_email || 'Sistema'}_`;

        return message;
    };

    // Send WhatsApp mutation
    const sendWhatsAppMutation = useMutation({
        mutationFn: async () => {
            if (!selectedContatto || !idTrasporto) {
                throw new Error('Contatto non selezionato');
            }

            const contatto = contatti.find((c) => c.id_contatto === selectedContatto);
            if (!contatto) {
                throw new Error('Contatto non trovato');
            }

            const messaggio = formatMessage();
            const numeroPulito = contatto.telefono.replace(/[^0-9+]/g, '');

            // Open WhatsApp Web
            const url = `https://wa.me/${numeroPulito}?text=${encodeURIComponent(messaggio)}`;
            window.open(url, '_blank');

            // Get current user
            const {
                data: { user },
            } = await supabase.auth.getUser();

            // Update DB with timestamp
            const { error } = await supabase
                .from('trasporti')
                .update({
                    whatsapp_sent_at: new Date().toISOString(),
                    whatsapp_sent_by: user?.id || null,
                    whatsapp_sent_to: contatto.telefono,
                })
                .eq('id_trasporto', idTrasporto);

            if (error) throw error;
        },
        onSuccess: () => {
            toast.success('WhatsApp inviato!');
            queryClient.invalidateQueries({ queryKey: ['trasporti'] });
            queryClient.invalidateQueries({ queryKey: ['trasporto-whatsapp', idTrasporto] });
        },
        onError: (error: Error) => {
            toast.error(`Errore: ${error.message}`);
        },
    });

    return {
        trasportoData,
        contatti,
        selectedContatto,
        setSelectedContatto,
        messaggio: formatMessage(),
        sendWhatsApp: () => sendWhatsAppMutation.mutate(),
        isLoading: trasportoLoading || contattiLoading,
        isSending: sendWhatsAppMutation.isPending,
    };
}
