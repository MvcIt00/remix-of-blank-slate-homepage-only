-- ==========================================
-- TABLE: document_snapshots
-- DESCRIPTION: Permanent storage for point-in-time document data.
-- ==========================================

CREATE TABLE IF NOT EXISTS public.document_snapshots (
    id_snapshot UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL, -- 'preventivo', 'contratto', 'intervento'
    entity_id UUID NOT NULL,   -- The FK to the source record
    version INTEGER DEFAULT 1,
    
    -- Snapshot Data (Atomic Blobs)
    dati_cliente JSONB NOT NULL,
    dati_mezzo JSONB,
    dati_termini JSONB, -- Terms, dates, pricing, etc.
    dati_owner JSONB,   -- Company info at the time of emission
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Search Optimization
    codice_documento TEXT, -- Denormalized code for fast lookup
    
    CONSTRAINT unique_document_version UNIQUE(entity_type, entity_id, version)
);

-- Indices for fast retrieval of document history
CREATE INDEX idx_snapshots_entity ON public.document_snapshots(entity_type, entity_id);
CREATE INDEX idx_snapshots_lookup ON public.document_snapshots(codice_documento);

-- RLS
ALTER TABLE public.document_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Accesso snapshots per utenti autenticati" 
ON public.document_snapshots 
FOR ALL 
TO authenticated 
USING (true);

COMMENT ON TABLE public.document_snapshots IS 'Archivio storico dei dati documentali (Snapshot Point-in-Time) per garantire integrità legale e tecnica.';
