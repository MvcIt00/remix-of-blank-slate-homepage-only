-- 🚨 RESET NUCLEARE PER BUCKET VUOTO 🚨
-- Se il bucket è nuovo e vuoto, qualsiasi record che punta a un file è un BUG.
-- Questo script pulisce TUTTE le tabelle del reparto noleggio per tornare allo stato "Ground Zero".

-- 1. RIMUOVI ICONE VERDI (Tabella documenti_noleggio)
-- Questa tabella è la fonte dei dati per vw_noleggi_completi -> contratto_firmato_info.
-- Se ci sono record qui, la UI mostrerà l'icona verde anche se il bucket è vuoto.
DELETE FROM public.documenti_noleggio 
WHERE tipo_documento = 'contratto_firmato'
   OR id_noleggio IS NOT NULL;

-- 2. RESET CONTRATTI (Tabella contratti_noleggio)
-- Rimuoviamo i path orfani e resettiamo lo stato a bozza.
UPDATE public.contratti_noleggio 
SET 
    pdf_bozza_path = NULL, 
    pdf_firmato_path = NULL,
    stato_contratto = 'bozza',
    data_firma = NULL;

-- 3. RESET PREVENTIVI (Tabella prev_noleggi)
-- Allineiamo i preventivi allo stato vuoto dello storage.
UPDATE public.prev_noleggi 
SET 
    pdf_bozza_path = NULL, 
    pdf_firmato_path = NULL,
    stato = 'bozza'; -- Riportiamo in bozza per permettere rigenerazione pulita

-- 4. VERIFICA FINALE
-- Dopo aver lanciato questo, vw_noleggi_completi restituirà NULL per i contratti 
-- e le icone torneranno BLU (Genera) o GRIGIE (Non richiesto).
