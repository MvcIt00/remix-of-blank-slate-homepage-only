-- =========================================
-- FIX 1: Add authentication checks to SECURITY DEFINER trigger functions
-- =========================================

-- Update interventi_insert with auth check and fixed search_path
CREATE OR REPLACE FUNCTION public.interventi_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verify user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  INSERT INTO public."Interventi" (
    codice_intervento,
    id_mezzo,
    id_anagrafica,
    descrizione_intervento,
    stato_intervento,
    stato_preventivo,
    is_cancellato,
    is_fatturato,
    is_chiuso
  ) VALUES (
    NEW.codice_intervento,
    NEW.id_mezzo,
    NEW.id_anagrafica,
    NEW.descrizione_intervento,
    NEW.stato_intervento,
    NEW.stato_preventivo,
    COALESCE(NEW.is_cancellato, false),
    COALESCE(NEW.is_fatturato, false),
    COALESCE(NEW.is_chiuso, false)
  );
  RETURN NEW;
END;
$$;

-- Update interventi_update with auth check and fixed search_path
CREATE OR REPLACE FUNCTION public.interventi_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verify user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  UPDATE public."Interventi"
  SET 
    codice_intervento = NEW.codice_intervento,
    id_mezzo = NEW.id_mezzo,
    id_anagrafica = NEW.id_anagrafica,
    descrizione_intervento = NEW.descrizione_intervento,
    stato_intervento = NEW.stato_intervento,
    stato_preventivo = NEW.stato_preventivo,
    is_cancellato = NEW.is_cancellato,
    is_fatturato = NEW.is_fatturato,
    is_chiuso = NEW.is_chiuso
  WHERE id_intervento = OLD.id_intervento;
  RETURN NEW;
END;
$$;

-- Update interventi_delete with auth check and fixed search_path
CREATE OR REPLACE FUNCTION public.interventi_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verify user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  DELETE FROM public."Interventi"
  WHERE id_intervento = OLD.id_intervento;
  RETURN OLD;
END;
$$;

-- =========================================
-- FIX 2: Recreate views with security_invoker='on'
-- =========================================

-- 1. interventi view
DROP VIEW IF EXISTS public.interventi;
CREATE VIEW public.interventi
WITH (security_invoker = on) AS
SELECT 
  id_intervento,
  id_mezzo,
  id_anagrafica,
  codice_intervento,
  descrizione_intervento,
  is_chiuso,
  is_fatturato,
  is_cancellato,
  created_at,
  stato_intervento,
  stato_preventivo
FROM public."Interventi";

-- Recreate triggers on the interventi view
CREATE TRIGGER interventi_insert_trigger
INSTEAD OF INSERT ON public.interventi
FOR EACH ROW
EXECUTE FUNCTION public.interventi_insert();

CREATE TRIGGER interventi_update_trigger
INSTEAD OF UPDATE ON public.interventi
FOR EACH ROW
EXECUTE FUNCTION public.interventi_update();

CREATE TRIGGER interventi_delete_trigger
INSTEAD OF DELETE ON public.interventi
FOR EACH ROW
EXECUTE FUNCTION public.interventi_delete();

-- 2. vw_anagrafiche_owners view
DROP VIEW IF EXISTS public.vw_anagrafiche_owners;
CREATE VIEW public.vw_anagrafiche_owners
WITH (security_invoker = on) AS
SELECT
  id_anagrafica,
  ragione_sociale,
  partita_iva,
  is_owner,
  is_fornitore,
  is_cliente
FROM public."Anagrafiche"
WHERE is_cancellato = false AND is_owner = true;

-- 3. vw_lav_tecnici_count view
DROP VIEW IF EXISTS public.vw_lav_tecnici_count CASCADE;
CREATE VIEW public.vw_lav_tecnici_count
WITH (security_invoker = on) AS
SELECT 
  lt.id_lavorazione,
  COUNT(*) as n_tecnici_assegnati,
  ARRAY_AGG(CONCAT(t.nome, ' ', t.cognome)) as nomi_tecnici
FROM public.lav_tecnici lt
JOIN public.tecnici t ON lt.id_tecnico = t.id_tecnico
GROUP BY lt.id_lavorazione;

-- 4. vw_int_lavorazioni_dettaglio view (depends on vw_lav_tecnici_count)
DROP VIEW IF EXISTS public.vw_int_lavorazioni_dettaglio CASCADE;
CREATE VIEW public.vw_int_lavorazioni_dettaglio
WITH (security_invoker = on) AS
SELECT 
  l.id_lavorazione,
  l.id_intervento,
  l.nome_lavorazione,
  l.descrizione_lavorazione,
  l.data_da_prevista,
  l.data_a_prevista,
  l.data_effettiva,
  l.durata_prevista,
  l.n_tecnici_previsti,
  l.prezzo_lavorazione,
  l.prezzo_manodopera,
  l.stato_lavorazione,
  l.competenza_lavorazione,
  l.is_completato,
  l.created_at,
  COALESCE(tc.n_tecnici_assegnati, 0) as n_tecnici_assegnati,
  tc.nomi_tecnici
