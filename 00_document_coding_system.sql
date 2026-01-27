-- 1. Table to track sequences for each document type and year
CREATE TABLE IF NOT EXISTS public.document_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_type TEXT NOT NULL, -- e.g., 'CNT', 'PRV'
    year INTEGER NOT NULL,
    current_value INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(doc_type, year) -- Ensures one sequence per type per year
);

-- 2. Centralized Function to generate the next code
-- It handles the logic: "If new year, start from 1. Else increment."
-- Returns format: TYPE-YYYY-NNNNN
CREATE OR REPLACE FUNCTION public.get_next_document_code(p_doc_type TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_year INTEGER;
    v_new_value INTEGER;
    v_code TEXT;
BEGIN
    v_year := date_part('year', CURRENT_DATE);

    -- Upsert: Try to insert a new counter for this year/type with value 1.
    -- If it exists, update it by incrementing.
    INSERT INTO public.document_sequences (doc_type, year, current_value)
    VALUES (p_doc_type, v_year, 1)
    ON CONFLICT (doc_type, year)
    DO UPDATE SET
        current_value = document_sequences.current_value + 1,
        updated_at = timezone('utc'::text, now())
    RETURNING current_value INTO v_new_value;

    -- Format the code: e.g., CNT-2024-00123
    -- LPAD ensures 5 digits with leading zeros
    v_code := p_doc_type || '-' || v_year || '-' || LPAD(v_new_value::TEXT, 5, '0');

    RETURN v_code;
END;
$$;
