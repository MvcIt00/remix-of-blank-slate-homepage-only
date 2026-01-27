-- 1. Modify PREVENTIVI table: Add the missing 'codice' column
-- Note: 'Preventivi' is case sensitive in the schema, using double quotes.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Preventivi' AND column_name='codice') THEN
        ALTER TABLE public."Preventivi" ADD COLUMN codice TEXT;
        -- Add a unique constraint to ensure no duplicate codes
        CREATE UNIQUE INDEX IF NOT EXISTS idx_preventivi_codice ON public."Preventivi"(codice);
    END IF;
END
$$;

-- 2. Trigger Function for PREVENTIVI
CREATE OR REPLACE FUNCTION public.trigger_set_preventivo_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only generate if not provided
    IF NEW.codice IS NULL THEN
        NEW.codice := public.get_next_document_code('PRV');
    END IF;
    RETURN NEW;
END;
$$;

-- 3. Apply Trigger to PREVENTIVI
DROP TRIGGER IF EXISTS trg_set_preventivo_code ON public."Preventivi";
CREATE TRIGGER trg_set_preventivo_code
BEFORE INSERT ON public."Preventivi"
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_preventivo_code();


-- 4. Trigger Function for CONTRATTI
CREATE OR REPLACE FUNCTION public.trigger_set_contratto_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only generate if not provided
    IF NEW.codice_contratto IS NULL THEN
        NEW.codice_contratto := public.get_next_document_code('CNT');
    END IF;
    RETURN NEW;
END;
$$;

-- 5. Apply Trigger to CONTRATTI
DROP TRIGGER IF EXISTS trg_set_contratto_code ON public.contratti_noleggio;
CREATE TRIGGER trg_set_contratto_code
BEFORE INSERT ON public.contratti_noleggio
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_contratto_code();
