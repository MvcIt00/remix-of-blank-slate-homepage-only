
Ho letto `protocollo` e ho verificato lo stato reale del sistema (AX00): ho aperto il progetto in preview e la compilazione fallisce con errori TypeScript su `PreventivoPreviewDialog` (mancano props obbligatorie in due call-site). Con build rotta, l’“anteprima PDF” non può più generarsi perché l’app non parte correttamente.

In parallelo ho verificato la catena tecnica della generazione PDF:
- `PreventivoPreviewDialog` (preventivi-noleggio) usa `DocumentPreviewDialog`
- `DocumentPreviewDialog` usa `BlobProvider` di `@react-pdf/renderer` e mostra un iframe con `blob:` URL
- quindi, quando l’app compila, l’anteprima PDF è “client-side” e non dipende da Supabase
- il salvataggio invece dipende da Supabase Storage (`uploadPreventivoPDF`) + aggiornamento DB via `onSave(...)`

Ho anche verificato una condizione reale lato Supabase: esiste il bucket `noleggio_docs` e le policy su `storage.objects` permettono `INSERT/UPDATE/DELETE` ad utenti `authenticated`. Quindi, una volta risolta la build, l’upload può funzionare (a patto che l’utente sia loggato, cosa garantita da `ProtectedRoute`).

Di seguito la sequenza dettagliata “tipo script” per ripristinare subito la generazione dell’anteprima PDF e riallineare il salvataggio DB.

---

## SCRIPT DI IMPLEMENTAZIONE (step-by-step, con dettagli tecnici)

### STEP 1 — Riparare la build (causa primaria: props obbligatorie non passate)
**Obiettivo:** eliminare gli errori TS così l’app torna a compilare e l’anteprima torna a generarsi.

**Scelta tecnica consigliata (minima + compatibile con i flussi esistenti):** rendere `PreventivoPreviewDialog` “dual-mode”:
- se ha `preventivoId` → abilita upload su Storage e ritorna `uploadedPath` a `onSave(uploadedPath)`
- se NON ha `preventivoId` → resta “preview-only” e chiama `onSave()` (es: crea record preventivo nel flow “nuovo preventivo”) senza fare upload

#### Comando/azione: modificare `src/components/preventivi-noleggio/PreventivoPreviewDialog.tsx`
1) **Aggiorna l’interfaccia props** rendendo opzionali i campi “da record esistente”:
- `preventivoId?: string`
- `statoCorrente?: StatoPreventivo`
- `versioneCorrente?: number`
- `pdfBozzaPath?: string | null`
- rendi `onSave` compatibile con entrambi i mondi: `onSave?: (uploadedPath?: string) => Promise<void>`

2) **Aggiorna la logica di `handleSave`**:
- se `!currentBlob` → toast errore come già fatto
- se `preventivoId` esiste:
  - chiama `uploadPreventivoPDF(currentBlob, preventivoId, datiPreventivo.codice_preventivo)`
  - ottieni `path`
  - chiama `await onSave?.(path)`
  - chiudi dialog
- se `preventivoId` NON esiste:
  - non fare upload
  - chiama `await onSave?.()` (serve per mantenere compatibilità con `NuovoNoleggioForm` che oggi usa “Salva Preventivo” per creare il record)
  - chiudi dialog

3) **UI/UX**:
- Mantieni il bottone “Salva” solo se `onSave` esiste (in modo che l’anteprima pura possa anche essere solo Download/Stampa, se in futuro serve).
- Etichetta consigliata:
  - se `preventivoId` presente: “Salva PDF”
  - se `preventivoId` assente: “Salva Preventivo”
  (questo evita ambiguità operativa)

**Risultato atteso:** spariscono gli errori TS perché i call-site che non hanno `preventivoId` non sono più obbligati a passarla.

---

### STEP 2 — Ripristinare “Salva” nella pagina principale `PreventiviNoleggio` (salvataggio DB)
**Obiettivo:** quando l’operatore apre anteprima e clicca “Salva”, oltre all’upload su Storage si deve salvare `pdf_bozza_path` in tabella `prev_noleggi`.

