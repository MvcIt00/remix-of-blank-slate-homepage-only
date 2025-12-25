-- 🔍 AUDIT COMPLETO: Dipendenze Vista Preventivi
-- Esegui queste query per capire la situazione reale nel database

-- 1. Verifica la definizione REALE della vista nel database
SELECT pg_get_viewdef('public.vw_preventivi_completi', true);

-- 2. Trova TUTTE le viste che dipendono da prev_noleggi
SELECT DISTINCT
    dependent_view.relname as vista_dipendente,
    source_table.relname as tabella_sorgente
FROM pg_depend 
JOIN pg_rewrite ON pg_depend.objid = pg_rewrite.oid 
JOIN pg_class as dependent_view ON pg_rewrite.ev_class = dependent_view.oid 
JOIN pg_class as source_table ON pg_depend.refobjid = source_table.oid 
WHERE source_table.relname = 'prev_noleggi'
  AND dependent_view.relkind = 'v';

-- 3. Verifica se ci sono altre viste che usano vw_preventivi_completi
SELECT DISTINCT
    dependent_view.relname as vista_che_usa_vw_preventivi,
    source_view.relname as vista_sorgente
FROM pg_depend 
JOIN pg_rewrite ON pg_depend.objid = pg_rewrite.oid 
JOIN pg_class as dependent_view ON pg_rewrite.ev_class = dependent_view.oid 
JOIN pg_class as source_view ON pg_depend.refobjid = source_view.oid 
WHERE source_view.relname = 'vw_preventivi_completi'
  AND dependent_view.relkind = 'v';
