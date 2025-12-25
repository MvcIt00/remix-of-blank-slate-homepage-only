-- VERIFICA VISTA "preventivi"
-- Controlliamo se questa vista usa le colonne che abbiamo eliminato

SELECT pg_get_viewdef('public.preventivi', true);
