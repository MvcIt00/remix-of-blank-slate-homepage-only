-- PUBLIC SCHEMA TABLE: Noleggi
-- Generated from monolithic schema.sql

CREATE TABLE IF NOT EXISTS public."Noleggi" (
    id_noleggio uuid DEFAULT gen_random_uuid() NOT NULL,
    id_mezzo uuid NOT NULL,
    id_anagrafica uuid NOT NULL,
    sede_operativa uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    data_inizio date,
    data_fine date,
    tempo_indeterminato boolean,
    prezzo_noleggio numeric,
    prezzo_trasporto numeric,
    contratto text,
    is_cancellato boolean DEFAULT false,
    stato_noleggio public.stato_noleggio,
    is_terminato boolean DEFAULT false NOT NULL,
    tipo_canone public.tipo_canone DEFAULT 'mensile'::public.tipo_canone,
    note text,
    data_terminazione_effettiva date
);

-- CONSTRAINTS & INDICES
ALTER TABLE ONLY public."Noleggi" ADD CONSTRAINT "Noleggi_pkey" PRIMARY KEY (id_noleggio);

CREATE INDEX IF NOT EXISTS idx_noleggi_data_fine ON public."Noleggi" USING btree (data_fine);
CREATE INDEX IF NOT EXISTS idx_noleggi_data_inizio ON public."Noleggi" USING btree (data_inizio);
CREATE INDEX IF NOT EXISTS idx_noleggi_id_anagrafica ON public."Noleggi" USING btree (id_anagrafica);
CREATE INDEX IF NOT EXISTS idx_noleggi_id_mezzo ON public."Noleggi" USING btree (id_mezzo);
CREATE INDEX IF NOT EXISTS idx_noleggi_mezzo_attivi ON public."Noleggi" USING btree (id_mezzo) WHERE ((is_cancellato = false) AND (is_terminato = false));
CREATE INDEX IF NOT EXISTS idx_noleggi_stato ON public."Noleggi" USING btree (stato_noleggio);
CREATE INDEX IF NOT EXISTS idx_noleggi_terminato ON public."Noleggi" USING btree (is_terminato);

-- FOREIGN KEYS
ALTER TABLE ONLY public."Noleggi" ADD CONSTRAINT "Noleggi_id_anagrafica_fkey" FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY public."Noleggi" ADD CONSTRAINT "Noleggi_id_mezzo_fkey" FOREIGN KEY (id_mezzo) REFERENCES public."Mezzi"(id_mezzo) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY public."Noleggi" ADD CONSTRAINT "Noleggi_sede_operativa_fkey" FOREIGN KEY (sede_operativa) REFERENCES public."Sedi"(id_sede) ON UPDATE CASCADE ON DELETE CASCADE;

-- TRIGGERS
CREATE TRIGGER trigger_capture_noleggio_storico BEFORE UPDATE ON public."Noleggi" FOR EACH ROW EXECUTE FUNCTION public.capture_noleggio_storico();

-- RLS & POLICIES
ALTER TABLE public."Noleggi" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access Noleggi" ON public."Noleggi" TO authenticated USING (true) WITH CHECK (true);
