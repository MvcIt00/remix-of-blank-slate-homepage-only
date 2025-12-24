-- PUBLIC SCHEMA VIEW: vw_sedi_tutte
-- Generated from monolithic schema.sql

CREATE OR REPLACE VIEW public.vw_sedi_tutte WITH (security_invoker='on') AS
 SELECT s.id_sede,
    s.id_anagrafica,
    s.nome_sede,
    s.indirizzo,
    s.citta,
    s.provincia,
    s.cap,
    s.is_legale,
    s.is_operativa,
    s.is_nave,
    s.is_banchina,
    s.is_officina,
    p.nome_porto,
    concat_ws(', '::text, s.indirizzo, s.citta, (s.provincia)::text, (s.cap)::text) AS ubicazione_completa
   FROM (public."Sedi" s
     LEFT JOIN public."Porti" p ON ((s.id_porto = p.id_porto)))
  WHERE (s.is_cancellato = false);

COMMENT ON VIEW public.vw_sedi_tutte IS 'View completa di tutte le sedi non cancellate, con porto e stringa di ubicazione pre-formattata.';
