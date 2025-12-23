-- =============================================================================
-- ARCHITETTURA DOCUMENT TEMPLATES (Enterprise Ready)
-- =============================================================================
-- Soluzione: Tabella Versionata + Stored Procedure di Gestione
-- Vantaggi:
-- 1. Nessun errore di "Insert manuale" (gestisce tutto la funzione).
-- 2. Versionamento automatico (v1, v2, v3...) senza doverlo calcolare a mano.
-- 3. Immutabilità: I vecchi contratti puntano alle vecchie versioni del testo.
-- 4. User Friendly: Basta chiamare la funzione 'publish_template'.

-- 1. TABELLA (Storage Layer)
CREATE TABLE IF NOT EXISTS public.document_templates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Chiavi di Ricerca
    code text NOT NULL,                -- Es: 'CONDIZIONI_NOLEGGIO' (Costante nel tempo)
    version integer NOT NULL,          -- Es: 1, 2, 3 (Incrementale automatico)
    
    -- Contenuto e Metadati
    content text NOT NULL,             -- Il testo (HTML/Plain)
    description text,                  -- Descrizione della specifica revisione
    category text DEFAULT 'general',
    
    -- Configurazione
    content_type text DEFAULT 'text/plain',
    metadata jsonb DEFAULT '{}'::jsonb,
    
    -- Audit & Validità
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid references auth.users(id),
    
    -- Vincoli
    CONSTRAINT uq_template_code_version UNIQUE (code, version)
);

-- 2. INDEXING (Performance)
CREATE INDEX IF NOT EXISTS idx_templates_lookup ON public.document_templates(code, version DESC);

-- 3. RLS SECURITY (Sicurezza)
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read Access" ON public.document_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Write Access" ON public.document_templates FOR ALL TO authenticated USING (true); -- Da restringere in prod

-- 4. STORED PROCEDURE (L'Interfaccia User Friendly)
-- Questa funzione è il "Cuore" del sistema. L'utente usa SOLO questa.
CREATE OR REPLACE FUNCTION public.publish_template(
    p_code text,           -- Il codice univoco (es. 'CONDIZIONI_GENERALI')
    p_content text,        -- Il tuo testo copiato/incollato
    p_description text DEFAULT NULL,
    p_category text DEFAULT 'contratti'
) RETURNS jsonb AS $$
DECLARE
    v_next_version integer;
    v_new_id uuid;
BEGIN
    -- A. Normalizzazione Input
    p_code := upper(trim(replace(p_code, ' ', '_'))); -- "Condizioni Generali" -> "CONDIZIONI_GENERALI"
    
    -- B. Calcolo Automatica Versione
    -- Se esiste, prendi la massima e aggiungi 1. Se no, parti da 1.
    SELECT COALESCE(MAX(version), 0) + 1 INTO v_next_version
    FROM public.document_templates
    WHERE code = p_code;
    
    -- C. Inserimento Sicuro
    INSERT INTO public.document_templates (
        code, 
        version, 
        content, 
        description, 
        category
    ) VALUES (
        p_code,
        v_next_version,
        p_content,
        COALESCE(p_description, 'Revisione ' || v_next_version || ' del ' || now()::date),
        p_category
    )
    RETURNING id INTO v_new_id;
    
    -- D. Output
    RETURN jsonb_build_object(
        'success', true,
        'id', v_new_id,
        'code', p_code,
        'version', v_next_version,
        'message', 'Template pubblicato con successo.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. TRIGGER DI UTILITÀ (Opzionale: Impedisce modifiche ai record passati)
-- In un sistema Enterprise, non si fa UPDATE di un testo legale firmato. Si crea una NUOVA versione.
CREATE OR REPLACE FUNCTION prevent_template_update() RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Non è permesso modificare un template pubblicato. Usa publish_template() per creare una nuova versione.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_protect_history
BEFORE UPDATE ON public.document_templates
FOR EACH ROW EXECUTE FUNCTION prevent_template_update();

GRANT EXECUTE ON FUNCTION public.publish_template TO authenticated;
