-- FIX COMPLETO SISTEMA DI CODIFICA
-- Questo script sovrascrive e corregge le configurazioni precedenti.

BEGIN;

-- 1. Tabella Sequenze (Drop e Re-Create per sicurezza su default value)
CREATE TABLE IF NOT EXISTS public.document_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Usa gen_random_uuid() nativo
    doc_type TEXT NOT NULL,
    year INTEGER NOT NULL,
    current_value INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(doc_type, year)
);

-- Assicuriamoci che RLS sia disabilitato o gestito (per ora disabilitato per semplicità, tanto usiamo function security definer)
ALTER TABLE public.document_sequences DISABLE ROW LEVEL SECURITY;

-- 2. Funzione Generazione Codice (SECURITY DEFINER + search_path)
CREATE OR REPLACE FUNCTION public.get_next_document_code(p_doc_type TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER -- Esegue come admin
SET search_path = public, extensions -- Include extensions per gen_random_uuid se necessario
AS $$
DECLARE
    v_year INTEGER;
    v_new_value INTEGER;
    v_code TEXT;
BEGIN
    v_year := date_part('year', CURRENT_DATE);

    -- Upsert: Inserisce o Incrementa
    INSERT INTO public.document_sequences (doc_type, year, current_value)
    VALUES (p_doc_type, v_year, 1)
    ON CONFLICT (doc_type, year)
    DO UPDATE SET
        current_value = document_sequences.current_value + 1,
        updated_at = timezone('utc'::text, now())
    RETURNING current_value INTO v_new_value;

    -- Formatta: TIPO-ANNO-NUMERO (es. CNT-2024-00150)
    v_code := p_doc_type || '-' || v_year || '-' || LPAD(v_new_value::TEXT, 5, '0');

    RETURN v_code;
END;
$$;

-- 3. Permessi (Fondamentali)
GRANT USAGE ON SCHEMA public TO authenticated, service_role;
GRANT ALL ON TABLE public.document_sequences TO  service_role; 
-- All'utente web basta eseguire la funzione:
GRANT EXECUTE ON FUNCTION public.get_next_document_code(text) TO authenticated, service_role;


-- 4. Ripristino Trigger per CONTRATTI (contratti_noleggio)
DROP TRIGGER IF EXISTS trg_set_contratto_code ON public.contratti_noleggio;

CREATE OR REPLACE FUNCTION public.trigger_set_contratto_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.codice_contratto IS NULL THEN
        NEW.codice_contratto := public.get_next_document_code('CNT');
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_set_contratto_code
BEFORE INSERT ON public.contratti_noleggio
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_contratto_code();


-- 5. Ripristino Trigger per PREVENTIVI ("Preventivi")
DROP TRIGGER IF EXISTS trg_set_preventivo_code ON public."Preventivi";

CREATE OR REPLACE FUNCTION public.trigger_set_preventivo_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.codice IS NULL THEN
        NEW.codice := public.get_next_document_code('PRV');
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_set_preventivo_code
BEFORE INSERT ON public."Preventivi"
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_preventivo_code();

COMMIT;
