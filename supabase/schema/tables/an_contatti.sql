-- PUBLIC SCHEMA TABLE: an_contatti
-- Generated from monolithic schema.sql

CREATE TABLE IF NOT EXISTS public.an_contatti (
    id_contatto uuid DEFAULT gen_random_uuid() NOT NULL,
    id_anagrafica uuid NOT NULL,
    id_sede uuid,
    nome text NOT NULL,
    ruolo text,
    telefono text,
    email text,
    is_aziendale boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    is_cancellato boolean DEFAULT false
);

-- CONSTRAINTS & INDICES
ALTER TABLE ONLY public.an_contatti ADD CONSTRAINT an_contatti_pkey PRIMARY KEY (id_contatto);

CREATE INDEX IF NOT EXISTS idx_contatti_anagrafica ON public.an_contatti USING btree (id_anagrafica) WHERE (is_cancellato = false);
CREATE INDEX IF NOT EXISTS idx_contatti_email ON public.an_contatti USING btree (email) WHERE (is_cancellato = false);

-- FOREIGN KEYS
ALTER TABLE ONLY public.an_contatti ADD CONSTRAINT an_contatti_id_anagrafica_fkey FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.an_contatti ADD CONSTRAINT an_contatti_id_sede_fkey FOREIGN KEY (id_sede) REFERENCES public."Sedi"(id_sede) ON UPDATE CASCADE ON DELETE SET NULL;

-- RLS & POLICIES
ALTER TABLE public.an_contatti ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access an_contatti" ON public.an_contatti TO authenticated USING (true) WITH CHECK (true);
