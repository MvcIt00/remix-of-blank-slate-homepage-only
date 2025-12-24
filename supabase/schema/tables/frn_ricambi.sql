-- PUBLIC SCHEMA TABLE: frn_ricambi
-- Generated from monolithic schema.sql

CREATE TABLE IF NOT EXISTS public.frn_ricambi (
    id_anagrafica uuid NOT NULL,
    id_ricambio uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- CONSTRAINTS & INDICES
ALTER TABLE ONLY public.frn_ricambi ADD CONSTRAINT frn_ricambi_pkey PRIMARY KEY (id_anagrafica, id_ricambio);

-- FOREIGN KEYS
ALTER TABLE ONLY public.frn_ricambi ADD CONSTRAINT frn_ricambi_id_anagrafica_fkey FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica) ON UPDATE CASCADE ON DELETE CASCADE;

-- RLS & POLICIES
ALTER TABLE public.frn_ricambi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access frn_ricambi" ON public.frn_ricambi TO authenticated USING (true) WITH CHECK (true);
