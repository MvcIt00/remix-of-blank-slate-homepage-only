-- =====================================================
-- SISTEMA EMAIL - BASE FUNZIONANTE
-- Rispetta axiomi: AX02 (FK specifici), AX03 (stati progressivi), AX07 (triade)
-- =====================================================

-- Account email (configurazione servizio esterno)
CREATE TABLE IF NOT EXISTS account_email (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificazione account
    email VARCHAR NOT NULL UNIQUE,
    nome_account VARCHAR NOT NULL,
    
    -- Credenziali servizio (Resend API key)
    api_key_encrypted TEXT, -- Resend API key criptata
    
    -- Configurazione webhook ricezione
    webhook_secret TEXT, -- Secret per validare webhook in arrivo
    
    -- Stati progressivi (AX03)
    stato VARCHAR DEFAULT 'attivo' CHECK (stato IN ('attivo', 'disabilitato', 'errore')),
    
    -- Metadata sincronizzazione
    ultima_sincronizzazione TIMESTAMPTZ,
    
    -- Audit
    creato_il TIMESTAMPTZ DEFAULT NOW(),
    creato_da UUID REFERENCES auth.users(id),
    modificato_il TIMESTAMPTZ DEFAULT NOW(),
    modificato_da UUID REFERENCES auth.users(id)
);

-- Messaggi email - TABELLA CENTRALE
CREATE TABLE IF NOT EXISTS messaggi_email (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Riferimento account
    account_email_id UUID REFERENCES account_email(id) ON DELETE CASCADE,
    
    -- Identificatori email esterni
    message_id VARCHAR UNIQUE, -- RFC Message-ID
    external_id VARCHAR, -- ID Resend/provider
    thread_id VARCHAR, -- Per raggruppare conversazioni
    
    -- Mittente
    da_email VARCHAR NOT NULL,
    da_nome VARCHAR,
    
    -- Destinatari (array JSON per semplicità)
    a_emails JSONB NOT NULL, -- [{email: "...", nome: "..."}]
    cc_emails JSONB DEFAULT '[]'::jsonb,
    bcc_emails JSONB DEFAULT '[]'::jsonb,
    
    -- Contenuto
    oggetto TEXT,
    corpo_text TEXT,
    corpo_html TEXT,
    
    -- Collegamenti con entità business (FK SPECIFICI - AX02)
    -- NON usiamo campi polimorfici tipo {entita_tipo, id_entita}
    id_cliente UUID REFERENCES anagrafiche(id) ON DELETE SET NULL,
    id_noleggio UUID REFERENCES noleggi(id) ON DELETE SET NULL,
    id_preventivo UUID REFERENCES preventivi(id) ON DELETE SET NULL,
    id_trasporto UUID REFERENCES trasporti(id) ON DELETE SET NULL,
    
    -- Stati progressivi (AX03)
    -- Fasi: propiziatoria (bozza) → confermata (inviata) → definitiva (consegnata/letta)
    stato VARCHAR DEFAULT 'bozza' CHECK (stato IN (
        'bozza',         -- propiziatoria: organizzativa, non ancora inviata
        'programmata',   -- propiziatoria: scheduled per invio futuro
        'in_invio',      -- confermata: in processamento
        'inviata',       -- confermata: accettata dal provider
        'consegnata',    -- definitiva: confermata consegna
        'letta',         -- definitiva: recipient ha aperto
        'fallita',       -- errore: invio fallito
        'archiviata'     -- definitiva: archiviata dall'utente
    )),
    
    -- Direzione flusso
    direzione VARCHAR NOT NULL CHECK (direzione IN ('ricevuta', 'inviata')),
    
    -- Triade DATE (AX07)
    data_creazione TIMESTAMPTZ DEFAULT NOW(),
    data_programmata TIMESTAMPTZ, -- Per email programmate
    data_invio_effettiva TIMESTAMPTZ, -- Quando effettivamente inviata
    data_consegna TIMESTAMPTZ, -- Quando consegnata (da webhook provider)
    data_lettura TIMESTAMPTZ, -- Quando letta dal destinatario
    
    -- Metadata
    ha_allegati BOOLEAN DEFAULT false,
    dimensione_bytes INTEGER,
    error_message TEXT, -- Messaggio di errore se fallita
    
    -- Audit
    creato_da UUID REFERENCES auth.users(id),
    modificato_il TIMESTAMPTZ DEFAULT NOW()
);

-- Allegati email
CREATE TABLE IF NOT EXISTS allegati_email (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    messaggio_id UUID REFERENCES messaggi_email(id) ON DELETE CASCADE,
    
    -- Metadata file
    nome_file VARCHAR NOT NULL,
    tipo_mime VARCHAR NOT NULL,
    dimensione_bytes INTEGER NOT NULL,
    
    -- Storage path in Supabase Storage
    storage_path TEXT NOT NULL,
    storage_bucket VARCHAR DEFAULT 'email-attachments',
    
    -- Audit
    creato_il TIMESTAMPTZ DEFAULT NOW()
);

-- Cartelle email (organizzazione opzionale)
CREATE TABLE IF NOT EXISTS cartelle_email (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_email_id UUID REFERENCES account_email(id) ON DELETE CASCADE,
    
    -- Identificazione cartella
    nome VARCHAR NOT NULL,
    tipo VARCHAR DEFAULT 'custom' CHECK (tipo IN ('inbox', 'sent', 'drafts', 'trash', 'archive', 'custom')),
    
    -- Struttura gerarchica
    parent_id UUID REFERENCES cartelle_email(id) ON DELETE CASCADE,
    
    -- Ordinamento
    ordine INTEGER DEFAULT 0,
    
    -- Audit
    creato_il TIMESTAMPTZ DEFAULT NOW()
);

