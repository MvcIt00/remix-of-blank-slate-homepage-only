// ============================================================================
// HOOKS: Trasporti Data Fetching
// React Query hooks for fetching trasporti data
// ============================================================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Trasporti } from '@/types/trasporti';

export type StatoTrasporto = 'richiesto' | 'confermato' | 'completato';

/**
 * Fetch all trasporti filtered by stato
 * @param stato - Optional filter by stato (richiesto/confermato/completato)
 * @param enabled - Optional flag to enable/disable query
 */
export const useTrasporti = (
    stato?: StatoTrasporto,
    enabled = true
) => {
    return useQuery({
        queryKey: ['trasporti', stato],
        queryFn: async () => {
            let query = supabase
                .from('trasporti' as any)
                .select(`
          *,
          mezzo:Mezzi(marca, modello, matricola),
          vettore:Anagrafiche(ragione_sociale),
          sede_partenza:Sedi!trasporti_id_sede_partenza_fkey(nome_sede, citta),
          sede_arrivo:Sedi!trasporti_id_sede_arrivo_fkey(nome_sede, citta)
        `)
                .eq('is_cancellato', false)
                .order('created_at', { ascending: false });

            if (stato) {
                query = query.eq('stato', stato);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data as any[];
        },
        enabled,
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000 // 5 minutes
    });
};

/**
 * Fetch trasporti linked to a specific noleggio
 * @param id_noleggio - ID of the noleggio
 * @param enabled - Optional flag to enable/disable query
 */
export const useTrasportiByNoleggio = (
    id_noleggio: string | null | undefined,
    enabled = true
) => {
    return useQuery({
        queryKey: ['trasporti', 'noleggio', id_noleggio],
        queryFn: async () => {
            if (!id_noleggio) return [];

            const { data, error } = await supabase
                .from('noleggi_trasporti' as any)
                .select(`
          trasporto:trasporti(
            *,
            mezzo:Mezzi(marca, modello, matricola),
            vettore:Anagrafiche(ragione_sociale),
            sede_partenza:Sedi!trasporti_id_sede_partenza_fkey(nome_sede, citta),
            sede_arrivo:Sedi!trasporti_id_sede_arrivo_fkey(nome_sede, citta)
          )
        `)
                .eq('id_noleggio', id_noleggio);

            if (error) throw error;

            // Extract trasporti from bridge table response
            return (data as any)?.map((item: any) => item.trasporto).filter(Boolean) || [];
        },
        enabled: enabled && !!id_noleggio,
        staleTime: 30 * 1000,
    });
};

/**
 * Fetch single trasporto by ID
 * @param id_trasporto - ID of the trasporto
 * @param enabled - Optional flag to enable/disable query
 */
export const useTrasporto = (
    id_trasporto: string | null | undefined,
    enabled = true
) => {
    return useQuery({
        queryKey: ['trasporto', id_trasporto],
        queryFn: async () => {
            if (!id_trasporto) return null;

            const { data, error } = await supabase
                .from('trasporti' as any)
                .select(`
          *,
          mezzo:Mezzi(marca, modello, matricola),
          vettore:Anagrafiche(ragione_sociale),
          sede_partenza:Sedi!trasporti_id_sede_partenza_fkey(nome_sede, citta),
          sede_arrivo:Sedi!trasporti_id_sede_arrivo_fkey(nome_sede, citta)
        `)
                .eq('id_trasporto', id_trasporto)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: enabled && !!id_trasporto,
        staleTime: 30 * 1000,
    });
};

/**
 * Fetch all trasporti counts by stato (for dashboard/stats)
 */
export const useTrasportiStats = () => {
    return useQuery({
        queryKey: ['trasporti', 'stats'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('trasporti' as any)
                .select('id_trasporto, stato')
                .eq('is_cancellato', false);

            if (error) throw error;

            // Count by stato
            const items = data as any[];
            const counts = {
                richiesto: items.filter(t => t.stato === 'richiesto').length,
                confermato: items.filter(t => t.stato === 'confermato').length,
                completato: items.filter(t => t.stato === 'completato').length,
            };

            return counts;
        },
        staleTime: 60 * 1000, // 1 minute
    });
};
