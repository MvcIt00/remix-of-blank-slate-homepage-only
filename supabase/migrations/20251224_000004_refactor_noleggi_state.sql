-- ==============================================================================
-- MIGRATION: 20251224_000004_refactor_noleggi_state.sql
-- DESCRIZIONE: Refactoring COMPLETO architettura Stato Noleggio.
--              Gestisce le dipendenze a cascata per rimuovere la colonna 'stato_noleggio'.
-- ==============================================================================

-- 1. DROP CASCADE delle VIEW dipendenti
--    Questo eliminerà:
--    - vw_noleggi_completi (dipende da Noleggi.stato_noleggio indirettamente o direttamente)
--    - view 'noleggi' (alias lowercase, che seleziona *)
--    - vw_mezzo_completo (che potrebbe dipendere da Noleggi in alcune definizioni)
DROP VIEW IF EXISTS public.vw_noleggi_completi CASCADE;
DROP VIEW IF EXISTS public.noleggi CASCADE;
DROP VIEW IF EXISTS public.vw_mezzi_guasti CASCADE; -- Spesso referenziata in cascata
DROP VIEW IF EXISTS public.vw_mezzo_completo CASCADE;
DROP VIEW IF EXISTS public.vw_mezzo_noleggi_attivi CASCADE;


-- 2. Modifica Tabella Noleggi: Rimozione colonna 'stato_noleggio'
ALTER TABLE public."Noleggi" DROP COLUMN IF EXISTS stato_noleggio;


-- 3. RICREAZIONE VIEW 'noleggi' (Alias Lowercase per Supabase/PostgREST)
CREATE OR REPLACE VIEW public.noleggi WITH (security_invoker = on) AS
SELECT * FROM public."Noleggi";

-- 4. RICREAZIONE TRIGGER per View 'noleggi' (Senza colonna stato_noleggio)

-- 4a. INSERT Trigger Function
CREATE OR REPLACE FUNCTION public.noleggi_view_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public."Noleggi" (
    id_noleggio, id_mezzo, id_anagrafica, sede_operativa, 
    created_at, data_inizio, data_fine, tempo_indeterminato,
    prezzo_noleggio, prezzo_trasporto, contratto, 
    is_cancellato, is_terminato, tipo_canone, note, data_terminazione_effettiva
  ) VALUES (
    COALESCE(NEW.id_noleggio, gen_random_uuid()), NEW.id_mezzo, NEW.id_anagrafica, NEW.sede_operativa,
    COALESCE(NEW.created_at, now()), NEW.data_inizio, NEW.data_fine, NEW.tempo_indeterminato,
    NEW.prezzo_noleggio, NEW.prezzo_trasporto, NEW.contratto,
    COALESCE(NEW.is_cancellato, false), COALESCE(NEW.is_terminato, false), 
    COALESCE(NEW.tipo_canone, 'mensile'::public.tipo_canone), NEW.note, NEW.data_terminazione_effettiva
  ) RETURNING * INTO NEW;
  RETURN NEW;
END;
$$;

-- 4b. UPDATE Trigger Function
CREATE OR REPLACE FUNCTION public.noleggi_view_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public."Noleggi" SET
    id_anagrafica = NEW.id_anagrafica,
    id_mezzo = NEW.id_mezzo,
    sede_operativa = NEW.sede_operativa,
    data_inizio = NEW.data_inizio,
    data_fine = NEW.data_fine,
    tempo_indeterminato = NEW.tempo_indeterminato,
    prezzo_noleggio = NEW.prezzo_noleggio,
    prezzo_trasporto = NEW.prezzo_trasporto,
    tipo_canone = NEW.tipo_canone,
    -- stato_noleggio RIMOSSO
    is_terminato = NEW.is_terminato,
    is_cancellato = NEW.is_cancellato,
    contratto = NEW.contratto,
    note = NEW.note,
    data_terminazione_effettiva = NEW.data_terminazione_effettiva
  WHERE id_noleggio = OLD.id_noleggio;
  RETURN NEW;
END;
$$;

-- 4c. DELETE Trigger Function (Invariata ma ricreiamo per sicurezza)
CREATE OR REPLACE FUNCTION public.noleggi_view_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public."Noleggi" WHERE id_noleggio = OLD.id_noleggio;
  RETURN OLD;
END;
$$;

-- 4d. Bind Triggers
DROP TRIGGER IF EXISTS noleggi_view_insert_trigger ON public.noleggi;
CREATE TRIGGER noleggi_view_insert_trigger INSTEAD OF INSERT ON public.noleggi FOR EACH ROW EXECUTE FUNCTION public.noleggi_view_insert();

DROP TRIGGER IF EXISTS noleggi_view_update_trigger ON public.noleggi;
CREATE TRIGGER noleggi_view_update_trigger INSTEAD OF UPDATE ON public.noleggi FOR EACH ROW EXECUTE FUNCTION public.noleggi_view_update();

DROP TRIGGER IF EXISTS noleggi_view_delete_trigger ON public.noleggi;
CREATE TRIGGER noleggi_view_delete_trigger INSTEAD OF DELETE ON public.noleggi FOR EACH ROW EXECUTE FUNCTION public.noleggi_view_delete();


