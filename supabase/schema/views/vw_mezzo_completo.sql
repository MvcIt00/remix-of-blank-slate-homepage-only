-- PUBLIC SCHEMA VIEW: vw_mezzo_completo
-- Generated from monolithic schema.sql

CREATE OR REPLACE VIEW public.vw_mezzo_completo WITH (security_invoker='on') AS
 SELECT m.id_mezzo,
    m.marca,
    m.modello,
    m.matricola,
    m.id_interno,
    m.anno,
    m.categoria,
    m.ore_moto,
    m.is_disponibile_noleggio,
    m.stato_funzionamento,
    m.specifiche_tecniche,
    a.ragione_sociale AS owner_ragione_sociale,
    a.partita_iva AS owner_partita_iva,
    sl.nome_sede AS sede_legale_nome,
    sl.ubicazione_completa AS sede_legale_ubicazione,
    su.nome_sede AS ubicazione_attuale_nome,
    su.ubicazione_completa AS ubicazione_attuale_dettaglio
   FROM (((public."Mezzi" m
     LEFT JOIN public."Anagrafiche" a ON ((m.id_anagrafica = a.id_anagrafica)))
     LEFT JOIN public.vw_sedi_tutte sl ON (((a.id_anagrafica = sl.id_anagrafica) AND (sl.is_legale = true))))
     LEFT JOIN public.vw_sedi_tutte su ON ((m.id_sede_ubicazione = su.id_sede)))
  WHERE (m.is_cancellato = false);

COMMENT ON VIEW public.vw_mezzo_completo IS 'Master view del mezzo: aggrega owner, sede legale e ubicazione attuale per display e documenti.';
