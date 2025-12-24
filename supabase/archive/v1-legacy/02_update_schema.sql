-- PART 2: Update Tables and Columns
-- Run this script SECOND, after 01_update_enums.sql is successful.

-- 1. Update prev_noleggi table to use the Enum
ALTER TABLE prev_noleggi ALTER COLUMN stato DROP DEFAULT;

ALTER TABLE prev_noleggi 
ALTER COLUMN stato TYPE stato_preventivo 
USING stato::text::stato_preventivo;

ALTER TABLE prev_noleggi ALTER COLUMN stato SET DEFAULT 'bozza'::stato_preventivo;


-- 2. Update contratti_noleggio columns (Idempotent check)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contratti_noleggio' AND column_name = 'pdf_firmato_path') THEN
        ALTER TABLE contratti_noleggio ADD COLUMN pdf_firmato_path text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contratti_noleggio' AND column_name = 'stato_contratto') THEN
        ALTER TABLE contratti_noleggio ADD COLUMN stato_contratto text; 
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contratti_noleggio' AND column_name = 'data_firma') THEN
        ALTER TABLE contratti_noleggio ADD COLUMN data_firma timestamp with time zone;
    END IF;
END$$;
