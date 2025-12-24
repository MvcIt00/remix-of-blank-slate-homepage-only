-- PUBLIC SCHEMA VIEW: vw_utenti_completi
-- Generated from monolithic schema.sql

CREATE OR REPLACE VIEW public.vw_utenti_completi WITH (security_invoker='on') AS
 SELECT u.id_utente,
    u.nome,
    u.cognome,
    u.email,
    u.id_auth,
    u.created_at,
    COALESCE(json_agg(r.role) FILTER (WHERE (r.role IS NOT NULL)), '[]'::json) AS roles
   FROM (public.utenti u
     LEFT JOIN public.user_roles r ON ((u.id_auth = r.user_id)))
  WHERE (u.is_cancellato = false)
  GROUP BY u.id_utente;

COMMENT ON VIEW public.vw_utenti_completi IS 'View completa degli utenti con aggregazione dei ruoli assegnati per una gestione centralizzata dei permessi.';
