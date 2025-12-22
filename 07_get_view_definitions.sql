DO $$
DECLARE
    v_def text;
BEGIN
    -- Get definition for 'interventi' view
    SELECT pg_get_viewdef('interventi', true) INTO v_def;
    RAISE NOTICE '-------------------------------------------';
    RAISE NOTICE 'DEFINITION FOR VIEW interventi:';
    RAISE NOTICE '%', v_def;
    RAISE NOTICE '-------------------------------------------';
    
    -- Get definition for 'vw_gestione_interventi' view
    SELECT pg_get_viewdef('vw_gestione_interventi', true) INTO v_def;
    RAISE NOTICE '-------------------------------------------';
    RAISE NOTICE 'DEFINITION FOR VIEW vw_gestione_interventi:';
    RAISE NOTICE '%', v_def;
    RAISE NOTICE '-------------------------------------------';
END$$;
