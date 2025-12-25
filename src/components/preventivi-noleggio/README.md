# Ecosystem: Preventivi Noleggio

Questo documento descrive l'architettura e il flusso dei dati dell'ecosistema dei **Preventivi Noleggio**, garantendo una guida per futuri interventi e per l'allineamento delle AI.

## 🏗️ Architettura & Flusso Dati

L'ecosistema è strutturato su tre livelli principali per garantire scalabilità e separazione delle responsabilità:

### 1. Livello Database (PostgreSQL / Supabase)
Il sistema non interroga direttamente le tabelle fisiche per la visualizzazione, ma utilizza una **Vista Unificata**:
- **Vista**: `public.vw_preventivi_completi`
- **Responsabilità**: Esegue i join tra `prev_noleggi`, `Anagrafiche`, `Mezzi` e `Sedi`.
- **Dato Critico**: La vista include i dati completi della **Sede Operativa** (indirizzo, città, cap, provincia) tramite un join con la vista `vw_sedi_tutte`.

### 2. Livello Logica & Mapping (React Hooks)
- **Hook**: `src/hooks/usePreventiviNoleggio.ts`
- **Mapping**: La funzione `mapPreventivoViewToModel` agisce da "traduttore". Prende le colonne piatte della vista SQL e le trasforma nell'oggetto strutturato `PreventivoNoleggio` usato dal frontend.
- **Integrità**: Questo strato garantisce che l'ID della sede (`id_sede`) e i dati logistici siano sempre disponibili per tabelle, form e dialog di conversione.

### 3. Livello Interfaccia (UI Components)
- **Pagina**: `src/pages/PreventiviNoleggio.tsx` (Lista e Filtri)
- **Form**: `src/components/preventivi-noleggio/PreventivoNoleggioForm.tsx` (Creazione e Modifica)
- **Logistica**: La UI predilige l'**Indirizzo** rispetto al nome della sede, poiché è il dato fondamentale per l'operatività del noleggio.

## 🔄 Lifecycle del Preventivo
1. **Creazione**: Un preventivo viene creato salvando i riferimenti (`id_mezzo`, `id_anagrafica`, `id_sede`) nella tabella `prev_noleggi`.
2. **Visualizzazione**: La tabella dei preventivi legge dalla Vista, mostrando l'indirizzo operativo per facilitare l'identificazione logistica.
3. **Conversione**: Tramite `ConfermaPreventivoDialog`, il sistema legge l'oggetto preventivo e lo converte in un record nella tabella `Noleggi`, mantenendo l'integrità dei dati (stessa sede, stesso prezzo).

---

## 💡 Note per lo Sviluppo
- **Tipi**: Qualsiasi modifica ai campi della sede deve essere riflessa in `src/types/database_views.ts` e `src/types/preventiviNoleggio.ts`.
- **PDF**: Il template `PreventivoPDF.tsx` deve attingere dall'oggetto sede unificato per garantire coerenza tra preventivo e futuro contratto.
