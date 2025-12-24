-- PUBLIC SCHEMA TABLE: frn_servizi
-- Generated from monolithic schema.sql

CREATE TABLE IF NOT EXISTS public.frn_servizi (
    id_anagrafica uuid NOT NULL,
    id_servizio uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- CONSTRAINTS & INDICES
ALTER TABLE ONLY public.frn_servizi ADD CONSTRAINT frn_servizi_pkey PRIMARY KEY (id_anagrafica, id_servizio);

-- FOREIGN KEYS
ALTER TABLE ONLY public.frn_servizi ADD CONSTRAINT frn_servizi_id_anagrafica_fkey FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica) ON UPDATE CASCADE ON DELETE CASCADE;

-- RLS & POLICIES
ALTER TABLE public.frn_servizi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access frn_servizi" ON public.frn_servizi TO authenticated USING (true) WITH CHECK (true);
