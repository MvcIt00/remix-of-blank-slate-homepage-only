-- SCRIPT DI POPOLAMENTO TEMPLATE (Eseguimi nel SQL Editor)
-- Questo script inserisce il testo legale completo senza errori.

INSERT INTO public.document_templates (
    code,                       -- CODICE CHE MANCAVA (Obbligatorio)
    description,                -- DESCRIZIONE (Obbligatoria)
    category,                   -- Categoria
    version,                    -- Versione
    content_type,               -- Tipo contenuto
    is_active,                  -- Attivo
    content                     -- IL TESTO DEL CONTRATTO
)
VALUES (
    'CONDIZIONI_NOLEGGIO_STD',               -- <--- Questo è il "code" che mancava!
    'Condizioni Generali di Noleggio (Standard)',
    'contratti',
    1,
    'text/plain',
    true,
    'CONDIZIONI GENERALI DI NOLEGGIO
Pag. 1 di 7
1) Ambito di applicazione

1.1) Tutte le locazioni di prodotti da parte di mvc toscana carrelli (di seguito mvc tc) sono disciplinate e regolate, oltre che dalle Condizioni Particolari (come nel seguito definite), dalle presenti condizioni generali di locazione (di seguito, le "Condizioni Generali").

1.2) In caso di difformità o di confliggenti disposizioni tra le Condizioni Generali e le Condizioni Particolari, prevarranno le Condizioni Particolari.

2) Definizioni

I termini e le espressioni di seguito elencati hanno, nell''ambito delle presenti Condizioni Generali, il significato qui di seguito indicato:

Condizioni Particolari: condizioni particolari di locazione concordate e sottoscritte tra le Parti;

Locatore: il fornitore della locazione (mvc tc);

Conduttore: qualsiasi conduttore del Prodotto;

Canone: il canone di locazione del Prodotto indicato nelle Condizioni Particolari;

Deposito Cauzionale: importo corrisposto dal Conduttore a titolo di deposito cauzionale infruttifero;

Full Service: controlli, manutenzione e riparazioni a carico del Locatore;

Locazione: il rapporto contrattuale disciplinato dalle presenti Condizioni;

Prodotto: qualsiasi Mezzo o Bene concesso in locazione;

Parte: il Locatore o il Conduttore;

Riconsegna: restituzione del Prodotto al Locatore.

3) Oggetto

Il Locatore concede in locazione il Prodotto dettagliato nelle Condizioni Particolari. Sono esclusi dalla locazione: operatore, energia elettrica, carburanti, acqua e materiali di consumo, salvo diversa indicazione.

4) Durata

4.1) La Locazione è a tempo determinato.

4.2) La durata è stabilita nelle Condizioni Particolari. Il contratto decorre dalla data di consegna risultante dal Documento di Trasporto.

4.3) Almeno 3 mesi prima della scadenza il Conduttore dovrà comunicare le modalità di restituzione o richiesta di proroga.

4.4) Il contratto non si rinnova tacitamente.

5) Canone

5.1) Il canone è riferito all''utilizzo massimo indicato. Eventuali eccedenze verranno addebitate.

5.2) Se non specificato, il canone si intende giornaliero.

5.3) Adeguamento annuale ISTAT.

5.4) Pagamento tramite RID. In caso di cessazione anticipata il residuo è immediatamente esigibile.

5.5) Revisione del canone in caso di variazione d’uso.

5.6) In caso di ritardo si applicano interessi di mora ex D.Lgs. 231/02.

6) Deposito Cauzionale

6.1) Pari a quanto indicato o a 3 mesi di canone.

6.2) Restituzione entro 60 giorni dalla riconsegna.

Pag. 2 di 7

6.3) Il Locatore può trattenere il deposito per canoni insoluti, danni o costi addebitabili.

6.4) Nei noleggi a lungo termine con mezzi nuovi è richiesta fideiussione.

7) Consegna del Prodotto

La consegna avviene secondo quanto stabilito nelle Condizioni Particolari. Dalla consegna il Conduttore assume custodia e responsabilità.

8) Riconsegna del Prodotto

Il Prodotto deve essere riconsegnato integro, funzionante e completo. Penale di 1/10 del canone mensile per ogni giorno di ritardo.

9) Spese di trasporto

A carico del Conduttore salvo diverso accordo.

10) Divieto di modifiche

È vietata qualsiasi modifica senza autorizzazione scritta. In caso di violazione il Locatore può mantenere o ripristinare a spese del Conduttore.

Pag. 3 di 7
11) Regole di utilizzo

Uso diligente, rispetto delle normative di sicurezza e impiego da parte di personale formato.

12) Manutenzione e riparazioni

Il Locatore garantisce il Full Service salvo esclusioni specifiche (incidenti, uso improprio, materiali di consumo, calamità).

Obbligo di segnalazione immediata dei guasti.

Pag. 4 di 7

Divieto di affidare manutenzione a terzi non autorizzati. Esclusione di responsabilità del Locatore per fermo macchina.

Pag. 5 di 7
13) Responsabilità

Il Conduttore è responsabile del Prodotto durante la locazione. Obbligo di assicurazione.

14) Divieto di sublocazione

È vietata senza consenso scritto.

15) Proprietà del Prodotto

La proprietà resta del Locatore. Possibile cessione del contratto.

Pag. 6 di 7
16) Diritto di visita

Il Locatore può ispezionare il Prodotto.

17) Limitazione eccezioni

Il Conduttore non può sospendere i pagamenti.

18) Clausola risolutiva espressa

Risoluzione automatica in caso di inadempimenti specifici.

19) Ulteriore diritto di recesso

Facoltà di recesso immediato del Locatore in caso di procedure concorsuali.

20) Forza maggiore

Esclusione di responsabilità per eventi fuori controllo.

Pag. 7 di 7
21) Cambio di controllo

Diritto di recesso del Locatore.

22) Intero accordo

Le presenti condizioni sostituiscono ogni precedente accordo.

23) Comunicazioni

Devono avvenire per iscritto.

24) Trattamento dati personali

Consenso al trattamento ex D.Lgs. 196/2003.

Foro competente

Autorità Giudiziaria di Livorno.'
)
ON CONFLICT (code, version) 
DO UPDATE SET 
    content = EXCLUDED.content,
    updated_at = now();
