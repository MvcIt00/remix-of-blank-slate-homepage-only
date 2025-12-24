-- PUBLIC SCHEMA TABLE: Anagrafiche
-- Generated from monolithic schema.sql

CREATE TABLE IF NOT EXISTS public."Anagrafiche" (
    id_anagrafica uuid DEFAULT gen_random_uuid() NOT NULL,
    ragione_sociale text NOT NULL,
    partita_iva text,
    is_cliente boolean,
    is_fornitore boolean,
    is_owner boolean,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_cancellato boolean DEFAULT false,
    richiede_contratto_noleggio boolean DEFAULT true
);

-- CONSTRAINTS & INDICES
ALTER TABLE ONLY public."Anagrafiche" ADD CONSTRAINT "Anagrafiche_pkey" PRIMARY KEY (id_anagrafica);

CREATE INDEX IF NOT EXISTS idx_anagrafiche_cliente ON public."Anagrafiche" USING btree (is_cliente) WHERE ((is_cancellato = false) AND (is_cliente = true));
CREATE INDEX IF NOT EXISTS idx_anagrafiche_partita_iva ON public."Anagrafiche" USING btree (partita_iva) WHERE (is_cancellato = false);
CREATE INDEX IF NOT EXISTS idx_anagrafiche_ragione_sociale ON public."Anagrafiche" USING btree (ragione_sociale) WHERE (is_cancellato = false);
CREATE INDEX IF NOT EXISTS idx_anagrafiche_search ON public."Anagrafiche" USING btree (ragione_sociale, partita_iva) WHERE (is_cancellato = false);

-- RLS & POLICIES
ALTER TABLE public."Anagrafiche" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access Anagrafiche" ON public."Anagrafiche" TO authenticated USING (true) WITH CHECK (true);
