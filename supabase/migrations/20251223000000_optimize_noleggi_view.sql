-- ==============================================================================
-- MIGRATION: 20251223000000_optimize_noleggi_view.sql
-- DESCRIZIONE: Crea la view vw_noleggi_completi per la dashboard Noleggi Attivi.
--              Include tutti i join necessari per le massime performance e completezza dati.
-- ==============================================================================

DROP VIEW IF EXISTS public.vw_noleggi_completi CASCADE;

CREATE OR REPLACE VIEW public.vw_noleggi_completi AS
SELECT 
    n.id_noleggio,
    n.created_at,
    n.data_inizio,
    n.data_fine,
    n.tempo_indeterminato,
    n.prezzo_noleggio,
    n.prezzo_trasporto,
    n.tipo_canone,
    n.stato_noleggio,
    n.is_terminato,
    n.note,

    -- Dati Mezzo
    m.id_mezzo,
    m.marca as mezzo_marca,
    m.modello as mezzo_modello,
    m.matricola as mezzo_matricola,

    -- Dati Cliente (Anagrafica)
    a.id_anagrafica,
    a.ragione_sociale as cliente_ragione_sociale,
    a.partita_iva as cliente_piva,
    a.richiede_contratto_noleggio,

    -- Dati Sede Operativa (Completi)
    s.id_sede as id_sede_operativa,
    s.nome_sede as sede_nome,
    s.indirizzo as sede_indirizzo,
    s.citta as sede_citta,
    s.provincia as sede_provincia,

    -- Link Preventivo (Relazione Inversa prev_noleggi)
    -- Assumiamo che un noleggio derivi da UN preventivo (o prendiamo il più recente)
    (
      SELECT pn.id_preventivo 
      FROM public."prev_noleggi" pn
      -- Il campo di join in prev_noleggi verso noleggi è 'convertito_in_noleggio_id'
      WHERE pn.convertito_in_noleggio_id = n.id_noleggio 
      LIMIT 1
    ) as id_preventivo,

    -- Info Contratto Firmato (JSON per Frontend)
    (
      SELECT row_to_json(dn.*) 
      FROM public.documenti_noleggio dn 
      WHERE dn.id_noleggio = n.id_noleggio 
        AND dn.is_cancellato IS NOT TRUE 
        AND dn.tipo_documento = 'contratto_firmato'
      ORDER BY dn.created_at DESC 
      LIMIT 1
    ) as contratto_firmato_info,

    -- Info Bozza Contratto (JSON per Frontend)
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
LEFT JOIN public."Sedi" s ON n.sede_operativa = s.id_sede;

-- Commento per PostgREST / Supabase
COMMENT ON VIEW public.vw_noleggi_completi IS 
'View ottimizzata per la dashboard noleggi. Aggrega Mezzi, Clienti, Sedi e Link Preventivi in una singola query.';
