// ============================================================================
// HOOKS: Trasporti Mutations
// React Query mutation hooks for CUD operations on trasporti
// ============================================================================

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { TrasportoInsert, TrasportoUpdate } from '@/types/trasporti';

/**
 * Create new trasporto + bridge table entry
 * @param id_noleggio - Required for bridge table link
 */
export const useCreateTrasporto = (id_noleggio?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: TrasportoInsert) => {
            // 1. Insert trasporto
            const { data: trasporto, error: trasportoError } = await supabase
                .from('trasporti' as any)
                .insert(data)
                .select()
                .single();

            if (trasportoError) throw trasportoError;

            // 2. Insert bridge table entry if id_noleggio provided
            if (id_noleggio && trasporto) {
                const { error: bridgeError } = await supabase
                    .from('noleggi_trasporti' as any)
                    .insert({
                        id_noleggio,
                        id_trasporto: (trasporto as any).id_trasporto,
                    });

                if (bridgeError) throw bridgeError;
            }

            return trasporto;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trasporti'] });
            if (id_noleggio) {
                queryClient.invalidateQueries({ queryKey: ['trasporti', 'noleggio', id_noleggio] });
            }
            toast.success('Trasporto creato con successo');
        },
        onError: (error: any) => {
            console.error('Error creating trasporto:', error);
            toast.error(error.message || 'Errore durante la creazione del trasporto');
        },
    });
};

/**
 * Update existing trasporto
 */
export const useUpdateTrasporto = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: TrasportoUpdate }) => {
            const { data: updated, error } = await supabase
                .from('trasporti' as any)
                .update(data)
                .eq('id_trasporto', id)
                .select()
                .single();

            if (error) throw error;
            return updated;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trasporti'] });
            toast.success('Trasporto aggiornato con successo');
        },
        onError: (error: any) => {
            console.error('Error updating trasporto:', error);
            toast.error(error.message || 'Errore durante l\'aggiornamento del trasporto');
        },
    });
};

/**
 * Soft delete trasporto
 */
export const useDeleteTrasporto = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('trasporti' as any)
                .update({ is_cancellato: true })
                .eq('id_trasporto', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trasporti'] });
            toast.success('Trasporto eliminato con successo');
        },
        onError: (error: any) => {
            console.error('Error deleting trasporto:', error);
            toast.error(error.message || 'Errore durante l\'eliminazione del trasporto');
        },
    });
};

/**
 * Conferma trasporto: richiesto → confermato
 */
export const useConfermaTrasporto = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { data, error } = await supabase
                .from('trasporti' as any)
                .update({ stato: 'confermato' })
                .eq('id_trasporto', id)
                .eq('stato', 'richiesto') // Safety check
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trasporti'] });
            toast.success('Trasporto confermato');
        },
        onError: (error: any) => {
            console.error('Error confirming trasporto:', error);
            toast.error(error.message || 'Errore durante la conferma del trasporto');
        },
    });
};

/**
 * Completa trasporto: confermato → completato
 * Triggers auto-update of Mezzo.id_sede_ubicazione via DB trigger
 */
export const useCompletaTrasporto = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data_effettiva }: { id: string; data_effettiva?: string }) => {
            const { data, error } = await supabase
                .from('trasporti' as any)
                .update({
                    stato: 'completato',
                    data_effettiva: data_effettiva || new Date().toISOString(),
                })
                .eq('id_trasporto', id)
                .eq('stato', 'confermato') // Safety check
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trasporti'] });
            queryClient.invalidateQueries({ queryKey: ['mezzi'] }); // Invalidate mezzi for ubicazione update
            toast.success('Trasporto completato. Ubicazione mezzo aggiornata.');
        },
        onError: (error: any) => {
            console.error('Error completing trasporto:', error);
            toast.error(error.message || 'Errore durante il completamento del trasporto');
        },
    });
};
