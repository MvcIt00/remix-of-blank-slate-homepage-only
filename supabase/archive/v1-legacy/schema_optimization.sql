-- 1. VIEW OTTIMIZZATA PER NOLEGGI ATTIVI (Sostituisce i JOIN frontend)
CREATE OR REPLACE VIEW public.vw_noleggi_completi AS
SELECT 
    n.id_noleggio,
    n.id_mezzo,
    n.id_anagrafica,
    n.sede_operativa,
    n.data_inizio,
    n.data_fine,
    n.tempo_indeterminato,
    n.prezzo_noleggio,
    n.prezzo_trasporto,
    n.tipo_canone,
    n.is_terminato,
    n.stato_noleggio,
    n.note,
    n.created_at,
    -- Dati Mezzo
    m.marca,
    m.modello,
    m.matricola,
    -- Dati Cliente
    a.ragione_sociale AS cliente_ragione_sociale,
    a.richiede_contratto_noleggio,
    -- Dati Sede
    s.nome_sede,
    s.indirizzo AS sede_indirizzo,
    s.citta AS sede_citta,
    -- Stato Contratti (Aggregato per evitare duplicazioni di righe)
    COALESCE(
        (SELECT jsonb_agg(jsonb_build_object('id_contratto', cn.id_contratto, 'created_at', cn.created_at, 'codice', cn.codice_contratto))
         FROM contratti_noleggio cn 
         WHERE cn.id_noleggio = n.id_noleggio AND cn.is_cancellato = false),
        '[]'::jsonb
    ) AS contratti,
    -- Documenti (Solo Contratto Firmato)
    COALESCE(
        (SELECT jsonb_agg(jsonb_build_object('id_documento', dn.id_documento, 'file_path', dn.file_path, 'created_at', dn.created_at))
         FROM documenti_noleggio dn
         WHERE dn.id_noleggio = n.id_noleggio AND dn.tipo_documento = 'contratto_firmato' AND dn.is_cancellato = false),
        '[]'::jsonb
    ) AS documenti_firmati
FROM public."Noleggi" n
LEFT JOIN public."Mezzi" m ON n.id_mezzo = m.id_mezzo
LEFT JOIN public."Anagrafiche" a ON n.id_anagrafica = a.id_anagrafica
LEFT JOIN public."Sedi" s ON n.sede_operativa = s.id_sede
WHERE n.is_cancellato = false;

-- 2. INDEXING STRATEGY (Boost Performance)
-- Indici per i filtri più comuni
CREATE INDEX IF NOT EXISTS idx_noleggi_stato ON public."Noleggi" (stato_noleggio, is_cancellato);
CREATE INDEX IF NOT EXISTS idx_noleggi_cliente ON public."Noleggi" (id_anagrafica);
CREATE INDEX IF NOT EXISTS idx_noleggi_mezzo ON public."Noleggi" (id_mezzo);

-- Indici per le Foreign Keys (Spesso dimenticati ma cruciali per i JOIN)
CREATE INDEX IF NOT EXISTS idx_contratti_noleggio_fk ON public.contratti_noleggio (id_noleggio);
CREATE INDEX IF NOT EXISTS idx_documenti_noleggio_fk ON public.documenti_noleggio (id_noleggio);

-- Indici per ricerche testuali (opzionale, ma utile per i selettori)
CREATE INDEX IF NOT EXISTS idx_anagrafiche_search ON public."Anagrafiche" USING btree (ragione_sociale);
CREATE INDEX IF NOT EXISTS idx_mezzi_search ON public."Mezzi" USING btree (matricola);

-- 3. PERMISSIONI
GRANT SELECT ON public.vw_noleggi_completi TO authenticated;