#### Comando/azione: modificare `src/pages/PreventiviNoleggio.tsx`
Nel render di `PreventivoPreviewDialog` (attualmente `onSave` chiude soltanto il dialog):

1) **Passa i metadati del record corrente** (ora supportati dal dialog):
- `preventivoId={preventivoPerPDF.id_preventivo}`
- `statoCorrente={preventivoPerPDF.stato}`
- `versioneCorrente={preventivoPerPDF.versione}`
- `pdfBozzaPath={preventivoPerPDF.pdf_bozza_path || null}`

2) **Implementa `onSave` reale**:
- firma: `onSave={async (uploadedPath) => { ... }}`
- guardia: se `!uploadedPath` → chiudi dialog e basta (copre i casi preview-only)
- altrimenti:
  - `await aggiornaPreventivo(preventivoPerPDF.id_preventivo, { pdf_bozza_path: uploadedPath })`
  - toast “PDF salvato”
  - `setPreviewOpen(false)`

3) **Nota importante di coerenza workflow/versioning**:
- In questa pagina, NON chiamare `incrementaVersione` dentro `onSave` dell’anteprima, perché:
  - l’upload avviene prima (dentro il dialog)
  - `incrementaVersione` nel tuo hook oggi fa anche `pdf_bozza_path: null` (reset) e quindi rischia di cancellare subito il path appena salvato
- Il versioning va gestito nel punto “modifica dopo inviato” (tipicamente al salvataggio della modifica quando stato = `IN_REVISIONE`), non al click “Salva PDF” dell’anteprima.

**Risultato atteso:** da “Da inviare” → Anteprima → Salva → file caricato in bucket + `pdf_bozza_path` valorizzato in DB.

---

### STEP 3 — Verifica che il flow “Nuovo Preventivo” (da form) resti coerente
**Obiettivo:** non rompere l’uso attuale di `PreventivoPreviewDialog` dentro `src/components/form/nuovo_noleggio_form.tsx`, dove “Salva Preventivo” crea il record e non dovrebbe richiedere `preventivoId`.

#### Comando/azione: controllo mirato su `src/components/form/nuovo_noleggio_form.tsx`
- Con le props rese opzionali, questo file compila senza modifiche.
- Verifica comportamento:
  - Apri anteprima
  - Clic “Salva Preventivo”
  - Deve chiamare `handleSavePreventivo()` (che crea il record con `creaPreventivo(preventivoData)`) e chiudere l’anteprima.

Se vuoi (opzionale) una coerenza UX migliore, dopo che `creaPreventivo(...)` ritorna l’id del record creato si può introdurre in futuro un secondo passaggio: “Vuoi generare e salvare anche il PDF?” ma NON è necessario per riparare l’anteprima ora.

---

## STEP 4 — Test funzionale (obbligatorio, con verifiche reali)
**Obiettivo:** confermare che la generazione PDF è tornata e che il salvataggio aggiorna DB e bucket.

### 4.1 Test UI
1) Vai su `/noleggi/preventivi`
2) Seleziona un preventivo in stato `da_inviare`
3) Click “Genera/Vedi PDF”
4) Attendi che sparisca “Generazione PDF...”
5) Click “Salva PDF”
6) Attesi:
   - toast di successo
   - dialog si chiude

### 4.2 Verifica DB (SQL)
Esegui (in ambiente **Test**) una SELECT mirata (via SQL Editor o strumenti interni):
```sql
select id_preventivo, codice, stato, versione, pdf_bozza_path, storico_pdf
from public.prev_noleggi
where id_preventivo = '<ID_DEL_PREVENTIVO>';
```
Attesi:
- `pdf_bozza_path` valorizzato (stringa path)
- `versione` invariata (se non sei in revisione)
- `storico_pdf` invariato (se non hai fatto revisione)

### 4.3 Verifica bucket
- Storage → bucket `noleggio_docs` → cerca il path appena scritto (cartella `preventivi/bozze/...`)
Atteso:
- file presente e dimensione > 0

---

