-- ==============================================================================
-- MIGRATION: 20251223100000_create_preventivi_view.sql
-- DESCRIZIONE: Crea la view vw_preventivi_completi per la gestione Preventivi.
--              Assicura che tutti i dati anagrafici (indirizzi, piva, pec) e
--              tecnici del mezzo siano disponibili in un singolo record piano
--              per alimentare correttamente il generatore PDF.
-- ==============================================================================

-- Assicura l'esistenza delle colonne path su prev_noleggi
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prev_noleggi' AND column_name = 'pdf_bozza_path') THEN
        ALTER TABLE public.prev_noleggi ADD COLUMN pdf_bozza_path text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prev_noleggi' AND column_name = 'pdf_firmato_path') THEN
        ALTER TABLE public.prev_noleggi ADD COLUMN pdf_firmato_path text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Preventivi' AND column_name = 'codice') THEN
        ALTER TABLE public."Preventivi" ADD COLUMN codice text;
    END IF;
END$$;

DROP VIEW IF EXISTS public.vw_preventivi_completi CASCADE;

CREATE OR REPLACE VIEW public.vw_preventivi_completi AS
SELECT 
    pn.id_preventivo,
    pn.id_anagrafica,
    pn.id_anagrafica_fornitore,
    pn.id_mezzo,
    pn.data_inizio,
    pn.data_fine,
    pn.tempo_indeterminato,
    pn.prezzo_noleggio,
    pn.prezzo_trasporto,
    pn.tipo_canone,
    pn.note,
    pn.stato,
    pn.convertito_in_noleggio_id,
    pn.created_at,
    pn.updated_at,
    pn.pdf_bozza_path,
    pn.pdf_firmato_path,
    -- Codice dal padre
    p.codice as codice,
    p.is_cancellato,
    -- Dati Cliente
    a.ragione_sociale as cliente_ragione_sociale,
    a.partita_iva as cliente_piva,
    (SELECT email FROM public.an_contatti c WHERE c.id_anagrafica = a.id_anagrafica AND c.is_cancellato = false ORDER BY is_aziendale DESC, created_at ASC LIMIT 1) as cliente_email,
    dm.pec as cliente_pec,
    dm.codice_univoco as cliente_codice_univoco,
    -- Dati Sede Legale Cliente
    sl.indirizzo as cliente_indirizzo,
    sl.citta as cliente_citta,
    sl.cap::text as cliente_cap,
    sl.provincia as cliente_provincia,
    -- Dati Mezzo
    m.marca as marca,
    m.modello as modello,
    m.matricola as matricola,
    m.id_interno as id_interno,
    m.anno as mezzo_anno,
    m.ore_moto as ore_moto,
    -- Info Noleggio Correlato
    n.is_terminato as noleggio_is_terminato
FROM public.prev_noleggi pn
LEFT JOIN public."Preventivi" p ON pn.id_preventivo = p.id_preventivo
LEFT JOIN public."Anagrafiche" a ON pn.id_anagrafica = a.id_anagrafica
LEFT JOIN public.an_dati_amministrativi dm ON a.id_anagrafica = dm.id_anagrafica
LEFT JOIN public."Sedi" sl ON (a.id_anagrafica = sl.id_anagrafica AND sl.is_legale = true AND sl.is_cancellato = false)
LEFT JOIN public."Mezzi" m ON pn.id_mezzo = m.id_mezzo
LEFT JOIN public."Noleggi" n ON pn.convertito_in_noleggio_id = n.id_noleggio
WHERE p.is_cancellato = false;

-- INDICI DI PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_prev_noleggi_anagrafica ON public.prev_noleggi(id_anagrafica);
CREATE INDEX IF NOT EXISTS idx_prev_noleggi_mezzo ON public.prev_noleggi(id_mezzo);
CREATE INDEX IF NOT EXISTS idx_prev_noleggi_convertito ON public.prev_noleggi(convertito_in_noleggio_id);

-- Commento per PostgREST
COMMENT ON VIEW public.vw_preventivi_completi IS 
'View per la generazione PDF e liste preventivi. Aggrega Dati Cliente (Sede Legale), Mezzi e Preventivi.';
