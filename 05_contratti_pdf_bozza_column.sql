-- Migration: Add pdf_bozza_path column to contratti_noleggio
-- Created: 2026-01-29
-- Description: Adds pdf_bozza_path column to store path of draft PDF contract in storage bucket

BEGIN;

-- Add column if not exists
ALTER TABLE public.contratti_noleggio 
ADD COLUMN IF NOT EXISTS pdf_bozza_path TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.contratti_noleggio.pdf_bozza_path IS 
'Path del PDF bozza del contratto salvato in Supabase Storage (bucket: noleggio_docs).
Pattern: contratti/bozze/contratto_CODICE_TIMESTAMP.pdf
Esempio: contratti/bozze/contratto_CNT-2026-00001_1738184400000.pdf
Viene generato automaticamente al click "Salva e Registra" nel dialog preview contratto.';

COMMIT;

-- Verification query (run manually after migration):
-- SELECT column_name, data_type, col_description('contratti_noleggio'::regclass, ordinal_position) 
-- FROM information_schema.columns 
-- WHERE table_name = 'contratti_noleggio' AND column_name = 'pdf_bozza_path';
