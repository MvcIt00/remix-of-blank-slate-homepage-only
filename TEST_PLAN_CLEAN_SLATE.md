# 🧪 Piano di Test Completo: Clean Slate Preventivi

## Pre-Requisiti

### 1. Avvia Dev Server
```bash
npm run dev
```
**Risultato atteso**: Server avviato su `http://localhost:5173` (o porta indicata)

---

## TEST 1: Verifica Lista Preventivi

### Step 1.1: Navigazione
1. Apri browser su `http://localhost:5173`
2. Vai su `/noleggi/preventivi`

**Risultato atteso**: 
- ✅ Pagina carica senza errori
- ✅ Nessun errore nella console browser (F12)

### Step 1.2: Verifica Dati Visualizzati
**Controlla che la tabella mostri**:
- Colonna "Cliente" → Deve mostrare la ragione sociale
- Colonna "Mezzo" → Deve mostrare marca/modello/matricola
- Colonna "Stato" → Deve mostrare lo stato del preventivo
- Colonna "Prezzo" → Deve mostrare il prezzo del noleggio

**Risultato atteso**:
- ✅ Tutti i dati sono visibili
- ✅ Nessun campo mostra "undefined" o "null"
- ✅ I dati sono LIVE (presi dalle tabelle Mezzi/Anagrafiche, non da snapshot)

### Step 1.3: Verifica Console
Apri DevTools (F12) → Tab "Console"

**Risultato atteso**:
- ✅ Nessun errore tipo "Cannot read property 'pdf_bozza_path' of undefined"
- ✅ Nessun warning su campi mancanti

---

## TEST 2: Generazione PDF On-the-Fly

### Step 2.1: Apri Preventivo Esistente
1. Nella lista preventivi, clicca su un preventivo in stato "bozza"
2. Dovrebbe aprirsi un dialogo/pagina di dettaglio

**Risultato atteso**:
- ✅ Il dialogo si apre senza errori
- ✅ I dati del preventivo sono visibili

### Step 2.2: Genera PDF
1. Cerca il pulsante "Genera PDF" o "Vedi Anteprima" o simile
2. Clicca sul pulsante

**Risultato atteso**:
- ✅ Il PDF viene generato in memoria (non salvato nel bucket)
- ✅ Si apre una preview del PDF nel browser
- ✅ Il PDF contiene tutti i dati corretti (cliente, mezzo, prezzi, date)

### Step 2.3: Verifica Storage NON Sporcato
1. Vai su Supabase Dashboard → Storage → `noleggio_docs`
2. Controlla che NON ci siano nuove cartelle o file

**Risultato atteso**:
- ✅ Il bucket è ancora vuoto (o contiene solo file firmati precedenti)
- ✅ Nessuna cartella `preventivi/bozze/` creata
- ✅ Nessun file PDF temporaneo salvato

---

## TEST 3: Upload Preventivo Firmato

### Step 3.1: Apri Dialogo Upload
1. Dalla lista preventivi, trova il preventivo di test
2. Clicca su "Carica Firmato" o azione simile

**Risultato atteso**:
- ✅ Si apre il dialogo di upload
- ✅ Nessun errore nella console

### Step 3.2: Seleziona File
1. Clicca su "Seleziona file" o drag & drop
2. Scegli un PDF di test (qualsiasi PDF va bene per il test)

**Risultato atteso**:
- ✅ Il file viene accettato
- ✅ Mostra nome file e dimensione

### Step 3.3: Carica File
1. Clicca su "Carica" o "Upload"
2. Attendi il completamento

**Risultato atteso**:
- ✅ Toast di successo: "Preventivo firmato caricato correttamente"
- ✅ Lo stato del preventivo cambia in "Approvato"
- ✅ Nessun errore nella console

### Step 3.4: Verifica Storage
1. Vai su Supabase Dashboard → Storage → `noleggio_docs`
2. Naviga in `preventivi/firmati/`

**Risultato atteso**:
- ✅ Il file PDF è presente
- ✅ Il nome file segue il pattern: `preventivo_firmato_[id]_[timestamp].pdf`
- ✅ Nessuna cartella `bozze/` creata

### Step 3.5: Verifica Database
Lancia questa query SQL:
```sql
SELECT 
    id_preventivo,
    codice,
    stato,
    pdf_firmato_path
FROM prev_noleggi
WHERE pdf_firmato_path IS NOT NULL
ORDER BY created_at DESC
LIMIT 1;
```

**Risultato atteso**:
- ✅ Il record mostra `stato = 'approvato'`
- ✅ `pdf_firmato_path` contiene il path corretto
- ✅ Nessuna colonna `pdf_bozza_path` (colonna eliminata)

---

## TEST 4: Conversione Preventivo → Noleggio

