-- STEP 1: DROP VISTA PREVENTIVI
-- Questo elimina la vista che dipende dalle colonne che vogliamo rimuovere

DROP VIEW IF EXISTS public.vw_preventivi_completi CASCADE;
