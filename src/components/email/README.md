# Ecosystem: Email Client (Paradigma Conversazionale)

⚠️ **ARCHITETTURA NON CONVENZIONALE**: Questo sistema implementa un client email con paradigma **conversazionale** (simile a WhatsApp/Telegram) invece del tradizionale modello inbox-based. Leggere attentamente prima di modificare.

## 🎯 Paradigma: Email-as-Messaging

Questo client email **non è un Outlook/Thunderbird clone**. È progettato come un'**app di messaggistica** che utilizza email come protocollo di trasporto:

- **Threading Automatico**: Le email sono raggruppate in conversazioni tramite logica multi-livello
- **UI Messenger-style**: Chat view, bubble layout, real-time feel
- **Smart Interaction**: Toggle intelligente per lettura/espansione thread
- **Visual Indicators**: Direction Dot e badge per orientamento immediato

## 🏗️ Architettura & Flusso Dati

### 1. Livello Database (PostgreSQL / Supabase)

Il sistema utilizza **tabelle duali** per separare le responsabilità:

- **Tabelle Email**:
  - `emails_ricevute`: Email fetched via IMAP
  - `emails_inviate`: Email sent via SMTP
  - Entrambe hanno campi threading: `message_id`, `in_reply_to`, `references_chain`

- **Tabella Threading**:
  - `conversazioni_email`: Raggruppa le email in thread univoci
  - `id_conversazione` (FK in emails_ricevute/inviate)

- **RPC Critiche**:
  - `get_or_create_conversation_by_refs`: Crea/recupera conversazione basata su Message-ID e References (pattern Mozilla Thunderbird GlodaConversation)
  - `sync_emails_ricevute_batch`: Batch insert con gestione threading automatica

### 2. Livello Logica & Threading (React Hooks)

- **Hook**: `src/hooks/useEmailThreads.ts`
- **Pattern Multi-Layer Fallback** (CRITICO):
  1. **Primary**: Raggruppa per `id_conversazione` (se presente nel DB)
  2. **Fallback #1**: Raggruppa per `in_reply_to` (orphaned emails)
  3. **Fallback #2**: Raggruppa per **Oggetto Normalizzato** (rimuove Re:, Fwd:, spazi)
  
  Questo garantisce threading resiliente anche se il DB non ha popolato `id_conversazione` per tutte le email.

- **Trasformazione**: 
  - Combina `emails_ricevute` + `emails_inviate` in un array unificato
  - Aggiunge campo `direzione: 'ricevuta' | 'inviata'`
  - Ordina per data in ordine cronologico inverso (latest first)

### 3. Livello Interfaccia (UI Components)

- **Main Page**: `src/components/email/EmailClientPage.tsx`
  - Gestisce selezione email, composer, sync IMAP
  - Implementa **Smart Toggle Logic** (vedi sotto)

- **Conversation Components** (WIP):
  - `ConversationChatView.tsx`: Vista chat-like per singola conversazione
  - `ConversationSidebar.tsx`: Lista conversazioni stile WhatsApp
  - `ConversationInput.tsx`: Composer integrato nella chat

- **Visual Indicators**:
  - **Direction Dot**: Pallino colorato sull'avatar (🔵 Sent / 🟠 Received)
  - **MessagesSquare Badge**: Icona + counter per thread con >1 messaggio
  - **Thread Nesting**: Border-left colorato per messaggi nidificati

## 🔄 Smart Toggle Interaction Pattern

**Problema risolto**: Come permettere la lettura dell'email capostipite mantenendo la funzione di collapse?

**Soluzione**:
```typescript
onClick (header email) {
  if (!isCurrentlySelected) {
    handleSelectEmail(email);  // Seleziona e mostra preview
    if (!isExpanded) toggleThread();  // Espande se collassato
  } else {
    toggleThread();  // Se già selezionata, esegue toggle
  }
}
```

**Behavior**:
- **1° clic**: Seleziona email → Mostra preview → Espande thread
- **2° clic (stessa email)**: Collassa thread
- **Badge `MessagesSquare`**: Toggle puro (indipendente dalla selezione)

## 🌐 Edge Functions & Sync

### IMAP Fetch (`email-imap-fetch`)
- **Trigger**: Manuale (button "Sync")
- **Flow**:
  1. Connessione IMAP al server
  2. Delta sync basato su UID (evita re-fetch)
  3. Fallback automatico su "Invalid messageset" (reset UID)
  4. Parsing header RFC (Message-ID, In-Reply-To, References)
  5. Batch insert via RPC `sync_emails_ricevute_batch`

### SMTP Send (`email-smtp-send`)
- **Trigger**: User action (Composer)
- **Flow**:
  1. Invio email via SMTP
  2. Salvataggio in `emails_inviate`
  3. Creazione/update conversazione (se è reply)

## 📊 Lifecycle di una Conversazione

1. **Ricezione Email**: IMAP fetch → Parsing header → RPC crea/aggiorna conversazione
2. **Frontend Rendering**: Hook `useEmailThreads` raggruppa → UI mostra thread espandibile
3. **User Interaction**: Click su header → Smart Toggle → Preview/Collapse
4. **Reply**: User risponde → SMTP send → Salvataggio in `inviate` → Thread aggiornato

## 💡 Note per lo Sviluppo

- **Tipi**: 
  - `src/types/email.ts`: Interfacce `Email`, `EmailThread`
  - Qualsiasi modifica ai campi threading richiede aggiornamento delle RPC database

- **Threading**:
  - Il fallback frontend è essenziale: NON rimuovere la logica di normalizzazione oggetto
  - Se modifichi la RPC `get_or_create_conversation_by_refs`, testa anche il fallback frontend

- **UI Consistency (AX00C)**:
  - Gli indicatori visivi (Direction Dot, badge) devono mantenere lo schema colore esistente
  - Usa `lucide-react` per nuove icone (non introdurre altre librerie)

- **Performance**:
  - Il limit di 100 email per tabella è intenzionale (pagination WIP)
  - Non fare query real-time: usa React Query con refetch manuale

---

## 📁 Gestione Allegati (Fase 4+)

Il sistema gestisce allegati 1-N integrati nel flusso conversazionale:

### 1. Modello Dati & Storage
- **Tabella**: `allegati_email` (FK su `id_email_ricevuta` o `id_email_inviata`)
- **Storage**: Bucket `email-attachments` con struttura `{accountId}/{emailId}/{filename}`
- **Fetching**: Gli allegati vengono caricati in modo isolato via `useEmailAttachments` per ottimizzare le performance (lazy loading).

### 2. Pattern Visualizzazione (Grid Dinamica)
Il componente `EmailAttachmentGallery` implementa un layout auto-adattivo:
- **1-2 File**: Card orizzontali ad alto dettaglio.
- **3-4 File**: Griglia compatta 2x2.
- **5+ File**: Grid view con indicatore del totale.

### 3. Vista Aggregata (Cassetto Conversazione)
Nell'header della chat è presente l'accesso al **Cassetto Allegati** (`ConversationFilesDrawer`). Questo aggrega TUTTI i file di ogni email appartenente al thread (usando `useConversationAttachments`), offrendo un punto unico per recuperare documenti storici senza scrollare l'intera chat.

### 4. Sicurezza & Download
Tutti i file sono protetti. Il download avviene tramite **Signed URLs** generati on-demand con validità di 1 ora, garantendo che i link non siano permanenti o accessibili pubblicamente all'esterno dell'app.

---

**Versione Documentazione**: V028 (2026-02-01)  
**Maintainer**: Sistema di AI Collaborativo (Antigravity)
