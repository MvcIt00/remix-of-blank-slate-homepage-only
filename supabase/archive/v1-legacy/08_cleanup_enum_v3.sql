-- CLEANUP V3: The Final Solution
-- 1. Drop Views that depend on the enum (Interventi, vw_gestione_interventi)
-- 2. Rename Old Type
-- 3. Create New Type
-- 4. Migrate Data & Update Types in Tables
-- 5. Drop Old Type
-- 6. Recreate Views

BEGIN;

-- ==========================================
-- 1. DROP DEPENDENT VIEWS
-- ==========================================
DROP VIEW IF EXISTS public.vw_gestione_interventi CASCADE;
DROP VIEW IF EXISTS public.interventi CASCADE;

-- ==========================================
-- 2. HANDLE ENUM RENAME/CREATE
-- ==========================================
-- Rename if exists (and not already renamed)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stato_preventivo') THEN
        ALTER TYPE stato_preventivo RENAME TO stato_preventivo_old;
    END IF;
END$$;

-- Create new type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stato_preventivo') THEN
        CREATE TYPE stato_preventivo AS ENUM ('bozza', 'inviato', 'approvato', 'rifiutato');
    END IF;
END$$;

-- ==========================================
-- 3. MIGRATE DATA & UPDATE COLUMNS
-- ==========================================

-- Table: prev_noleggi
UPDATE prev_noleggi SET stato = 'approvato' WHERE stato::text = 'convertito';
ALTER TABLE prev_noleggi 
  ALTER COLUMN stato DROP DEFAULT,
  ALTER COLUMN stato TYPE stato_preventivo USING stato::text::stato_preventivo,
  ALTER COLUMN stato SET DEFAULT 'bozza'::stato_preventivo;

-- Table: Interventi (The TABLE, not the view)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Interventi' AND column_name = 'stato_preventivo') THEN
        UPDATE "Interventi" SET stato_preventivo = 'approvato' WHERE stato_preventivo::text = 'convertito';
        ALTER TABLE "Interventi" 
          ALTER COLUMN stato_preventivo TYPE stato_preventivo USING stato_preventivo::text::stato_preventivo;
    END IF;
END$$;

-- Table: prev_interventi
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prev_interventi' AND column_name = 'stato_preventivo') THEN
        UPDATE prev_interventi SET stato_preventivo = 'approvato' WHERE stato_preventivo::text = 'convertito';
        ALTER TABLE prev_interventi 
          ALTER COLUMN stato_preventivo TYPE stato_preventivo USING stato_preventivo::text::stato_preventivo;
    END IF;
END$$;

-- ==========================================
-- 4. DROP OLD TYPE
-- ==========================================
DROP TYPE IF EXISTS stato_preventivo_old;

-- ==========================================
-- 5. RECREATE VIEWS
-- ==========================================

-- Recreate View: interventi
CREATE VIEW public.interventi
WITH (security_invoker = on) AS
SELECT 
  id_intervento,
  id_mezzo,
  id_anagrafica,
  codice_intervento,
  descrizione_intervento,
  is_chiuso,
  is_fatturato,
  is_cancellato,
  created_at,
  stato_intervento,
  stato_preventivo
FROM public."Interventi";

-- Restore Triggers for 'interventi' view
CREATE TRIGGER interventi_insert_trigger
INSTEAD OF INSERT ON public.interventi
FOR EACH ROW EXECUTE FUNCTION public.interventi_insert();

CREATE TRIGGER interventi_update_trigger
INSTEAD OF UPDATE ON public.interventi
FOR EACH ROW EXECUTE FUNCTION public.interventi_update();

CREATE TRIGGER interventi_delete_trigger
INSTEAD OF DELETE ON public.interventi
FOR EACH ROW EXECUTE FUNCTION public.interventi_delete();


-- Recreate View: vw_gestione_interventi
CREATE VIEW public.vw_gestione_interventi
WITH (security_invoker = on) AS
SELECT 
  i.id_intervento,
  i.id_mezzo,
  i.id_anagrafica,
  i.codice_intervento,
  i.descrizione_intervento,
  i.stato_intervento,
  i.stato_preventivo,
  i.is_chiuso,
  i.is_fatturato,
  i.created_at,
  a.ragione_sociale,
  a.partita_iva,
  m.marca,
  m.modello,
  m.matricola,
  m.id_interno,
  m.categoria as mezzo_categoria,
  m.stato_funzionamento,
  m.ubicazione,
  COUNT(DISTINCT l.id_lavorazione) as n_lavorazioni,
  MIN(l.data_da_prevista) as prima_data_prevista,
  MAX(l.data_a_prevista) as ultima_data_prevista,
  SUM(COALESCE(l.n_tecnici_previsti, 0)) as totale_tecnici_previsti,
  SUM(COALESCE(ld.n_tecnici_assegnati, 0)) as totale_tecnici_assegnati,
  STRING_AGG(DISTINCT array_to_string(ld.nomi_tecnici, ', '), ', ') as nomi_tecnici_aggregati
FROM public."Interventi" i
LEFT JOIN public."Anagrafiche" a ON i.id_anagrafica = a.id_anagrafica
LEFT JOIN public."Mezzi" m ON i.id_mezzo = m.id_mezzo
LEFT JOIN public.int_lavorazioni l ON i.id_intervento = l.id_intervento AND l.is_cancellato = false
LEFT JOIN public.vw_int_lavorazioni_dettaglio ld ON l.id_lavorazione = ld.id_lavorazione
WHERE i.is_cancellato = false
GROUP BY 
  i.id_intervento, i.id_mezzo, i.id_anagrafica, i.codice_intervento,
  i.descrizione_intervento, i.stato_intervento, i.stato_preventivo,
  i.is_chiuso, i.is_fatturato, i.created_at,
  a.ragione_sociale, a.partita_iva,
  m.marca, m.modello, m.matricola, m.id_interno, m.categoria,
  m.stato_funzionamento, m.ubicazione;

COMMIT;
