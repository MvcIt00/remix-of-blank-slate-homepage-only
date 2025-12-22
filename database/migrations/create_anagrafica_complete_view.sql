-- =====================================================
-- VISTA AGGREGATA ANAGRAFICHE COMPLETE (V2)
-- =====================================================
-- Questa vista risolve il problema della duplicazione delle righe
-- raggruppando sedi e contatti in array JSONB.
-- Include anche un campo 'sede_legale' pre-estratto.

DROP VIEW IF EXISTS vw_anagrafiche_complete;

CREATE OR REPLACE VIEW vw_anagrafiche_complete 
WITH (security_invoker = on)
AS
SELECT 
    a.id_anagrafica,
    a.ragione_sociale,
    a.partita_iva,
    a.is_cliente,
    a.is_fornitore,
    a.is_owner,
    
    -- Dati amministrativi (One-to-One)
    dm.pec,
    dm.codice_univoco,
    dm.iban,
    dm.pagamento as modalita_pagamento_default,
    dm.esente_iva,

    -- Sede Legale (estratta come oggetto JSONB)
    (
        SELECT row_to_json(sl)
        FROM (
            SELECT indirizzo, citta, cap, provincia, nome_sede
            FROM public."Sedi"
            WHERE id_anagrafica = a.id_anagrafica AND is_legale = true AND is_cancellato = false
            LIMIT 1
        ) sl
    )::jsonb as sede_legale,

    -- Tutte le Sedi (Aggregate come JSONB Array)
    COALESCE(
        (
            SELECT jsonb_agg(row_to_json(s))
            FROM (
                SELECT id_sede, nome_sede, indirizzo, citta, cap, provincia, is_legale, is_operativa
                FROM public."Sedi"
                WHERE id_anagrafica = a.id_anagrafica AND is_cancellato = false
            ) s
        ),
        '[]'::jsonb
    ) as sedi,

    -- Contatti (Aggregate come JSONB Array)
    COALESCE(
        (
            SELECT jsonb_agg(row_to_json(c))
            FROM (
                SELECT id_contatto, nome, email, telefono, is_referente, is_aziendale
                FROM public.an_contatti
                WHERE id_anagrafica = a.id_anagrafica AND is_cancellato = false
            ) c
        ),
        '[]'::jsonb
    ) as contatti

FROM public."Anagrafiche" a
LEFT JOIN public.an_dati_amministrativi dm ON a.id_anagrafica = dm.id_anagrafica
WHERE a.is_cancellato = false;

-- Grant permissions for Supabase
GRANT SELECT ON vw_anagrafiche_complete TO anon, authenticated, service_role;

-- =====================================================
-- VISTA SPECIFICA PER OWNER (Contratto Header)
-- =====================================================
DROP VIEW IF EXISTS vw_owner_info;

CREATE OR REPLACE VIEW vw_owner_info
WITH (security_invoker = on)
AS
SELECT 
    a.id_anagrafica,
    a.ragione_sociale,
    a.partita_iva,
    dm.pec,
    dm.iban,
    dm.codice_univoco,
    sl.indirizzo as sede_legale_indirizzo,
    sl.citta as sede_legale_citta,
    sl.cap as sede_legale_cap,
    sl.provincia as sede_legale_provincia,
    c.email as contatto_email,
    c.telefono as contatto_telefono
FROM public."Anagrafiche" a
LEFT JOIN public.an_dati_amministrativi dm ON a.id_anagrafica = dm.id_anagrafica
LEFT JOIN public."Sedi" sl ON a.id_anagrafica = sl.id_anagrafica AND sl.is_legale = true AND sl.is_cancellato = false
LEFT JOIN LATERAL (
    -- Prende il primo contatto aziendale utile
    SELECT email, telefono 
    FROM public.an_contatti 
    WHERE id_anagrafica = a.id_anagrafica AND is_aziendale = true AND is_cancellato = false
    LIMIT 1
) c ON true
WHERE a.is_owner = true AND a.is_cancellato = false;

GRANT SELECT ON vw_owner_info TO anon, authenticated, service_role;
