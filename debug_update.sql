\pset pager off
-- Get one active ID
SELECT id_noleggio FROM "Noleggi" WHERE is_terminato = false LIMIT 1;

-- Try update (using a placeholder ID, I will check output of first query then replace, OR use subquery)
DO $$
DECLARE
    v_id uuid;
BEGIN
    SELECT id_noleggio INTO v_id FROM "Noleggi" WHERE is_terminato = false LIMIT 1;
    
    IF v_id IS NOT NULL THEN
        RAISE NOTICE 'Attempting to update Noleggio ID: %', v_id;
        UPDATE "Noleggi" 
        SET is_terminato = true, data_terminazione_effettiva = CURRENT_DATE 
        WHERE id_noleggio = v_id;
    ELSE
        RAISE NOTICE 'No active Noleggio found to test.';
    END IF;
END $$;
