-- PUBLIC SCHEMA TABLE: Subnoleggi
-- Generated from monolithic schema.sql

CREATE TABLE IF NOT EXISTS public."Subnoleggi" (
    id_subnoleggio uuid DEFAULT gen_random_uuid() NOT NULL,
    id_anagrafica uuid NOT NULL,
    id_mezzo uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    data_inizio date,
    data_fine date,
    tempo_indeterminato boolean,
    costo_subnoleggio numeric,
    valore_residuo numeric,
    contratto text,
    is_cancellato boolean DEFAULT false
);

-- CONSTRAINTS & INDICES
ALTER TABLE ONLY public."Subnoleggi" ADD CONSTRAINT "Subnoleggi_pkey" PRIMARY KEY (id_subnoleggio);

CREATE INDEX IF NOT EXISTS idx_subnoleggi_data_fine ON public."Subnoleggi" USING btree (data_fine);
CREATE INDEX IF NOT EXISTS idx_subnoleggi_data_inizio ON public."Subnoleggi" USING btree (data_inizio);
CREATE INDEX IF NOT EXISTS idx_subnoleggi_id_anagrafica ON public."Subnoleggi" USING btree (id_anagrafica);
CREATE INDEX IF NOT EXISTS idx_subnoleggi_id_mezzo ON public."Subnoleggi" USING btree (id_mezzo);
CREATE INDEX IF NOT EXISTS idx_subnoleggi_mezzo_attivi ON public."Subnoleggi" USING btree (id_mezzo) WHERE (is_cancellato = false);

-- FOREIGN KEYS
ALTER TABLE ONLY public."Subnoleggi" ADD CONSTRAINT "Subnoleggi_id_anagrafica_fkey" FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica) ON DELETE CASCADE;
ALTER TABLE ONLY public."Subnoleggi" ADD CONSTRAINT "Subnoleggi_id_mezzo_fkey" FOREIGN KEY (id_mezzo) REFERENCES public."Mezzi"(id_mezzo) ON DELETE CASCADE;

-- RLS & POLICIES
ALTER TABLE public."Subnoleggi" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access Subnoleggi" ON public."Subnoleggi" TO authenticated USING (true) WITH CHECK (true);
