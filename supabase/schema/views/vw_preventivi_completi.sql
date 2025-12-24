-- PUBLIC SCHEMA VIEW: vw_preventivi_completi
-- DEFINITIVA: Corretto errore di mappatura colonna id_prev_noleggio (rimossa).

DROP VIEW IF EXISTS public.vw_preventivi_completi CASCADE;

CREATE OR REPLACE VIEW public.vw_preventivi_completi WITH (security_invoker='on') AS
 SELECT p.id_preventivo,
    p.codice,
    pn.id_mezzo,
    pn.id_anagrafica,
    pn.id_anagrafica_fornitore,
    pn.data_inizio,
    pn.data_fine,
    pn.prezzo_noleggio,
    pn.prezzo_trasporto,
    pn.deposito_cauzionale,
    pn.modalita_pagamento,
    pn.clausole_speciali,
    pn.tipo_canone,
    pn.tempo_indeterminato,
    pn.note,
    pn.updated_at,
    p.is_cancellato,
    -- Technical Data (Mezzo)
    m.marca,
    m.modello,
    m.matricola,
    m.id_interno,
    m.anno AS mezzo_anno,
    m.ore_moto,
    m.categoria,
    m.specifiche_tecniche,
    -- Legal Data (UNIFIED FROM vw_entita_anagrafica_documentale)
    -- Dual naming: standardized + legacy aliases
    ad.ragione_sociale,
    ad.ragione_sociale as cliente_ragione_sociale,
    ad.partita_iva,
    ad.partita_iva as cliente_piva,
    ad.email_principale,
    ad.email_principale as cliente_email,
    ad.pec,
    ad.pec as cliente_pec,
    ad.codice_univoco,
    ad.codice_univoco as cliente_codice_univoco,
    ad.telefono_principale,
    ad.telefono_principale as cliente_telefono,
    ad.nome_contatto_principale,
    ad.sede_legale_indirizzo,
    ad.sede_legale_indirizzo as cliente_indirizzo,
    ad.sede_legale_citta,
    ad.sede_legale_citta as cliente_citta,
    ad.sede_legale_cap,
    ad.sede_legale_cap as cliente_cap,
    ad.sede_legale_provincia,
    ad.sede_legale_provincia as cliente_provincia,
    -- Operating Location (Sede Operativa)
    s.id_sede as id_sede_operativa,
    s.nome_sede as sede_operativa_nome,
    s.nome_sede as sede_nome,
    s.ubicazione_completa as sede_operativa_ubicazione,
    s.indirizzo as sede_indirizzo,
    s.citta as sede_citta,
    s.provincia as sede_provincia
   FROM public.prev_noleggi pn
     JOIN public."Preventivi" p ON pn.id_preventivo = p.id_preventivo
     LEFT JOIN public."Mezzi" m ON pn.id_mezzo = m.id_mezzo
     LEFT JOIN public.vw_entita_anagrafica_documentale ad ON pn.id_anagrafica = ad.id_anagrafica
     LEFT JOIN public.vw_sedi_tutte s ON pn.sede_operativa = s.id_sede
  WHERE p.is_cancellato = false;
