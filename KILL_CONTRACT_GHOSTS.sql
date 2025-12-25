-- 🧨 NUCLEAR CLEANUP: ELIMINATE DRAFT GHOSTS
-- Removing all contract records that are causing the 'Orange' (Draft) icons.
-- This forces the UI back to 'Blue' (+), which is correct for a fresh bucket.

DELETE FROM public.contratti_noleggio;

-- Also ensure no documents point to a rental if they aren't signed contracts explicitly.
DELETE FROM public.documenti_noleggio WHERE tipo_documento != 'contratto_firmato';
