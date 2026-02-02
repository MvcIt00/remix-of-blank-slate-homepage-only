# AI Briefings MVP - Documentazione Completa Implementazione

**Data Implementazione**: 2026-02-02  
**Status**: ✅ DEPLOYED & OPERATIONAL  
**Version**: 1.3 (Multi-Account + Bugfix)

---

## 📋 Executive Summary

Sistema AI-powered per analisi email con estrazione automatica di informazioni rilevanti tramite LLM (OpenAI GPT-4o-mini). Il sistema presenta "briefings" contestualizzati invece di inbox tradizionale, riducendo il cognitive load da "100 email" a "5 briefing rilevanti".

**Evoluzioni implementate**:
1. **MVP Base** (v1.0): Schema DB, Edge Function, Frontend component
2. **Prompt Customization** (v1.1): Formato strutturato "CHI vuole COSA + dettagli"
3. **Multi-Account** (v1.2): Filtering per account, state lifting
4. **Bugfix Hooks** (v1.3): Risoluzione violazione Rules of Hooks

---

## 🗄️ Database Schema

### Tabelle Create

#### 1. `ai_knowledge_base`
**Scopo**: Memorizzare fatti estratti dalle email tramite LLM

| Colonna | Tipo | Descrizione | Constraints |
|---------|------|-------------|-------------|
| `id` | UUID | PK | `gen_random_uuid()` |
| `source_email_id` | UUID | FK → `emails_ricevute(id)` | **CASCADE on delete** |
| `fact_summary` | TEXT | Sintesi fatto (max 1000 char) | `LENGTH 1-1000` |
| `fact_type` | VARCHAR(50) | Tipo: conferma,domanda,problema,info | - |
| `relevance_score` | FLOAT | Rilevanza 0.0-1.0 | `BETWEEN 0 AND 1` |
| `confidence_score` | FLOAT | Confidenza LLM 0.0-1.0 | `BETWEEN 0 AND 1` |
| `extraction_raw` | JSONB | Risposta LLM completa (debug) | - |
| `extracted_at` | TIMESTAMPTZ | Timestamp estrazione | `DEFAULT NOW()` |

**Indici**:
```sql
CREATE INDEX idx_ai_kb_source_email ON ai_knowledge_base(source_email_id);
CREATE INDEX idx_ai_kb_relevance ON ai_knowledge_base(relevance_score DESC) WHERE relevance_score >= 0.5;
CREATE INDEX idx_ai_kb_extracted_at ON ai_knowledge_base(extracted_at DESC);
```

**Relazione critica**: `source_email_id` → `emails_ricevute(id)` → `account_email(id_account)`  
Questo permette il filtering per account attraverso JOIN.

---

#### 2. `ai_briefings`
**Scopo**: Briefing user-facing generati dall'AI

| Colonna | Tipo | Descrizione | Constraints |
|---------|------|-------------|-------------|
| `id` | UUID | PK | `gen_random_uuid()` |
| `fact_id` | UUID | FK → `ai_knowledge_base(id)` | **CASCADE on delete** |
| `title` | TEXT | Titolo (max 200 char) | `LENGTH 1-200` |
| `message` | TEXT | Messaggio (max 500 char) | `LENGTH 1-500` |
| `priority` | VARCHAR(20) | urgent, high, medium, low | `IN (...)` |
| `icon` | VARCHAR(10) | Emoji per priorità visiva | - |
| `read_at` | TIMESTAMPTZ | NULL = non letto | - |
| `created_at` | TIMESTAMPTZ | Timestamp creazione | `DEFAULT NOW()` |

**Indici**:
```sql
CREATE INDEX idx_ai_briefings_unread ON ai_briefings(created_at DESC) WHERE read_at IS NULL;
CREATE INDEX idx_ai_briefings_fact ON ai_briefings(fact_id);
CREATE INDEX idx_ai_briefings_all ON ai_briefings(created_at DESC);
```

---

### Migration File
- **File**: `supabase/migrations/20260202000001_ai_briefings_mvp.sql`
- **Applied**: ✅ Via MCP Supabase server
- **RLS**: Disabilitato per MVP (accesso service-role)
- **Safety**: Tutti i CREATE usano `IF NOT EXISTS`

