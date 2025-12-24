-- URGENZA: Sincronizzazione colonne mancanti in prev_noleggi
-- Questi campi servono per far funzionare i Preventivi unificati.

DO $$ 
BEGIN 
    -- 1. Deposito Cauzionale
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prev_noleggi' AND column_name='deposito_cauzionale') THEN
        ALTER TABLE public.prev_noleggi ADD COLUMN deposito_cauzionale numeric;
    END IF;

    -- 2. Modalità Pagamento
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prev_noleggi' AND column_name='modalita_pagamento') THEN
        ALTER TABLE public.prev_noleggi ADD COLUMN modalita_pagamento text;
    END IF;

    -- 3. Clausole Speciali
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prev_noleggi' AND column_name='clausole_speciali') THEN
        ALTER TABLE public.prev_noleggi ADD COLUMN clausole_speciali text;
    END IF;
END $$;
