-- PUBLIC SCHEMA TABLE: utenti
-- Generated from monolithic schema.sql

CREATE TABLE IF NOT EXISTS public.utenti (
    id_utente uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text,
    cognome text,
    email text,
    id_auth uuid,
    created_at timestamp with time zone DEFAULT now(),
    is_cancellato boolean DEFAULT false
);

-- CONSTRAINTS & INDICES
ALTER TABLE ONLY public.utenti ADD CONSTRAINT utenti_pkey PRIMARY KEY (id_utente);
ALTER TABLE ONLY public.utenti ADD CONSTRAINT utenti_id_auth_key UNIQUE (id_auth);

-- RLS & POLICIES
ALTER TABLE public.utenti ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access utenti" ON public.utenti TO authenticated USING (true) WITH CHECK (true);
