-- Script di Verifica Sistema di Codifica
-- Eseguire questo script per confermare che i codici vengano generati automaticamente.

BEGIN;

-- 1. Inserimento di prova: Preventivo (senza specificare il codice)
-- Usiamo ID fittizi o esistenti. Per sicurezza usiamo un UUID generato per l'ID record, 
-- e ID casuali per le FK (potrebbe fallire se la FK non esiste, quindi cerchiamo di usare ID validi se possibile, 
-- oppure disabilitiamo i check FK per il test, ma meglio di no).
-- Cerchiamo un cliente e un mezzo esistenti (presi dalla demo data o generici)
-- Se non esistono, l'insert fallirà per FK constraint. 
-- Tenteremo di prendere il PRIMO cliente e PRIMO mezzo disponibili.

DO $$
DECLARE
    v_anagrafica_id uuid;
    v_mezzo_id uuid;
    v_noleggio_id uuid;
    v_prev_id uuid;
    v_contr_id uuid;
    v_codice_prv text;
    v_codice_cnt text;
BEGIN
    -- Recupera ID esistenti
    SELECT id_anagrafica INTO v_anagrafica_id FROM public."Anagrafiche" LIMIT 1;
    SELECT id_mezzo INTO v_mezzo_id FROM public."Mezzi" LIMIT 1;
    
    IF v_anagrafica_id IS NULL OR v_mezzo_id IS NULL THEN
        RAISE EXCEPTION 'Non ho trovato Anagrafiche o Mezzi nel DB per fare il test. Inserire dati demo prima.';
    END IF;

    -- A. TEST PREVENTIVO
    INSERT INTO public."Preventivi" (created_at, id_anagrafica)
    VALUES (now(), v_anagrafica_id)
    RETURNING id_preventivo, codice INTO v_prev_id, v_codice_prv;
    
    RAISE NOTICE 'Inserito Preventivo ID: % - CODICE GENERATO: %', v_prev_id, v_codice_prv;

    -- B. TEST CONTRATTO
    -- Creiamo prima un noleggio dummy necessario per il contratto
    INSERT INTO public."Noleggi" (created_at, id_anagrafica, id_mezzo)
    VALUES (now(), v_anagrafica_id, v_mezzo_id)
    RETURNING id_noleggio INTO v_noleggio_id;

    INSERT INTO public.contratti_noleggio (
        data_inizio, 
        dati_cliente, datos_fornitore, dati_mezzo, -- campi json dummy
        id_anagrafica_cliente, id_anagrafica_fornitore, id_noleggio
    )
    VALUES (
        now()::date::text, 
        '{}'::json, '{}'::json, '{}'::json, -- json vuoti
        v_anagrafica_id, v_anagrafica_id, v_noleggio_id
    )
    RETURNING id_contratto, codice_contratto INTO v_contr_id, v_codice_cnt;

    RAISE NOTICE 'Inserito Contratto ID: % - CODICE GENERATO: %', v_contr_id, v_codice_cnt;

    -- ROLLBACK AUTOMATICO PER NON SPORCARE IL DB
    -- Rimuovere "ROLLBACK" e mettere "COMMIT" se si vogliono mantenere i dati di test
    RAISE NOTICE 'Test completato con successo. Eseguo ROLLBACK per pulire.';
END;
$$;

ROLLBACK;
