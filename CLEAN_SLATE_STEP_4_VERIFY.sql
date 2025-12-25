-- STEP 4: VERIFICA FINALE
-- Controlla che tutto sia andato a buon fine

-- 1. Verifica colonne rimaste in prev_noleggi
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'prev_noleggi' 
  AND column_name IN ('pdf_bozza_path', 'dati_cliente', 'dati_mezzo', 'dati_azienda', 'pdf_firmato_path')
ORDER BY column_name;
-- Risultato atteso: solo pdf_firmato_path

-- 2. Verifica che la vista funzioni
SELECT * FROM public.vw_preventivi_completi LIMIT 1;

-- 3. Verifica che non ci siano viste rotte
SELECT 
    schemaname,
    viewname
FROM pg_views
WHERE schemaname = 'public'
  AND viewname LIKE '%prevent%';
