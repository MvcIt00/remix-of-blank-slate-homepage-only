-- PUBLIC SCHEMA TABLE: contratti_noleggio
-- Description: Table for rental contracts, expanded for modularity.

CREATE TABLE IF NOT EXISTS public.contratti_noleggio (
    id_contratto uuid DEFAULT gen_random_uuid() NOT NULL,
    id_noleggio uuid NOT NULL,
    id_anagrafica_cliente uuid,
    id_anagrafica_fornitore uuid,
    id_mezzo uuid REFERENCES public."Mezzi"(id_mezzo),
    codice_contratto text,
    data_contratto date,
    data_inizio date,
    data_fine date,
    tempo_indeterminato boolean DEFAULT false,
    canone_noleggio numeric,
    tipo_canone text,
    costo_trasporto numeric,
    deposito_cauzionale numeric,
    modalita_pagamento text,
    termini_pagamento text,
    clausole_speciali text,
    note text,
    created_at timestamp with time zone DEFAULT now(),
    is_cancellato boolean DEFAULT false
);

-- 1. PRIMARY KEY (Idempotent)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contratti_noleggio_pkey') THEN
        ALTER TABLE public.contratti_noleggio ADD CONSTRAINT contratti_noleggio_pkey PRIMARY KEY (id_contratto);
    END IF;
END $$;

-- 2. UNIQUE INDEX (Idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS idx_contratti_noleggio_codice ON public.contratti_noleggio USING btree (codice_contratto);

-- 3. FOREIGN KEYS (Idempotent)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contratti_noleggio_id_anagrafica_cliente_fkey') THEN
        ALTER TABLE ONLY public.contratti_noleggio ADD CONSTRAINT contratti_noleggio_id_anagrafica_cliente_fkey FOREIGN KEY (id_anagrafica_cliente) REFERENCES public."Anagrafiche"(id_anagrafica);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contratti_noleggio_id_anagrafica_fornitore_fkey') THEN
        ALTER TABLE ONLY public.contratti_noleggio ADD CONSTRAINT contratti_noleggio_id_anagrafica_fornitore_fkey FOREIGN KEY (id_anagrafica_fornitore) REFERENCES public."Anagrafiche"(id_anagrafica);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contratti_noleggio_id_noleggio_fkey') THEN
        ALTER TABLE ONLY public.contratti_noleggio ADD CONSTRAINT contratti_noleggio_id_noleggio_fkey FOREIGN KEY (id_noleggio) REFERENCES public."Noleggi"(id_noleggio) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. TRIGGERS (Standard DROP/CREATE for idempotency)
DROP TRIGGER IF EXISTS trg_set_contratto_code ON public.contratti_noleggio;
CREATE TRIGGER trg_set_contratto_code BEFORE INSERT ON public.contratti_noleggio FOR EACH ROW EXECUTE FUNCTION public.trigger_set_contratto_code();

DROP TRIGGER IF EXISTS trigger_generate_codice_contratto ON public.contratti_noleggio;
CREATE TRIGGER trigger_generate_codice_contratto BEFORE INSERT ON public.contratti_noleggio FOR EACH ROW WHEN (((new.codice_contratto IS NULL) OR (new.codice_contratto = ''::text))) EXECUTE FUNCTION public.generate_codice_contratto();

-- 5. RLS & POLICIES
ALTER TABLE public.contratti_noleggio ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Authenticated users can access contratti_noleggio') THEN
        CREATE POLICY "Authenticated users can access contratti_noleggio" ON public.contratti_noleggio TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;
