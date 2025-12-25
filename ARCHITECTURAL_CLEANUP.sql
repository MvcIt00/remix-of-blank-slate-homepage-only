-- 🏛️ Super-Enterprise Alignment & Cleanup
-- Questo script normalizza i percorsi e risolve le incongruenze DB/Storage.

-- 1. IDENTIFICAZIONE RECORD LEGACY (noleggi/)
-- Questi sono i record che scrivono nella cartella sbagliata. 
-- Li evidenziamo per futuro spostamento manuale o li resettiamo se orfani.
SELECT id_contratto, codice_contratto, pdf_firmato_path 
FROM public.contratti_noleggio 
WHERE pdf_firmato_path LIKE 'noleggi/%';

-- 2. NORMALIZZAZIONE PREVENTIVI
-- Assicuriamoci che tutti i preventivi usino il formato standard nel DB
UPDATE public.prev_noleggi
SET pdf_bozza_path = 'preventivi/bozze/preventivo_' || REPLACE(codice, '/', '-') || '.pdf'
WHERE pdf_bozza_path IS NOT NULL 
AND pdf_bozza_path NOT LIKE 'preventivi/bozze/%';

-- 3. RESET ICONE VERDI "FALSE POSITIVE" (Opzionale/Cautelativo)
-- Se il path è palesemente nel vecchio formato e l'utente ha segnalato che sono vuoti,
-- possiamo resettarli per permettere un nuovo caricamento pulito.
-- NOTA: Commentato per sicurezza, decommentare dopo verifica.
/*
UPDATE public.contratti_noleggio
SET pdf_firmato_path = NULL, stato_contratto = 'bozza'
WHERE pdf_firmato_path LIKE 'noleggi/%';
*/

-- 4. ALLINEAMENTO TABELLA DOCUMENTI
-- Molti upload generici sono finiti in 'noleggi/'. 
-- In un ecosistema enterprise, dovrebbero essere mappati correttamente.
UPDATE public.documenti_noleggio
SET file_path = REPLACE(file_path, 'noleggi/', 'contratti/firmati/')
WHERE file_path LIKE 'noleggi/%';
