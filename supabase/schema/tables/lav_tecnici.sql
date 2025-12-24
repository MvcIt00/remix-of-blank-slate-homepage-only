-- PUBLIC SCHEMA TABLE: lav_tecnici
-- Generated from monolithic schema.sql

CREATE TABLE IF NOT EXISTS public.lav_tecnici (
    id_lavorazione uuid NOT NULL,
    id_tecnico uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- CONSTRAINTS & INDICES
ALTER TABLE ONLY public.lav_tecnici ADD CONSTRAINT lav_tecnici_pkey PRIMARY KEY (id_lavorazione, id_tecnico);

-- FOREIGN KEYS
ALTER TABLE ONLY public.lav_tecnici ADD CONSTRAINT lav_tecnici_id_lavorazione_fkey FOREIGN KEY (id_lavorazione) REFERENCES public.int_lavorazioni(id_lavorazione) ON DELETE CASCADE;
ALTER TABLE ONLY public.lav_tecnici ADD CONSTRAINT lav_tecnici_id_tecnico_fkey FOREIGN KEY (id_tecnico) REFERENCES public.tecnici(id_tecnico) ON DELETE CASCADE;

-- TRIGGERS
CREATE TRIGGER trigger_update_stato_on_delete AFTER DELETE ON public.lav_tecnici FOR EACH ROW EXECUTE FUNCTION public.update_lavorazione_stato();
CREATE TRIGGER trigger_update_stato_on_insert AFTER INSERT ON public.lav_tecnici FOR EACH ROW EXECUTE FUNCTION public.update_lavorazione_stato();

-- RLS & POLICIES
ALTER TABLE public.lav_tecnici ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access lav_tecnici" ON public.lav_tecnici TO authenticated USING (true) WITH CHECK (true);
