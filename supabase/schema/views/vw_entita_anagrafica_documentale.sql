-- PUBLIC SCHEMA VIEW: vw_entita_anagrafica_documentale
-- Unified source for document headers and client info in PDFs.
-- Includes fallback logic if is_legale is not set.

DROP VIEW IF EXISTS public.vw_entita_anagrafica_documentale CASCADE;

CREATE OR REPLACE VIEW public.vw_entita_anagrafica_documentale WITH (security_invoker='on') AS
 SELECT a.id_anagrafica,
    a.ragione_sociale,
    a.partita_iva,
    dm.pec,
    dm.codice_univoco,
    dm.iban,
    dm.pagamento AS modalita_pagamento_default,
    COALESCE(sl.indirizzo, fallback_sl.indirizzo) AS sede_legale_indirizzo,
    COALESCE(sl.citta, fallback_sl.citta) AS sede_legale_citta,
    COALESCE(sl.cap, fallback_sl.cap) AS sede_legale_cap,
    COALESCE(sl.provincia, fallback_sl.provincia) AS sede_legale_provincia,
    c_best.nome AS nome_contatto_principale,
    c_best.email AS email_principale,
    c_best.telefono AS telefono_principale
   FROM public."Anagrafiche" a
     LEFT JOIN public.an_dati_amministrativi dm ON a.id_anagrafica = dm.id_anagrafica
     -- Strategy 1: Explicitly marked as Legal
     LEFT JOIN public."Sedi" sl ON a.id_anagrafica = sl.id_anagrafica AND sl.is_legale = true AND sl.is_cancellato = false
     -- Strategy 2: Fallback to first available address
     LEFT JOIN LATERAL ( 
       SELECT s.indirizzo, s.citta, s.cap, s.provincia
       FROM public."Sedi" s
       WHERE s.id_anagrafica = a.id_anagrafica AND s.is_cancellato = false
       ORDER BY s.created_at ASC
       LIMIT 1
     ) fallback_sl ON true
     -- Strategy 3: Best available contact
     LEFT JOIN LATERAL ( 
       SELECT c.nome, c.email, c.telefono
       FROM public.an_contatti c
       WHERE c.id_anagrafica = a.id_anagrafica AND c.is_cancellato = false
       ORDER BY c.is_aziendale DESC, c.created_at
       LIMIT 1
     ) c_best ON true
  WHERE a.is_cancellato = false;

COMMENT ON VIEW public.vw_entita_anagrafica_documentale IS 'View atomica resiliente: centralizza dati legali con fallback automatico se is_legale non è impostato.';
