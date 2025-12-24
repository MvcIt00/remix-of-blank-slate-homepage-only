-- =============================================================
-- MIGRATION: Expansion of Quote and Contract Schema
-- DESCRIPTION: Adds missing economic and legal fields to 
--              support full document generation.
-- =============================================================

-- 1. Expansion of public.contratti_noleggio
ALTER TABLE public.contratti_noleggio 
ADD COLUMN IF NOT EXISTS id_mezzo UUID REFERENCES public."Mezzi"(id_mezzo),
ADD COLUMN IF NOT EXISTS data_inizio DATE,
ADD COLUMN IF NOT EXISTS data_fine DATE,
ADD COLUMN IF NOT EXISTS tempo_indeterminato BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS canone_noleggio NUMERIC,
ADD COLUMN IF NOT EXISTS tipo_canone TEXT, -- e.g. 'mensile', 'giornaliero'
ADD COLUMN IF NOT EXISTS costo_trasporto NUMERIC,
ADD COLUMN IF NOT EXISTS deposito_cauzionale NUMERIC,
ADD COLUMN IF NOT EXISTS modalita_pagamento TEXT,
ADD COLUMN IF NOT EXISTS clausole_speciali TEXT;

-- 2. Expansion of public.prev_noleggi (Quotes)
-- To ensure the quote can define these terms before they become a contract
ALTER TABLE public.prev_noleggi
ADD COLUMN IF NOT EXISTS deposito_cauzionale NUMERIC,
ADD COLUMN IF NOT EXISTS modalita_pagamento TEXT,
ADD COLUMN IF NOT EXISTS clausole_speciali TEXT;

-- 3. Update Existing Views if necessary
-- (Incremental update: we'll re-run view definitions if needed)

COMMENT ON COLUMN public.contratti_noleggio.deposito_cauzionale IS 'Importo della cauzione richiesta per il noleggio.';
COMMENT ON COLUMN public.contratti_noleggio.clausole_speciali IS 'Note legali aggiuntive specifiche per questo contratto.';
