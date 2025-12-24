-- PUBLIC SCHEMA TABLE: frn_mezzi
-- Generated from monolithic schema.sql

CREATE TABLE IF NOT EXISTS public.frn_mezzi (
    id_anagrafica uuid NOT NULL,
    id_mezzo uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- CONSTRAINTS & INDICES
ALTER TABLE ONLY public.frn_mezzi ADD CONSTRAINT frn_mezzi_pkey PRIMARY KEY (id_anagrafica, id_mezzo);

-- FOREIGN KEYS
ALTER TABLE ONLY public.frn_mezzi ADD CONSTRAINT frn_mezzi_id_anagrafica_fkey FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica) ON UPDATE CASCADE ON DELETE CASCADE;

-- RLS & POLICIES
ALTER TABLE public.frn_mezzi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access frn_mezzi" ON public.frn_mezzi TO authenticated USING (true) WITH CHECK (true);
