# CHANGE REGISTRY - Gestionale Toscana Carrelli

Registro cronologico delle modifiche al codebase secondo **AX08_CHANGE_REGISTRY_MANDATORY**.

---

## [V026.2] 2026-02-01 04:20
**commit_hash**: `7c81e1f`

### Functional State
- **Compact Sidebar**: UI della sidebar resa più densa e leggibile. Le card sono state rimpicciolite e lo spacing ottimizzato.
- **Safety Input**: Tasto "Invio" disabilitato per l'invio rapido dei messaggi per evitare errori; ora genera solo un a capo (`\n`). L'invio avviene esclusivamente tramite pulsante "Invia".
- **Visual Improvements**: Contatore messaggi spostato in alto a destra nella card per non sottrarre spazio al mittente. Migliorato il contrasto di mittente e oggetto.

### Structural Changes
- **UI Components**:
  - `src/components/email/ConversationSidebar.tsx`: Padding ridotto (`p-2.5`), counter riposizionato (`absolute top-2.5 right-2`), font-size compattato.
  - `src/components/email/ConversationInput.tsx`: Rimozione trigger `Enter` in `handleKeyDown` e rimozione dicitura informativa obsoleta.

### Complete Rollback
- **steps**:
  1. `git checkout V026.1`
- **verification**: Il sistema ripristina le card sidebar più grandi e il comportamento di invio tramite tasto Invio.

---

## [V026.1] 2026-02-01 03:55
**commit_hash**: `a4b7ce2`

### Functional State
- **Affidabilità Invio (RFC 822)**: Risolto errore "bare LF" tramite normalizzazione CRLF forzata nella Edge Function, garantendo compatibilità con Libero/Virgilio.
- **Transazionalità DB**: Implementato sistema di salvataggio preventivo ('bozza') che si aggiorna in 'inviata' solo a conferma SMTP avvenuta.
- **UX Email Fallite**: Introdotta gestione visiva degli errori di invio. Se un'email fallisce (stato != 'inviata'), viene mostrato un avviso contestuale con opzioni di **"Riprova"** o **"Elimina"**.
- **Auto-Read & Cleanup**: Integrato sistema di marcatura automatica come "letto" su apertura thread o selezione mail, con rimozione pulsanti manuali ridondanti.
- **Ripristino Toolbar**: Tutte le azioni (Rispondi, Inoltra, Archivia, Elimina) sono state centralizzate e ripristinate coerentemente tra le diverse viste.

### Structural Changes
- **Edge Function**: Aggiornata a v18 (SMTP-Send) con normalizzazione parametri CRLF e gestione stati asincrona.
- **Hook Centralizzato**: Creato/Potenziato `src/hooks/useEmailManagement.ts` per gestire tutta la logica operativa, stati compositore e feedback (toast).
- **UI Component**: Creato `src/components/email/EmailActionsToolbar.tsx` e aggiornati `ConversationChatView` ed `EmailClassicView` con indicatori di errore.

### Ordinary Changes
- Typography: Incremento font del 10% e testi in "Black/White" per massima leggibilità.
- Pulizia logica duplicata negli orchestratori.

### Complete Rollback
- **steps**:
    1. `git checkout [commit_hash_pre_v26.1]`
- **verification**: Il sistema torna ad avere invii non transazionali e manca della gestione automatica degli stati di lettura.

---

## [V026] 2026-02-01 03:15
**commit_hash**: `PENDING_PUSH`

### Functional State
- **Hybrid UI (V3)**: Implementata architettura a doppia vista (Chat moderna + Email Classica).
- **Accordion Sidebar**: Navigazione a due livelli (Conversazione -> Email singola) con espansione fluida.
- **Typography & High-Contrast**: Incremento font del 10% globale e testi in "Pieno Nero" (Black/White) per massima leggibilità in sidebar e chat.
- **Email Cleaning**: Integrazione logica `emailUtils` per la pulizia del corpo mail (rimozione quote/header) con toggle di espansione.

### Structural Changes
- **architecture**: Creazione componenti atomici `ConversationChatView`, `ConversationInput`, `ConversationSidebar`, `EmailClassicView`.
- **logic**: Introdotta utility centralizzata `lib/emailUtils.ts` per il processing del testo.
- **refactoring**: `EmailClientPage.tsx` ora agisce come orchestratore di viste tramite stato `selectedEmailId`.

