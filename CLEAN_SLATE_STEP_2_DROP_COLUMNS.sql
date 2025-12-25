-- STEP 2: RIMUOVI COLONNE INUTILIZZATE
-- Ora che la vista è stata eliminata, possiamo rimuovere le colonne

ALTER TABLE public.prev_noleggi 
  DROP COLUMN IF EXISTS pdf_bozza_path,
  DROP COLUMN IF EXISTS dati_cliente,
  DROP COLUMN IF EXISTS dati_mezzo,
  DROP COLUMN IF EXISTS dati_azienda;
