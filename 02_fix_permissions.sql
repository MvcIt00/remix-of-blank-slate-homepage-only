-- FIX PERMISSIONS for Document Coding System

-- 1. Update the function to be SECURITY DEFINER.
-- This allows the function to execute with the privileges of the creator (postgres/admin),
-- bypassing the need for the web user to have direct write access to the sequence table.
CREATE OR REPLACE FUNCTION public.get_next_document_code(p_doc_type TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER -- <--- CRITICAL CHANGE
SET search_path = public -- Secure search path
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
    v_code := p_doc_type || '-' || v_year || '-' || LPAD(v_new_value::TEXT, 5, '0');

    RETURN v_code;
END;
$$;

-- 2. Grant Execute permissions
GRANT EXECUTE ON FUNCTION public.get_next_document_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_next_document_code(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_next_document_code(text) TO anon; -- If needed

-- 3. Grant Table permissions (Backup, in case SECURITY DEFINER isn't enough for some reason or RLS blocks it)
GRANT ALL ON TABLE public.document_sequences TO service_role;
-- We do NOT grant write access to public/authenticated intentionally, 
-- relying on the function to handle it.
