-- PUBLIC SCHEMA TABLE: noleggi_storico
-- Generated from monolithic schema.sql

CREATE TABLE IF NOT EXISTS public.noleggi_storico (
    id_storico uuid DEFAULT gen_random_uuid() NOT NULL,
    id_noleggio uuid NOT NULL,
    data_cambio timestamp with time zone DEFAULT now(),
    stato_precedente public.stato_noleggio,
    stato_nuovo public.stato_noleggio,
    note text,
    is_cancellato boolean DEFAULT false
);

-- CONSTRAINTS & INDICES
ALTER TABLE ONLY public.noleggi_storico ADD CONSTRAINT noleggi_storico_pkey PRIMARY KEY (id_storico);

-- FOREIGN KEYS
ALTER TABLE ONLY public.noleggi_storico ADD CONSTRAINT noleggi_storico_id_noleggio_fkey FOREIGN KEY (id_noleggio) REFERENCES public."Noleggi"(id_noleggio) ON DELETE CASCADE;

-- RLS & POLICIES
ALTER TABLE public.noleggi_storico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access noleggi_storico" ON public.noleggi_storico TO authenticated USING (true) WITH CHECK (true);
