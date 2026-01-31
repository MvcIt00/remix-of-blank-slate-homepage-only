# Reversibilità Implementazione Email IMAP/SMTP

---

## 1. Edge Functions

### Elimina via CLI
```bash
npx supabase functions delete email-imap-fetch --project-ref ahboipwbpyalpyzriizf
npx supabase functions delete email-smtp-send --project-ref ahboipwbpyalpyzriizf
```

### Elimina file locali
```powershell
Remove-Item -Recurse -Force "supabase\functions\email-imap-fetch"
Remove-Item -Recurse -Force "supabase\functions\email-smtp-send"
```

---

## 2. Database

```sql
DROP TABLE IF EXISTS allegati_email CASCADE;
DROP TABLE IF EXISTS messaggi_email CASCADE;
DROP TABLE IF EXISTS account_email CASCADE;
```

### Elimina migrations locali
```powershell
Remove-Item -Force "supabase\migrations\02_email_imap_schema.sql"
Remove-Item -Force "supabase\migrations\20260131_create_email_system.sql"
```

---

## 3. Storage Bucket

Dashboard Supabase → Storage → Elimina `email-attachments`

---

## 4. Componenti React

```powershell
Remove-Item -Recurse -Force "src\components\email"
Remove-Item -Force "src\pages\EmailPage.tsx"
```

---

## 5. Route (App.tsx) e Sidebar (AppSidebar.tsx)

Rimuovi manualmente import e route `/posta`

---

## 6. Documentazione

```powershell
Remove-Item -Force "SETUP_EMAIL.md"
Remove-Item -Force "EMAIL_ROLLBACK.md"
```

---

## Script Rollback Completo

```powershell
Remove-Item -Recurse -Force "supabase\functions\email-*" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "src\components\email" -ErrorAction SilentlyContinue
Remove-Item -Force "src\pages\EmailPage.tsx" -ErrorAction SilentlyContinue
Remove-Item -Force "supabase\migrations\*email*.sql" -ErrorAction SilentlyContinue
Remove-Item -Force "SETUP_EMAIL.md", "EMAIL_ROLLBACK.md" -ErrorAction SilentlyContinue
```

---

## Note Tecniche

| Funzione | Versione | Tecnologia | Modifiche |
|----------|----------|------------|-----------|
| `email-imap-fetch` | v3 | `postal-mime` | Parsing MIME completo, body pulito |
| `email-smtp-send` | v2 | `emailjs` | Timeout 30s, error handling |

### Librerie utilizzate
- `npm:postal-mime@2.4.1` - Parsing MIME web-native
- `npm:emailjs@4.0.3` - Client SMTP Deno-compatible
- `Deno.connectTls` - Connessione TCP/TLS nativa

### Project ID Supabase
`ahboipwbpyalpyzriizf`
