-- =====================================================
-- MIGRATION: 20251224_000003_fix_vw_preventivi_completi
-- DESCRIZIONE: Fix della view vw_preventivi_completi per includere
--              tutti i campi necessari al frontend (stato, created_at,
--              convertito_in_noleggio_id, pdf paths)
-- =====================================================

-- Drop della view esistente
DROP VIEW IF EXISTS public.vw_preventivi_completi CASCADE;

-- Ricreazione della view con TUTTI i campi necessari
CREATE OR REPLACE VIEW public.vw_preventivi_completi AS
SELECT 
    -- Campi da Preventivi (padre)
    p.id_preventivo,
    p.codice,
    p.is_cancellato,
    p.created_at as preventivo_created_at,
    
    -- Campi da prev_noleggi (figlio) - COMPLETI
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
    
    -- ✅ CAMPI CRITICI AGGIUNTI (erano mancanti!)
    pn.stato,
    pn.created_at,
    pn.updated_at,
    pn.convertito_in_noleggio_id,
    pn.pdf_bozza_path,
    pn.pdf_firmato_path,
    
    -- Dati Mezzo
    m.marca,
    m.modello,
    m.matricola,
    m.id_interno,
    m.anno AS mezzo_anno,
    m.ore_moto,
    m.categoria,
    m.specifiche_tecniche,
    
    -- Dati Cliente (da view vw_entita_anagrafica_documentale)
    ad.ragione_sociale,
    ad.ragione_sociale AS cliente_ragione_sociale,
    ad.partita_iva,
    ad.partita_iva AS cliente_piva,
    ad.email_principale,
    ad.email_principale AS cliente_email,
    ad.pec,
    ad.pec AS cliente_pec,
    ad.codice_univoco,
    ad.codice_univoco AS cliente_codice_univoco,
    ad.telefono_principale,
    ad.telefono_principale AS cliente_telefono,
    ad.nome_contatto_principale,
    ad.sede_legale_indirizzo,
    ad.sede_legale_indirizzo AS cliente_indirizzo,
    ad.sede_legale_citta,
    ad.sede_legale_citta AS cliente_citta,
    ad.sede_legale_cap,
    ad.sede_legale_cap AS cliente_cap,
    ad.sede_legale_provincia,
    ad.sede_legale_provincia AS cliente_provincia,
    
    -- Dati Sede Operativa
    s.id_sede AS id_sede_operativa,
    s.nome_sede AS sede_operativa_nome,
    s.nome_sede AS sede_nome,
    s.ubicazione_completa AS sede_operativa_ubicazione,
    s.indirizzo AS sede_indirizzo,
    s.citta AS sede_citta,
    s.provincia AS sede_provincia,
    
    -- Info Noleggio Correlato (se convertito)
    n.is_terminato AS noleggio_is_terminato
    
FROM public.prev_noleggi pn
INNER JOIN public."Preventivi" p ON pn.id_preventivo = p.id_preventivo
LEFT JOIN public."Mezzi" m ON pn.id_mezzo = m.id_mezzo
LEFT JOIN public.vw_entita_anagrafica_documentale ad ON pn.id_anagrafica = ad.id_anagrafica
LEFT JOIN public.vw_sedi_tutte s ON pn.sede_operativa = s.id_sede
LEFT JOIN public."Noleggi" n ON pn.convertito_in_noleggio_id = n.id_noleggio
WHERE p.is_cancellato = false;

-- Commento per PostgREST
COMMENT ON VIEW public.vw_preventivi_completi IS 
'View completa per preventivi noleggio. Include tutti i campi necessari al frontend: stato, created_at, convertito_in_noleggio_id, pdf paths, dati cliente, mezzo e sede operativa.';

-- Grant permissions (RLS gestito dalle tabelle sottostanti)
GRANT SELECT ON public.vw_preventivi_completi TO authenticated;
GRANT SELECT ON public.vw_preventivi_completi TO anon;
