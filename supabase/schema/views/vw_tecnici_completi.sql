-- PUBLIC SCHEMA VIEW: vw_tecnici_completi
-- Generated from monolithic schema.sql

CREATE OR REPLACE VIEW public.vw_tecnici_completi WITH (security_invoker='on') AS
 SELECT t.id_tecnico,
    t.id_utente,
    t.nome,
    t.cognome,
    t.specializzazione,
    u.email,
    u.id_auth
   FROM (public.tecnici t
     LEFT JOIN public.utenti u ON ((t.id_utente = u.id_utente)))
  WHERE (t.is_cancellato = false);

COMMENT ON VIEW public.vw_tecnici_completi IS 'View completa dei tecnici con riferimento all''utente di sistema ed email.';