### Ordinary Changes
- Corretti import icone mancanti (`Layout`).
- Aggiornati stili Tailwind per coerenza tipografica (font-black, leading-snug).

### Complete Rollback
- **steps**:
    1. `git checkout b7e0951` (Stato pre-V3)
    2. `rm src/components/email/ConversationChatView.tsx src/components/email/ConversationInput.tsx src/components/email/ConversationSidebar.tsx src/components/email/EmailClassicView.tsx src/lib/emailUtils.ts`
- **verification**: Verificare il ripristino della visualizzazione email singola standard senza accordion.

---

## [V025] 2026-02-01 02:05
**commit_hash**: `PENDING`

### Functional State
- **Smart Toggle**: Implementata logica di interazione avanzata nell'header del thread. Il primo clic seleziona ed espande, il secondo clic sulla stessa email collassa il thread.
- **Visual indicators**: Integrato Direction Dot luminoso (Sent/Received) e badge interattivo `MessagesSquare`.
- **Integrità**: Risolto il conflitto di leggibilità dell'email capostipite preservando la funzione di raggruppamento.

### Structural Changes
- **architecture**: Modificata gestione eventi di clic in `EmailClientPage.tsx` per gestire stati di selezione e thread simultaneamente.

### Ordinary Changes
- Restyling grafico componenti lista email e thread nidificati.

### Complete Rollback
- **steps**:
    1. `git checkout 164b17f` (Ritorno allo stato pre-Smart Toggle)
- **verification**: Verificare che l'email capostipite non esegua il toggle al secondo clic ma rimanga selezionata.

---

## V024 - 2026-01-31 18:18

### Scope
- Database: Tabella `emails_inviate`
- Componenti: Edge Function `email-smtp-send`

### Stato Precedente
**Funzionalità operative:**
- Invio email tramite SMTP funzionante (consegna al destinatario).

**Problemi esistenti:**
- Le email inviate **non venivano salvate nel database**.
- Cause: Colonne `da_email` e `da_nome` mancanti nello schema; campo data denominato erroneamente `data_invio` invece di `data_invio_effettiva`.
- Errore runtime: Variabile `messageId` non definita nella risposta della funzione.

### Modifiche Effettuate
- **Database**: Aggiunte colonne `da_email` e `da_nome` alla tabella `emails_inviate` via migrazione.
- **Edge Function**: Corretto il codice per usare i nomi colonna corretti e risolto il bug sulla variabile `messageId`.
- **Deploy**: Effettuata nuova release (v14) della funzione SMTP.

### Reasoning
**Assiomi applicati:**
- AX02: Mantenuta la simmetria dei dati tra ricevute ed inviate per permettere analisi storiche e unificazioni (UNION) semplici.

**Problema risolto:**
- Ora ogni email inviata genera correttamente una riga in `emails_inviate`, permettendo la visualizzazione dei thread completi.

### Testing & Stato
**Testato:**
- Deploy effettuato via MCP.
- Schema verificato post-migrazione.

**Funziona:**
- Salvataggio email inviate nel database ripristinato.

---

## V023 - 2026-01-31 18:15

### Scope
- Database: RPC `sync_emails_ricevute_batch`
- Componenti: Sincronizzazione IMAP, Threading

### Stato Precedente
**Funzionalità operative:**
- Sincronizzazione email base funzionante.
- Struttura threading presente ma non popolata correttamente.

**Problemi esistenti:**
- Errore 500 durante il re-sync: `references_chain` di tipo `text[]` riceveva `jsonb`.
- Errore "cannot extract elements from a scalar" quando `references_chain` non era un array (es. null o stringa).

### Modifiche Effettuate
- **Database (RPC)**: Modificata la funzione `sync_emails_ricevute_batch` per gestire correttamente il tipo di dato `references_chain`.
- **Logica di Conversione**: Aggiunto cast esplicito da `jsonb` array a `text[]` e gestione preventiva dei tipi scalar/null tramite `jsonb_typeof`.

### Reasoning
**Assiomi applicati:**
- AX02: Garantita la granularità dei dati mantenendo il tipo `text[]` corretto nel database per facilitare analisi future.

**Problema risolto:**
- Ripristinata la stabilità della sincronizzazione dopo il reset per il threading.

### Testing & Stato
**Testato:**
- Esecuzione migrazione SQL correttiva.
- Verifica tipi tramite `information_schema`.

**Funziona:**
- Sincronizzazione IMAP stabile e in grado di popolare i campi threading senza errori.

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
