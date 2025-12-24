# PIANO STRATEGICO DI MIGRAZIONE: NXUS v2 (The Shadow Rebuild Protocol)

## INDICE ANALITICO
1. [Filosofia dello Shadow Rebuild](#1-filosofia-dello-shadow-rebuild)
2. [Fase 1: Setup dell'Ambiente Isolato](#2-fase-1-setup-dellambiente-isolato)
3. [Fase 2: Progettazione del Master Schema](#3-fase-2-progettazione-del-master-schema)
4. [Fase 3: Strategia di Migrazione Dati (ETL)](#4-fase-3-strategia-di-migrazione-dati-etl)
5. [Fase 4: Refactoring Modulare (Vertical Slices)](#5-fase-4-refactoring-modulare-vertical-slices)
6. [Fase 5: Hardening, QA e Performance](#6-fase-5-hardening-qa-e-performance)
7. [Fase 6: Il Protocollo di Cutover (Go-Live)](#7-fase-6-il-protocollo-di-cutover-go-live)
8. [Piano di Rollback e Sicurezza](#8-piano-di-rollback-e-sicurezza)

---

## 1. FILOSOFIA DELLO SHADOW REBUILD
Non modifichiamo il sistema in corsa. Ne costruiamo uno nuovo, perfetto e testato, "all'ombra" di quello attuale. La V2 nascerà su un nuovo database e un nuovo branch Git.

## 2. FASE 1: SETUP DELL'AMBIENTE ISOLATO
- **Git Branching**: Creazione del branch `rebuild/enterprise-v2`.
- **Supabase Staging**: Provisioning di un nuovo progetto Supabase dedicato esclusivamente alla V2. 

## 3. FASE 2: PROGETTAZIONE DEL MASTER SCHEMA
Ricostruiremo la struttura del database applicando il **Manifesto**.
- **Tbl/Vw/Rpc Separation**: Applicazione rigida della separazione.
- **RLS by Design**: Policy RLS granulari fin dal primo `CREATE TABLE`.

## 4. FASE 3: STRATEGIA DI MIGRAZIONE DATI (ETL)
- **Transformation**: Script SQL di "ponte" dal vecchio al nuovo.
- **Integrity Check**: Confronto dei conteggi record.

## 5. FASE 4: REFACTORING MODULARE (VERTICAL SLICES)
- **Modulo 0: Core & Auth**: Anagrafiche, Sedi, Utenti.
- **Modulo 1: Flotta**: Mezzi, Manutenzioni.
- **Modulo 2: Documenti**: Preventivi, Noleggi, Snapshots.

## 6. FASE 5: HARDENING, QA E PERFORMANCE
- **TypeScript Lockdown**: Attivazione di `strict: true`.

## 7. FASE 6: IL PROTOCOLLO DI CUTOVER (GO-LIVE)
1. **Final Data Sync**.
2. **Variable Switch**.
3. **Main Merge**.
