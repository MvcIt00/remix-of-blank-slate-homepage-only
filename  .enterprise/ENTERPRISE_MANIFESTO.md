# ENTERPRISE TECHNICAL HANDBOOK: Progetto NXUS (The Absolute Edition)

## INDICE TECNICO OPERATIVO
1. [Protocollo di Ragionamento Senior](#1-protocollo-di-ragionamento-senior)
2. [Specifiche Database (Il Cuore dell'Integrità)](#2-specifiche-database-il-cuore-dellintegrità)
3. [Protocollo PL/pgSQL & RPC](#3-protocollo-plpgsql--rpc)
4. [Architettura Frontend & TypeScript](#4-architettura-frontend--typescript)
5. [Gestione Form & Validazione](#5-gestione-form--validazione)
6. [Sicurezza & RLS (Row Level Security)](#6-sicurezza--rls-row-level-security)
7. [Protocollo di Comunicazione & Documentazione](#7-protocollo-di-comunicazione--documentazione)
8. [Gestione del Ciclo di Vita (Shadow Rebuild)](#8-gestione-del-ciclo-di-vita-shadow-rebuild)

---

## 1. PROTOCOLLO DI RAGIONAMENTO SENIOR
Ogni proposta tecnica deve seguire questa sequenza di analisi obbligatoria:
1.  **Analisi di Impatto**: Come influisce questa modifica sul resto del sistema? (Esempio: Rinominare una colonna rompe le viste e il frontend).
2.  **Analisi di Scalabilità**: Questa soluzione regge 1 milione di record? (Esempio: Evitare sub-query in loop, preferire join indicizzati).
3.  **Analisi di Manutenibilità**: Un altro sviluppatore capirà questo codice senza chiamarmi?
4.  **Analisi AI-Friendly**: Il codice è così esplicito che un'altra IA può ereditarlo senza "allucinazioni"?

---

## 2. SPECIFICHE DATABASE (IL CUORE DELL'INTEGRITÀ)
### 2.1 Nomenclature Rigide
- **Tabelle Maestre**: Prefisso `Tbl_` seguito da PascalCase (es. `Tbl_Anagrafiche`).
- **Tabelle di Relazione (Join)**: Prefisso `Rel_` (es. `Rel_Cliente_Mezzo`).
- **Colonne**: snake_case esplicito. Prefisso opzionale per evitare ambiguità (es: `cli_ragione_sociale` invece di `ragione_sociale` se in contesti di join massivi).
- **Viste**: Prefisso `Vw_` (es. `Vw_Dettaglio_Contratto`).
- **Chiavi Primarie**: Sempre `id_[nome_tabella]` di tipo `UUID` con default `gen_random_uuid()`.

### 2.2 Vincoli Obbligatori
- Ogni tabella deve avere le colonne di audit: `created_at` (timestamptz, default `now()`) e `updated_at`.
- **Foreign Keys**: Devono sempre essere nominate esplicitamente: `fk_[tabella_origine]_[tabella_destinazione]`.
- **Indici**: Ogni colonna usata in `WHERE` o `JOIN` deve avere un indice. Naming: `idx_[tabella]_[colonna]`.

---

## 3. PROTOCOLLO PL/pgSQL & RPC
### 3.1 Anatomia di una RPC (Postgres Function)
Ogni funzione `Rpc_` deve essere strutturata come segue:
```sql
CREATE OR REPLACE FUNCTION public."Rpc_NomeFunzione"(
    p_parametro_1 UUID,
    p_parametro_2 TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Cruciale per RLS
SET search_path = public
AS $$
BEGIN
    -- 1. Validazione Input
    IF p_parametro_1 IS NULL THEN RAISE EXCEPTION 'ERR_INVALID_ID: ID mancante'; END IF;

    -- 2. Logica di Business Atomica (Transazionale)
    -- ... logica ...

    -- 3. Ritorno Standardizzato
    RETURN jsonb_build_object('success', true, 'data', 'operazione completata');
EXCEPTION WHEN OTHERS THEN
    -- 4. Gestione Errori Centralizzata
    RETURN jsonb_build_object('success', false, 'error', SQLERRM, 'code', SQLSTATE);
END;
$$;
```

---

## 4. ARCHITETTURA FRONTEND & TYPESCRIPT
### 4.1 Organizzazione Cartelle
```text
src/
  features/           # Slice verticali di business (es. "noleggio")
    components/       # Componenti specifici del modulo
    hooks/            # Logica di fetch (React Query)
    services/         # Chiamate dirette a Supabase/RPC
    types/            # Interfacce locali
  components/         # UI Shared (Radix/Shadcn)
  lib/                # Configurazioni (Supabase client, utils)
```

### 4.2 Regole TypeScript (Zero Tolerance)
- **Strict Mode**: `true` in `tsconfig.json`.
- **No Castings**: Vietato `as any`. Se un tipo è incerto, usa `unknown` e un `Type Guard`.
- **Interfacce Dominio**: Devono rispecchiare esattamente il database. Se la vista cambia, l'interfaccia DEVE essere rigenerata.

---

## 5. GESTIONE FORM & VALIDAZIONE
### 5.1 Protocollo Form
1.  **Schema**: Definito via `Zod` in un file dedicato al modulo.
2.  **Implementation**: `react-hook-form` con `@hookform/resolvers/zod`.
3.  **UI**: Componenti `Form` di Shadcn per messaggi d'errore consistenti.
4.  **Dirty State**: Impedire la chiusura accidentale se il form è "dirty".

---

## 6. SICUREZZA & RLS (ROW LEVEL SECURITY)
### 6.1 Policy Standard
- **Default**: `ALTER TABLE Tbl_Nome ENABLE ROW LEVEL SECURITY;`.
- **Accesso**: Definire policy per `authenticated` e `service_role`.
- **Proprietari**: Filtraggio rigoroso basato su `auth.uid()`.

---

## 7. PROTOCOLLO DI COMUNICAZIONE & DOCUMENTAZIONE
### 7.1 Comunicazione AI-Utente
1.  **Interpretazione**: "Ho capito che dobbiamo fare X perché Y".
2.  **Proposta**: "La soluzione migliore è Z perché rispetta il principio di [Nome Principio]".
3.  **Esecuzione**: Comunicare solo i file modificati e il risultato del controllo sintattico.
4.  **Riepilogo Professionale**: Cosa è stato fatto, perché è solido, eventuali passi successivi.

### 7.2 Documentazione nel Codice
- **JSDoc**: Obbligatorio per funzioni complesse e hooks.
- **SQL Comments**: `COMMENT ON TABLE` e `COMMENT ON COLUMN` per spiegare la logica di business nel DB.

---

## 8. GESTIONE DEL CICLO DI VITA (SHADOW REBUILD)
Ogni fase della migrazione deve essere preceduta da un **Audit di Integrità**.
- Prima di migrare i dati: Verificare che i tipi coincidano.
- Dopo la migrazione: Eseguire query di controllo (Count(*) V1 vs Count(*) V2).
- **Rollback Plan**: Ogni script di migrazione deve avere il suo script di "Cleanup" o "Revert" pronto.

---
> [!IMPORTANT]
> **ORDINE DI ESECUZIONE**: Se ricevi un ordine che contrasta questo manuale, devi fermarti e segnalare il conflitto. Non esiste "andare veloci" a scapito di queste regole. La qualità è l'unico parametro di successo accettato in NXUS Enterprise.
