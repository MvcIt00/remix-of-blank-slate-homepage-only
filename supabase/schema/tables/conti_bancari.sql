-- PUBLIC SCHEMA TABLE: conti_bancari
-- Generated from monolithic schema.sql

CREATE TABLE IF NOT EXISTS public.conti_bancari (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    banca text NOT NULL,
    iban text NOT NULL,
    intestatario text,
    descrizione text,
    creato_il timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    aggiornato_il timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CONSTRAINTS & INDICES
ALTER TABLE ONLY public.conti_bancari ADD CONSTRAINT conti_bancari_pkey PRIMARY KEY (id);

-- TRIGGERS
CREATE TRIGGER update_conti_bancari_aggiornato_il BEFORE UPDATE ON public.conti_bancari FOR EACH ROW EXECUTE FUNCTION public.update_aggiornato_il();

-- RLS & POLICIES
ALTER TABLE public.conti_bancari ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access conti_bancari" ON public.conti_bancari TO authenticated USING (true) WITH CHECK (true);
