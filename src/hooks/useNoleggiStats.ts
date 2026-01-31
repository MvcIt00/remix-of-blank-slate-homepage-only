import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * AI GUIDANCE:
 * Per comprendere la logica concettuale degli allarmi intelligenti (±7gg, richiede_contratto),
 * consultare il file di contesto: src/components/noleggi/.context.md
 */

/**
 * FILOSOFIA (Protocollo AX04/AX05/AX06):
 * Hook per statistiche operative noleggi con sistema di allarmi proattivo.
 * 
 * MATRICE STATI-ALLARMI:
 * - Stati formali: futuro | attivo | scaduto | terminato (da VIEW)
 * - Allarmi cross-stato: contratto, trasporto (da analisi contestuale)
 * 
 * NON è un contatore statistico ma un indicatore operativo che suggerisce azioni.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface NoleggiStats {
    // Contatori per stato formale
    futuri: number;
    attivi: number;
    scaduti: number;
    terminati: number;

    // Contatori allarmi (cross-stato)
    contrattiDaGenerare: number;
    contrattiDaAllegare: number;
    trasportiConsegnaPendenti: number;
    trasportiRitiroPendenti: number;
}

export interface Allarmi {
    contrattoDaGenerare: boolean;
    contrattoDaAllegare: boolean;
    trasportoConsegnaPendente: boolean;
    trasportoRitiroPendente: boolean;
}

export interface NoleggioView {
    // View columns (subset, add more as needed)
    id_noleggio: string;
    codice_noleggio: string;
    stato_noleggio: "futuro" | "attivo" | "scaduto" | "terminato" | "archiviato";

    // Dati cliente
    id_anagrafica: string;
    cliente_ragione_sociale: string;
    cliente_citta: string;

    // Dati mezzo
    id_mezzo: string;
    mezzo_marca: string;
    mezzo_modello: string;
    mezzo_matricola: string;

    // Dati sede
    id_sede_operativa: string | null;
    sede_nome: string | null;
    sede_citta: string | null;

    // Periodo
    data_inizio: string | null;
    data_fine: string | null;
    tempo_indeterminato: boolean | null;

    //Prezzo
    prezzo_noleggio: number | null;
    tipo_canone: "giornaliero" | "mensile" | null;

    // Contratti (JSON dalla VIEW)
    contratto_firmato_info: {
        id_documento: string;
        file_path: string;
        data_documento: string;
    } | null;
    contratto_bozza_info: {
        id_contratto: string;
        created_at: string;
    } | null;
    richiede_contratto_noleggio: boolean | null;

    // Flags
    is_terminato: boolean | null;
    is_cancellato: boolean;
}

export interface TrasportoNoleggio {
    id_trasporto: string;
    stato: "richiesto" | "confermato" | "completato";
    id_sede_arrivo: string | null;
    id_sede_partenza: string | null;
}

export interface NoleggioConAllarmi extends NoleggioView {
    allarmi: Allarmi;
    trasporti: TrasportoNoleggio[];
}

export interface Allarmi {
    // Allarmi contratti
    contrattoDaGenerare: boolean;
    contrattoDaAllegare: boolean;

    // Allarmi trasporti (boolean per compatibilità)
    trasportoConsegnaPendente: boolean;
    trasportoRitiroPendente: boolean;

    // INFO STATO TRASPORTI (per azioni contestuali)
    trasportoConsegnaInfo: {
        exists: boolean;
        trasportoId: string | null;
        stato: "richiesto" | "confermato" | "completato" | null;
    };
    trasportoRitiroInfo: {
        exists: boolean;
        trasportoId: string | null;
        stato: "richiesto" | "confermato" | "completato" | null;
    };
}

export interface TrasportoNoleggio {
    id_trasporto: string;
    stato: "richiesto" | "confermato" | "completato";
    id_sede_arrivo: string | null;
    id_sede_partenza: string | null;
}

export interface NoleggioConAllarmi extends NoleggioView {
    allarmi: Allarmi;
    trasporti: TrasportoNoleggio[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Costruisce mappa id_noleggio → array trasporti
 */
function buildTrasportiMap(data: any[] | null): Map<string, TrasportoNoleggio[]> {
    const map = new Map<string, TrasportoNoleggio[]>();

    if (!data) return map;

    for (const item of data) {
        if (!item.id_noleggio || !item.trasporto) continue;

        // Il trasporto nested dalla join
        const trasporto: TrasportoNoleggio = {
            id_trasporto: item.trasporto.id_trasporto,
            stato: item.trasporto.stato,
            id_sede_arrivo: item.trasporto.id_sede_arrivo,
            id_sede_partenza: item.trasporto.id_sede_partenza,
        };

        if (!map.has(item.id_noleggio)) {
            map.set(item.id_noleggio, []);
        }
        map.get(item.id_noleggio)!.push(trasporto);
    }

    return map;
}

/**
 * Calcola allarmi operativi per un singolo noleggio.
 * 
 * LOGICA ALLARMI:
 * 1. Contratto da generare: richiede_contratto=true AND nessuna bozza AND nessun firmato
 * 2. Contratto da allegare: ha bozza BUT nessun firmato
 * 3. Trasporto consegna pendente: stato futuro/attivo AND no trasporto completato verso sede cliente
 * 4. Trasporto ritiro pendente: stato terminato AND no trasporto completato verso sede MVC
 */
