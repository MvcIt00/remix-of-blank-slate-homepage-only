-- Assicura che il tipo enum esista
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stato_preventivo') THEN
        CREATE TYPE stato_preventivo AS ENUM ('bozza', 'inviato', 'approvato', 'rifiutato', 'convertito');
    ELSE
        -- Opzionale: Aggiungi valori se mancano (es. 'convertito')
        ALTER TYPE stato_preventivo ADD VALUE IF NOT EXISTS 'convertito';
    END IF;
END$$;

-- Aggiorna la tabella prev_noleggi per usare il tipo enum
-- 1. Rimuovi il default esistente (che è di tipo text/string)
ALTER TABLE prev_noleggi ALTER COLUMN stato DROP DEFAULT;

-- 2. Converti la colonna
ALTER TABLE prev_noleggi 
ALTER COLUMN stato TYPE stato_preventivo 
USING stato::text::stato_preventivo;

-- 3. Reimposta il default con il tipo corretto
ALTER TABLE prev_noleggi ALTER COLUMN stato SET DEFAULT 'bozza'::stato_preventivo;

-- Verifica/Aggiunta colonne su contratti_noleggio (idempotente)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contratti_noleggio' AND column_name = 'pdf_firmato_path') THEN
        ALTER TABLE contratti_noleggio ADD COLUMN pdf_firmato_path text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contratti_noleggio' AND column_name = 'stato_contratto') THEN
        -- Assumi che esista un tipo stato_contratto o crealo, qui usi text o enum esistente
        ALTER TABLE contratti_noleggio ADD COLUMN stato_contratto text; 
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contratti_noleggio' AND column_name = 'data_firma') THEN
        ALTER TABLE contratti_noleggio ADD COLUMN data_firma timestamp with time zone;
    END IF;
END$$;
