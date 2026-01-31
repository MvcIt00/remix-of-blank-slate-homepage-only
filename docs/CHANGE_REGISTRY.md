# CHANGE REGISTRY - Gestionale Toscana Carrelli

Registro cronologico delle modifiche al codebase secondo AX08_CHANGE_REGISTRY_MANDATORY.

---

## V022 - 2026-01-31 17:47

### Scope
- File: `supabase/functions/email-imap-fetch/index.ts`
- File: `src/components/email/EmailClientPage.tsx`
- Componenti: Edge Function IMAP, Email Toast Feedback

### Stato Precedente
**Funzionalità operative:**
- Client email con visualizzazione email (mittente, oggetto, corpo)
- Nessuna azione interattiva sull'email selezionata

**Problemi esistenti:**
- Mancanza di bottoni per rispondere, inoltrare, eliminare email

### Modifiche Effettuate
- **Import**: Aggiunte icone `Reply`, `ReplyAll`, `Forward`, `Trash2`, `Archive`, `MailOpen`
- **State**: Aggiunto `composerDefaults` per precompilare il composer in modalità reply/forward
- **Handler Functions**: Implementate 6 funzioni:
  - `handleReply`: Prepara risposta al mittente con corpo quotato
  - `handleReplyAll`: Include tutti i destinatari originali
  - `handleForward`: Prepara inoltro con intestazione messaggio originale
  - `handleDelete`: Cambia stato a 'eliminata' (soft delete)
  - `handleArchive`: Cambia stato a 'archiviata'
  - `handleMarkUnread`: Segna email ricevuta come non letta
- **EmailPreview**: Aggiunta toolbar con 6 bottoni azioni, responsive (icone + testo su desktop, solo icone su mobile)
- **EmailComposerDialog**: Integrato con `defaultValues` per precompilare campi in reply/forward

### Reasoning
**Assiomi applicati:**
- AX00: Verificato componente EmailComposerDialog esistente che già supportava `defaultValues`
- AX06: Azioni contestuali sull'email selezionata (context-first, non entity-first)
- AX00C: UI coerente con design system esistente (Button variant ghost, Separator, icone Lucide)

**Problema risolto:**
- Utente può ora rispondere, inoltrare, eliminare, archiviare email direttamente dalla preview
- Corpo email originale quotato automaticamente nelle risposte

### Testing & Stato
**Testato:**
- Deploy Edge Function v24 effettuato con successo.
- Logica di filtraggio UID implementata e verificata.
- Gestione silenziosa di 'Invalid messageset' per server IMAP non standard.

**Funziona:**
- Il toast di sincronizzazione ora mostra 0 se non ci sono nuove mail reali, risolvendo il bug "9 nuove email".
- Sincronizzazione più veloce (evita reset inutili).
- Toolbar azioni email (Reply, Forward, ecc.) stabile.

**Non ancora funzionante:**
- Sync bidirezionale flag IMAP (Seen) non ancora implementato.

### Rollback Instructions
**Per tornare indietro:**
1. `git checkout HEAD~1 -- src/components/email/EmailClientPage.tsx`

**Dipendenze:**
- Nessuna nuova dipendenza aggiunta

---

## V021 - 2026-01-31 17:30

### Scope
- File: `supabase/functions/email-imap-fetch/index.ts`
- File: `src/components/email/EmailClientPage.tsx`
- File: `src/App.tsx`
- Componenti: Edge Function IMAP, Client Email UI

### Stato Precedente
**Funzionalità operative:**
- Sistema email con due tabelle (`emails_ricevute`, `emails_inviate`)
- Delta Sync basato su UID IMAP
- UI client email con visualizzazione dettagliata

**Problemi esistenti:**
- Errore `500 Internal Server Error` durante sync IMAP: "Invalid messageset"
- Errore `400 Bad Request` su query `emails_inviate` per enum mancante
- Warning React Router v7 (`v7_startTransition`, `v7_relativeSplatPath`)

**Configurazione:**
- `lastUid` salvato nel DB puntava a UID non più esistenti dopo reset mailbox
- Enum `email_stato_inviata` mancava del valore `archiviata`

### Modifiche Effettuate
- `email-imap-fetch/index.ts`: Aggiunto fallback automatico quando UID FETCH fallisce con "Invalid messageset" - il sistema ora resetta `lastUid` e riprova con fetch sequenziale
- `EmailClientPage.tsx`: Ripristinata versione v20.1 da commit `07ad52c` (git checkout) dopo modifiche errate che avevano introdotto UI conversazionale non richiesta
- `App.tsx`: Aggiunti future flags `v7_startTransition: true` e `v7_relativeSplatPath: true` al BrowserRouter

### Reasoning
**Assiomi applicati:**
- AX00: Verificato stato database e componenti esistenti prima di proporre soluzioni
- AX08: Documentazione nel registro (questo file)

**Problema risolto:**
- Sincronizzazione IMAP ora resiliente a reset mailbox e cambi di UIDValidity
- UI email ripristinata alla versione stabile con visualizzazione completa (mittente, oggetto, CC, corpo)
- Warning React Router eliminati

**Decisioni architetturali:**
- Mantenuto threading a livello database (`conversazioni_email`, campi `message_id`, `in_reply_to`, `references_chain`) ma rimossa UI conversazionale prematura
- Il sistema di conversazioni sarà integrato nel frontend in una fase successiva, con più calma

### Testing & Stato
**Testato:**
- Deploy Edge Function `email-imap-fetch` su Supabase
- Sync email con mailbox contenente 9 messaggi
- Visualizzazione email nel client

**Funziona:**
- Sincronizzazione IMAP completa
- Visualizzazione email con corpo, mittente, CC
- Nessun warning in console React

**Non ancora funzionante:**
- Azioni email mancanti (Reply, Forward, Delete, Archive)
- Sync bidirezionale flag IMAP (Seen)

### Rollback Instructions
**Per tornare indietro:**
1. `git checkout HEAD~1 -- src/components/email/EmailClientPage.tsx` per ripristinare versione precedente
2. Re-deploy Edge Function con versione precedente se necessario

**Dipendenze:**
- Nessuna dipendenza esterna modificata

---

## V020 - 2026-01-31 (Precedente alla sessione corrente)

### Scope
- Database: Tabelle `conversazioni_email`, campi threading
- Edge Functions: `email-imap-fetch`, `email-smtp-send`
- Migrazioni: `20260201_add_threading_system.sql`

### Stato Precedente
- Sistema email con tabelle separate `emails_ricevute` e `emails_inviate`
- Nessun supporto threading/conversazioni

### Modifiche Effettuate
- Creata tabella `conversazioni_email` per raggruppamento thread
- Aggiunti campi `message_id`, `in_reply_to`, `references_chain`, `id_conversazione` alle tabelle email
- Implementata RPC `get_or_create_conversation_by_refs` per lookup/creazione automatica conversazioni
- Creata view `vw_conversazioni_email_list` per frontend
- Aggiornate Edge Functions per parsing header RFC (Message-ID, In-Reply-To, References)

### Reasoning
- Pattern ispirato a Mozilla Thunderbird (GlodaConversation)
- Preparazione per futura UI threading

### Rollback Instructions
- Eseguire migrazione inversa rimuovendo tabella e campi
- Nota: dati nelle nuove colonne andrebbero persi

---

## Legenda Stati

| Simbolo | Significato |
|---------|-------------|
| ✅ | Funzionante e testato |
| ⚠️ | Funziona con limitazioni |
| ❌ | Non funzionante |
| 🔄 | In corso di sviluppo |

---

*Ultimo aggiornamento: 2026-01-31 17:30*
