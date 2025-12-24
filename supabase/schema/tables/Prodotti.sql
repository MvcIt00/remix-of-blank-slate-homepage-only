-- PUBLIC SCHEMA TABLE: Prodotti
-- Generated from monolithic schema.sql

CREATE TABLE IF NOT EXISTS public."Prodotti" (
    id_prodotto uuid DEFAULT gen_random_uuid() NOT NULL,
    codice text NOT NULL,
    nome text NOT NULL,
    descrizione text,
    marca text,
    modello text,
    prezzo_listino numeric,
    costo_acquisto numeric,
    created_at timestamp with time zone DEFAULT now(),
    is_cancellato boolean DEFAULT false
);

-- CONSTRAINTS & INDICES
ALTER TABLE ONLY public."Prodotti" ADD CONSTRAINT "Prodotti_pkey" PRIMARY KEY (id_prodotto);
ALTER TABLE ONLY public."Prodotti" ADD CONSTRAINT "Prodotti_codice_key" UNIQUE (codice);

CREATE INDEX IF NOT EXISTS idx_prodotti_codice ON public."Prodotti" USING btree (codice) WHERE (is_cancellato = false);
CREATE INDEX IF NOT EXISTS idx_prodotti_search ON public."Prodotti" USING btree (nome, codice, marca, modello) WHERE (is_cancellato = false);

-- RLS & POLICIES
ALTER TABLE public."Prodotti" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access Prodotti" ON public."Prodotti" TO authenticated USING (true) WITH CHECK (true);
