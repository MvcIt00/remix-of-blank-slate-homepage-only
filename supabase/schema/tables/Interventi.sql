-- PUBLIC SCHEMA TABLE: Interventi
-- Generated from monolithic schema.sql

CREATE TABLE IF NOT EXISTS public."Interventi" (
    id_intervento uuid DEFAULT gen_random_uuid() NOT NULL,
    id_mezzo uuid NOT NULL,
    id_anagrafica uuid,
    codice_intervento text,
    descrizione_intervento text,
    is_chiuso boolean DEFAULT false NOT NULL,
    is_fatturato boolean DEFAULT false NOT NULL,
    is_cancellato boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    stato_intervento public.stato_intervento,
    stato_preventivo public.stato_preventivo
);

-- CONSTRAINTS & INDICES
ALTER TABLE ONLY public."Interventi" ADD CONSTRAINT "Interventi_pkey" PRIMARY KEY (id_intervento);
ALTER TABLE ONLY public."Interventi" ADD CONSTRAINT "Interventi_codice_intervento_key" UNIQUE (codice_intervento);

CREATE INDEX IF NOT EXISTS idx_interventi_anagrafica ON public."Interventi" USING btree (id_anagrafica) WHERE (is_cancellato = false);
CREATE INDEX IF NOT EXISTS idx_interventi_created ON public."Interventi" USING btree (created_at DESC) WHERE (is_cancellato = false);
CREATE INDEX IF NOT EXISTS idx_interventi_created_at ON public."Interventi" USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_interventi_id_mezzo ON public."Interventi" USING btree (id_mezzo);
CREATE INDEX IF NOT EXISTS idx_interventi_mezzo ON public."Interventi" USING btree (id_mezzo) WHERE (is_cancellato = false);
CREATE INDEX IF NOT EXISTS idx_interventi_mezzo_attivi ON public."Interventi" USING btree (id_mezzo) WHERE ((is_cancellato = false) AND (is_chiuso = false));
CREATE INDEX IF NOT EXISTS idx_interventi_mezzo_stato ON public."Interventi" USING btree (id_mezzo, is_cancellato, is_chiuso) WHERE ((is_cancellato = false) AND (is_chiuso = false));
CREATE INDEX IF NOT EXISTS idx_interventi_stato ON public."Interventi" USING btree (stato_intervento) WHERE (is_cancellato = false);

-- FOREIGN KEYS
ALTER TABLE ONLY public."Interventi" ADD CONSTRAINT "Interventi_id_anagrafica_fkey" FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public."Interventi" ADD CONSTRAINT "Interventi_id_mezzo_fkey" FOREIGN KEY (id_mezzo) REFERENCES public."Mezzi"(id_mezzo) ON DELETE CASCADE;

-- TRIGGERS
CREATE TRIGGER gen_codice_intervento BEFORE INSERT ON public."Interventi" FOR EACH ROW EXECUTE FUNCTION public.generate_codice_intervento();

-- RLS & POLICIES
ALTER TABLE public."Interventi" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access Interventi" ON public."Interventi" TO authenticated USING (true) WITH CHECK (true);
