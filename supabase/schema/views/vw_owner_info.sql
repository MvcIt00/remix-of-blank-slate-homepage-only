-- PUBLIC SCHEMA VIEW: vw_owner_info
-- Generated from monolithic schema.sql

CREATE OR REPLACE VIEW public.vw_owner_info WITH (security_invoker='on') AS
 SELECT a.id_anagrafica,
    a.ragione_sociale,
    a.partita_iva,
    dm.pec,
    dm.iban,
    dm.codice_univoco,
    sl.indirizzo AS sede_legale_indirizzo,
    sl.citta AS sede_legale_citta,
    sl.cap AS sede_legale_cap,
    sl.provincia AS sede_legale_provincia,
    c.email AS contatto_email,
    c.telefono AS contatto_telefono
   FROM (((public."Anagrafiche" a
     LEFT JOIN public.an_dati_amministrativi dm ON ((a.id_anagrafica = dm.id_anagrafica)))
     LEFT JOIN public."Sedi" sl ON (((a.id_anagrafica = sl.id_anagrafica) AND (sl.is_legale = true) AND (sl.is_cancellato = false))))
     LEFT JOIN LATERAL ( SELECT an_contatti.email,
            an_contatti.telefono
           FROM public.an_contatti
          WHERE ((an_contatti.id_anagrafica = a.id_anagrafica) AND (an_contatti.is_aziendale = true) AND (an_contatti.is_cancellato = false))
         LIMIT 1) c ON (true))
  WHERE ((a.is_owner = true) AND (a.is_cancellato = false));
