-- AUDIT 1: Verifica Stati Preventivi Reali
-- Voglio vedere quali stati esistono davvero e quanti preventivi per stato

SELECT 
    stato,
    COUNT(*) as totale,
    COUNT(pdf_firmato_path) as con_firmato
FROM prev_noleggi
GROUP BY stato
ORDER BY stato;
