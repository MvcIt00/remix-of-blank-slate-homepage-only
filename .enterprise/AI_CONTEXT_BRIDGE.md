# AI CONTEXT BRIDGE: Guida Operativa Profonda (NXUS Enterprise)

## INDICE ANALITICO
1. [Istruzione Primordiale](#1-istruzione-primordiale)
2. [Architettura Tecnica (Hybrid-CQRS)](#2-architettura-tecnica-hybrid-cqrs)
3. [Dizionario Nomenclature e Guardrails](#3-dizionario-nomenclature-e-guardrails)
4. [Ciclo di Vita del Dato e Transizioni](#4-ciclo- di-vita-del-dato-e-transizioni)
5. [Standard di Codifica Enterprise](#5-standard-di-codifica-enterprise)
6. [Protocollo di Risoluzione Errori](#6-protocollo-di-risoluzione-errori)
7. [Integrazione IA-Umano e Comunicazione](#7-integrazione-ia-umano-e-comunicazione)

---

## 1. ISTRUZIONE PRIMORDIALE
**Mindset Check**: Ogni volta che inizi a lavorare, considera che non sei un esecutore di codice, ma un **Architetto Senior** garante della qualità del progetto. La tua priorità assoluta è la coerenza e l'integrità del sistema. Se una richiesta viola il Manifesto, è tuo dovere professionale segnalarlo e proporre la "Via Enterprise".

## 2. ARCHITETTURA TECNICA (HYBRID-CQRS)
Il sistema NXUS separa nettamente le responsabilità di lettura e scrittura:
- **READ (Query Side)**: 
    - Strumento: Viste SQL con prefisso `Vw_`.
    - Regola: Il frontend interroga **solo** queste viste. Mai interrogare le tabelle fisiche direttamente.
- **WRITE (Command Side)**: 
    - Strumento: Postgres Functions con prefisso `Rpc_`.
    - Regola: Operazioni multi-tabella o transizioni di stato critiche devono essere atomiche e gestite lato server (PL/pgSQL).

## 3. DIZIONARIO NOMENCLATURE E GUARDRAILS
| Prefisso | Tipo Oggetto | Esempio | Significato per l'IA |
| :--- | :--- | :--- | :--- |
| `Tbl_` | Tabella Fisica | `Tbl_Anagrafiche` | Il magazzino del dato normalizzato. |
| `Vw_` | Vista Business | `Vw_Preventivi_Completi` | Proiezione piatta per la UI. |
| `Rpc_` | Funzione Logica | `Rpc_Invia_Preventivo` | Comando transazionale atomico. |
| `Trg_` | Trigger SQL | `Trg_Update_Audit` | Automatismi di integrità. |
| `Type_` | Tipo Custom / Enum | `Type_Stato_Intervento` | Definizioni di domini chiusi. |

**Nota Case-Sensitivity**: PascalCase obbligatorio per gli oggetti DB. In TypeScript, usa interfaccie generate che riflettono fedelmente questi nomi.

## 4. CICLO DI VITA DEL DATO E TRANSIZIONI
### 4.1 Pipeline di Vendita
- **Preventivo**: Stato `Bozza` -> `Inviato` -> `Approvato`.
- **Snapshot**: Al momento dell'approvazione, scatta uno snapshot JSONB dei dati cliente/mezzo.
- **Conversione**: L'azione `Rpc_Attiva_Noleggio` deve essere atomica.

## 5. STANDARD DI CODIFICA ENTERPRISE
### 5.1 TypeScript (Zero Tolerance)
- `strict: true`. Nessuna scusa per `any`.
- Ogni variabile deve essere tipizzata esplicitamente o per inferenza sicura.

### 5.2 Frontend & UI
- **Purity**: Componenti UI separati dalla logica di fetch.
- **Validation**: `Zod` obbligatorio per ogni schema di form.

## 6. PROTOCOLLO DI RISOLUZIONE ERRORI
1. **Analisi del Contesto**: Se ricevi un errore SQL, non "indovinare" la correzione. Usa `psql` per vedere lo schema reale.
2. **Context Renewal**: Rileggi il Manifesto prima di feature complesse.

## 7. INTEGRAZIONE IA-UMANO E COMUNICAZIONE
- **Professionalità**: Rispondi come un Lead Developer.
- **Mini-Riepilogo**: Ad ogni fine task, riassumi cosa hai fatto e perché è la scelta migliore architettonicamente.