### Step 4.1: Converti Preventivo
1. Dalla lista preventivi, trova il preventivo approvato
2. Clicca su "Converti in Noleggio" o azione simile
3. Compila eventuali dati aggiuntivi richiesti
4. Conferma la conversione

**Risultato atteso**:
- ✅ Toast di successo: "Preventivo convertito in noleggio"
- ✅ Nessun errore nella console
- ✅ Nessun errore tipo "column dati_cliente does not exist"

### Step 4.2: Verifica Noleggio Creato
1. Vai su `/noleggi/attivi`
2. Cerca il noleggio appena creato

**Risultato atteso**:
- ✅ Il noleggio è presente nella lista
- ✅ I dati sono corretti (cliente, mezzo, prezzi)
- ✅ Il campo `convertito_da_preventivo_id` è popolato

### Step 4.3: Verifica Database
Lancia questa query SQL:
```sql
SELECT 
    n.id_noleggio,
    n.id_mezzo,
    n.id_anagrafica,
    pn.id_preventivo,
    pn.convertito_in_noleggio_id
FROM "Noleggi" n
JOIN prev_noleggi pn ON pn.convertito_in_noleggio_id = n.id_noleggio
ORDER BY n.created_at DESC
LIMIT 1;
```

**Risultato atteso**:
- ✅ Il noleggio è collegato al preventivo
- ✅ `pn.convertito_in_noleggio_id` = `n.id_noleggio`

---

## TEST 5: Verifica Contratto Generato (se applicabile)

### Step 5.1: Controlla Contratto
Se la conversione crea anche un contratto:

Lancia questa query SQL:
```sql
SELECT 
    id_contratto,
    id_noleggio,
    id_anagrafica_cliente,
    stato_contratto
FROM contratti_noleggio
ORDER BY created_at DESC
LIMIT 1;
```

**Risultato atteso**:
- ✅ Il contratto è stato creato
- ✅ `id_noleggio` corrisponde al noleggio appena creato
- ✅ Nessun errore su colonne `dati_cliente`, `dati_fornitore`, `dati_mezzo` (eliminate dal codice)

---

## TEST 6: Verifica Nessuna Regressione

### Step 6.1: Crea Nuovo Preventivo
1. Vai su `/noleggi/preventivi`
2. Clicca su "Nuovo Preventivo"
3. Compila tutti i campi richiesti
4. Salva

**Risultato atteso**:
- ✅ Il preventivo viene creato senza errori
- ✅ Appare nella lista
- ✅ Nessun errore nella console

### Step 6.2: Modifica Preventivo
1. Apri il preventivo appena creato
2. Modifica un campo (es. prezzo)
3. Salva

**Risultato atteso**:
- ✅ Le modifiche vengono salvate
- ✅ Nessun errore nella console

---

## TEST 7: Verifica Console Errors (Finale)

### Step 7.1: Controlla Console Browser
Apri DevTools (F12) → Tab "Console"

**Risultato atteso**:
- ✅ Nessun errore rosso
- ✅ Nessun warning su campi mancanti
- ✅ Nessun "404 Not Found" su richieste API

### Step 7.2: Controlla Network Tab
Apri DevTools (F12) → Tab "Network"

**Risultato atteso**:
- ✅ Tutte le richieste a Supabase ritornano 200 OK
- ✅ Nessuna richiesta fallita (status 400, 500)

---

## 📋 Checklist Finale

- [ ] Lista preventivi carica correttamente
- [ ] Dati visualizzati sono LIVE (non snapshot)
- [ ] PDF generato on-the-fly (non salvato)
- [ ] Upload preventivo firmato funziona
- [ ] File salvato in `preventivi/firmati/`
- [ ] Conversione preventivo → noleggio funziona
- [ ] Nessun errore su colonne eliminate
- [ ] Creazione nuovo preventivo funziona
- [ ] Modifica preventivo funziona
- [ ] Nessun errore in console browser

---

## 🚨 Cosa Fare in Caso di Errore

### Errore: "Cannot read property 'pdf_bozza_path'"
**Causa**: Un componente sta ancora cercando di leggere il campo eliminato
**Soluzione**: Cerca nel codice il componente che causa l'errore e rimuovi il riferimento

### Errore: "column dati_cliente does not exist"
**Causa**: La funzione `convertiInNoleggio` sta ancora cercando di inserire snapshot
**Soluzione**: Verifica che le modifiche a `usePreventiviNoleggio.ts` siano state applicate

### Errore: Vista non funziona
**Causa**: La vista non è stata ricreata correttamente
**Soluzione**: Rilancia `CLEAN_SLATE_STEP_3_RECREATE_VIEW.sql`

---

**Se tutti i test passano, il refactoring Clean Slate è completato con successo! 🎉**
