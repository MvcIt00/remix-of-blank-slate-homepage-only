-- PUBLIC SCHEMA TABLE: Porti
-- Generated from monolithic schema.sql

CREATE TABLE IF NOT EXISTS public."Porti" (
    id_porto uuid DEFAULT gen_random_uuid() NOT NULL,
    nome_porto text NOT NULL,
    codice_porto text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_cancellato boolean DEFAULT false
);

-- CONSTRAINTS & INDICES
ALTER TABLE ONLY public."Porti" ADD CONSTRAINT "Porti_pkey" PRIMARY KEY (id_porto);

-- RLS & POLICIES
ALTER TABLE public."Porti" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access Porti" ON public."Porti" TO authenticated USING (true) WITH CHECK (true);
