-- 1. DROP TRIGGER and FUNCTION (Fixes the immediate bug)
DROP TRIGGER IF EXISTS trigger_capture_noleggio_storico ON public."Noleggi";
DROP FUNCTION IF EXISTS public.capture_noleggio_storico();

-- 2. Drop Legacy Table (As requested: no longer needed)
DROP TABLE IF EXISTS public.noleggi_storico CASCADE;
DROP TABLE IF EXISTS public.noleggi_storico_legacy CASCADE;

-- 3. DROP VIEW CASCADE to avoid column mismatch errors during re-creation
DROP VIEW IF EXISTS public.vw_storico_noleggi CASCADE;

-- 4. Create View for History (Enterprise Approach)
-- Unifies Terminated and Cancelled rentals from the main table.
-- No duplication, real-time data.
CREATE VIEW public.vw_storico_noleggi AS
SELECT 
    n.id_noleggio as id_storico, -- Use id_noleggio as key
    n.id_noleggio,
    n.id_mezzo,
    n.id_anagrafica,
    n.data_inizio,
    n.data_fine,
    n.data_terminazione_effettiva as data_fine_periodo, -- Use actual termination date
    n.data_terminazione_effettiva,
    n.tempo_indeterminato,
    n.prezzo_noleggio,
    n.prezzo_trasporto,
    n.tipo_canone,
    n.note,
    n.is_terminato,
    -- Computed Fields for compatibility with UI
    CASE 
        WHEN n.is_cancellato = true THEN 'cancellazione'::text 
        ELSE 'terminazione'::text 
    END as tipo_evento,
    n.created_at as data_evento, -- Fallback to created_at or updated_at if tracked
    
    -- Joins for descriptions
    CONCAT_WS(' - ', m.marca, m.modello, m.matricola) as mezzo_descrizione,
    a.ragione_sociale as ragione_sociale_cliente,
    CONCAT_WS(', ', s.nome_sede, s.indirizzo, s.citta) as sede_operativa_descrizione

FROM public."Noleggi" n
LEFT JOIN public."Mezzi" m ON n.id_mezzo = m.id_mezzo
LEFT JOIN public."Anagrafiche" a ON n.id_anagrafica = a.id_anagrafica
LEFT JOIN public."Sedi" s ON n.sede_operativa = s.id_sede

WHERE n.is_terminato = true OR n.is_cancellato = true;

-- permissions
GRANT SELECT ON public.vw_storico_noleggi TO authenticated;
GRANT SELECT ON public.vw_storico_noleggi TO service_role;