-- Relazione molti-a-molti messaggi-cartelle
CREATE TABLE IF NOT EXISTS messaggi_cartelle (
    messaggio_id UUID REFERENCES messaggi_email(id) ON DELETE CASCADE,
    cartella_id UUID REFERENCES cartelle_email(id) ON DELETE CASCADE,
    
    -- Quando aggiunto alla cartella
    aggiunto_il TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (messaggio_id, cartella_id)
);

-- =====================================================
-- INDICI PER PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_messaggi_email_account ON messaggi_email(account_email_id);
CREATE INDEX IF NOT EXISTS idx_messaggi_email_direzione ON messaggi_email(direzione);
CREATE INDEX IF NOT EXISTS idx_messaggi_email_stato ON messaggi_email(stato);
CREATE INDEX IF NOT EXISTS idx_messaggi_email_cliente ON messaggi_email(id_cliente) WHERE id_cliente IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messaggi_email_noleggio ON messaggi_email(id_noleggio) WHERE id_noleggio IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messaggi_email_preventivo ON messaggi_email(id_preventivo) WHERE id_preventivo IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messaggi_email_trasporto ON messaggi_email(id_trasporto) WHERE id_trasporto IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messaggi_email_thread ON messaggi_email(thread_id) WHERE thread_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messaggi_email_data_creazione ON messaggi_email(data_creazione DESC);
CREATE INDEX IF NOT EXISTS idx_allegati_messaggio ON allegati_email(messaggio_id);

-- =====================================================
-- VIEW PER INBOX COMPLETA
-- =====================================================

CREATE OR REPLACE VIEW vw_inbox_completa AS
SELECT 
    m.id,
    m.message_id,
    m.oggetto,
    m.da_email,
    m.da_nome,
    m.a_emails,
    m.stato,
    m.direzione,
    m.data_creazione,
    m.data_invio_effettiva,
    m.data_lettura,
    m.ha_allegati,
    
    -- Informazioni account
    a.email AS account_email,
    a.nome_account,
    
    -- Conteggio allegati
    COUNT(DISTINCT att.id) AS numero_allegati,
    
    -- Riferimenti business (per mostrare contesto)
    c.ragione_sociale AS cliente_nome,
    n.codice_documento AS noleggio_codice,
    p.codice_documento AS preventivo_codice,
    t.codice AS trasporto_codice
    
FROM messaggi_email m
LEFT JOIN account_email a ON m.account_email_id = a.id
LEFT JOIN allegati_email att ON m.id = att.messaggio_id
LEFT JOIN anagrafiche c ON m.id_cliente = c.id
LEFT JOIN noleggi n ON m.id_noleggio = n.id
LEFT JOIN preventivi p ON m.id_preventivo = p.id
LEFT JOIN trasporti t ON m.id_trasporto = t.id

GROUP BY 
    m.id, m.message_id, m.oggetto, m.da_email, m.da_nome, m.a_emails,
    m.stato, m.direzione, m.data_creazione, m.data_invio_effettiva,
    m.data_lettura, m.ha_allegati, a.email, a.nome_account,
    c.ragione_sociale, n.codice_documento, p.codice_documento, t.codice;

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE account_email ENABLE ROW LEVEL SECURITY;
ALTER TABLE messaggi_email ENABLE ROW LEVEL SECURITY;
ALTER TABLE allegati_email ENABLE ROW LEVEL SECURITY;
ALTER TABLE cartelle_email ENABLE ROW LEVEL SECURITY;
ALTER TABLE messaggi_cartelle ENABLE ROW LEVEL SECURITY;

-- Policy: tutti gli utenti autenticati possono vedere/modificare account email
CREATE POLICY "Utenti autenticati possono gestire account email"
    ON account_email FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Policy: tutti gli utenti autenticati possono vedere/modificare messaggi
CREATE POLICY "Utenti autenticati possono gestire messaggi"
    ON messaggi_email FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Policy: tutti gli utenti autenticati possono gestire allegati
CREATE POLICY "Utenti autenticati possono gestire allegati"
    ON allegati_email FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Policy: tutti gli utenti autenticati possono gestire cartelle
CREATE POLICY "Utenti autenticati possono gestire cartelle"
    ON cartelle_email FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Policy: tutti gli utenti autenticati possono gestire relazioni messaggi-cartelle
CREATE POLICY "Utenti autenticati possono gestire messaggi_cartelle"
    ON messaggi_cartelle FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- TRIGGER PER AUDIT
-- =====================================================

CREATE OR REPLACE FUNCTION update_modified_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modificato_il = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER account_email_modified
    BEFORE UPDATE ON account_email
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_timestamp();

CREATE TRIGGER messaggi_email_modified
    BEFORE UPDATE ON messaggi_email
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_timestamp();

-- =====================================================
-- SEED DATA - Account Email Default
-- =====================================================

-- Inserisci un account email di esempio
-- NOTA: L'utente dovrà configurare la propria API key Resend
INSERT INTO account_email (email, nome_account, stato)
VALUES ('info@toscanacarrelli.it', 'Account Principale', 'disabilitato')
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- COMMENTI FINALI
-- =====================================================

COMMENT ON TABLE messaggi_email IS 'Tabella centrale per tutti i messaggi email (ricevuti e inviati). Rispetta AX02 (FK specifici), AX03 (stati progressivi), AX07 (triade date).';
COMMENT ON COLUMN messaggi_email.stato IS 'Stati progressivi: bozza (propiziatoria) → inviata (confermata) → consegnata/letta (definitiva)';
COMMENT ON COLUMN messaggi_email.id_cliente IS 'FK specifico (AX02) - NON usiamo polymorphic {entita_tipo, id_entita}';
COMMENT ON TABLE allegati_email IS 'Allegati email salvati in Supabase Storage';
