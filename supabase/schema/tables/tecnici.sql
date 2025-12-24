-- PUBLIC SCHEMA TABLE: tecnici
-- Generated from monolithic schema.sql

CREATE TABLE IF NOT EXISTS public.tecnici (
    id_tecnico uuid DEFAULT gen_random_uuid() NOT NULL,
    id_utente uuid,
    nome text NOT NULL,
    cognome text NOT NULL,
    specializzazione text,
    created_at timestamp with time zone DEFAULT now(),
    is_cancellato boolean DEFAULT false
);

-- CONSTRAINTS & INDICES
ALTER TABLE ONLY public.tecnici ADD CONSTRAINT tecnici_pkey PRIMARY KEY (id_tecnico);

-- FOREIGN KEYS
ALTER TABLE ONLY public.tecnici ADD CONSTRAINT tecnici_id_utente_fkey FOREIGN KEY (id_utente) REFERENCES public.utenti(id_utente) ON DELETE CASCADE;

-- RLS & POLICIES
ALTER TABLE public.tecnici ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access tecnici" ON public.tecnici TO authenticated USING (true) WITH CHECK (true);
