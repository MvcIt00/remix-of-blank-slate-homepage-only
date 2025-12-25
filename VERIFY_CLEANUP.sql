-- ✅ VERIFICA POST-CLEANUP
-- Esegui queste query per confermare che il reset sia andato a buon fine

-- 1. Verifica che non ci siano contratti "fantasma"
SELECT COUNT(*) as contratti_rimasti FROM public.contratti_noleggio;
-- Risultato atteso: 0

-- 2. Verifica che non ci siano documenti bozza
SELECT COUNT(*) as documenti_bozza FROM public.documenti_noleggio 
WHERE tipo_documento != 'contratto_firmato';
-- Risultato atteso: 0

-- 3. Verifica che i noleggi esistano ancora (dati intatti)
SELECT COUNT(*) as noleggi_totali FROM public."Noleggi" 
WHERE is_cancellato = false;
-- Risultato atteso: > 0 (i tuoi noleggi sono ancora lì)

-- 4. Verifica la vista completa (dovrebbe mostrare noleggi senza contratti)
SELECT 
    id_noleggio,
    mezzo_matricola,
    cliente_ragione_sociale,
    contratto_firmato_info,
    contratto_bozza_info
FROM public.vw_noleggi_completi
LIMIT 5;
-- Risultato atteso: contratto_firmato_info e contratto_bozza_info = NULL
