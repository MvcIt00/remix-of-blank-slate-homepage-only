-- Add sede_operativa column to prev_noleggi table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prev_noleggi' AND column_name = 'sede_operativa') THEN
        ALTER TABLE prev_noleggi ADD COLUMN sede_operativa text;
    END IF;
END$$;
