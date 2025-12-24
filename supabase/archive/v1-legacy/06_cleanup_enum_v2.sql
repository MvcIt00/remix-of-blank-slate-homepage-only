-- CLEANUP V2: Handle dependencies in Interventi tables
-- 1. Rename old type
-- 2. Create new type
-- 3. Migrate data in ALL tables
-- 4. Update columns in ALL tables
-- 5. Drop old type

BEGIN;

-- 1. Rename logic (If not already renamed by previous partial run, handle safely)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stato_preventivo') THEN
        ALTER TYPE stato_preventivo RENAME TO stato_preventivo_old;
    END IF;
END$$;

-- 2. Create new type if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stato_preventivo') THEN
        CREATE TYPE stato_preventivo AS ENUM ('bozza', 'inviato', 'approvato', 'rifiutato');
    END IF;
END$$;

-- 3. Migrate Data & Update Columns for ALL tables using this enum

-- Table: prev_noleggi
UPDATE prev_noleggi SET stato = 'approvato' WHERE stato::text = 'convertito';
ALTER TABLE prev_noleggi 
  ALTER COLUMN stato DROP DEFAULT,
  ALTER COLUMN stato TYPE stato_preventivo USING stato::text::stato_preventivo,
  ALTER COLUMN stato SET DEFAULT 'bozza'::stato_preventivo;


-- Table: Interventi
-- Check if column exists just in case
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Interventi' AND column_name = 'stato_preventivo') THEN
        -- Migrate data "blindly" casting to text to check value
        UPDATE "Interventi" SET stato_preventivo = 'approvato' WHERE stato_preventivo::text = 'convertito';
        
        -- Update Type
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


-- 4. Recreate Views if necessary?
-- Usually changing column type might require view recreation if strict.
-- If this script fails on "cannot alter column type... view depends on it", we must DROP and RECREATE views.
-- However, since we are doing this in transaction, let's hope Postgres allows the type cast swap.
-- If it fails, I will need the VIEW definitions to recreate them.
-- For now, let's try to Drop the old type.

DROP TYPE stato_preventivo_old;

COMMIT;
