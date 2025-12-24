/**
 * Atomic Data Orchestration Layer
 * Standardized hooks for fetching pre-processed document data from SQL views.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
    EntitaAnagraficaDocumentale,
    EntitaMezzoDocumentale
} from "@/types/database_views";

/**
 * Hook to fetch a standardized client/partner legal record
 */
export function useAtomicAnagrafica(idAnagrafica?: string | null) {
    return useQuery({
        queryKey: ["atomic_anagrafica", idAnagrafica],
        queryFn: async (): Promise<EntitaAnagraficaDocumentale | null> => {
            if (!idAnagrafica) return null;

            const { data, error } = await supabase
                .from("vw_entita_anagrafica_documentale" as any)
                .select("*")
                .eq("id_anagrafica", idAnagrafica)
                .maybeSingle();

            if (error) {
                console.error("Error fetching atomic anagrafica:", error);
                throw error;
            }
            return data as EntitaAnagraficaDocumentale;
        },
        enabled: !!idAnagrafica,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to fetch standardized vehicle technical data
 */
export function useAtomicMezzo(idMezzo?: string | null) {
    return useQuery({
        queryKey: ["atomic_mezzo", idMezzo],
        queryFn: async (): Promise<EntitaMezzoDocumentale | null> => {
            if (!idMezzo) return null;

            const { data, error } = await supabase
                .from("vw_entita_mezzo_documentale" as any)
                .select("*")
                .eq("id_mezzo", idMezzo)
                .maybeSingle();

            if (error) {
                console.error("Error fetching atomic mezzo:", error);
                throw error;
            }
            return data as EntitaMezzoDocumentale;
        },
        enabled: !!idMezzo,
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Hook to fetch the Owner (Company) legal data
 */
export function useAtomicOwner() {
    return useQuery({
        queryKey: ["atomic_owner"],
        queryFn: async (): Promise<EntitaAnagraficaDocumentale | null> => {
            const { data, error } = await supabase
                .from("vw_entita_anagrafica_documentale" as any)
                .select("*")
                .eq("is_owner", true)
                .maybeSingle();

            if (error) {
                console.error("Error fetching atomic owner:", error);
                throw error;
            }
            return data as EntitaAnagraficaDocumentale;
        },
        staleTime: 1000 * 60 * 60, // 1 hour (owner data changes rarely)
    });
}
