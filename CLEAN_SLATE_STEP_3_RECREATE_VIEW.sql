-- STEP 3: RICREA VISTA PULITA (SENZA SNAPSHOT)
-- Questa è la nuova vista senza i campi eliminati e senza logica COALESCE

DROP VIEW IF EXISTS public.vw_preventivi_completi CASCADE;

CREATE OR REPLACE VIEW public.vw_preventivi_completi WITH (security_invoker='on') AS
SELECT 
    pn.id_preventivo,
    pn.codice,
    p.is_cancellato,
    p.created_at AS preventivo_created_at,
    pn.id_mezzo,
    pn.id_anagrafica,
    pn.id_anagrafica_fornitore,
    pn.data_inizio,
    pn.data_fine,
    pn.tempo_indeterminato,
    pn.prezzo_noleggio,
    pn.prezzo_trasporto,
    pn.tipo_canone,
    pn.note,
    pn.deposito_cauzionale,
    pn.modalita_pagamento,
    pn.clausole_speciali,
    pn.sede_operativa,
    pn.stato,
    pn.created_at,
    pn.updated_at,
    pn.convertito_in_noleggio_id,
    pn.pdf_firmato_path,  -- MANTENIAMO SOLO IL FIRMATO
    -- Dati Mezzo (LIVE, non snapshot)
    m.marca,
    m.modello,
    m.matricola,
    m.id_interno,
    -- Dati Cliente (LIVE, non snapshot)
    ad.ragione_sociale AS cliente_ragione_sociale,
    ad.partita_iva AS cliente_piva,
    ad.email_principale AS cliente_email,
    -- Sede Operativa
    s.id_sede AS id_sede_operativa,
    s.nome_sede AS sede_nome,
    s.indirizzo AS sede_indirizzo,
    s.citta AS sede_citta,
    s.provincia AS sede_provincia,
    -- Noleggio Collegato
    n.is_terminato AS noleggio_is_terminato
FROM public.prev_noleggi pn
JOIN public."Preventivi" p ON pn.id_preventivo = p.id_preventivo
LEFT JOIN public."Mezzi" m ON pn.id_mezzo = m.id_mezzo
LEFT JOIN public.vw_entita_anagrafica_documentale ad ON pn.id_anagrafica = ad.id_anagrafica
LEFT JOIN public.vw_sedi_tutte s ON pn.sede_operativa = s.id_sede
LEFT JOIN public."Noleggi" n ON pn.convertito_in_noleggio_id = n.id_noleggio
WHERE p.is_cancellato = false;
