-- ==============================================================================
-- MIGRATION: 20251224_000007_preventivi_snapshots.sql
-- DESCRIZIONE: Allineamento Enterprise dell'ecosistema Preventivi allo standard dei Contratti.
--              Introduzione di SNAPSHOT JSONB per integrità storica dati.
-- ==============================================================================

-- 1. Aggiunta Colonne Snapshot a prev_noleggi
ALTER TABLE public.prev_noleggi
ADD COLUMN IF NOT EXISTS dati_cliente JSONB,
ADD COLUMN IF NOT EXISTS dati_mezzo JSONB,
ADD COLUMN IF NOT EXISTS dati_azienda JSONB;

-- 2. Funzione Trigger per Cattura Snapshot
-- Questa funzione "fotografa" i dati correnti di cliente e mezzo e li salva nel preventivo
-- per garantire che il PDF rimanga integro anche se le anagrafiche cambiano.
CREATE OR REPLACE FUNCTION public.fn_capture_preventivo_snapshot()
RETURNS TRIGGER AS $$
DECLARE
    v_cliente_json JSONB;
    v_mezzo_json JSONB;
    v_azienda_json JSONB;
BEGIN
    -- 1. Snapshot Cliente (da vw_entita_anagrafica_documentale per avere dati completi)
    SELECT row_to_json(ad.*)::jsonb INTO v_cliente_json
    FROM public.vw_entita_anagrafica_documentale ad
    WHERE ad.id_anagrafica = NEW.id_anagrafica;

    -- 2. Snapshot Mezzo
    SELECT row_to_json(m.*)::jsonb INTO v_mezzo_json
    FROM public."Mezzi" m
    WHERE m.id_mezzo = NEW.id_mezzo;

    -- 3. Snapshot Azienda (Owner)
    SELECT row_to_json(ao.*)::jsonb INTO v_azienda_json
    FROM public.vw_anagrafiche_owners ao
    LIMIT 1;

    -- Assegnazione snapshot
    NEW.dati_cliente = v_cliente_json;
    NEW.dati_mezzo = v_mezzo_json;
    NEW.dati_azienda = v_azienda_json;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger per Automazione Snapshot
-- Lo snapshot viene catturato automaticamente quando il preventivo 
-- esce dallo stato 'bozza' o quando viene creato direttamente in stato avanzato.
DROP TRIGGER IF EXISTS tr_preventivo_snapshot ON public.prev_noleggi;

CREATE TRIGGER tr_preventivo_snapshot
BEFORE INSERT OR UPDATE OF stato ON public.prev_noleggi
FOR EACH ROW
WHEN (NEW.stato NOT IN ('bozza') AND (OLD.stato IS NULL OR OLD.stato = 'bozza'))
EXECUTE FUNCTION public.fn_capture_preventivo_snapshot();

-- 4. Commenti
COMMENT ON COLUMN public.prev_noleggi.dati_cliente IS 'Snapshot JSON dei dati cliente al momento dell invio/approvazione.';
COMMENT ON COLUMN public.prev_noleggi.dati_mezzo IS 'Snapshot JSON dei dati mezzo al momento dell invio/approvazione.';
COMMENT ON COLUMN public.prev_noleggi.dati_azienda IS 'Snapshot JSON dei dati dell azienda fornitrice (Toscana Carrelli).';
