-- PUBLIC SCHEMA TABLE: Preventivi
-- Generated from monolithic schema.sql

CREATE TABLE IF NOT EXISTS public."Preventivi" (
    id_preventivo uuid DEFAULT gen_random_uuid() NOT NULL,
    id_anagrafica uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_cancellato boolean DEFAULT false,
    codice text
);

-- CONSTRAINTS & INDICES
ALTER TABLE ONLY public."Preventivi" ADD CONSTRAINT "Preventivi_pkey" PRIMARY KEY (id_preventivo);
CREATE UNIQUE INDEX IF NOT EXISTS idx_preventivi_codice ON public."Preventivi" USING btree (codice);

-- FOREIGN KEYS
ALTER TABLE ONLY public."Preventivi" ADD CONSTRAINT "Preventivi_id_anagrafica_fkey" FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica) ON UPDATE CASCADE ON DELETE CASCADE;

-- TRIGGERS
CREATE TRIGGER trg_set_preventivo_code BEFORE INSERT ON public."Preventivi" FOR EACH ROW EXECUTE FUNCTION public.trigger_set_preventivo_code();

-- RLS & POLICIES
ALTER TABLE public."Preventivi" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access Preventivi" ON public."Preventivi" TO authenticated USING (true) WITH CHECK (true);
