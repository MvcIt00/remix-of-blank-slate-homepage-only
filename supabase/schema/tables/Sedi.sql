-- PUBLIC SCHEMA TABLE: Sedi
-- Generated from monolithic schema.sql

CREATE TABLE IF NOT EXISTS public."Sedi" (
    id_sede uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    id_anagrafica uuid,
    is_legale boolean,
    is_operativa boolean,
    indirizzo text,
    citta text,
    provincia text,
    cap numeric,
    nome_sede text,
    id_porto uuid,
    is_nave boolean,
    is_banchina boolean,
    is_officina boolean,
    is_cancellato boolean DEFAULT false
);

-- CONSTRAINTS & INDICES
ALTER TABLE ONLY public."Sedi" ADD CONSTRAINT "Sedi_pkey" PRIMARY KEY (id_sede);

CREATE INDEX IF NOT EXISTS idx_sedi_anagrafica ON public."Sedi" USING btree (id_anagrafica) WHERE (is_cancellato = false);
CREATE INDEX IF NOT EXISTS idx_sedi_id_anagrafica ON public."Sedi" USING btree (id_anagrafica);
CREATE INDEX IF NOT EXISTS idx_sedi_id_porto ON public."Sedi" USING btree (id_porto);
CREATE INDEX IF NOT EXISTS idx_sedi_operativa ON public."Sedi" USING btree (is_operativa) WHERE ((is_cancellato = false) AND (is_operativa = true));
CREATE INDEX IF NOT EXISTS idx_sedi_search ON public."Sedi" USING btree (indirizzo, citta, provincia) WHERE (is_cancellato = false);

-- FOREIGN KEYS
ALTER TABLE ONLY public."Sedi" ADD CONSTRAINT "Sedi_id_anagrafica_fkey" FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica) ON DELETE CASCADE;
ALTER TABLE ONLY public."Sedi" ADD CONSTRAINT "Sedi_id_porto_fkey" FOREIGN KEY (id_porto) REFERENCES public."Porti"(id_porto) ON DELETE SET NULL;

-- RLS & POLICIES
ALTER TABLE public."Sedi" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access Sedi" ON public."Sedi" TO authenticated USING (true) WITH CHECK (true);
