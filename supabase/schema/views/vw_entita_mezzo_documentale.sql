-- PUBLIC SCHEMA VIEW: vw_entita_mezzo_documentale
-- Unified source for vehicle technical specs in PDF attachments and data sheets.

CREATE OR REPLACE VIEW public.vw_entita_mezzo_documentale WITH (security_invoker='on') AS
 SELECT m.id_mezzo,
    m.marca,
    m.modello,
    m.matricola,
    m.id_interno,
    m.anno,
    m.categoria,
    m.ore_moto,
    m.specifiche_tecniche,
    a_owner.ragione_sociale AS owner_ragione_sociale,
    a_owner.partita_iva AS owner_partita_iva,
    sl_owner.ubicazione_completa AS owner_sede_legale_ubicazione,
    su.ubicazione_completa AS ubicazione_attuale_dettaglio
   FROM (((public."Mezzi" m
     LEFT JOIN public."Anagrafiche" a_owner ON ((m.id_anagrafica = a_owner.id_anagrafica)))
     LEFT JOIN public.vw_sedi_tutte sl_owner ON (((a_owner.id_anagrafica = sl_owner.id_anagrafica) AND (sl_owner.is_legale = true))))
     LEFT JOIN public.vw_sedi_tutte su ON ((m.id_sede_ubicazione = su.id_sede)))
  WHERE (m.is_cancellato = false);

COMMENT ON VIEW public.vw_entita_mezzo_documentale IS 'View atomica standardizzata per dati tecnici mezzo in documenti. Aggrega specifiche, owner e ubicazione.';
