-- ==============================================================================
-- 🚀 ENTERPRISE DEPLOYMENT: SNAPSHOTS & ARCHITECTURAL ALIGNMENT
-- Eseguire questo script nel SQL Editor di Supabase.
-- ==============================================================================

-- 1. AGGIORNAMENTO TABELLA: Introduzione Snapshots JSONB
-- Forniscono integrità storica (immutabilità documentale)
ALTER TABLE public.prev_noleggi
ADD COLUMN IF NOT EXISTS dati_cliente JSONB,
ADD COLUMN IF NOT EXISTS dati_mezzo JSONB,
ADD COLUMN IF NOT EXISTS dati_azienda JSONB;

-- 2. FUNZIONE TRIGGER: Cattura Snapshot Automatica
-- Salva lo stato attuale delle anagrafiche nel preventivo
CREATE OR REPLACE FUNCTION public.fn_capture_preventivo_snapshot()
RETURNS TRIGGER AS $$
DECLARE
    v_cliente_json JSONB;
    v_mezzo_json JSONB;
    v_azienda_json JSONB;
BEGIN
    -- Snapshot Cliente (dati completi per PDF)
    SELECT row_to_json(ad.*)::jsonb INTO v_cliente_json
    FROM public.vw_entita_anagrafica_documentale ad
    WHERE ad.id_anagrafica = NEW.id_anagrafica;

    -- Snapshot Mezzo (specifiche tecniche e matricola)
    SELECT row_to_json(m.*)::jsonb INTO v_mezzo_json
    FROM public."Mezzi" m
    WHERE m.id_mezzo = NEW.id_mezzo;

    -- Snapshot Azienda (Owner/Toscana Carrelli)
    SELECT row_to_json(ao.*)::jsonb INTO v_azienda_json
    FROM public.vw_owner_info ao
    LIMIT 1;

    -- Assegnazione
    NEW.dati_cliente = v_cliente_json;
    NEW.dati_mezzo = v_mezzo_json;
    NEW.dati_azienda = v_azienda_json;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. TRIGGER: Automazione al cambio di stato
-- Lo snapshot viene catturato quando il preventivo esce dallo stato 'bozza'
DROP TRIGGER IF EXISTS tr_preventivo_snapshot_insert ON public.prev_noleggi;
CREATE TRIGGER tr_preventivo_snapshot_insert
BEFORE INSERT ON public.prev_noleggi
FOR EACH ROW
WHEN (NEW.stato NOT IN ('bozza'))
EXECUTE FUNCTION public.fn_capture_preventivo_snapshot();

DROP TRIGGER IF EXISTS tr_preventivo_snapshot_update ON public.prev_noleggi;
CREATE TRIGGER tr_preventivo_snapshot_update
BEFORE UPDATE OF stato ON public.prev_noleggi
FOR EACH ROW
WHEN (NEW.stato NOT IN ('bozza') AND (OLD.stato IS NULL OR OLD.stato = 'bozza'))
EXECUTE FUNCTION public.fn_capture_preventivo_snapshot();

-- 4. REFACTORING VIEW: Privilegio degli Snapshot
-- La vista ora mostra i dati 'congelati' se presenti, altrimenti quelli live (per bozze)
DROP VIEW IF EXISTS public.vw_preventivi_completi CASCADE;

CREATE OR REPLACE VIEW public.vw_preventivi_completi AS
SELECT 
    p.id_preventivo,
    p.codice,
    p.is_cancellato,
    p.created_at AS preventivo_created_at,
    pn.id_mezzo,
    pn.id_anagrafica,
    pn.id_anagrafica_fornitore,
    pn.data_inizio,
    pn.data_fine,
    pn.tempo_indeterminato,
    pn.prezzo_noleggio,
    pn.prezzo_trasporto,
    pn.tipo_canone,
    pn.note,
    pn.deposito_cauzionale,
    pn.modalita_pagamento,
    pn.clausole_speciali,
    pn.sede_operativa,
    pn.stato,
    pn.created_at,
    pn.updated_at,
    pn.convertito_in_noleggio_id,
    pn.pdf_bozza_path,
    pn.pdf_firmato_path,
    
    -- Snapshots per il frontend
    pn.dati_cliente AS snapshot_cliente,
    pn.dati_mezzo AS snapshot_mezzo,
    pn.dati_azienda AS snapshot_azienda,
    
    -- Dati Mezzo (Fallback snapshot -> live)
    COALESCE(pn.dati_mezzo->>'marca', m.marca) AS marca,
    COALESCE(pn.dati_mezzo->>'modello', m.modello) AS modello,
    COALESCE(pn.dati_mezzo->>'matricola', m.matricola) AS matricola,
    COALESCE(pn.dati_mezzo->>'id_interno', m.id_interno) AS id_interno,
    
    -- Dati Cliente (Fallback snapshot -> live)
    COALESCE(pn.dati_cliente->>'ragione_sociale', ad.ragione_sociale) AS cliente_ragione_sociale,
    COALESCE(pn.dati_cliente->>'partita_iva', ad.partita_iva) AS cliente_piva,
    COALESCE(pn.dati_cliente->>'email_principale', ad.email_principale) AS cliente_email,
    
    -- Dati Sede Operativa (Sempre live per logistica corrente)
    s.id_sede AS id_sede_operativa,
    s.nome_sede AS sede_nome,
    s.indirizzo AS sede_indirizzo,
    s.citta AS sede_citta,
    s.provincia AS sede_provincia,
    
    -- Noleggio Correlato
    n.is_terminato AS noleggio_is_terminato
    
FROM public.prev_noleggi pn
JOIN public."Preventivi" p ON pn.id_preventivo = p.id_preventivo
LEFT JOIN public."Mezzi" m ON pn.id_mezzo = m.id_mezzo
LEFT JOIN public.vw_entita_anagrafica_documentale ad ON pn.id_anagrafica = ad.id_anagrafica
LEFT JOIN public.vw_sedi_tutte s ON pn.sede_operativa = s.id_sede
LEFT JOIN public."Noleggi" n ON pn.convertito_in_noleggio_id = n.id_noleggio
WHERE p.is_cancellato = false;

-- Grant permissions
GRANT SELECT ON public.vw_preventivi_completi TO authenticated;
GRANT SELECT ON public.vw_preventivi_completi TO anon;

COMMENT ON VIEW public.vw_preventivi_completi IS 'Enterprise View: Unifica dati live e snapshot storici per preventivi noleggio.';
