-- ALINEAMENTO DATABASE E STORAGE (NXUS)
-- Questo script configura il bucket di storage e pulisce le vecchie tabelle.

BEGIN;

-- 1. PULIZIA VECCHIO SISTEMA (Template dinamici)
-- Utilizziamo un blocco DO per gestire la pulizia in modo sicuro (Enterprise Standard)
DO $$
BEGIN
    -- Se la tabella esiste, puliamo trigger e tabella
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'document_templates') THEN
        DROP TRIGGER IF EXISTS trg_protect_history ON public.document_templates;
        DROP TABLE public.document_templates CASCADE;
    END IF;
END $$;

-- Rimuoviamo le funzioni (queste hanno il loro IF EXISTS nativo)
DROP FUNCTION IF EXISTS public.prevent_template_update();
DROP FUNCTION IF EXISTS public.publish_template(text, text, text, text);

-- 2. CONFIGURAZIONE STORAGE (Bucket 'contratti')
-- Assicuriamoci che il bucket esista
INSERT INTO storage.buckets (id, name, public)
VALUES ('contratti', 'contratti', false)
ON CONFLICT (id) DO NOTHING;

-- A. Permesso di LETTURA per le Condizioni Generali (cartella static/)
-- Usiamo LIKE per compatibilità universale
CREATE POLICY "Accesso Condizioni Generali Autenticati"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'contratti' AND name LIKE 'static/%');

CREATE POLICY "Accesso Condizioni Generali Anonimi"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'contratti' AND name LIKE 'static/%');

-- B. Permesso di SCRITTURA/LETTURA per i contratti generati (cartella generati/)
CREATE POLICY "Gestione Contratti Generati"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'contratti' AND name LIKE 'generati/%');

COMMIT;

-- ISTRUZIONI MANUALI:
-- Dopo aver eseguito questo SQL, carica il file tramite interfaccia Supabase:
-- Bucket: contratti -> Crea cartella 'static' -> Carica 'condizioni_generali_noleggio.pdf'
