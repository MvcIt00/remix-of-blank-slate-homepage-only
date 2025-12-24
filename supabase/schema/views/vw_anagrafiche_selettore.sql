-- PUBLIC SCHEMA VIEW: vw_anagrafiche_selettore
-- Generated from monolithic schema.sql

CREATE OR REPLACE VIEW public.vw_anagrafiche_selettore AS
 SELECT a.id_anagrafica,
    a.ragione_sociale,
    a.partita_iva,
    a.is_cliente,
    a.is_fornitore,
    a.is_owner,
    sl.nome_sede AS sede_legale_nome,
    sl.citta AS sede_legale_citta,
    sl.provincia AS sede_legale_provincia,
    ( SELECT count(*) AS count
           FROM public."Sedi" s
          WHERE ((s.id_anagrafica = a.id_anagrafica) AND (s.is_cancellato = false))) AS num_sedi,
    ((((COALESCE(a.ragione_sociale, ''::text) || ' '::text) || COALESCE(a.partita_iva, ''::text)) || ' '::text) || COALESCE(sl.citta, ''::text)) AS search_text
   FROM (public."Anagrafiche" a
     LEFT JOIN public."Sedi" sl ON (((a.id_anagrafica = sl.id_anagrafica) AND (sl.is_legale = true) AND (sl.is_cancellato = false))))
  WHERE (a.is_cancellato = false);

COMMENT ON VIEW public.vw_anagrafiche_selettore IS 'View ottimizzata per il selettore anagrafiche. Include ragione sociale, sede legale, e conteggi per display efficiente.';
