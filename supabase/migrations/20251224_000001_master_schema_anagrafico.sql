-- =====================================================
-- NXUS V2 ENTERPRISE: MASTER SCHEMA - MODULO ANAGRAFICO
-- Migration: 20251224_000001_master_schema_anagrafico
-- FEDELE ALLO SCHEMA ESISTENTE
-- =====================================================

-- =====================================================
-- 1. TABELLA: Tbl_Porti (Lookup)
-- =====================================================
CREATE TABLE IF NOT EXISTS public."Tbl_Porti" (
    id_porto UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_porto TEXT NOT NULL UNIQUE,
    codice_porto TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public."Tbl_Porti" IS 'Lookup table per porti marittimi utilizzati nelle ubicazioni dei mezzi';

-- Indici
CREATE INDEX IF NOT EXISTS idx_porti_nome ON public."Tbl_Porti"(nome_porto);

-- RLS
ALTER TABLE public."Tbl_Porti" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access Porti"
ON public."Tbl_Porti"
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- 2. TABELLA: Tbl_Anagrafiche (Minimalista - FILOSOFIA NXUS)
-- =====================================================
CREATE TABLE IF NOT EXISTS public."Tbl_Anagrafiche" (
    id_anagrafica UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ragione_sociale TEXT NOT NULL,
    partita_iva TEXT,
    is_cliente BOOLEAN,
    is_fornitore BOOLEAN,
    is_owner BOOLEAN,
    richiede_contratto_noleggio BOOLEAN DEFAULT true,
    is_cancellato BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE public."Tbl_Anagrafiche" IS 'Entità anagrafiche minimaliste - ZERO dati geografici (stanno in Sedi)';
COMMENT ON COLUMN public."Tbl_Anagrafiche".is_owner IS 'Proprietario di mezzi';

-- Indici (fedeli all'originale)
CREATE INDEX IF NOT EXISTS idx_anagrafiche_cliente ON public."Tbl_Anagrafiche"(is_cliente) WHERE (is_cancellato = false AND is_cliente = true);
CREATE INDEX IF NOT EXISTS idx_anagrafiche_partita_iva ON public."Tbl_Anagrafiche"(partita_iva) WHERE (is_cancellato = false);
CREATE INDEX IF NOT EXISTS idx_anagrafiche_ragione_sociale ON public."Tbl_Anagrafiche"(ragione_sociale) WHERE (is_cancellato = false);
CREATE INDEX IF NOT EXISTS idx_anagrafiche_search ON public."Tbl_Anagrafiche"(ragione_sociale, partita_iva) WHERE (is_cancellato = false);

-- RLS
ALTER TABLE public."Tbl_Anagrafiche" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access Anagrafiche"
ON public."Tbl_Anagrafiche"
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- 3. TABELLA: Tbl_Sedi (Entità Vive - FILOSOFIA RIVOLUZIONARIA)
-- =====================================================
CREATE TABLE IF NOT EXISTS public."Tbl_Sedi" (
    id_sede UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_anagrafica UUID,
    nome_sede TEXT,
    
    -- Dati geografici (QUI, non in Anagrafiche!)
    indirizzo TEXT,
    citta TEXT,
    provincia TEXT,
    cap NUMERIC,
    
    -- Tipizzazione Semantica (GENIALE!)
    is_legale BOOLEAN,
    is_operativa BOOLEAN,
    is_nave BOOLEAN,
    is_banchina BOOLEAN,
    is_officina BOOLEAN,
    
    -- Collegamenti
    id_porto UUID,
    
    -- Metadata
    is_cancellato BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_sedi_anagrafica FOREIGN KEY (id_anagrafica) 
        REFERENCES public."Tbl_Anagrafiche"(id_anagrafica) ON DELETE CASCADE,
    CONSTRAINT fk_sedi_porto FOREIGN KEY (id_porto) 
        REFERENCES public."Tbl_Porti"(id_porto) ON DELETE SET NULL
);

COMMENT ON TABLE public."Tbl_Sedi" IS 'Sedi come entità vive con tipizzazione semantica (is_nave, is_banchina, is_officina)';

-- Indici (fedeli all'originale)
CREATE INDEX IF NOT EXISTS idx_sedi_anagrafica ON public."Tbl_Sedi"(id_anagrafica) WHERE (is_cancellato = false);
CREATE INDEX IF NOT EXISTS idx_sedi_id_anagrafica ON public."Tbl_Sedi"(id_anagrafica);
CREATE INDEX IF NOT EXISTS idx_sedi_id_porto ON public."Tbl_Sedi"(id_porto);
CREATE INDEX IF NOT EXISTS idx_sedi_operativa ON public."Tbl_Sedi"(is_operativa) WHERE (is_cancellato = false AND is_operativa = true);
CREATE INDEX IF NOT EXISTS idx_sedi_search ON public."Tbl_Sedi"(indirizzo, citta, provincia) WHERE (is_cancellato = false);

-- RLS
ALTER TABLE public."Tbl_Sedi" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access Sedi"
ON public."Tbl_Sedi"
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- TRIGGER: Auto-update updated_at (solo per Porti)
-- =====================================================
CREATE OR REPLACE FUNCTION public.trg_update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_porti_updated_at
    BEFORE UPDATE ON public."Tbl_Porti"
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_update_timestamp();