## STEP 5 — Azioni successive (solo se emergono problemi dopo il fix build)
Queste sono le “uscite di sicurezza” se, dopo la build fix, l’anteprima resta bloccata su “Generazione PDF...”:
1) Stampare a console `error` e `loading` dal `BlobProvider` in `DocumentPreviewDialog` per capire se c’è un errore silenziato
2) Verificare l’asset `logo_mvc.png` (dimensione e compatibilità) perché è usato in `LetterheadPDF` tramite `<Image src={logoMvc}>` e, se il loader asset fallisce, `BlobProvider` può rimanere in pending
3) Ridurre temporaneamente il PDF (escludere immagini) per isolare la causa

---

## RAGIONAMENTO COMPLETO (cosa ho verificato e perché sono arrivato qui)
Ho seguito la sequenza richiesta dal tuo `protocollo`:
- Ho letto `protocollo` per allinearmi agli assiomi (AX00…).
- Ho verificato lo stato reale del sistema aprendo la preview: la build è rotta da errori TS, quindi “non viene generata l’anteprima PDF” non è un problema del motore PDF, ma un problema che impedisce all’app di eseguire correttamente.
- Ho tracciato la catena di generazione: `PreventivoPreviewDialog` → `DocumentPreviewDialog` → `BlobProvider` (`@react-pdf/renderer`). Questo mi dice che la generazione dell’anteprima è locale (blob URL) e non dipende da Supabase.
- Ho verificato Supabase per escludere falsi positivi: bucket esiste e RLS su `storage.objects` consente insert/update/delete agli `authenticated`, quindi l’upload è fattibile.
- Ho individuato l’incoerenza funzionale principale lato app: in `src/pages/PreventiviNoleggio.tsx` `onSave` era “vuota” (chiude soltanto), quindi anche quando l’upload avvenisse non verrebbe scritto il path nel DB.
- Ho notato un secondo punto architetturale: lo stesso dialog viene usato sia per “creare un preventivo” (non hai id record) sia per “salvare PDF di un preventivo esistente” (hai id record). Rendere il dialog “dual-mode” è il fix minimo che mantiene il comportamento attuale e ripristina la build senza stravolgere workflow.

---

## STATO LAVORI (tempi stimati per scelte future + variabili condizionanti)

### Scelta 1 (consigliata): Fix minimo + retro-compatibilità (dual-mode nel dialog)
**Cosa include:** STEP 1 + STEP 2 + test base (STEP 4)  
**Tempo stimato:** 60–120 minuti  
**Variabili condizionanti:**
- quante altre chiamate a `PreventivoPreviewDialog` esistono oltre a quelle già viste
- presenza di edge-case “preview-only” senza `onSave`
- dati reali disponibili per testare almeno 1 preventivo “da inviare”

### Scelta 2: Tenere props obbligatorie e rendere sempre disponibile `preventivoId` (creazione record prima dell’anteprima)
**Cosa include:** cambiare workflow “Nuovo preventivo” per creare subito un record in DB (ottenendo `id_preventivo`) e poi aprire anteprima con salvataggio PDF reale  
**Tempo stimato:** 3–6 ore  
**Variabili condizionanti:**
- accettazione del nuovo flusso operativo (creazione “anticipata” di record)
- gestione rollback se l’operatore chiude senza confermare
- gestione di record “fantasma” se l’operatore abbandona

### Scelta 3: Refactor strutturale (separare “PreviewPDFDialog” da “SavePDFDialog” e centralizzare la logica in hook)
**Cosa include:** componente preview puro + componente/action di salvataggio per record esistenti + centralizzazione in `usePreventiviNoleggio` (un solo punto che gestisce upload+db update+eventuale versioning)  
**Tempo stimato:** 1–2 giorni lavorativi (6–12 ore)  
**Variabili condizionanti:**
- quanta logica duplicata esiste tra `PreventiviNoleggio.tsx` e `PreventiviFilteredDialog.tsx`
- necessità di includere anche la logica versioning corretta (evitare reset `pdf_bozza_path` in momenti sbagliati)
- tempo di QA su più stati (`da_inviare`, `inviato`, `in_revisione`, ecc.)

