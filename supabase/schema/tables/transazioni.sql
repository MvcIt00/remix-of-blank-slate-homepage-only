-- PUBLIC SCHEMA TABLE: transazioni
-- Generated from monolithic schema.sql

CREATE TABLE IF NOT EXISTS public.transazioni (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conto_bancario_id uuid NOT NULL,
    data_transazione date NOT NULL,
    descrizione text NOT NULL,
    importo numeric(12,2) NOT NULL,
    tipo text NOT NULL,
    categoria text,
    creato_il timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    aggiornato_il timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    transazione_collegata_id uuid,
    note text,
    CONSTRAINT transazioni_tipo_check CHECK ((tipo = ANY (ARRAY['entrata'::text, 'uscita'::text])))
);

-- CONSTRAINTS & INDICES
ALTER TABLE ONLY public.transazioni ADD CONSTRAINT transazioni_pkey PRIMARY KEY (id);

-- FOREIGN KEYS
ALTER TABLE ONLY public.transazioni ADD CONSTRAINT transazioni_conto_bancario_id_fkey FOREIGN KEY (conto_bancario_id) REFERENCES public.conti_bancari(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.transazioni ADD CONSTRAINT transazioni_transazione_collegata_id_fkey FOREIGN KEY (transazione_collegata_id) REFERENCES public.transazioni(id) ON DELETE SET NULL;

-- TRIGGERS
CREATE TRIGGER update_transazioni_aggiornato_il BEFORE UPDATE ON public.transazioni FOR EACH ROW EXECUTE FUNCTION public.update_aggiornato_il();

-- RLS & POLICIES
ALTER TABLE public.transazioni ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access transazioni" ON public.transazioni TO authenticated USING (true) WITH CHECK (true);
