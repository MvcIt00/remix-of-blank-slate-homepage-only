-- PUBLIC SCHEMA TABLE: document_sequences
-- Generated from monolithic schema.sql

CREATE TABLE IF NOT EXISTS public.document_sequences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sequence_name text NOT NULL,
    prefix text,
    current_value integer DEFAULT 0 NOT NULL,
    year integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- CONSTRAINTS & INDICES
ALTER TABLE ONLY public.document_sequences ADD CONSTRAINT document_sequences_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.document_sequences ADD CONSTRAINT document_sequences_sequence_name_year_key UNIQUE (sequence_name, year);

-- RLS & POLICIES
ALTER TABLE public.document_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access document_sequences" ON public.document_sequences TO authenticated USING (true) WITH CHECK (true);
