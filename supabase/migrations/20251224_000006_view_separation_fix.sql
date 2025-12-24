-- 1. DROP VIEW CASCADE
-- Questo è necessario perché se cambiamo la struttura delle colonne, Postgres non permette il "REPLACE".
DROP VIEW IF EXISTS public.vw_noleggi_completi CASCADE;

-- 2. Ricreazione VIEW 'vw_noleggi_completi' (Operativa / Attivi)
-- Ora esclude rigorosamente i noleggi TERMINATI o CANCELLATI.
CREATE VIEW public.vw_noleggi_completi AS
SELECT 
    n.id_noleggio,
    n.created_at,
    n.data_inizio,
    n.data_fine,
    n.tempo_indeterminato,
    n.prezzo_noleggio,
    n.prezzo_trasporto,
    n.tipo_canone,
    
    -- CALCOLO DINAMICO DELLO STATO (Logic Core)
    CASE
        WHEN n.is_terminato = true THEN 'terminato'::public.stato_noleggio
        WHEN (n.is_cancellato = true) THEN 'archiviato'::public.stato_noleggio
        WHEN (
             n.tempo_indeterminato IS NOT TRUE 
             AND n.data_fine IS NOT NULL 
             AND n.data_fine < CURRENT_DATE
        ) THEN 'scaduto'::public.stato_noleggio
        WHEN (
             n.data_inizio IS NOT NULL 
             AND n.data_inizio > CURRENT_DATE
        ) THEN 'futuro'::public.stato_noleggio
        ELSE 'attivo'::public.stato_noleggio
    END AS stato_noleggio,

    n.is_terminato,
    n.is_cancellato,
    n.note,

    -- Dati Mezzo
    m.id_mezzo,
    m.marca as mezzo_marca,
    m.modello as mezzo_modello,
    m.matricola as mezzo_matricola,

    -- Dati Cliente
    a.id_anagrafica,
    a.ragione_sociale as cliente_ragione_sociale,
    a.partita_iva as cliente_piva,
    a.richiede_contratto_noleggio,

    -- Dati Sede
    s.id_sede as id_sede_operativa,
    s.nome_sede as sede_nome,
    s.indirizzo as sede_indirizzo,
    s.citta as sede_citta,
    s.provincia as sede_provincia,

    -- Link Preventivo
    (
      SELECT pn.id_preventivo 
      FROM public."prev_noleggi" pn
      WHERE pn.convertito_in_noleggio_id = n.id_noleggio 
      LIMIT 1
    ) as id_preventivo,

    -- Info Contratti (JSON)
    (
      SELECT row_to_json(dn.*) 
      FROM public.documenti_noleggio dn 
      WHERE dn.id_noleggio = n.id_noleggio 
        AND dn.is_cancellato IS NOT TRUE 
        AND dn.tipo_documento = 'contratto_firmato'
      ORDER BY dn.created_at DESC 
      LIMIT 1
    ) as contratto_firmato_info,

    (
      SELECT row_to_json(cn.*) 
      FROM public.contratti_noleggio cn 
      WHERE cn.id_noleggio = n.id_noleggio 
        AND cn.is_cancellato IS NOT TRUE
      ORDER BY cn.created_at DESC 
      LIMIT 1
    ) as contratto_bozza_info

FROM public."Noleggi" n
LEFT JOIN public."Mezzi" m ON n.id_mezzo = m.id_mezzo
LEFT JOIN public."Anagrafiche" a ON n.id_anagrafica = a.id_anagrafica
LEFT JOIN public."Sedi" s ON n.sede_operativa = s.id_sede
-- FILTRO RIGOROSO: Solo ciò che NON è terminato e NON è cancellato
WHERE (n.is_cancellato IS NOT TRUE) AND (n.is_terminato IS NOT TRUE);

-- Permessi
GRANT SELECT ON public.vw_noleggi_completi TO authenticated;
GRANT SELECT ON public.vw_noleggi_completi TO service_role;