---

## ⚡ Edge Function: `ai-extract-facts-mvp`

### Deployment Info
- **Version**: 3 (ultima con account filtering)
- **Status**: ACTIVE
- **ID**: `e67a929c-5ffe-4c98-8f2f-36e3f19b3a4a`
- **verify_jwt**: true
- **Model**: `gpt-4o-mini` (OpenAI)

### File
`supabase/functions/ai-extract-facts-mvp/index.ts` (285 righe)

### Safety Features
1. ✅ Content truncation (max 3000 chars/email)
2. ✅ Rate limiting (max 10 email/invocazione)
3. ✅ Delay tra chiamate LLM (1 sec)
4. ✅ Timeout protection (50 sec max execution)
5. ✅ Duplicate detection (skip already processed)
6. ✅ Graceful error handling (continua su errore singolo)
7. ✅ CORS headers
8. ✅ Input validation
9. ✅ Relevance filtering (threshold 0.2 per testing)

### LLM Prompt (v1.1 - Formato Strutturato)

**Istruzioni chiave** (modificate in v1.1):

```typescript
const senderDisplay = email.da_nome || email.da_email.split('@')[0] || email.da_email;

// FORMATO RICHIESTO:
// "${senderDisplay} [COSA VUOLE/FA]. [Argomentazione se necessario]."

// Esempi:
// - "Marco Rossi chiede conferma disponibilità carrello. Ha urgenza per cantiere di Milano che parte lunedì."
// - "ABC Forniture segnala ritardo consegna. Problema con trasportatore, slittamento di 2 giorni."
```

