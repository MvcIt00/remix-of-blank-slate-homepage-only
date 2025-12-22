-- =====================================================
-- VIEW OTTIMIZZATE PER SELETTORI
-- =====================================================
-- Queste view pre-computano tutti i JOIN necessari
-- per i selettori, garantendo performance ottimali
-- =====================================================

-- =====================================================
-- 1. VIEW PER SELETTORE MEZZI
-- =====================================================
CREATE OR REPLACE VIEW vw_mezzi_selettore AS
SELECT 
    m.id_mezzo,
    m.marca,
    m.modello,
    m.matricola,
    m.id_interno,
    m.anno,
    m.categoria,
    m.stato_funzionamento,
    m.is_disponibile_noleggio,
    m.ore_moto,
    m.id_anagrafica,
    m.id_sede_assegnata,
    m.id_sede_ubicazione,
    
    -- Dati anagrafica (owner)
    a.ragione_sociale as owner_ragione_sociale,
    
    -- Dati sede assegnata
    sa.nome_sede as sede_assegnata_nome,
    sa.ubicazione_completa as sede_assegnata_ubicazione,
    
    -- Dati ubicazione attuale
    su.nome_sede as ubicazione_nome,
    su.ubicazione_completa as ubicazione_completa,
    
    -- Campo ricerca full-text (per indicizzazione futura)
    (
        COALESCE(m.marca, '') || ' ' ||
        COALESCE(m.modello, '') || ' ' ||
        COALESCE(m.matricola, '') || ' ' ||
        COALESCE(m.id_interno, '') || ' ' ||
        COALESCE(a.ragione_sociale, '')
    ) as search_text

FROM "Mezzi" m
LEFT JOIN "Anagrafiche" a ON m.id_anagrafica = a.id_anagrafica
LEFT JOIN vw_sedi_tutte sa ON m.id_sede_assegnata = sa.id_sede
LEFT JOIN vw_sedi_tutte su ON m.id_sede_ubicazione = su.id_sede
WHERE m.is_cancellato = false;

-- =====================================================
-- 2. VIEW PER SELETTORE ANAGRAFICHE
-- =====================================================
CREATE OR REPLACE VIEW vw_anagrafiche_selettore AS
SELECT 
    a.id_anagrafica,
    a.ragione_sociale,
    a.partita_iva,
    a.is_cliente,
    a.is_fornitore,
    a.is_owner,
    
    -- Sede legale (per info contestuali)
    sl.nome_sede as sede_legale_nome,
    sl.citta as sede_legale_citta,
    sl.provincia as sede_legale_provincia,
    
    -- Conteggio sedi operative
    (SELECT COUNT(*) FROM "Sedi" s WHERE s.id_anagrafica = a.id_anagrafica AND s.is_cancellato = false) as num_sedi,
    
    -- Campo ricerca
    (
        COALESCE(a.ragione_sociale, '') || ' ' ||
        COALESCE(a.partita_iva, '') || ' ' ||
        COALESCE(sl.citta, '')
    ) as search_text
    
FROM "Anagrafiche" a
LEFT JOIN "Sedi" sl ON a.id_anagrafica = sl.id_anagrafica AND sl.is_legale = true AND sl.is_cancellato = false
WHERE a.is_cancellato = false;

-- =====================================================
-- 3. INDICI PER OTTIMIZZAZIONE RICERCA
-- =====================================================
-- Nota: Gli indici GIN per full-text search possono essere
-- aggiunti in futuro se necessario, per ora usiamo B-tree

-- Indice per ricerca su mezzi
CREATE INDEX IF NOT EXISTS idx_mezzi_search 
ON "Mezzi" (marca, modello, matricola, id_interno) 
WHERE is_cancellato = false;

-- Indice per ricerca su anagrafiche
CREATE INDEX IF NOT EXISTS idx_anagrafiche_search 
ON "Anagrafiche" (ragione_sociale, partita_iva) 
WHERE is_cancellato = false;

-- =====================================================
-- 4. COMMENTI DOCUMENTAZIONE
-- =====================================================
COMMENT ON VIEW vw_mezzi_selettore IS 
'View ottimizzata per il selettore mezzi. Include tutti i dati necessari per display e ricerca con JOIN pre-computati per massime performance.';

COMMENT ON VIEW vw_anagrafiche_selettore IS 
'View ottimizzata per il selettore anagrafiche. Include ragione sociale, sede legale, e conteggi per display efficiente.';
