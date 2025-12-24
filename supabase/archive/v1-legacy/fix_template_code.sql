-- SCRIPT DI CORREZIONE CODICI TEMPLATE
-- Questo script allinea i codici nel DB a quello che si aspetta il frontend.

BEGIN;

-- 1. Rimuove spazi vuoti accidentali dai codici esistenti
UPDATE public.document_templates
SET code = TRIM(code);

-- 2. Standardizza il codice in 'CONDIZIONI_NOLEGGIO_STD'
UPDATE public.document_templates
SET code = 'CONDIZIONI_NOLEGGIO_STD'
WHERE code IN ('CONDIZIONI_NOLEGGIO', 'CONDIZIONI GENERALI', 'Condizioni Generali')
  AND version = 1;

-- 3. Assicura che sia attivo
UPDATE public.document_templates
SET is_active = true
WHERE code = 'CONDIZIONI_NOLEGGIO_STD';

COMMIT;