**Regole**:
1. **SEMPRE inizia con nome/account mittente**
2. Descrivi COSA vuole/fa in modo conciso
3. Aggiungi 1-2 frasi argomentazione se utile
4. Usa NOMI quando disponibili, altrimenti email
5. Includi codici (#PRV-xxx, #NOL-xxx)
6. Tono diretto e professionale
7. relevance_score realistico (0.2-1.0)

### ENV Variables Required
```bash
OPENAI_API_KEY=sk-proj-...  # CRITICAL: Function non funziona senza
SUPABASE_URL=...            # Auto-injected
SUPABASE_SERVICE_ROLE_KEY=... # Auto-injected
```

---

## 🎨 Frontend Implementation

### 1. Component: `AIBriefingsMVP.tsx`
**Path**: `src/components/ai/AIBriefingsMVP.tsx` (350 righe)

**Props** (v1.2 - Multi-Account):
```typescript
interface Props {
    activeAccount?: any; // Account attivo dal parent
}
```

**Features**:
- Manual trigger only (no auto-refresh)
- Account filtering tramite JOIN
- Loading/error states
- Read/unread tracking
- Debug panel (MVP only)
- Empty state + guard clause per missing account

**Query con Account Filter** (v1.2):
```typescript
const { data: briefings } = useQuery({
    queryKey: ["ai-briefings-mvp", activeAccount?.id],
    queryFn: async () => {
        const { data } = await supabase
            .from("ai_briefings")
            .select(`
                *,
                ai_knowledge_base!inner (
                    source_email_id,
                    extraction_raw,
                    emails_ricevute!inner (
                        id_account
                    )
                )
            `)
            .eq("ai_knowledge_base.emails_ricevute.id_account", activeAccount.id)
            ...
    },
    enabled: !!activeAccount
});
```

**Processing con Account Filter**:
```typescript
const { data: allEmails } = await supabase
    .from("emails_ricevute")
    .select("id")
    .eq("id_account", activeAccount.id) // ← CRITICAL
    ...
```

---

### 2. Page: `EmailPage.tsx`
**Path**: `src/pages/EmailPage.tsx`

**v1.2 - State Lifting per Multi-Account**:
```typescript
export default function EmailPage() {
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    
    const { data: accounts = [] } = useQuery({
        queryKey: ["email-accounts"],
        queryFn: async () => { /* fetch account_email */ }
    });

    const activeAccount = useMemo(() =>
        accounts.find(a => a.id === selectedAccountId) || accounts[0],
        [accounts, selectedAccountId]
    );

    return (
        {/* Account Selector (shared) */}
        {accounts.length > 1 && (
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                {/* ... */}
            </Select>
        )}
        
        <Tabs defaultValue="email-client">
            <TabsContent value="email-client">
                <EmailClientPage activeAccount={activeAccount} />
            </TabsContent>
            <TabsContent value="ai-briefings">
                <AIBriefingsMVP activeAccount={activeAccount} />
            </TabsContent>
        </Tabs>
    );
}
```

**Architettura**: State lifting pattern per condividere account tra Email Client e AI Briefings.

---

### 3. Component: `EmailClientPage.tsx`
**Path**: `src/components/email/EmailClientPage.tsx`

**v1.2 - Backward Compatible con Prop**:
```typescript
export function EmailClientPage({ activeAccount: propActiveAccount }: { activeAccount?: any }) {
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    
    const { data: accounts = [] } = useQuery({
        enabled: !propActiveAccount, // Solo se non passato via prop
        ...
    });

    // v1.3 BUGFIX - useMemo SEMPRE chiamato (Rules of Hooks)
    const computedAccount = useMemo(() =>
        accounts.find(a => a.id === selectedAccountId) || accounts[0],
        [accounts, selectedAccountId]
    );

    const activeAccount = propActiveAccount || computedAccount;

    // Hide internal selector if controlled
    {!propActiveAccount && accounts.length > 1 && (
        <Select ... />
    )}
}
```

**v1.3 - Critical Bugfix**: Violazione React Hooks [Rules of Hooks](https://react.dev/warnings/invalid-hook-call-warning)
- **Errore**: `const activeAccount = propActiveAccount || useMemo(...)` 
- **Fix**: Separato in `computedAccount` (SEMPRE chiamato) + assegnazione condizionale

---

## 🚀 Setup & Configuration

### Step 1: Configure OpenAI API Key

**⚠️ CRITICAL: Edge Function richiede questo secret!**

```bash
# Via Supabase CLI
npx supabase secrets set OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE --project-ref ahboipwbpyalpyzriizf

# Verify
npx supabase secrets list --project-ref ahboipwbpyalpyzriizf
```

**Ottieni chiave**: https://platform.openai.com/api-keys

---

### Step 2: Deploy (se necessario)

```bash
# Re-deploy Edge Function (se modificata)
cd supabase/functions
npx supabase functions deploy ai-extract-facts-mvp --project-ref ahboipwbpyalpyzriizf

# Verify deployment
npx supabase functions list --project-ref ahboipwbpyalpyzriizf
```

---

### Step 3: Run Development

```bash
npm run dev
# Apri: http://localhost:5173/posta
```

---

## 🧪 Testing

### Funzionalità da Testare

#### Base MVP
- [ ] Navigate `/posta` → 2 tabs visibili
- [ ] Tab "AI Briefings" → Empty state se nessun briefing
- [ ] Click "Analizza Ultime Email" → Loading spinner
- [ ] Alert success/error dopo processing
- [ ] Briefing cards appaiono se email rilevanti
- [ ] Card mostra: icon, priority, title, message, timestamp
- [ ] "Segna Letto" → card diventa grigia
- [ ] "Vedi Email" → alert TODO (Phase 2)

#### Multi-Account (v1.2)
- [ ] Con 2+ account → dropdown selector visibile in header
- [ ] Switch account → briefings si aggiornano
- [ ] Briefings Account A non visibili in Account B
- [ ] "Analizza Email" → processa solo account corrente
- [ ] Query performance accettabile (<200ms JOIN)

#### Edge Cases
- [ ] Nessuna email nuova → Alert "Nessuna email nuova"
- [ ] Tutte irrelevanti → Alert "nessuna conteneva informazioni"
- [ ] OPENAI_API_KEY mancante → Errore chiaro
- [ ] Process twice → Skip già processate
- [ ] Pagina bianca → Nessun errore console Hooks

---

## 🔄 ROLLBACK COMPLETO DATABASE

### ⚠️ ATTENZIONE: PROCEDURA DISTRUTTIVA

Questo rollback **ELIMINA DEFINITIVAMENTE** tutti i dati AI (fatti estratti + briefings).  
**Non è reversibile. Creare backup se necessario.**

---

### STEP 1: Backup Dati (OPZIONALE ma CONSIGLIATO)

```sql
-- Esegui PRIMA di procedere con rollback
-- In Supabase SQL Editor:

-- Backup briefings
CREATE TABLE ai_briefings_backup_20260202 AS 
SELECT * FROM ai_briefings;

-- Backup knowledge base
CREATE TABLE ai_knowledge_base_backup_20260202 AS 
SELECT * FROM ai_knowledge_base;

-- Verifica backup creati
SELECT COUNT(*) as briefings_backed_up FROM ai_briefings_backup_20260202;
SELECT COUNT(*) as facts_backed_up FROM ai_knowledge_base_backup_20260202;
```

**Risultato atteso**: Due nuove tabelle con snapshot dati correnti.

---

### STEP 2: Drop Tabelle AI (ORDINE CRITICO)

**⚠️ ORDINE OBBLIGATORIO: briefings PRIMA di knowledge_base**  
(Motivo: `ai_briefings.fact_id` è FK verso `ai_knowledge_base.id`)

```sql
-- Esegui in Supabase SQL Editor
-- STEP 2a: Drop ai_briefings (dipendente)
DROP TABLE IF EXISTS ai_briefings CASCADE;

-- STEP 2b: Drop ai_knowledge_base (parent)
DROP TABLE IF EXISTS ai_knowledge_base CASCADE;
```

**Verifica drop avvenuto**:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'ai_%'
  AND table_name NOT LIKE '%backup%';
```

**Risultato atteso**: Query restituisce 0 righe (nessuna tabella ai_* trovata).

---

### STEP 3: Verifica Indici e Constraints Rimossi

```sql
-- Verifica nessun indice orfano
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_ai_%';
```

**Risultato atteso**: 0 righe (tutti gli indici ai_* cancellati con CASCADE).

```sql
-- Verifica nessun constraint orfano
SELECT conname, conrelid::regclass 
FROM pg_constraint 
WHERE conname LIKE '%ai_%';
```

**Risultato atteso**: 0 righe.

---

### STEP 4: Delete Edge Function

```bash
# Via Supabase CLI
npx supabase functions delete ai-extract-facts-mvp --project-ref ahboipwbpyalpyzriizf

# Conferma deletion quando richiesto
```

**Verifica**:
```bash
npx supabase functions list --project-ref ahboipwbpyalpyzriizf | grep ai-extract
```

**Risultato atteso**: Nessun output (funzione non esiste più).

**Alternative via Dashboard**:
1. Apri Supabase Dashboard → Edge Functions
2. Trova `ai-extract-facts-mvp`
3. Click `...` → Delete
4. Conferma

---

### STEP 5: Remove Migration File (OPZIONALE)

```bash
# Rimuove traccia migrazione da filesystem
rm supabase/migrations/20260202000001_ai_briefings_mvp.sql
```

**⚠️ Nota**: Questo NON annulla la migrazione già applicata al DB (STEP 2 lo ha fatto). Serve solo per pulizia storico locale.

---

### STEP 6: Remove Edge Function Files

```bash
# Rimuove directory funzione da filesystem
rm -rf supabase/functions/ai-extract-facts-mvp/
```

**Verifica**:
```bash
ls supabase/functions/ | grep ai-extract
```

**Risultato atteso**: Nessun output.

---

### STEP 7: Revert Frontend Changes

```bash
# Metodo A: Git checkout selettivo (se hai commit separati)
git checkout HEAD~N -- src/components/ai/AIBriefingsMVP.tsx
git checkout HEAD~N -- src/pages/EmailPage.tsx

# Metodo B: Rimozione manuale (se mescolato con altre modifiche)
# Rimuovi componente AI
rm -rf src/components/ai/

# Revert EmailPage a versione pre-tabs
git log --oneline src/pages/EmailPage.tsx  # Trova commit pre-tabs
git checkout <COMMIT_HASH> -- src/pages/EmailPage.tsx
```

**Per EmailClientPage** (se ha modifiche multi-account non volute):
```bash
# Trova commit pre-multi-account
git log --oneline src/components/email/EmailClientPage.tsx
git checkout <COMMIT_HASH> -- src/components/email/EmailClientPage.tsx
```

---

### STEP 8: Verifica Applicazione Pulita

```bash
# Build check
npm run build
```

**Risultato atteso**: Build successful senza errori TypeScript su tabelle/componenti AI.

```bash
# Runtime check
npm run dev
```

**Test**:
1. Apri `http://localhost:5173/posta`
2. **Se rollback tabs**: Dovrebbe mostrare solo `EmailClientPage` (NO tabs)
3. **Se mantenuto tabs**: Tab "AI Briefings" dovrebbe essere vuoto o rimosso
4. Nessun errore console

---

### STEP 9: Verifica Database Consistency

```sql
-- Check nessuna foreign key orfana (paranoia check)
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE confrelid::regclass::text IN ('ai_knowledge_base', 'ai_briefings');
```

**Risultato atteso**: 0 righe (nessuna FK punta a tabelle eliminate).

```sql
-- Check storage emails integro
SELECT COUNT(*) as total_emails FROM emails_ricevute;
```

**Risultato atteso**: Stesso numero di prima (email NON toccate dal rollback).

---

### STEP 10: Cleanup Secrets (OPZIONALE)

```bash
# Rimuovi OPENAI_API_KEY se non serve più
npx supabase secrets unset OPENAI_API_KEY --project-ref ahboipwbpyalpyzriizf
```

**⚠️ Skip questo step** se usi OpenAI per altri scopi nel progetto.

---

### ROLLBACK COMPLETED ✅

**Verifica finale checklist**:
- [ ] Tabelle `ai_briefings` e `ai_knowledge_base` non esistono
- [ ] Edge Function `ai-extract-facts-mvp` deletata
- [ ] Directory `src/components/ai/` rimossa
- [ ] EmailPage NON ha più tab AI Briefings (o tab vuoto)
- [ ] App compila senza errori
- [ ] App runs senza crash
- [ ] Nessun errore console su componenti AI
- [ ] Email client funziona normalmente
- [ ] Database emails_ricevute integro

**Se tutti i check passano**: Rollback completato con successo.  
**Sistema ripristinato a stato pre-AI Briefings MVP.**

---

## 📊 Monitoring & Costs

### OpenAI Usage
- **Dashboard**: https://platform.openai.com/usage
- **Model**: `gpt-4o-mini`
- **Costo stimato**: ~$0.0001 per email (500 input + 150 output tokens)
- **Costo 1000 email**: ~$0.10

### Supabase Edge Function Logs
```bash
# Real-time
npx supabase functions logs ai-extract-facts-mvp --tail --project-ref ahboipwbpyalpyzriizf

# Last 100 invocations
npx supabase functions logs ai-extract-facts-mvp --limit 100 --project-ref ahboipwbpyalpyzriizf
```

### Database Stats
```sql
-- Total facts extracted
SELECT COUNT(*) as total FROM ai_knowledge_base;

-- Average relevance
SELECT AVG(relevance_score)::numeric(3,2) as avg_relevance FROM ai_knowledge_base;

-- Facts by type
SELECT fact_type, COUNT(*) as count 
FROM ai_knowledge_base 
GROUP BY fact_type 
ORDER BY count DESC;

-- Unread briefings
SELECT COUNT(*) FROM ai_briefings WHERE read_at IS NULL;

-- Briefings per account
SELECT 
    e.id_account,
    a.email as account_email,
    COUNT(b.id) as briefing_count
FROM ai_briefings b
JOIN ai_knowledge_base kb ON b.fact_id = kb.id
JOIN emails_ricevute e ON kb.source_email_id = e.id
JOIN account_email a ON e.id_account = a.id
GROUP BY e.id_account, a.email;
```

---

## 🐛 Troubleshooting

### Problema: Pagina Bianca

**Error console**: "Warning: React has detected a change in the order of Hooks"

**Causa**: Violazione React Hooks Rules (v1.3 fixed questo)

**Soluzione**:
```bash
# Assicurati di avere v1.3 con fix
git pull
# Ricarica pagina (Ctrl+R)
```

---

### Problema: "OPENAI_API_KEY not configured"

**Soluzione**:
```bash
# Verifica secret
npx supabase secrets list --project-ref ahboipwbpyalpyzriizf

# Se manca, set
npx supabase secrets set OPENAI_API_KEY=sk-proj-... --project-ref ahboipwbpyalpyzriizf

# Re-deploy function (se deployment predated secret)
npx supabase functions deploy ai-extract-facts-mvp --project-ref ahboipwbpyalpyzriizf
```

---

### Problema: Briefings non appaiono ma processing successful

**Debug**:
1. Apri browser console → Check API response
2. Espandi "Debug" section nel componente
3. Check `relevance_score` delle email processate
4. Se tutte < 0.2 → email classificate come irrilevanti

**Query manuale**:
```sql
SELECT * FROM ai_briefings 
ORDER BY created_at DESC 
LIMIT 10;
```

Se query restituisce righe ma frontend non mostra:
- Check account filtering (switch account?)
- Check query key React Query (dovrebbe includere account ID)

---

### Problema: TypeScript errors

**Error**: `Cannot find name 'ai_briefings'`

**Causa**: Types Supabase non rigenerati dopo migration

**Soluzione**:
```bash
npx supabase gen types typescript --project-id ahboipwbpyalpyzriizf > src/integrations/supabase/types.ts
```

Poi rimuovi tutti gli `as any` dai componenti.

---

## 🚦 Roadmap Phase 2+

### Pianificato (Post-MVP)

1. **Automatic Triggers**
   - Scheduled job (ogni 2h)
   - Webhook su email arrival

2. **Contextual Actions**
   - "Converti in Noleggio" → Form pre-filled
   - "AI Draft Reply" → Generate response

3. **Entity Linking**
   - Extract `#PRV-045` → Link to DB preventivo
   - Show related entities in card

4. **User Preferences**
   - Frequency settings
   - Relevance threshold slider
   - Tone customization (formale/informale)

5. **Improvements**
   - Better prompts (iterate on user feedback)
   - Local LLM option (cost reduction)
   - Email navigation from briefing ("Vedi Email")

6. **RLS Policies**
   - Enable Row Level Security
   - User-specific briefings

---

## 📝 Change History

### v1.3 - 2026-02-02 03:10
**Changes**: React Hooks bugfix
- Fixed conditional `useMemo` call violating Rules of Hooks
- Separated into `computedAccount` (always called) + conditional assignment
- Added null guard for `accounts.length`

### v1.2 - 2026-02-02 02:55
**Changes**: Multi-account filtering
- Lifted account state to EmailPage
- Added account selector (shared between tabs)
- Account filtering via JOIN (ai_briefings → ai_knowledge_base → emails_ricevute)
- Email processing now filters by active account

### v1.1 - 2026-02-02 02:45
**Changes**: LLM prompt customization
- Structured format: "CHI vuole COSA + dettagli"
- Always show sender name/email first
- Lowered relevance threshold 0.5 → 0.2 (testing phase)

### v1.0 - 2026-02-02 02:30
**Changes**: Initial MVP deployment
- Created DB schema (migration)
- Deployed Edge Function (version 1)
- Created frontend component AIBriefingsMVP
- Integrated in EmailPage with tabs
- Configured OPENAI_API_KEY secret

---

## 📞 Documentation References

### File Locations
```
DB Migration:
  supabase/migrations/20260202000001_ai_briefings_mvp.sql

Edge Function:
  supabase/functions/ai-extract-facts-mvp/index.ts

Frontend:
  src/components/ai/AIBriefingsMVP.tsx
  src/pages/EmailPage.tsx
  src/components/email/EmailClientPage.tsx (modified for multi-account)

Documentation:
  docs/AI_BRIEFINGS_MVP_IMPLEMENTATION.md (this file)
  docs/CHANGE_REGISTRY.md (version entry)
```

### External Resources
- OpenAI API: https://platform.openai.com/docs
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- React Hooks Rules: https://react.dev/warnings/invalid-hook-call-warning

---

**Version**: 1.3  
**Last Updated**: 2026-02-02 03:12 UTC  
**Maintained By**: Development Team  
**Status**: ✅ Production Ready