-- 5. RICREAZIONE VIEW INTELLIGENTE 'vw_noleggi_completi'
CREATE OR REPLACE VIEW public.vw_noleggi_completi AS
SELECT 
    n.id_noleggio,
    n.created_at,
    n.data_inizio,
    n.data_fine,
    n.tempo_indeterminato,
    n.prezzo_noleggio,
    n.prezzo_trasporto,
    n.tipo_canone,
    
    -- CALCOLO DINAMICO DELLO STATO (Logic Core)
    CASE
        WHEN n.is_terminato = true THEN 'terminato'::public.stato_noleggio
        WHEN (n.is_cancellato = true) THEN 'archiviato'::public.stato_noleggio
        WHEN (
             n.tempo_indeterminato IS NOT TRUE 
             AND n.data_fine IS NOT NULL 
             AND n.data_fine < CURRENT_DATE
        ) THEN 'scaduto'::public.stato_noleggio
        WHEN (
             n.data_inizio IS NOT NULL 
             AND n.data_inizio > CURRENT_DATE
        ) THEN 'futuro'::public.stato_noleggio
        ELSE 'attivo'::public.stato_noleggio
    END AS stato_noleggio,

    n.is_terminato,
    n.note,

    -- Dati Mezzo
    m.id_mezzo,
    m.marca as mezzo_marca,
    m.modello as mezzo_modello,
    m.matricola as mezzo_matricola,

    -- Dati Cliente
    a.id_anagrafica,
    a.ragione_sociale as cliente_ragione_sociale,
    a.partita_iva as cliente_piva,
    a.richiede_contratto_noleggio,

    -- Dati Sede
    s.id_sede as id_sede_operativa,
    s.nome_sede as sede_nome,
    s.indirizzo as sede_indirizzo,
    s.citta as sede_citta,
    s.provincia as sede_provincia,

    -- Link Preventivo
    (
      SELECT pn.id_preventivo 
      FROM public."prev_noleggi" pn
      WHERE pn.convertito_in_noleggio_id = n.id_noleggio 
      LIMIT 1
    ) as id_preventivo,

    -- Info Contratti (JSON)
    (
      SELECT row_to_json(dn.*) 
      FROM public.documenti_noleggio dn 
      WHERE dn.id_noleggio = n.id_noleggio 
        AND dn.is_cancellato IS NOT TRUE 
        AND dn.tipo_documento = 'contratto_firmato'
      ORDER BY dn.created_at DESC 
      LIMIT 1
    ) as contratto_firmato_info,

    (
      SELECT row_to_json(cn.*) 
      FROM public.contratti_noleggio cn 
      WHERE cn.id_noleggio = n.id_noleggio 
        AND cn.is_cancellato IS NOT TRUE
      ORDER BY cn.created_at DESC 
      LIMIT 1
    ) as contratto_bozza_info

FROM public."Noleggi" n
LEFT JOIN public."Mezzi" m ON n.id_mezzo = m.id_mezzo
LEFT JOIN public."Anagrafiche" a ON n.id_anagrafica = a.id_anagrafica
LEFT JOIN public."Sedi" s ON n.sede_operativa = s.id_sede
WHERE (n.is_cancellato IS NOT TRUE);

-- Commento
COMMENT ON VIEW public.vw_noleggi_completi IS 
'View Refactored: Stato Noleggio calcolato dinamicamente. Nessuna dipendenza da colonne statiche.';


-- 6. RIPRISTINO ALTRE VIEW DROPPATE (Definizioni originali prese da file precedenti)

-- 6a. vw_mezzi_guasti
CREATE VIEW public.vw_mezzi_guasti WITH (security_invoker = on) AS
SELECT 
  m.id_mezzo,
  m.id_anagrafica,
  m.id_interno,
  m.marca,
  m.modello,
  m.matricola,
  m.stato_funzionamento,
  m.stato_funzionamento_descrizione,
  m.ubicazione,
  m.id_sede_ubicazione,
  a.ragione_sociale as proprietario,
  (SELECT COUNT(*) FROM public."Interventi" i 
   WHERE i.id_mezzo = m.id_mezzo 
   AND i.is_cancellato = false 
   AND i.is_chiuso = false) as num_interventi_attivi
FROM public."Mezzi" m
LEFT JOIN public."Anagrafiche" a ON m.id_anagrafica = a.id_anagrafica
WHERE m.is_cancellato = false 
AND m.stato_funzionamento IN ('intervenire', 'ritirare');

-- 6b. vw_mezzo_completo
CREATE VIEW public.vw_mezzo_completo WITH (security_invoker = on) AS
SELECT 
  m.id_mezzo,
  m.id_interno,
  m.marca,
  m.modello,
  m.matricola,
  m.anno,
  m.categoria,
  m.stato_funzionamento,
  m.stato_funzionamento_descrizione,
  m.ubicazione,
  m.ore_moto,
  m.is_disponibile_noleggio,
  m.specifiche_tecniche,
  a.ragione_sociale as proprietario,
  sa.nome_sede as sede_assegnata_nome,
  sa.citta as sede_assegnata_citta,
  sa.indirizzo as sede_assegnata_indirizzo,
  su.nome_sede as sede_ubicazione_nome,
  su.citta as sede_ubicazione_citta
FROM public."Mezzi" m
LEFT JOIN public."Anagrafiche" a ON m.id_anagrafica = a.id_anagrafica
LEFT JOIN public."Sedi" sa ON m.id_sede_assegnata = sa.id_sede
LEFT JOIN public."Sedi" su ON m.id_sede_ubicazione = su.id_sede
WHERE m.is_cancellato = false;

-- 6c. vw_mezzo_noleggi_attivi
CREATE VIEW public.vw_mezzo_noleggi_attivi WITH (security_invoker = on) AS
SELECT 
  n.id_noleggio,
  n.id_mezzo,
  n.data_inizio,
  n.data_fine,
  n.tempo_indeterminato,
  n.prezzo_noleggio,
  n.prezzo_trasporto,
  n.tipo_canone,
  n.created_at,
  a.ragione_sociale as cliente
FROM public."Noleggi" n
LEFT JOIN public."Anagrafiche" a ON n.id_anagrafica = a.id_anagrafica
WHERE n.is_cancellato = false AND n.is_terminato = false;
