-- PUBLIC SCHEMA TABLE: int_lav_prod
-- Generated from monolithic schema.sql

CREATE TABLE IF NOT EXISTS public.int_lav_prod (
    id_lav_prod uuid DEFAULT gen_random_uuid() NOT NULL,
    id_lavorazione uuid,
    id_prodotto uuid,
    n_prodotto_uscita_prevista numeric,
    n_prodotto_uscita_effettiva numeric,
    n_prodotto_rientro_previsto numeric,
    n_prodotto_rientro_effettivo numeric,
    costo_prodotto_lavorazione numeric,
    prezzo_prodotto_lavorazione numeric,
    created_at timestamp with time zone DEFAULT now()
);

-- CONSTRAINTS & INDICES
ALTER TABLE ONLY public.int_lav_prod ADD CONSTRAINT int_lav_prod_pkey PRIMARY KEY (id_lav_prod);

-- FOREIGN KEYS
ALTER TABLE ONLY public.int_lav_prod ADD CONSTRAINT int_lav_prod_id_lavorazione_fkey FOREIGN KEY (id_lavorazione) REFERENCES public.int_lavorazioni(id_lavorazione) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.int_lav_prod ADD CONSTRAINT int_lav_prod_id_prodotto_fkey FOREIGN KEY (id_prodotto) REFERENCES public."Prodotti"(id_prodotto) ON UPDATE CASCADE ON DELETE SET NULL;

-- RLS & POLICIES
ALTER TABLE public.int_lav_prod ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access int_lav_prod" ON public.int_lav_prod TO authenticated USING (true) WITH CHECK (true);
