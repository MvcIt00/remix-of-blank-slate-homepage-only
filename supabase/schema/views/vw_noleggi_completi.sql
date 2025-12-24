-- PUBLIC SCHEMA VIEW: vw_noleggi_completi
-- DESCRIPTION: Master view for Rental management.
-- RE-ENGINEERED: Uses Unified Sources but maintains Legacy API Aliases to prevent UI breakage.

DROP VIEW IF EXISTS public.vw_noleggi_completi CASCADE;

CREATE OR REPLACE VIEW public.vw_noleggi_completi WITH (security_invoker='on') AS
 SELECT 
    n.id_noleggio,
    n.created_at,
    n.data_inizio,
    n.data_fine,
    n.tempo_indeterminato,
    n.prezzo_noleggio,
    n.prezzo_trasporto,
    n.tipo_canone,
    n.stato_noleggio,
    n.is_terminato,
    n.note,
    -- Dati Mezzo (Aliased for Legacy compatibility)
    m.id_mezzo,
    m.marca as mezzo_marca,
    m.modello as mezzo_modello,
    m.matricola as mezzo_matricola,
    m.id_interno,
    -- Dati Cliente (Anagrafica - UNIFIED SOURCE, LEGACY ALIASES)
    ad.id_anagrafica,
    ad.ragione_sociale as cliente_ragione_sociale,
    ad.partita_iva as cliente_piva,
    a_raw.richiede_contratto_noleggio,
    ad.sede_legale_indirizzo as cliente_indirizzo, -- Optional: used in some components
    -- Dati Sede Operativa (Completi)
    s.id_sede as id_sede_operativa,
    s.nome_sede as sede_nome,
    s.indirizzo as sede_indirizzo,
    s.citta as sede_citta,
    s.provincia as sede_provincia,
    -- Link Preventivo (Relazione Inversa prev_noleggi)
    (
      SELECT pn.id_preventivo 
      FROM public.prev_noleggi pn
      WHERE pn.convertito_in_noleggio_id = n.id_noleggio 
      LIMIT 1
    ) as id_preventivo,
    -- Info Contratto Firmato (JSON per Frontend)
    (
      SELECT row_to_json(dn.*) 
      FROM public.documenti_noleggio dn 
      WHERE dn.id_noleggio = n.id_noleggio 
        AND dn.is_cancellato IS NOT TRUE 
        AND dn.tipo_documento = 'contratto_firmato'
      ORDER BY dn.created_at DESC 
      LIMIT 1
    ) as contratto_firmato_info,
    -- Info Bozza Contratto (JSON per Frontend)
    (
      SELECT row_to_json(cn.*) 
      FROM public.contratti_noleggio cn 
      WHERE cn.id_noleggio = n.id_noleggio 
        AND cn.is_cancellato IS NOT TRUE
      ORDER BY cn.created_at DESC 
      LIMIT 1
    ) as contratto_bozza_info
   FROM public."Noleggi" n
     LEFT JOIN public."Mezzi" m ON n.id_mezzo = m.id_mezzo
     LEFT JOIN public."Anagrafiche" a_raw ON n.id_anagrafica = a_raw.id_anagrafica
     LEFT JOIN public.vw_entita_anagrafica_documentale ad ON n.id_anagrafica = ad.id_anagrafica
     LEFT JOIN public.vw_sedi_tutte s ON n.sede_operativa = s.id_sede
  WHERE n.is_cancellato = false;

COMMENT ON VIEW public.vw_noleggi_completi IS 'View ibrida: Dati unificati alla fonte + API Column Naming compatibile con il frontend esistente.';