function calcolaAllarmi(
    noleggio: any,  // Include campi da vw_noleggi_allarmi
    trasporti: TrasportoNoleggio[]
): Allarmi {
    // ========================================================================
    // ALLARMI DA VISTA (pre-calcolati con logica intelligente DB-side)
    // ========================================================================
    const contrattoDaGenerare = noleggio.allarme_contratto_da_generare || false;
    const contrattoDaAllegare = noleggio.allarme_contratto_da_allegare || false;
    const trasportoConsegnaPendente = noleggio.allarme_trasporto_consegna || false;
    const trasportoRitiroPendente = noleggio.allarme_trasporto_ritiro || false;

    // Trasporto consegna = arrivo presso cliente (sede_operativa)
    const trasportoConsegna = trasporti.find(
        (t) => t.id_sede_arrivo === noleggio.id_sede_operativa
    );

    // Trasporto ritiro = NON arrivo presso cliente
    const trasportoRitiro = trasporti.find(
        (t) => t.id_sede_arrivo && t.id_sede_arrivo !== noleggio.id_sede_operativa
    );

    return {
        contrattoDaGenerare,
        contrattoDaAllegare,
        trasportoConsegnaPendente,
        trasportoRitiroPendente,

        // INFO TRASPORTI per azioni contestuali
        trasportoConsegnaInfo: {
            exists: !!trasportoConsegna,
            trasportoId: trasportoConsegna?.id_trasporto || null,
            stato: trasportoConsegna?.stato || null,
        },
        trasportoRitiroInfo: {
            exists: !!trasportoRitiro,
            trasportoId: trasportoRitiro?.id_trasporto || null,
            stato: trasportoRitiro?.stato || null,
        },
    };
}

// ============================================================================
// HOOK PRINCIPALE
// ============================================================================

export function useNoleggiStats() {
    // 1. Fetch tutti i noleggi dalla VIEW con allarmi intelligenti
    const noleggiQuery = useQuery({
        queryKey: ["noleggi-dashboard"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("vw_noleggi_allarmi" as any)  // View non ancora in types generati
                .select("*")
                .neq("stato_noleggio", "archiviato");

            if (error) throw error;
            return data as any as NoleggioView[];
        },
    });

    // 2. Fetch TUTTI i trasporti collegati a noleggi (batch via bridge table)
    const trasportiQuery = useQuery({
        queryKey: ["noleggi-trasporti-batch"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("noleggi_trasporti")
                .select(
                    `
          id_noleggio,
          trasporto:trasporti(
            id_trasporto,
            stato,
            id_sede_arrivo,
            id_sede_partenza
          )
        `
                )
                .eq("trasporti.is_cancellato", false);

            if (error) throw error;
            return data;
        },
        enabled: !!noleggiQuery.data, // Run only se noleggi loaded
    });

    // 3. CALCOLA statistiche e allarmi
    const computed = useMemo(() => {
        if (!noleggiQuery.data) {
            return {
                stats: null,
                noleggiConAllarmi: [],
            };
        }

        const noleggi = noleggiQuery.data;
        const trasportiMap = buildTrasportiMap(trasportiQuery.data);

        // Enricha ogni noleggio con allarmi + trasporti
        const noleggiConAllarmi: NoleggioConAllarmi[] = noleggi.map((n) => {
            const trasporti = trasportiMap.get(n.id_noleggio) || [];
            const allarmi = calcolaAllarmi(n, trasporti);

            return {
                ...n,
                allarmi,
                trasporti,
            };
        });

        // Aggregazione contatori
        const stats: NoleggiStats = {
            // Stati formali
            futuri: noleggi.filter((n) => n.stato_noleggio === "futuro").length,
            attivi: noleggi.filter((n) => n.stato_noleggio === "attivo").length,
            scaduti: noleggi.filter((n) => n.stato_noleggio === "scaduto").length,
            terminati: noleggi.filter((n) => n.stato_noleggio === "terminato")
                .length,

            // Allarmi (cross-stato)
            contrattiDaGenerare: noleggiConAllarmi.filter(
                (n) => n.allarmi.contrattoDaGenerare
            ).length,
            contrattiDaAllegare: noleggiConAllarmi.filter(
                (n) => n.allarmi.contrattoDaAllegare
            ).length,
            trasportiConsegnaPendenti: noleggiConAllarmi.filter(
                (n) => n.allarmi.trasportoConsegnaPendente
            ).length,
            trasportiRitiroPendenti: noleggiConAllarmi.filter(
                (n) => n.allarmi.trasportoRitiroPendente
            ).length,
        };

        return { stats, noleggiConAllarmi };
    }, [noleggiQuery.data, trasportiQuery.data]);

    return {
        stats: computed.stats,
        noleggiConAllarmi: computed.noleggiConAllarmi,
        loading: noleggiQuery.isLoading || trasportiQuery.isLoading,
        error: noleggiQuery.error || trasportiQuery.error,
        refetch: () => {
            noleggiQuery.refetch();
            trasportiQuery.refetch();
        },
    };
}
