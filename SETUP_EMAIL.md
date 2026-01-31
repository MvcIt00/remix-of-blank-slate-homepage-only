# Setup Client Email IMAP/SMTP

Istruzioni per attivare il client email nativo con protocolli standard IMAP e SMTP.

## 1. Eseguire Migration Database

```bash
npx supabase migration up
```

Questo crea/aggiorna la tabella `account_email` con i campi:
- `password_encrypted` (crittografata base64)
- `imap_host`, `imap_port`, `imap_ssl`
- `smtp_host`, `smtp_port`, `smtp_ssl`, `smtp_auth`

## 2. Deploy Edge Functions

```bash
# Fetch email via IMAP
npx supabase functions deploy email-imap-fetch

# Invio email via SMTP
npx supabase functions deploy email-smtp-send
```

## 3. Creare Storage Bucket

Dashboard Supabase → Storage → "New bucket":
- **Name**: `email-attachments`
- **Public**: NO

## 4. Testare con Account Libero

Usa i seguenti parametri per l'account di test:

| Campo | Valore |
|-------|--------|
| Email | `testimap2026app@libero.it` |
| Password | *(la tua password)* |
| IMAP Host | `imapmail.libero.it` |
| IMAP Port | `993` |
| IMAP SSL | ✅ |
| SMTP Host | `smtp.libero.it` |
| SMTP Port | `465` |
| SMTP SSL | ✅ |

## 5. Avviare e Testare

```bash
npm run dev
```

1. Vai a `/posta`
2. Click **Configura** → inserisci parametri Libero
3. Click **Sincronizza** → fetch email via IMAP
4. Click **Nuova Email** → invia via SMTP

## Note Sicurezza

⚠️ Per MVP la password è in base64. In produzione:
- Usare Web Crypto API con AES-256-GCM
- Memorizzare chiave crittografia in Supabase Vault
