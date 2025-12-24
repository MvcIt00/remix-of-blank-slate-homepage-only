-- PUBLIC SCHEMA TABLE: Mezzi
-- Generated from monolithic schema.sql

CREATE TABLE IF NOT EXISTS public."Mezzi" (
    id_mezzo uuid DEFAULT gen_random_uuid() NOT NULL,
    id_anagrafica uuid,
    id_sede_assegnata uuid,
    id_sede_ubicazione uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    stato_funzionamento_descrizione text,
    stato_funzionamento public.stato_funzionamento,
    marca text,
    modello text,
    matricola text,
    id_interno text,
    anno text,
    categoria public.categoria_mezzo,
    ore_moto numeric,
    ubicazione text,
    specifiche_tecniche jsonb,
    is_cancellato boolean DEFAULT false,
    is_disponibile_noleggio boolean DEFAULT false
);

-- CONSTRAINTS & INDICES
ALTER TABLE ONLY public."Mezzi" ADD CONSTRAINT "Mezzi_pkey" PRIMARY KEY (id_mezzo);
ALTER TABLE ONLY public."Mezzi" ADD CONSTRAINT "Mezzi_matricola_unique" UNIQUE (matricola);

CREATE INDEX IF NOT EXISTS idx_mezzi_categoria ON public."Mezzi" USING btree (categoria) WHERE (is_cancellato = false);
CREATE INDEX IF NOT EXISTS idx_mezzi_id_anagrafica ON public."Mezzi" USING btree (id_anagrafica);
CREATE INDEX IF NOT EXISTS idx_mezzi_id_sede_ubicazione ON public."Mezzi" USING btree (id_sede_ubicazione);
CREATE INDEX IF NOT EXISTS idx_mezzi_search ON public."Mezzi" USING btree (marca, modello, matricola, id_interno) WHERE (is_cancellato = false);
CREATE INDEX IF NOT EXISTS idx_mezzi_sede_ubicazione ON public."Mezzi" USING btree (id_sede_ubicazione) WHERE (is_cancellato = false);
CREATE INDEX IF NOT EXISTS idx_mezzi_stato_funzionamento ON public."Mezzi" USING btree (stato_funzionamento);
CREATE INDEX IF NOT EXISTS idx_mezzi_ubicazione ON public."Mezzi" USING btree (id_sede_ubicazione) WHERE (is_cancellato = false);

-- FOREIGN KEYS
ALTER TABLE ONLY public."Mezzi" ADD CONSTRAINT "Mezzi_id_anagrafica_fkey" FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica) ON DELETE SET NULL;
ALTER TABLE ONLY public."Mezzi" ADD CONSTRAINT "Mezzi_id_sede_assegnata_fkey" FOREIGN KEY (id_sede_assegnata) REFERENCES public."Sedi"(id_sede) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public."Mezzi" ADD CONSTRAINT "Mezzi_id_sede_ubicazione_fkey" FOREIGN KEY (id_sede_ubicazione) REFERENCES public."Sedi"(id_sede) ON UPDATE CASCADE ON DELETE SET NULL;

-- TRIGGERS
CREATE TRIGGER trg_update_ubicazione BEFORE UPDATE OF id_sede_ubicazione ON public."Mezzi" FOR EACH ROW EXECUTE FUNCTION public.update_ubicazione();
CREATE TRIGGER trigger_update_ubicazione BEFORE INSERT OR UPDATE OF id_sede_ubicazione ON public."Mezzi" FOR EACH ROW EXECUTE FUNCTION public.update_ubicazione();

-- RLS & POLICIES
ALTER TABLE public."Mezzi" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access Mezzi" ON public."Mezzi" TO authenticated USING (true) WITH CHECK (true);
