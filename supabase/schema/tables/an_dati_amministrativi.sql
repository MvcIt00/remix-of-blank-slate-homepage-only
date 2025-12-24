-- PUBLIC SCHEMA TABLE: an_dati_amministrativi
-- Generated from monolithic schema.sql

CREATE TABLE IF NOT EXISTS public.an_dati_amministrativi (
    id_amministrativo uuid DEFAULT gen_random_uuid() NOT NULL,
    id_anagrafica uuid NOT NULL,
    pec text,
    codice_univoco text,
    iban text,
    created_at timestamp with time zone DEFAULT now(),
    is_cancellato boolean DEFAULT false
);

-- CONSTRAINTS & INDICES
ALTER TABLE ONLY public.an_dati_amministrativi ADD CONSTRAINT an_dati_amministrativi_pkey PRIMARY KEY (id_amministrativo);

CREATE INDEX IF NOT EXISTS idx_dati_amministrativi_anagrafica ON public.an_dati_amministrativi USING btree (id_anagrafica) WHERE (is_cancellato = false);

-- FOREIGN KEYS
ALTER TABLE ONLY public.an_dati_amministrativi ADD CONSTRAINT an_dati_amministrativi_id_anagrafica_fkey FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica) ON UPDATE CASCADE ON DELETE CASCADE;

-- RLS & POLICIES
ALTER TABLE public.an_dati_amministrativi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access an_dati_amministrativi" ON public.an_dati_amministrativi TO authenticated USING (true) WITH CHECK (true);
