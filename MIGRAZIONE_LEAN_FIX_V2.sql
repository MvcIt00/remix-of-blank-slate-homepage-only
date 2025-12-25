-- ==============================================================================
-- 🚀 FIXED MIGRAZIONE: LEAN & SCALABLE PREVENTIVI (Dependency Aware)
-- Gestisce la dipendenza della vista vw_preventivi_completi.
-- ==============================================================================

-- 1. PREPARAZIONE TABELLA FIGLIO
ALTER TABLE public.prev_noleggi ADD COLUMN IF NOT EXISTS codice text;

-- 2. MIGRAZIONE DATI
UPDATE public.prev_noleggi pn
SET codice = p.codice
FROM public."Preventivi" p
WHERE pn.id_preventivo = p.id_preventivo
AND p.codice IS NOT NULL;

-- 3. AGGIORNAMENTO VISTA (Rimuove dipendenza da Preventivi.codice)
-- Redefiniamo la vista prendendo il codice da prev_noleggi
CREATE OR REPLACE VIEW public.vw_preventivi_completi AS
SELECT 
    pn.id_preventivo,
    pn.codice,           -- <--- Ora preso da qui
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
    pn.dati_cliente AS snapshot_cliente,
    pn.dati_mezzo AS snapshot_mezzo,
    pn.dati_azienda AS snapshot_azienda,
    COALESCE(pn.dati_mezzo ->> 'marca'::text, m.marca) AS marca,
    COALESCE(pn.dati_mezzo ->> 'modello'::text, m.modello) AS modello,
    COALESCE(pn.dati_mezzo ->> 'matricola'::text, m.matricola) AS matricola,
    COALESCE(pn.dati_mezzo ->> 'id_interno'::text, m.id_interno) AS id_interno,
    COALESCE(pn.dati_cliente ->> 'ragione_sociale'::text, ad.ragione_sociale) AS cliente_ragione_sociale,
    COALESCE(pn.dati_cliente ->> 'partita_iva'::text, ad.partita_iva) AS cliente_piva,
    COALESCE(pn.dati_cliente ->> 'email_principale'::text, ad.email_principale) AS cliente_email,
    s.id_sede AS id_sede_operativa,
    s.nome_sede AS sede_nome,
    s.indirizzo AS sede_indirizzo,
    s.citta AS sede_citta,
    s.provincia AS sede_provincia,
    n.is_terminato AS noleggio_is_terminato
FROM public.prev_noleggi pn
JOIN public."Preventivi" p ON pn.id_preventivo = p.id_preventivo
LEFT JOIN public."Mezzi" m ON pn.id_mezzo = m.id_mezzo
LEFT JOIN public.vw_entita_anagrafica_documentale ad ON pn.id_anagrafica = ad.id_anagrafica
LEFT JOIN public.vw_sedi_tutte s ON pn.sede_operativa = s.id_sede
LEFT JOIN public."Noleggi" n ON pn.convertito_in_noleggio_id = n.id_noleggio
WHERE p.is_cancellato = false;

-- 4. CLEANUP TABELLA PADRE
-- Ora che la vista non dipende più da "Preventivi".codice, possiamo pulire
DROP TRIGGER IF EXISTS trg_set_preventivo_code ON public."Preventivi";
ALTER TABLE public."Preventivi" DROP COLUMN IF EXISTS codice;

-- 5. NUOVA LOGICA GENERAZIONE PN (Figlio)
CREATE OR REPLACE FUNCTION public.fn_set_preventivo_noleggio_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codice IS NULL THEN
        NEW.codice := public.get_next_document_code('PN');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_set_prev_noleggio_code ON public.prev_noleggi;
CREATE TRIGGER trg_set_prev_noleggio_code
BEFORE INSERT ON public.prev_noleggi
FOR EACH ROW
EXECUTE FUNCTION public.fn_set_preventivo_noleggio_code();

-- 6. SINCRONIZZAZIONE ATOMICA (Aggiornamento id_anagrafica)
CREATE OR REPLACE FUNCTION public.fn_sync_preventivo_parent_entity_update()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.id_anagrafica IS DISTINCT FROM NEW.id_anagrafica) THEN
        UPDATE public."Preventivi"
        SET id_anagrafica = NEW.id_anagrafica
        WHERE id_preventivo = NEW.id_preventivo;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_preventivo_parent ON public.prev_noleggi;
CREATE TRIGGER tr_sync_preventivo_parent
AFTER UPDATE OF id_anagrafica ON public.prev_noleggi
FOR EACH ROW
EXECUTE FUNCTION public.fn_sync_preventivo_parent_entity_update();

COMMENT ON TABLE public.prev_noleggi IS 'Tabella specializzata noleggio con codice PN. Storage: noleggio_docs';
