-- PUBLIC SCHEMA TABLE: documenti_noleggio
-- Generated from monolithic schema.sql

CREATE TABLE IF NOT EXISTS public.documenti_noleggio (
    id_documento uuid DEFAULT gen_random_uuid() NOT NULL,
    id_noleggio uuid NOT NULL,
    tipo_documento text NOT NULL,
    nome_file text NOT NULL,
    perc_file text NOT NULL,
    data_caricamento timestamp with time zone DEFAULT now(),
    is_cancellato boolean DEFAULT false
);

-- CONSTRAINTS & INDICES
ALTER TABLE ONLY public.documenti_noleggio ADD CONSTRAINT documenti_noleggio_pkey PRIMARY KEY (id_documento);

-- FOREIGN KEYS
ALTER TABLE ONLY public.documenti_noleggio ADD CONSTRAINT documenti_noleggio_id_noleggio_fkey FOREIGN KEY (id_noleggio) REFERENCES public."Noleggi"(id_noleggio) ON DELETE CASCADE;

-- RLS & POLICIES
ALTER TABLE public.documenti_noleggio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access documenti_noleggio" ON public.documenti_noleggio TO authenticated USING (true) WITH CHECK (true);
