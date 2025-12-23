-- RIMOZIONE SISTEMA DOCUMENT TEMPLATES
-- Come richiesto, puliamo il DB rimuovendo la tabella e le funzioni create.

BEGIN;

-- 1. Rimozioni Funzioni e Trigger
DROP TRIGGER IF EXISTS trg_protect_history ON public.document_templates;
DROP FUNCTION IF EXISTS prevent_template_update();
DROP FUNCTION IF EXISTS public.publish_template(text, text, text, text);

-- 2. Rimozione Tabella
DROP TABLE IF EXISTS public.document_templates;

COMMIT;
