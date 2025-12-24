-- PUBLIC SCHEMA TABLE: int_lavorazioni
-- Generated from monolithic schema.sql

CREATE TABLE IF NOT EXISTS public.int_lavorazioni (
    id_lavorazione uuid DEFAULT gen_random_uuid() NOT NULL,
    id_intervento uuid NOT NULL,
    nome_lavorazione text NOT NULL,
    descrizione_lavorazione text,
    data_da_prevista timestamp with time zone,
    data_a_prevista timestamp with time zone,
    durata_prevista numeric,
    n_tecnici_previsti numeric,
    prezzo_lavorazione numeric,
    prezzo_manodopera numeric,
    competenza_lavorazione public.competenza_lavorazione,
    stato_lavorazione public.stato_lavorazione,
    data_effettiva timestamp with time zone,
    is_completato boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    is_cancellato boolean DEFAULT false
);

-- CONSTRAINTS & INDICES
ALTER TABLE ONLY public.int_lavorazioni ADD CONSTRAINT int_lavorazioni_pkey PRIMARY KEY (id_lavorazione);

CREATE INDEX IF NOT EXISTS idx_int_lavorazioni_id_intervento ON public.int_lavorazioni USING btree (id_intervento);
CREATE INDEX IF NOT EXISTS idx_lavorazioni_intervento ON public.int_lavorazioni USING btree (id_intervento) WHERE (is_cancellato = false);
CREATE INDEX IF NOT EXISTS idx_lavorazioni_stato ON public.int_lavorazioni USING btree (stato_lavorazione) WHERE (is_cancellato = false);

-- FOREIGN KEYS
ALTER TABLE ONLY public.int_lavorazioni ADD CONSTRAINT int_lavorazioni_id_intervento_fkey FOREIGN KEY (id_intervento) REFERENCES public."Interventi"(id_intervento) ON UPDATE CASCADE ON DELETE CASCADE;

-- RLS & POLICIES
ALTER TABLE public.int_lavorazioni ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access int_lavorazioni" ON public.int_lavorazioni TO authenticated USING (true) WITH CHECK (true);
