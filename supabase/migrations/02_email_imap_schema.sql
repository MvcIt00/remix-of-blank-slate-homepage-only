-- Aggiornamento tabella account_email per supportare IMAP/SMTP
ALTER TABLE account_email DROP COLUMN IF EXISTS api_key_encrypted;

ALTER TABLE account_email ADD COLUMN IF NOT EXISTS password_encrypted text;
ALTER TABLE account_email ADD COLUMN IF NOT EXISTS imap_host text;
ALTER TABLE account_email ADD COLUMN IF NOT EXISTS imap_port integer DEFAULT 993;
ALTER TABLE account_email ADD COLUMN IF NOT EXISTS imap_ssl boolean DEFAULT true;
ALTER TABLE account_email ADD COLUMN IF NOT EXISTS smtp_host text;
ALTER TABLE account_email ADD COLUMN IF NOT EXISTS smtp_port integer DEFAULT 465;
ALTER TABLE account_email ADD COLUMN IF NOT EXISTS smtp_ssl boolean DEFAULT true;
ALTER TABLE account_email ADD COLUMN IF NOT EXISTS smtp_auth boolean DEFAULT true;

-- Note: In produzione, la password_encrypted dovrebbe essere gestita via Edge Function
-- che utilizza una chiave segreta (Vault).
