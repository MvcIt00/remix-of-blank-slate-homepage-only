# AI Cognitive Communication System - Implementation Plan (Integrale)

## Obiettivo
Rivoluzionare il sistema di comunicazione email trasformandolo da **message-centric** a **context-centric**. L'AI funziona come segreteria/collega intelligente che monitora comunicazioni, comprende contesto business, e comunica **solo aggiornamenti rilevanti** in linguaggio naturale.

---

## Stato dell'Arte vs Piano Strategico

### 🟢 IMPLEMENTATO (MVP Operativo)
- **Database Core**: Tabelle `ai_knowledge_base` e `ai_briefings`.
- **Engine di Estrazione**: Edge Function `ai-extract-facts-mvp` (GPT-4o-mini) con prompt strutturato.
- **Frontend**: `AIBriefingsMVP.tsx` con design "chat-like", avatars e hover-actions.
- **Multi-Account**: Filtraggio sincronizzato tra Email Client e Briefing AI.
- **UI/UX**: Estetica professionale, densa, monocromatica ( Slate/Black).

### 🟡 IN CORSO / PARZIALE
- **Relevance Scoring**: Attualmente basato su euristiche semplici nel prompt.
- **Contextual Actions**: Presenti visivamente (bottone Email), ma con link logico di Phase 2.
- **Account Selection**: Stato sollevato a `EmailPage` per coerenza globale.

### 🔴 MANCANTE (Rispetto al Piano Integrale)
1. **Memory Layer Avanzato**:
   - `ai_entity_states`: Non tracciamo ancora lo storico dei cambi di stato (es. da "preventivo" a "confermato").
   - `ai_user_knowledge`: Non filtriamo i fatti che l'utente ha già appreso tramite altri canali (manuale).
2. **Automazione Trigger**:
   - Manca il `pg_cron` per l'analisi automatica ogni 2 ore; attualmente è basato su trigger manuale (Sincronizza).
3. **Preferenze Utente**:
   - Manca la tabella `ai_user_preferences` e il pannello per regolare toni, soglie di rilevanza e blacklist.
4. **Integrazione Dati Business**:
   - L'AI non incrocia ancora i dati delle email con il database reale dei Carrelli/Noleggi per la validazione dei fatti.

---

## Prossimi Passi Suggeriti
1. **Rifinitura Memory**: Implementare `ai_user_knowledge` per evitare ridondanze.
2. **Automazione**: Configurare il job di analisi automatica.
3. **Deep Linking**: Collegare i briefing alle entità reali (clic per aprire il carrello specifico).
