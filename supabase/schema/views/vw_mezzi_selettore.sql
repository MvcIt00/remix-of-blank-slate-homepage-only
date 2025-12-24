-- PUBLIC SCHEMA VIEW: vw_mezzi_selettore
-- Generated from monolithic schema.sql

CREATE OR REPLACE VIEW public.vw_mezzi_selettore AS
  SELECT m.id_mezzo,
    m.marca,
    m.modello,
    m.matricola,
    m.id_interno,
    m.anno,
    m.categoria,
    m.stato_funzionamento,
    m.is_disponibile_noleggio,
    m.ore_moto,
    m.id_anagrafica,
    m.id_sede_assegnata,
    m.id_sede_ubicazione,
    a.ragione_sociale AS owner_ragione_sociale,
    sa.nome_sede AS sede_assegnata_nome,
    sa.ubicazione_completa AS sede_assegnata_ubicazione,
    su.nome_sede AS ubicazione_nome,
    su.ubicazione_completa,
    ((((((((COALESCE(m.marca, ''::text) || ' '::text) || COALESCE(m.modello, ''::text)) || ' '::text) || COALESCE(m.matricola, ''::text)) || ' '::text) || COALESCE(m.id_interno, ''::text)) || ' '::text) || COALESCE(a.ragione_sociale, ''::text)) AS search_text
   FROM (((public."Mezzi" m
     LEFT JOIN public."Anagrafiche" a ON ((m.id_anagrafica = a.id_anagrafica)))
     LEFT JOIN public.vw_sedi_tutte sa ON ((m.id_sede_assegnata = sa.id_sede)))
     LEFT JOIN public.vw_sedi_tutte su ON ((m.id_sede_ubicazione = su.id_sede)))
  WHERE (m.is_cancellato = false);

COMMENT ON VIEW public.vw_mezzi_selettore IS 'View ottimizzata per il selettore mezzi. Include tutti i dati necessari per display e ricerca con JOIN pre-computati per massime performance.';
