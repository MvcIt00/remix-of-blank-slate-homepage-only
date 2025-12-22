-- PART 1: Update Enums
-- Run this script FIRST. It adds the 'convertito' value to the enum if missing.
-- This is separated because adding an enum value cannot be done in the same transaction as using it.

DO $$
BEGIN
    -- Create the type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stato_preventivo') THEN
        CREATE TYPE stato_preventivo AS ENUM ('bozza', 'inviato', 'approvato', 'rifiutato', 'convertito');
    END IF;
END$$;

-- Add the value if the type exists but the value is missing
-- This statement must be run outside of a transaction block in some Postgres environments
ALTER TYPE stato_preventivo ADD VALUE IF NOT EXISTS 'convertito';
