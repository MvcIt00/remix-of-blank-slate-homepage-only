-- PUBLIC SCHEMA VIEW: vw_int_lavorazioni_dettaglio
-- Generated from monolithic schema.sql

CREATE OR REPLACE VIEW public.vw_int_lavorazioni_dettaglio WITH (security_invoker='on') AS
 SELECT l.id_lavorazione,
    count(t.id_tecnico) AS n_tecnici_assegnati,
    array_agg(concat_ws(' '::text, t.nome, t.cognome)) AS nomi_tecnici
   FROM (public.int_lavorazioni l
     LEFT JOIN public.lav_tecnici lt ON ((l.id_lavorazione = lt.id_lavorazione)))
     LEFT JOIN public.tecnici t ON ((lt.id_tecnico = t.id_tecnico))
  GROUP BY l.id_lavorazione;

COMMENT ON VIEW public.vw_int_lavorazioni_dettaglio IS 'Dettaglio tecnico delle lavorazioni: conta i tecnici assegnati e ne aggrega i nomi.';
