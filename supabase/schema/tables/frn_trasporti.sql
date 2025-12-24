-- PUBLIC SCHEMA TABLE: frn_trasporti
-- Generated from monolithic schema.sql

CREATE TABLE IF NOT EXISTS public.frn_trasporti (
    id_anagrafica uuid NOT NULL,
    id_trasporto uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- CONSTRAINTS & INDICES
ALTER TABLE ONLY public.frn_trasporti ADD CONSTRAINT frn_trasporti_pkey PRIMARY KEY (id_anagrafica, id_trasporto);

-- FOREIGN KEYS
ALTER TABLE ONLY public.frn_trasporti ADD CONSTRAINT frn_trasporti_id_anagrafica_fkey FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica) ON UPDATE CASCADE ON DELETE CASCADE;

-- RLS & POLICIES
ALTER TABLE public.frn_trasporti ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access frn_trasporti" ON public.frn_trasporti TO authenticated USING (true) WITH CHECK (true);
