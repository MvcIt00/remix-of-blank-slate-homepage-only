-- ==============================================================================
-- 🚀 SUPER-ENTERPRISE STORAGE SETUP: Bucket Policies
-- NOTA: Poiché le tabelle di sistema 'storage.buckets' sono protette,
-- la creazione del bucket deve avvenire tramite Dashboard Supabase.
-- ==============================================================================

-- STEP 1: ISTRUZIONI MANUALI (DA ESEGUIRE PRIMA)
-- 1. Vai su Supabase Dashboard -> Storage
-- 2. Clicca "New Bucket"
-- 3. Nome: noleggio_docs
-- 4. Imposta come "Public" (o segui le policy RLS sotto)

-- STEP 2: Policy di Accesso (RLS)
-- Una volta creato il bucket via UI, esegui questo script per le policy enterprise.

-- Elimina policy esistenti per ricostruzione pulita
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;

-- Policy: Lettura pubblica (per visualizzazione PDF)
-- Nota: 'noleggio_docs' deve esistere già nella tabella buckets
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'noleggio_docs');

-- Policy: Inserimento solo per utenti autenticati
CREATE POLICY "Authenticated Insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'noleggio_docs');

-- Policy: Aggiornamento solo per utenti autenticati
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'noleggio_docs')
WITH CHECK (bucket_id = 'noleggio_docs');

-- Policy: Cancellazione solo per utenti autenticati
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'noleggio_docs');

COMMENT ON TABLE storage.objects IS 'Policies per il bucket noleggio_docs. Assicurati che il bucket sia stato creato via Dashboard.';
