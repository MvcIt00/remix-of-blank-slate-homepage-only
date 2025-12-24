-- PUBLIC SCHEMA VIEW: vw_anagrafiche_complete
-- Generated from monolithic schema.sql

CREATE OR REPLACE VIEW public.vw_anagrafiche_complete WITH (security_invoker='on') AS
 SELECT a.id_anagrafica,
    a.ragione_sociale,
    a.partita_iva,
    a.is_cliente,
    a.is_fornitore,
    a.is_owner,
    dm.pec,
    dm.codice_univoco,
    dm.iban,
    dm.pagamento AS modalita_pagamento_default,
    dm.esente_iva,
    (( SELECT row_to_json(sl.*) AS row_to_json
           FROM ( SELECT "Sedi".indirizzo,
                    "Sedi".citta,
                    "Sedi".cap,
                    "Sedi".provincia,
                    "Sedi".nome_sede
                   FROM public."Sedi"
                  WHERE (("Sedi".id_anagrafica = a.id_anagrafica) AND ("Sedi".is_legale = true) AND ("Sedi".is_cancellato = false))
                 LIMIT 1) sl))::jsonb AS sede_legale,
    COALESCE(( SELECT jsonb_agg(row_to_json(s.*)) AS jsonb_agg
           FROM ( SELECT "Sedi".id_sede,
                    "Sedi".nome_sede,
                    "Sedi".indirizzo,
                    "Sedi".citta,
                    "Sedi".cap,
                    "Sedi".provincia,
                    "Sedi".is_legale,
                    "Sedi".is_operativa
                   FROM public."Sedi"
                  WHERE (("Sedi".id_anagrafica = a.id_anagrafica) AND ("Sedi".is_cancellato = false))) s), '[]'::jsonb) AS sedi,
    COALESCE(( SELECT jsonb_agg(row_to_json(c.*)) AS jsonb_agg
           FROM ( SELECT an_contatti.id_contatto,
                    an_contatti.nome,
                    an_contatti.email,
                    an_contatti.telefono,
                    an_contatti.is_referente,
                    an_contatti.is_aziendale
                   FROM public.an_contatti
                  WHERE ((an_contatti.id_anagrafica = a.id_anagrafica) AND (an_contatti.is_cancellato = false))) c), '[]'::jsonb) AS contatti
   FROM (public."Anagrafiche" a
     LEFT JOIN public.an_dati_amministrativi dm ON ((a.id_anagrafica = dm.id_anagrafica)))
  WHERE (a.is_cancellato = false);
