-- 1. VIEW STORICO NOLEGGI (Ottimizzata)
CREATE OR REPLACE VIEW public.vw_storico_noleggi AS
SELECT 
    ns.id_storico,
    ns.id_noleggio,
    ns.data_evento,
    ns.tipo_evento,
    ns.note,
    ns.created_at,
    -- Dati Snapshot al momento dell'evento
    ns.mezzo_descrizione,
    ns.ragione_sociale_cliente,
    ns.sede_operativa_descrizione,
    ns.data_inizio,
    ns.data_fine,
    ns.data_fine_periodo,
    ns.data_terminazione_effettiva,
    ns.tempo_indeterminato,
    ns.prezzo_noleggio,
    ns.prezzo_trasporto,
    ns.tipo_canone,
    ns.is_terminato
FROM public.noleggi_storico ns
WHERE ns.tipo_evento IN ('terminazione', 'cambio_sede', 'cancellazione', 'riattivazione');

-- 2. VIEW PREVENTIVI (Ottimizzata con JOIN)
CREATE OR REPLACE VIEW public.vw_preventivi_completi AS
SELECT 
    p.id_preventivo,
    p.id_anagrafica,
    p.id_mezzo,
    p.data_inizio,
    p.data_fine,
    p.tempo_indeterminato,
    p.prezzo_noleggio,
    p.prezzo_trasporto,
    p.tipo_canone,
    p.note,
    p.stato,
    p.convertito_in_noleggio_id,
    p.created_at,
    -- Dati Cliente
    a.ragione_sociale AS cliente_ragione_sociale,
    a.partita_iva AS cliente_piva,
    -- Recupera contatti dal primo contatto trovato (priorità a referente o aziendale se necessario, qui prendiamo il primo)
    (SELECT email FROM public.an_contatti ac WHERE ac.id_anagrafica = p.id_anagrafica LIMIT 1) AS cliente_email,
    (SELECT telefono FROM public.an_contatti ac WHERE ac.id_anagrafica = p.id_anagrafica LIMIT 1) AS cliente_telefono,
    -- Dati Mezzo
    m.marca,
    m.modello,
    m.matricola,
    -- Noleggio Correlato (se convertito)
    n.is_terminato AS noleggio_is_terminato
FROM public.prev_noleggi p
LEFT JOIN public."Anagrafiche" a ON p.id_anagrafica = a.id_anagrafica
LEFT JOIN public."Mezzi" m ON p.id_mezzo = m.id_mezzo
LEFT JOIN public."Noleggi" n ON p.convertito_in_noleggio_id = n.id_noleggio
WHERE p.stato != 'archiviato';

-- 3. PERMISSIONI
GRANT SELECT ON public.vw_storico_noleggi TO authenticated;
GRANT SELECT ON public.vw_preventivi_completi TO authenticated;

-- 4. INDICI UTILI
CREATE INDEX IF NOT EXISTS idx_noleggi_storico_tipo ON public.noleggi_storico (tipo_evento);
CREATE INDEX IF NOT EXISTS idx_prev_noleggi_stato ON public.prev_noleggi (stato);