FROM public.int_lavorazioni l
LEFT JOIN public.vw_lav_tecnici_count tc ON l.id_lavorazione = tc.id_lavorazione
WHERE l.is_cancellato = false;

-- 5. vw_gestione_interventi view
DROP VIEW IF EXISTS public.vw_gestione_interventi;
CREATE VIEW public.vw_gestione_interventi
WITH (security_invoker = on) AS
SELECT 
  i.id_intervento,
  i.id_mezzo,
  i.id_anagrafica,
  i.codice_intervento,
  i.descrizione_intervento,
  i.stato_intervento,
  i.stato_preventivo,
  i.is_chiuso,
  i.is_fatturato,
  i.created_at,
  a.ragione_sociale,
  a.partita_iva,
  m.marca,
  m.modello,
  m.matricola,
  m.id_interno,
  m.categoria as mezzo_categoria,
  m.stato_funzionamento,
  m.ubicazione,
  COUNT(DISTINCT l.id_lavorazione) as n_lavorazioni,
  MIN(l.data_da_prevista) as prima_data_prevista,
  MAX(l.data_a_prevista) as ultima_data_prevista,
  SUM(COALESCE(l.n_tecnici_previsti, 0)) as totale_tecnici_previsti,
  SUM(COALESCE(ld.n_tecnici_assegnati, 0)) as totale_tecnici_assegnati,
  STRING_AGG(DISTINCT array_to_string(ld.nomi_tecnici, ', '), ', ') as nomi_tecnici_aggregati
FROM public."Interventi" i
LEFT JOIN public."Anagrafiche" a ON i.id_anagrafica = a.id_anagrafica
LEFT JOIN public."Mezzi" m ON i.id_mezzo = m.id_mezzo
LEFT JOIN public.int_lavorazioni l ON i.id_intervento = l.id_intervento AND l.is_cancellato = false
LEFT JOIN public.vw_int_lavorazioni_dettaglio ld ON l.id_lavorazione = ld.id_lavorazione
WHERE i.is_cancellato = false
GROUP BY 
  i.id_intervento, i.id_mezzo, i.id_anagrafica, i.codice_intervento,
  i.descrizione_intervento, i.stato_intervento, i.stato_preventivo,
  i.is_chiuso, i.is_fatturato, i.created_at,
  a.ragione_sociale, a.partita_iva,
  m.marca, m.modello, m.matricola, m.id_interno, m.categoria,
  m.stato_funzionamento, m.ubicazione;

-- 6. vw_mezzi_guasti view (uses correct enum values: intervenire, ritirare)
DROP VIEW IF EXISTS public.vw_mezzi_guasti;
CREATE VIEW public.vw_mezzi_guasti
WITH (security_invoker = on) AS
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

-- 7. vw_mezzo_completo view
DROP VIEW IF EXISTS public.vw_mezzo_completo;
CREATE VIEW public.vw_mezzo_completo
WITH (security_invoker = on) AS
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

-- 8. vw_mezzo_noleggi_attivi view
DROP VIEW IF EXISTS public.vw_mezzo_noleggi_attivi;
CREATE VIEW public.vw_mezzo_noleggi_attivi
WITH (security_invoker = on) AS
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

-- 9. vw_mezzo_subnoleggi_attivi view
DROP VIEW IF EXISTS public.vw_mezzo_subnoleggi_attivi;
CREATE VIEW public.vw_mezzo_subnoleggi_attivi
WITH (security_invoker = on) AS
SELECT 
  s.id_subnoleggio,
  s.id_mezzo,
  s.data_inizio,
  s.data_fine,
  s.tempo_indeterminato,
  s.costo_subnoleggio,
  s.valore_residuo,
  s.created_at,
  a.ragione_sociale as fornitore
FROM public."Subnoleggi" s
LEFT JOIN public."Anagrafiche" a ON s.id_anagrafica = a.id_anagrafica
WHERE s.is_cancellato = false;

-- 10. vw_sedi_per_anagrafica view
DROP VIEW IF EXISTS public.vw_sedi_per_anagrafica;
CREATE VIEW public.vw_sedi_per_anagrafica
WITH (security_invoker = on) AS
SELECT 
  s.id_sede,
  s.id_anagrafica,
  s.nome_sede,
  s.indirizzo,
  s.citta,
  s.provincia,
  s.cap,
  a.ragione_sociale as anagrafica_nome,
  CONCAT_WS(', ', s.indirizzo, s.citta, s.provincia) as ubicazione_completa
FROM public."Sedi" s
LEFT JOIN public."Anagrafiche" a ON s.id_anagrafica = a.id_anagrafica
WHERE s.is_cancellato = false;

-- 11. vw_sedi_tutte view
DROP VIEW IF EXISTS public.vw_sedi_tutte;
CREATE VIEW public.vw_sedi_tutte
WITH (security_invoker = on) AS
SELECT 
  s.id_sede,
  s.nome_sede,
  s.indirizzo,
  s.citta,
  s.provincia,
  s.cap,
  CONCAT_WS(', ', s.indirizzo, s.citta, s.provincia) as ubicazione_completa
FROM public."Sedi" s
WHERE s.is_cancellato = false;