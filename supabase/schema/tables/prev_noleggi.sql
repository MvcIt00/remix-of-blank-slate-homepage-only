-- PUBLIC SCHEMA TABLE: prev_noleggi
-- Description: Table for rental quote details, expanded for modularity and idempotency.

CREATE TABLE IF NOT EXISTS public.prev_noleggi (
    id_preventivo uuid NOT NULL,
    id_mezzo uuid,
    id_anagrafica uuid,
    id_anagrafica_fornitore uuid,
    sede_operativa uuid,
    data_inizio date,
    data_fine date,
    tempo_indeterminato boolean,
    prezzo_noleggio numeric,
    prezzo_trasporto numeric,
    tipo_canone public.tipo_canone DEFAULT 'mensile'::public.tipo_canone,
    deposito_cauzionale numeric,
    modalita_pagamento text,
    clausole_speciali text,
    note text,
    convertito_in_noleggio_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 1. PRIMARY KEY (Idempotent)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'prev_noleggi_pkey') THEN
        ALTER TABLE public.prev_noleggi ADD CONSTRAINT prev_noleggi_pkey PRIMARY KEY (id_preventivo);
    END IF;
END $$;

-- 2. INDICES (Standard IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_prev_noleggi_anagrafica ON public.prev_noleggi USING btree (id_anagrafica);
CREATE INDEX IF NOT EXISTS idx_prev_noleggi_convertito ON public.prev_noleggi USING btree (convertito_in_noleggio_id);
CREATE INDEX IF NOT EXISTS idx_prev_noleggi_id_preventivo ON public.prev_noleggi USING btree (id_preventivo);
CREATE INDEX IF NOT EXISTS idx_prev_noleggi_mezzo ON public.prev_noleggi USING btree (id_mezzo);

-- 3. FOREIGN KEYS (Idempotent)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'prev_noleggi_convertito_in_noleggio_id_fkey') THEN
        ALTER TABLE ONLY public.prev_noleggi ADD CONSTRAINT prev_noleggi_convertito_in_noleggio_id_fkey FOREIGN KEY (convertito_in_noleggio_id) REFERENCES public."Noleggi"(id_noleggio) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'prev_noleggi_id_anagrafica_fkey') THEN
        ALTER TABLE ONLY public.prev_noleggi ADD CONSTRAINT prev_noleggi_id_anagrafica_fkey FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'prev_noleggi_id_anagrafica_fornitore_fkey') THEN
        ALTER TABLE ONLY public.prev_noleggi ADD CONSTRAINT prev_noleggi_id_anagrafica_fornitore_fkey FOREIGN KEY (id_anagrafica_fornitore) REFERENCES public."Anagrafiche"(id_anagrafica);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'prev_noleggi_id_mezzo_fkey') THEN
        ALTER TABLE ONLY public.prev_noleggi ADD CONSTRAINT prev_noleggi_id_mezzo_fkey FOREIGN KEY (id_mezzo) REFERENCES public."Mezzi"(id_mezzo);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'prev_noleggi_id_preventivo_fkey') THEN
        ALTER TABLE ONLY public.prev_noleggi ADD CONSTRAINT prev_noleggi_id_preventivo_fkey FOREIGN KEY (id_preventivo) REFERENCES public."Preventivi"(id_preventivo) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'prev_noleggi_sede_operativa_fkey') THEN
        ALTER TABLE ONLY public.prev_noleggi ADD CONSTRAINT prev_noleggi_sede_operativa_fkey FOREIGN KEY (sede_operativa) REFERENCES public."Sedi"(id_sede) ON UPDATE CASCADE ON DELETE SET NULL;
    END IF;
END $$;

-- 4. TRIGGERS (Standard DROP/CREATE)
DROP TRIGGER IF EXISTS update_prev_noleggi_updated_at ON public.prev_noleggi;
CREATE TRIGGER update_prev_noleggi_updated_at BEFORE UPDATE ON public.prev_noleggi FOR EACH ROW EXECUTE FUNCTION public.update_prev_noleggi_updated_at();

-- 5. RLS & POLICIES
ALTER TABLE public.prev_noleggi ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Accesso completo prev_noleggi') THEN
        CREATE POLICY "Accesso completo prev_noleggi" ON public.prev_noleggi USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Authenticated users can access prev_noleggi') THEN
        CREATE POLICY "Authenticated users can access prev_noleggi" ON public.prev_noleggi TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;
