-- Migrazione v20.2: Threading e Conversazioni (Pattern Thunderbird)

-- 1. Tabella Conversazioni
CREATE TABLE IF NOT EXISTS conversazioni_email (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_normalized TEXT, -- Soggetto senza Re:/Fwd:
    data_primo_messaggio TIMESTAMPTZ DEFAULT NOW(),
    data_ultimo_messaggio TIMESTAMPTZ DEFAULT NOW(),
    count_messaggi INTEGER DEFAULT 1,
    id_anagrafica UUID REFERENCES "Anagrafiche"(id_anagrafica) ON DELETE SET NULL,
    id_noleggio UUID REFERENCES "Noleggi"(id_noleggio) ON DELETE SET NULL,
    id_preventivo UUID REFERENCES "Preventivi"(id_preventivo) ON DELETE SET NULL
);

-- 2. Campi Threading per emails_ricevute
ALTER TABLE emails_ricevute 
ADD COLUMN IF NOT EXISTS message_id TEXT,
ADD COLUMN IF NOT EXISTS in_reply_to TEXT,
ADD COLUMN IF NOT EXISTS references_chain TEXT[],
ADD COLUMN IF NOT EXISTS id_conversazione UUID REFERENCES conversazioni_email(id) ON DELETE SET NULL;

-- 3. Campi Threading per emails_inviate
ALTER TABLE emails_inviate
ADD COLUMN IF NOT EXISTS message_id TEXT,
ADD COLUMN IF NOT EXISTS in_reply_to TEXT,
ADD COLUMN IF NOT EXISTS references_chain TEXT[],
ADD COLUMN IF NOT EXISTS id_conversazione UUID REFERENCES conversazioni_email(id) ON DELETE SET NULL;

-- 4. Indici per performance (AX04)
CREATE INDEX IF NOT EXISTS idx_emails_ricevute_conversazione ON emails_ricevute(id_conversazione);
CREATE INDEX IF NOT EXISTS idx_emails_inviate_conversazione ON emails_inviate(id_conversazione);
CREATE INDEX IF NOT EXISTS idx_emails_ricevute_message_id ON emails_ricevute(message_id);
CREATE INDEX IF NOT EXISTS idx_emails_inviate_message_id ON emails_inviate(message_id);

-- Indice GIN per la catena references (per lookup veloce)
CREATE INDEX IF NOT EXISTS idx_emails_ricevute_refs ON emails_ricevute USING GIN (references_chain);
CREATE INDEX IF NOT EXISTS idx_emails_inviate_refs ON emails_inviate USING GIN (references_chain);

-- 5. RPC per associazione intelligente della conversazione
CREATE OR REPLACE FUNCTION get_or_create_conversation_by_refs(
    p_subject TEXT,
    p_message_id TEXT,
    p_references TEXT[],
    p_id_anagrafica UUID DEFAULT NULL,
    p_id_noleggio UUID DEFAULT NULL,
    p_id_preventivo UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_conv_id UUID;
    v_ref TEXT;
BEGIN
    -- 1. Cerchiamo se esiste già una conversazione tramite i References
    IF p_references IS NOT NULL AND array_length(p_references, 1) > 0 THEN
        SELECT id_conversazione INTO v_conv_id
        FROM (
            SELECT id_conversazione FROM emails_ricevute WHERE message_id = ANY(p_references)
            UNION
            SELECT id_conversazione FROM emails_inviate WHERE message_id = ANY(p_references)
        ) combined_refs
        WHERE id_conversazione IS NOT NULL
        LIMIT 1;
    END IF;

    -- 2. Se non trovata, cerchiamo per Message-ID (in caso di duplicati o re-sync)
    IF v_conv_id IS NULL THEN
        SELECT id_conversazione INTO v_conv_id
        FROM (
            SELECT id_conversazione FROM emails_ricevute WHERE message_id = p_message_id
            UNION
            SELECT id_conversazione FROM emails_inviate WHERE message_id = p_message_id
        ) combined_msgid
        WHERE id_conversazione IS NOT NULL
        LIMIT 1;
    END IF;

    -- 3. Se ancora non trovata, creiamo una nuova conversazione
    IF v_conv_id IS NULL THEN
        INSERT INTO conversazioni_email (
            subject_normalized,
            id_anagrafica,
            id_noleggio,
            id_preventivo
        ) VALUES (
            regexp_replace(p_subject, '^(Re:|Fwd:|AW:|WG:)\s*', '', 'i'),
            p_id_anagrafica,
            p_id_noleggio,
            p_id_preventivo
        ) RETURNING id INTO v_conv_id;
    ELSE
        -- Aggiorniamo la conversazione esistente con l'ultima data
        UPDATE conversazioni_email 
        SET data_ultimo_messaggio = NOW(),
            count_messaggi = count_messaggi + 1
        WHERE id = v_conv_id;
    END IF;

    RETURN v_conv_id;
END;
$$ LANGUAGE plpgsql;
