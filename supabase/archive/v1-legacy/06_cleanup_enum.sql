-- CLEANUP: Remove 'convertito' from Enum (Strict Cleanup)
-- Postgres does not support "DROP VALUE" from Enums. 
-- We must recreate the type to be perfectly clean.

BEGIN;

-- 1. Rename the old type to avoid conflict
ALTER TYPE stato_preventivo RENAME TO stato_preventivo_old;

-- 2. Create the NEW clean type (without 'convertito')
CREATE TYPE stato_preventivo AS ENUM ('bozza', 'inviato', 'approvato', 'rifiutato');

-- 3. Update the table to use the NEW type
-- We cast to text first to break the link to the old oid
ALTER TABLE prev_noleggi 
  ALTER COLUMN stato DROP DEFAULT,
  ALTER COLUMN stato TYPE stato_preventivo USING stato::text::stato_preventivo,
  ALTER COLUMN stato SET DEFAULT 'bozza'::stato_preventivo;

-- 4. Drop the old type
DROP TYPE stato_preventivo_old;

COMMIT;
