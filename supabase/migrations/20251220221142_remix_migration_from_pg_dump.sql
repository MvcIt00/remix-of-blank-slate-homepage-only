CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: categoria_mezzo; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.categoria_mezzo AS ENUM (
    'sollevamento',
    'trasporto',
    'escavazione',
    'compattazione',
    'altro'
);


--
-- Name: categoria_uscita; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.categoria_uscita AS ENUM (
    'Spese Bancarie',
    'Fornitori',
    'Tasse/Imposte',
    'Varie'
);


--
-- Name: categorie_prodotti; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.categorie_prodotti AS ENUM (
    'ricambio',
    'componente',
    'materiale_consumo',
    'attrezzatura',
    'altro'
);


--
-- Name: competenza_lavorazione; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.competenza_lavorazione AS ENUM (
    'meccanica',
    'elettrica',
    'idraulica',
    'generale'
);


--
-- Name: modalita_pagamento; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.modalita_pagamento AS ENUM (
    'bonifico_anticipato',
    'bonifico_30gg',
    'bonifico_60gg',
    'bonifico_90gg',
    'riba_30gg',
    'riba_60gg',
    'riba_90gg',
    'rimessa_diretta',
    'contrassegno'
);


--
-- Name: stato_contratto; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.stato_contratto AS ENUM (
    'bozza',
    'inviato',
    'firmato',
    'attivo',
    'annullato'
);


--
-- Name: stato_funzionamento; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.stato_funzionamento AS ENUM (
    'funzionante',
    'intervenire',
    'ritirare'
);


--
-- Name: stato_intervento; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.stato_intervento AS ENUM (
    'aperto',
    'in lavorazione',
    'chiuso',
    'preventivazione'
);


--
-- Name: stato_lavorazione; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.stato_lavorazione AS ENUM (
    'prevista',
    'aperta',
    'in lavorazione',
    'chiusa',
    'pronta',
    'assegnata',
    'in_lavorazione',
    'completata'
);


--
-- Name: stato_noleggio; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.stato_noleggio AS ENUM (
    'futuro',
    'attivo',
    'scaduto'
);


--
-- Name: stato_preventivo; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.stato_preventivo AS ENUM (
    'non preventivato',
    'bozza',
    'inviato',
    'approvato',
    'rifiutato'
);


--
-- Name: tipo_canone; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_canone AS ENUM (
    'giornaliero',
    'mensile'
);


--
-- Name: tipo_documento_noleggio; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_documento_noleggio AS ENUM (
    'contratto_firmato',
    'verbale_consegna',
    'ddt',
    'foto_consegna',
    'foto_ritiro',
    'altro'
);


--
-- Name: tipo_evento_storico; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_evento_storico AS ENUM (
    'creazione',
    'modifica',
    'terminazione',
    'cancellazione',
    'riattivazione',
    'cambio_sede'
);


--
-- Name: tipo_movimento; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_movimento AS ENUM (
    'BONIFICO',
    'RICEVUTA_BANCARIA',
    'ASSEGNO',
    'CONTANTI',
    'ALTRO'
);


--
-- Name: tipo_transazione; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_transazione AS ENUM (
    'ENTRATA',
    'USCITA',
    'TRASFERIMENTO'
);


--
-- Name: capture_noleggio_storico(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.capture_noleggio_storico() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_tipo_evento tipo_evento_storico;
  v_ragione_sociale text;
  v_mezzo_desc text;
  v_sede_desc text;
  v_sede_precedente_desc text;
  v_should_create_record boolean := false;
  v_data_fine_periodo date;
  v_data_inizio_periodo date;
BEGIN
  -- Skip if this is a reactivation (from terminated to active) - handled by app deleting storico record
  IF TG_OP = 'UPDATE' AND NEW.is_terminato = false AND OLD.is_terminato = true THEN
    RETURN NEW;
  END IF;

  -- Get client name
  SELECT ragione_sociale INTO v_ragione_sociale
  FROM "Anagrafiche"
  WHERE id_anagrafica = NEW.id_anagrafica;

  -- Get vehicle description
  SELECT CONCAT_WS(' - ', id_interno, marca, modello, matricola) INTO v_mezzo_desc
  FROM "Mezzi"
  WHERE id_mezzo = NEW.id_mezzo;

  -- Get current sede description
  IF NEW.sede_operativa IS NOT NULL THEN
    SELECT CONCAT_WS(', ', nome_sede, indirizzo, citta) INTO v_sede_desc
    FROM "Sedi"
    WHERE id_sede = NEW.sede_operativa;
  END IF;

  -- Case 1: Termination - create record for the completed period
  IF TG_OP = 'UPDATE' AND NEW.is_terminato = true AND (OLD.is_terminato = false OR OLD.is_terminato IS NULL) THEN
    v_tipo_evento := 'terminazione';
    v_should_create_record := true;
    v_data_inizio_periodo := OLD.data_inizio;
    v_data_fine_periodo := COALESCE(NEW.data_terminazione_effettiva, CURRENT_DATE);

  -- Case 2: Sede change on active rental - close previous period, start new one
  ELSIF TG_OP = 'UPDATE' AND 
        NEW.sede_operativa IS DISTINCT FROM OLD.sede_operativa AND 
        OLD.sede_operativa IS NOT NULL AND
        (NEW.is_terminato = false OR NEW.is_terminato IS NULL) AND
        (OLD.is_terminato = false OR OLD.is_terminato IS NULL) THEN
    v_tipo_evento := 'cambio_sede';
    v_should_create_record := true;
    v_data_inizio_periodo := OLD.data_inizio;
    v_data_fine_periodo := CURRENT_DATE;
    
    -- Get previous sede description
    SELECT CONCAT_WS(', ', nome_sede, indirizzo, citta) INTO v_sede_precedente_desc
    FROM "Sedi"
    WHERE id_sede = OLD.sede_operativa;
    
    -- Update the rental's data_inizio to today (new period starts)
    NEW.data_inizio := CURRENT_DATE;

  -- Case 3: Cancellation
  ELSIF TG_OP = 'UPDATE' AND NEW.is_cancellato = true AND (OLD.is_cancellato = false OR OLD.is_cancellato IS NULL) THEN
    v_tipo_evento := 'cancellazione';
    v_should_create_record := true;
    v_data_inizio_periodo := OLD.data_inizio;
    v_data_fine_periodo := CURRENT_DATE;
  END IF;

  -- Only insert if we should create a record
  IF v_should_create_record THEN
    INSERT INTO noleggi_storico (
      id_noleggio,
      id_anagrafica,
      id_mezzo,
      sede_operativa,
      data_inizio,
      data_fine,
      data_fine_periodo,
      sede_precedente_id,
      sede_precedente_descrizione,
      tempo_indeterminato,
      prezzo_noleggio,
      prezzo_trasporto,
      contratto,
      stato_noleggio,
      is_terminato,
      tipo_canone,
      tipo_evento,
      ragione_sociale_cliente,
      mezzo_descrizione,
      sede_operativa_descrizione,
      note,
      data_terminazione_effettiva
    ) VALUES (
      NEW.id_noleggio,
      NEW.id_anagrafica,
      NEW.id_mezzo,
      CASE WHEN v_tipo_evento = 'cambio_sede' THEN OLD.sede_operativa ELSE NEW.sede_operativa END,
      v_data_inizio_periodo,
      CASE WHEN v_tipo_evento = 'cambio_sede' THEN OLD.data_fine ELSE NEW.data_fine END,
      v_data_fine_periodo,
      CASE WHEN v_tipo_evento = 'cambio_sede' THEN OLD.sede_operativa ELSE NULL END,
      v_sede_precedente_desc,
      CASE WHEN v_tipo_evento = 'cambio_sede' THEN OLD.tempo_indeterminato ELSE NEW.tempo_indeterminato END,
      CASE WHEN v_tipo_evento = 'cambio_sede' THEN OLD.prezzo_noleggio ELSE NEW.prezzo_noleggio END,
      CASE WHEN v_tipo_evento = 'cambio_sede' THEN OLD.prezzo_trasporto ELSE NEW.prezzo_trasporto END,
      NEW.contratto,
      NEW.stato_noleggio,
      NEW.is_terminato,
      CASE WHEN v_tipo_evento = 'cambio_sede' THEN OLD.tipo_canone ELSE NEW.tipo_canone END,
      v_tipo_evento,
      v_ragione_sociale,
      v_mezzo_desc,
      CASE WHEN v_tipo_evento = 'cambio_sede' THEN v_sede_precedente_desc ELSE v_sede_desc END,
      NEW.note,
      NEW.data_terminazione_effettiva
    );
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: generate_codice_contratto(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_codice_contratto() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  anno_corrente TEXT;
  numero_contratto INTEGER;
BEGIN
  anno_corrente := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  SELECT COALESCE(MAX(
    CASE 
      WHEN codice_contratto LIKE 'CTR_' || anno_corrente || '_%' 
      THEN SUBSTRING(codice_contratto FROM LENGTH('CTR_' || anno_corrente || '_') + 1)::INTEGER
      ELSE 0
    END
  ), 0) + 1
  INTO numero_contratto
  FROM public.contratti_noleggio;
  
  NEW.codice_contratto := 'CTR_' || anno_corrente || '_' || LPAD(numero_contratto::TEXT, 4, '0');
  
  RETURN NEW;
END;
$$;


--
-- Name: generate_codice_intervento(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_codice_intervento() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  anno_corrente TEXT;
  numero_intervento INTEGER;
BEGIN
  -- Get current year
  anno_corrente := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  -- Get next intervention number for this year
  SELECT COALESCE(MAX(
    CASE 
      WHEN codice_intervento LIKE 'INT_' || anno_corrente || '_%' 
      THEN SUBSTRING(codice_intervento FROM LENGTH('INT_' || anno_corrente || '_') + 1)::INTEGER
      ELSE 0
    END
  ), 0) + 1
  INTO numero_intervento
  FROM public."Interventi";
  
  -- Generate codice_intervento with format INT_YYYY_N
  NEW.codice_intervento := 'INT_' || anno_corrente || '_' || numero_intervento::TEXT;
  
  RETURN NEW;
END;
$$;


--
-- Name: interventi_delete(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.interventi_delete() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  DELETE FROM public."Interventi"
  WHERE id_intervento = OLD.id_intervento;
  RETURN OLD;
END;
$$;


--
-- Name: interventi_insert(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.interventi_insert() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
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


--
-- Name: interventi_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.interventi_update() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
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


--
-- Name: update_aggiornato_il(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_aggiornato_il() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.aggiornato_il = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_lavorazione_stato(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_lavorazione_stato() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_n_tecnici_previsti INTEGER;
  v_n_tecnici_assegnati INTEGER;
  v_nuovo_stato stato_lavorazione;
BEGIN
  -- Get the expected number of technicians for this lavorazione
  SELECT n_tecnici_previsti INTO v_n_tecnici_previsti
  FROM public.int_lavorazioni
  WHERE id_lavorazione = COALESCE(NEW.id_lavorazione, OLD.id_lavorazione);
  
  -- Count assigned technicians
  SELECT COUNT(*) INTO v_n_tecnici_assegnati
  FROM public.lav_tecnici
  WHERE id_lavorazione = COALESCE(NEW.id_lavorazione, OLD.id_lavorazione);
  
  -- Determine new status
  IF v_n_tecnici_assegnati = 0 THEN
    v_nuovo_stato := 'pronta';
  ELSIF v_n_tecnici_assegnati >= COALESCE(v_n_tecnici_previsti, 0) AND v_n_tecnici_previsti > 0 THEN
    v_nuovo_stato := 'assegnata';
  ELSE
    v_nuovo_stato := 'pronta';
  END IF;
  
  -- Update the lavorazione status
  UPDATE public.int_lavorazioni
  SET stato_lavorazione = v_nuovo_stato
  WHERE id_lavorazione = COALESCE(NEW.id_lavorazione, OLD.id_lavorazione)
    AND stato_lavorazione != 'completata'; -- Don't override completed status
  
  RETURN COALESCE(NEW, OLD);
END;
$$;


--
-- Name: update_ubicazione(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_ubicazione() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF NEW.id_sede_ubicazione IS DISTINCT FROM OLD.id_sede_ubicazione THEN
    -- Get sede information to update ubicazione text with indirizzo, città, provincia
    SELECT CONCAT_WS(', ',
      COALESCE(NULLIF(indirizzo, ''), NULL),
      COALESCE(NULLIF(citta, ''), NULL),
      COALESCE(NULLIF(provincia, ''), NULL)
    )
    INTO NEW.ubicazione
    FROM public."Sedi"
    WHERE id_sede = NEW.id_sede_ubicazione;
  END IF;
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: Anagrafiche; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Anagrafiche" (
    id_anagrafica uuid DEFAULT gen_random_uuid() NOT NULL,
    ragione_sociale text NOT NULL,
    partita_iva text,
    is_cliente boolean,
    is_fornitore boolean,
    is_owner boolean,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_cancellato boolean DEFAULT false,
    richiede_contratto_noleggio boolean DEFAULT true
);


--
-- Name: Interventi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Interventi" (
    id_intervento uuid DEFAULT gen_random_uuid() NOT NULL,
    id_mezzo uuid NOT NULL,
    id_anagrafica uuid,
    codice_intervento text,
    descrizione_intervento text,
    is_chiuso boolean DEFAULT false NOT NULL,
    is_fatturato boolean DEFAULT false NOT NULL,
    is_cancellato boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    stato_intervento public.stato_intervento,
    stato_preventivo public.stato_preventivo
);


--
-- Name: Mezzi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Mezzi" (
    id_mezzo uuid DEFAULT gen_random_uuid() NOT NULL,
    id_anagrafica uuid,
    id_sede_assegnata uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    stato_funzionamento_descrizione text,
    stato_funzionamento public.stato_funzionamento,
    marca text,
    modello text,
    matricola text,
    id_interno text,
    anno text,
    categoria public.categoria_mezzo,
    id_sede_ubicazione uuid,
    ore_moto numeric,
    ubicazione text,
    specifiche_tecniche jsonb,
    is_cancellato boolean DEFAULT false,
    is_disponibile_noleggio boolean DEFAULT false
);


--
-- Name: Noleggi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Noleggi" (
    id_noleggio uuid DEFAULT gen_random_uuid() NOT NULL,
    id_mezzo uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    id_anagrafica uuid NOT NULL,
    sede_operativa uuid,
    data_inizio date,
    data_fine date,
    tempo_indeterminato boolean,
    prezzo_noleggio numeric,
    prezzo_trasporto numeric,
    contratto text,
    is_cancellato boolean DEFAULT false,
    stato_noleggio public.stato_noleggio,
    is_terminato boolean DEFAULT false NOT NULL,
    tipo_canone public.tipo_canone DEFAULT 'mensile'::public.tipo_canone,
    note text,
    data_terminazione_effettiva date
);


--
-- Name: Porti; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Porti" (
    id_porto uuid DEFAULT gen_random_uuid() NOT NULL,
    nome_porto text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_cancellato boolean DEFAULT false
);


--
-- Name: Preventivi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Preventivi" (
    id_preventivo uuid DEFAULT gen_random_uuid() NOT NULL,
    id_anagrafica uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_cancellato boolean DEFAULT false
);


--
-- Name: Prodotti; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Prodotti" (
    id_prodotto uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    codice text,
    nome text,
    descrizione jsonb,
    marca text,
    modello text,
    categoria public.categorie_prodotti,
    is_cancellato boolean DEFAULT false,
    costo_prodotto numeric,
    prezzo_prodotto numeric
);


--
-- Name: Sedi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Sedi" (
    id_sede uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    id_anagrafica uuid,
    is_legale boolean,
    is_operativa boolean,
    indirizzo text,
    citta text,
    provincia text,
    cap numeric,
    nome_sede text,
    id_porto uuid,
    is_nave boolean,
    is_banchina boolean,
    is_officina boolean,
    is_cancellato boolean DEFAULT false
);


--
-- Name: Subnoleggi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Subnoleggi" (
    id_subnoleggio uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    id_anagrafica uuid NOT NULL,
    id_mezzo uuid NOT NULL,
    data_inizio date,
    data_fine date,
    tempo_indeterminato boolean,
    costo_subnoleggio numeric,
    valore_residuo numeric,
    contratto text,
    is_cancellato boolean DEFAULT false
);


--
-- Name: an_contatti; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.an_contatti (
    id_anagrafica uuid NOT NULL,
    id_sede uuid,
    nome text,
    email text,
    telefono text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_aziendale boolean,
    is_referente boolean,
    id_contatto uuid DEFAULT gen_random_uuid() NOT NULL,
    is_cancellato boolean DEFAULT false
);


--
-- Name: an_dati_amministrativi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.an_dati_amministrativi (
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    id_anagrafica uuid NOT NULL,
    pec text,
    codice_univoco text,
    iban text,
    pagamento text,
    partita_iva_estera text,
    esente_iva boolean,
    is_cancellato boolean DEFAULT false,
    prezzo_manodopera numeric
);


--
-- Name: conti_bancari; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conti_bancari (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    nome_banca text NOT NULL,
    iban text,
    saldo_attuale numeric DEFAULT 0 NOT NULL,
    creato_il timestamp with time zone DEFAULT now() NOT NULL,
    aggiornato_il timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: contratti_noleggio; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contratti_noleggio (
    id_contratto uuid DEFAULT gen_random_uuid() NOT NULL,
    codice_contratto text NOT NULL,
    id_noleggio uuid NOT NULL,
    id_anagrafica_cliente uuid NOT NULL,
    id_anagrafica_fornitore uuid NOT NULL,
    dati_cliente jsonb NOT NULL,
    dati_fornitore jsonb NOT NULL,
    dati_mezzo jsonb NOT NULL,
    data_inizio date NOT NULL,
    data_fine date,
    tempo_indeterminato boolean DEFAULT false,
    canone_noleggio numeric(10,2),
    tipo_canone public.tipo_canone,
    costo_trasporto numeric(10,2),
    deposito_cauzionale numeric(10,2),
    modalita_pagamento public.modalita_pagamento,
    termini_pagamento text,
    clausole_speciali text,
    note_interne text,
    pdf_bozza_path text,
    pdf_firmato_path text,
    stato_contratto public.stato_contratto DEFAULT 'bozza'::public.stato_contratto,
    data_creazione timestamp with time zone DEFAULT now(),
    data_invio timestamp with time zone,
    data_firma timestamp with time zone,
    is_cancellato boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: documenti_noleggio; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documenti_noleggio (
    id_documento uuid DEFAULT gen_random_uuid() NOT NULL,
    id_noleggio uuid NOT NULL,
    tipo_documento public.tipo_documento_noleggio NOT NULL,
    file_path text NOT NULL,
    nome_file_originale text,
    dimensione_bytes bigint,
    descrizione text,
    data_documento date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now(),
    is_cancellato boolean DEFAULT false
);


--
-- Name: frn_mezzi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.frn_mezzi (
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    id_anagrafica uuid NOT NULL,
    is_cancellato boolean DEFAULT false
);


--
-- Name: frn_ricambi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.frn_ricambi (
    id_anagrafica uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    sconto numeric,
    is_cancellato boolean DEFAULT false
);


--
-- Name: frn_servizi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.frn_servizi (
    id_anagrafica uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    tariffa_oraria numeric,
    is_cancellato boolean DEFAULT false
);


--
-- Name: frn_trasporti; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.frn_trasporti (
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    id_anagrafica uuid NOT NULL,
    is_cancellato boolean DEFAULT false
);


--
-- Name: int_lav_prod; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.int_lav_prod (
    id_lav_prod uuid DEFAULT gen_random_uuid() NOT NULL,
    id_lavorazione uuid,
    id_prodotto uuid,
    n_prodotto_uscita_prevista numeric,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    costo_prodotto_lavorazione numeric,
    prezzo_prodotto_lavorazione numeric
);


--
-- Name: int_lavorazioni; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.int_lavorazioni (
    id_lavorazione uuid DEFAULT gen_random_uuid() NOT NULL,
    id_intervento uuid,
    nome_lavorazione text,
    descrizione_lavorazione text,
    data_da_prevista date,
    data_a_prevista date,
    durata_prevista text,
    n_tecnici_previsti numeric,
    competenza_lavorazione public.competenza_lavorazione,
    prezzo_lavorazione numeric,
    prezzo_manodopera numeric,
    ricambi jsonb,
    is_completato boolean,
    is_cancellato boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    stato_lavorazione public.stato_lavorazione DEFAULT 'prevista'::public.stato_lavorazione,
    data_effettiva date
);


--
-- Name: interventi; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.interventi AS
 SELECT id_intervento,
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


--
-- Name: lav_tecnici; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lav_tecnici (
    id_lav_tecnico uuid DEFAULT gen_random_uuid() NOT NULL,
    id_lavorazione uuid NOT NULL,
    id_tecnico uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: noleggi_storico; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.noleggi_storico (
    id_storico uuid DEFAULT gen_random_uuid() NOT NULL,
    id_noleggio uuid NOT NULL,
    id_anagrafica uuid NOT NULL,
    id_mezzo uuid NOT NULL,
    sede_operativa uuid,
    data_inizio date,
    data_fine date,
    tempo_indeterminato boolean,
    prezzo_noleggio numeric,
    prezzo_trasporto numeric,
    contratto text,
    stato_noleggio public.stato_noleggio,
    is_terminato boolean,
    tipo_canone public.tipo_canone,
    tipo_evento public.tipo_evento_storico NOT NULL,
    data_evento timestamp with time zone DEFAULT now() NOT NULL,
    note_evento text,
    ragione_sociale_cliente text,
    mezzo_descrizione text,
    sede_operativa_descrizione text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    note text,
    data_terminazione_effettiva date,
    data_fine_periodo date,
    sede_precedente_id uuid,
    sede_precedente_descrizione text,
    id uuid GENERATED ALWAYS AS (id_storico) STORED
);


--
-- Name: prev_interventi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prev_interventi (
    id_preventivo uuid NOT NULL,
    id_intervento uuid,
    nome_preventivo text,
    pdf_path text,
    pdf_size bigint,
    pdf_created_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_cancellato boolean DEFAULT false,
    stato_preventivo public.stato_preventivo
);


--
-- Name: tecnici; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tecnici (
    id_tecnico uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text,
    cognome text,
    specializzazione text,
    id_utente uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: transazioni; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transazioni (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tipo public.tipo_transazione NOT NULL,
    descrizione text NOT NULL,
    importo numeric NOT NULL,
    data_scadenza_originale date NOT NULL,
    data_scadenza_mese date NOT NULL,
    data_pagamento date,
    tipo_movimento public.tipo_movimento NOT NULL,
    data_deposito_riba date,
    conto_bancario_id uuid NOT NULL,
    transazione_collegata_id uuid,
    note text,
    creato_il timestamp with time zone DEFAULT now() NOT NULL,
    aggiornato_il timestamp with time zone DEFAULT now() NOT NULL,
    pagato boolean DEFAULT false NOT NULL,
    categoria_uscita public.categoria_uscita
);


--
-- Name: utenti; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.utenti (
    id_utente uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text,
    cognome text,
    email text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: vw_anagrafiche_owners; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_anagrafiche_owners AS
 SELECT id_anagrafica,
    ragione_sociale,
    partita_iva,
    is_owner,
    is_cliente,
    is_fornitore
   FROM public."Anagrafiche"
  WHERE ((is_cancellato = false) AND (is_owner = true))
  ORDER BY ragione_sociale;


--
-- Name: vw_lav_tecnici_count; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_lav_tecnici_count AS
 SELECT lt.id_lavorazione,
    count(lt.id_tecnico) AS n_tecnici_assegnati,
    array_agg(concat(t.nome, ' ', t.cognome) ORDER BY t.nome, t.cognome) FILTER (WHERE (t.id_tecnico IS NOT NULL)) AS nomi_tecnici
   FROM (public.lav_tecnici lt
     LEFT JOIN public.tecnici t ON ((lt.id_tecnico = t.id_tecnico)))
  GROUP BY lt.id_lavorazione;


--
-- Name: vw_int_lavorazioni_dettaglio; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_int_lavorazioni_dettaglio AS
 SELECT il.id_lavorazione,
    il.id_intervento,
    il.nome_lavorazione,
    il.descrizione_lavorazione,
    il.durata_prevista,
    il.data_da_prevista,
    il.data_a_prevista,
    il.data_effettiva,
    il.n_tecnici_previsti,
    il.competenza_lavorazione,
    il.stato_lavorazione,
    il.is_completato,
    il.prezzo_lavorazione,
    il.prezzo_manodopera,
    il.created_at,
    COALESCE(ltc.n_tecnici_assegnati, (0)::bigint) AS n_tecnici_assegnati,
    ltc.nomi_tecnici
   FROM (public.int_lavorazioni il
     LEFT JOIN public.vw_lav_tecnici_count ltc ON ((il.id_lavorazione = ltc.id_lavorazione)))
  WHERE (il.is_cancellato = false);


--
-- Name: vw_gestione_interventi; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_gestione_interventi AS
 SELECT i.id_intervento,
    i.codice_intervento,
    i.descrizione_intervento,
    i.stato_intervento,
    i.stato_preventivo,
    i.created_at,
    i.is_fatturato,
    i.is_chiuso,
    m.id_mezzo,
    m.marca,
    m.modello,
    m.matricola,
    m.id_interno,
    m.ubicazione,
    m.stato_funzionamento,
    m.categoria AS mezzo_categoria,
    a.id_anagrafica,
    a.ragione_sociale,
    a.partita_iva,
    ( SELECT count(*) AS count
           FROM public.int_lavorazioni il
          WHERE ((il.id_intervento = i.id_intervento) AND (il.is_cancellato = false))) AS n_lavorazioni,
    ( SELECT min(il.data_da_prevista) AS min
           FROM public.int_lavorazioni il
          WHERE ((il.id_intervento = i.id_intervento) AND (il.is_cancellato = false))) AS prima_data_prevista,
    ( SELECT max(il.data_a_prevista) AS max
           FROM public.int_lavorazioni il
          WHERE ((il.id_intervento = i.id_intervento) AND (il.is_cancellato = false))) AS ultima_data_prevista,
    ( SELECT COALESCE(sum(il.n_tecnici_previsti), (0)::numeric) AS "coalesce"
           FROM public.int_lavorazioni il
          WHERE ((il.id_intervento = i.id_intervento) AND (il.is_cancellato = false))) AS totale_tecnici_previsti,
    ( SELECT COALESCE(sum(vld.n_tecnici_assegnati), (0)::numeric) AS "coalesce"
           FROM public.vw_int_lavorazioni_dettaglio vld
          WHERE (vld.id_intervento = i.id_intervento)) AS totale_tecnici_assegnati,
    ( SELECT string_agg(DISTINCT sub.nome_tecnico, ', '::text ORDER BY sub.nome_tecnico) AS string_agg
           FROM ( SELECT unnest(vld.nomi_tecnici) AS nome_tecnico
                   FROM public.vw_int_lavorazioni_dettaglio vld
                  WHERE ((vld.id_intervento = i.id_intervento) AND (vld.nomi_tecnici IS NOT NULL))) sub) AS nomi_tecnici_aggregati
   FROM ((public."Interventi" i
     LEFT JOIN public."Mezzi" m ON ((i.id_mezzo = m.id_mezzo)))
     LEFT JOIN public."Anagrafiche" a ON ((i.id_anagrafica = a.id_anagrafica)))
  WHERE (i.is_cancellato = false);


--
-- Name: vw_lavorazioni_complete; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_lavorazioni_complete AS
SELECT
    NULL::uuid AS id_lavorazione,
    NULL::uuid AS id_intervento,
    NULL::text AS nome_lavorazione,
    NULL::text AS descrizione_lavorazione,
    NULL::date AS data_da_prevista,
    NULL::date AS data_a_prevista,
    NULL::text AS durata_prevista,
    NULL::numeric AS n_tecnici_previsti,
    NULL::numeric AS prezzo_lavorazione,
    NULL::numeric AS prezzo_manodopera,
    NULL::public.competenza_lavorazione AS competenza_lavorazione,
    NULL::public.stato_lavorazione AS stato_lavorazione,
    NULL::date AS data_effettiva,
    NULL::boolean AS is_completato,
    NULL::timestamp with time zone AS created_at,
    NULL::json AS prodotti;


--
-- Name: vw_mezzi_guasti; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_mezzi_guasti AS
 SELECT m.id_mezzo,
    m.marca,
    m.modello,
    m.matricola,
    m.id_interno,
    m.stato_funzionamento,
    m.stato_funzionamento_descrizione,
    m.ubicazione,
    m.id_sede_ubicazione,
    m.id_anagrafica,
    a.ragione_sociale AS proprietario,
    count(i.id_intervento) AS num_interventi_attivi
   FROM ((public."Mezzi" m
     LEFT JOIN public."Anagrafiche" a ON ((m.id_anagrafica = a.id_anagrafica)))
     LEFT JOIN public."Interventi" i ON (((m.id_mezzo = i.id_mezzo) AND (i.is_cancellato = false) AND (i.is_chiuso = false))))
  WHERE ((m.is_cancellato = false) AND (m.stato_funzionamento = ANY (ARRAY['intervenire'::public.stato_funzionamento, 'ritirare'::public.stato_funzionamento])))
  GROUP BY m.id_mezzo, m.marca, m.modello, m.matricola, m.id_interno, m.stato_funzionamento, m.stato_funzionamento_descrizione, m.ubicazione, m.id_sede_ubicazione, m.id_anagrafica, a.ragione_sociale
 HAVING (count(i.id_intervento) = 0);


--
-- Name: vw_mezzo_completo; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_mezzo_completo AS
 SELECT m.id_mezzo,
    m.marca,
    m.modello,
    m.matricola,
    m.id_interno,
    m.anno,
    m.categoria,
    m.stato_funzionamento,
    m.stato_funzionamento_descrizione,
    m.ubicazione,
    m.ore_moto,
    m.specifiche_tecniche,
    m.is_disponibile_noleggio,
    prop.ragione_sociale AS proprietario,
    sa.nome_sede AS sede_assegnata_nome,
    sa.citta AS sede_assegnata_citta,
    sa.indirizzo AS sede_assegnata_indirizzo,
    su.nome_sede AS sede_ubicazione_nome,
    su.citta AS sede_ubicazione_citta
   FROM (((public."Mezzi" m
     LEFT JOIN public."Anagrafiche" prop ON ((m.id_anagrafica = prop.id_anagrafica)))
     LEFT JOIN public."Sedi" sa ON ((m.id_sede_assegnata = sa.id_sede)))
     LEFT JOIN public."Sedi" su ON ((m.id_sede_ubicazione = su.id_sede)))
  WHERE (m.is_cancellato = false);


--
-- Name: vw_mezzo_noleggi_attivi; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_mezzo_noleggi_attivi AS
 SELECT n.id_mezzo,
    n.id_noleggio,
    n.data_inizio,
    n.data_fine,
    n.tempo_indeterminato,
    n.prezzo_noleggio,
    n.prezzo_trasporto,
    n.tipo_canone,
    n.created_at,
    a.ragione_sociale AS cliente
   FROM (public."Noleggi" n
     LEFT JOIN public."Anagrafiche" a ON ((n.id_anagrafica = a.id_anagrafica)))
  WHERE ((n.is_cancellato = false) AND (n.is_terminato = false));


--
-- Name: vw_mezzo_subnoleggi_attivi; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_mezzo_subnoleggi_attivi AS
 SELECT s.id_mezzo,
    s.id_subnoleggio,
    s.data_inizio,
    s.data_fine,
    s.tempo_indeterminato,
    s.costo_subnoleggio,
    s.valore_residuo,
    s.created_at,
    a.ragione_sociale AS fornitore
   FROM (public."Subnoleggi" s
     LEFT JOIN public."Anagrafiche" a ON ((s.id_anagrafica = a.id_anagrafica)))
  WHERE (s.is_cancellato = false);


--
-- Name: vw_sedi_per_anagrafica; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_sedi_per_anagrafica AS
 SELECT s.id_sede,
    s.id_anagrafica,
    s.nome_sede,
    s.indirizzo,
    s.citta,
    s.provincia,
    s.cap,
    a.ragione_sociale AS anagrafica_nome,
    concat_ws(', '::text, COALESCE(NULLIF(s.nome_sede, ''::text), NULL::text), COALESCE(NULLIF(s.indirizzo, ''::text), NULL::text), COALESCE(NULLIF(s.citta, ''::text), NULL::text), COALESCE(NULLIF(s.provincia, ''::text), NULL::text)) AS ubicazione_completa
   FROM (public."Sedi" s
     LEFT JOIN public."Anagrafiche" a ON ((s.id_anagrafica = a.id_anagrafica)))
  WHERE (s.is_cancellato = false)
  ORDER BY s.nome_sede, s.citta;


--
-- Name: vw_sedi_tutte; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_sedi_tutte AS
 SELECT id_sede,
    nome_sede,
    indirizzo,
    citta,
    provincia,
    cap,
    concat_ws(', '::text, COALESCE(NULLIF(nome_sede, ''::text), NULL::text), COALESCE(NULLIF(indirizzo, ''::text), NULL::text), COALESCE(NULLIF(citta, ''::text), NULL::text), COALESCE(NULLIF(provincia, ''::text), NULL::text)) AS ubicazione_completa
   FROM public."Sedi"
  WHERE (is_cancellato = false)
  ORDER BY citta, indirizzo;


--
-- Name: Interventi Interventi_codice_intervento_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Interventi"
    ADD CONSTRAINT "Interventi_codice_intervento_key" UNIQUE (codice_intervento);


--
-- Name: Interventi Interventi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Interventi"
    ADD CONSTRAINT "Interventi_pkey" PRIMARY KEY (id_intervento);


--
-- Name: an_contatti an_contatti_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.an_contatti
    ADD CONSTRAINT an_contatti_pkey PRIMARY KEY (id_contatto);


--
-- Name: an_dati_amministrativi an_dati_amministrativi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.an_dati_amministrativi
    ADD CONSTRAINT an_dati_amministrativi_pkey PRIMARY KEY (id_anagrafica);


--
-- Name: Anagrafiche anagrafiche_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Anagrafiche"
    ADD CONSTRAINT anagrafiche_pkey PRIMARY KEY (id_anagrafica);


--
-- Name: conti_bancari conti_bancari_iban_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conti_bancari
    ADD CONSTRAINT conti_bancari_iban_key UNIQUE (iban);


--
-- Name: conti_bancari conti_bancari_nome_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conti_bancari
    ADD CONSTRAINT conti_bancari_nome_key UNIQUE (nome);


--
-- Name: conti_bancari conti_bancari_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conti_bancari
    ADD CONSTRAINT conti_bancari_pkey PRIMARY KEY (id);


--
-- Name: contratti_noleggio contratti_noleggio_codice_contratto_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contratti_noleggio
    ADD CONSTRAINT contratti_noleggio_codice_contratto_key UNIQUE (codice_contratto);


--
-- Name: contratti_noleggio contratti_noleggio_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contratti_noleggio
    ADD CONSTRAINT contratti_noleggio_pkey PRIMARY KEY (id_contratto);


--
-- Name: documenti_noleggio documenti_noleggio_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documenti_noleggio
    ADD CONSTRAINT documenti_noleggio_pkey PRIMARY KEY (id_documento);


--
-- Name: frn_mezzi frn_mezzi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.frn_mezzi
    ADD CONSTRAINT frn_mezzi_pkey PRIMARY KEY (id_anagrafica);


--
-- Name: frn_ricambi frn_ricambi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.frn_ricambi
    ADD CONSTRAINT frn_ricambi_pkey PRIMARY KEY (id_anagrafica);


--
-- Name: frn_servizi frn_servizi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.frn_servizi
    ADD CONSTRAINT frn_servizi_pkey PRIMARY KEY (id_anagrafica);


--
-- Name: frn_trasporti frn_trasporti_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.frn_trasporti
    ADD CONSTRAINT frn_trasporti_pkey PRIMARY KEY (id_anagrafica);


--
-- Name: int_lav_prod int_lav_prod_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.int_lav_prod
    ADD CONSTRAINT int_lav_prod_pkey PRIMARY KEY (id_lav_prod);


--
-- Name: int_lavorazioni int_lavorazioni_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.int_lavorazioni
    ADD CONSTRAINT int_lavorazioni_pkey PRIMARY KEY (id_lavorazione);


--
-- Name: lav_tecnici lav_tecnici_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lav_tecnici
    ADD CONSTRAINT lav_tecnici_pkey PRIMARY KEY (id_lav_tecnico);


--
-- Name: lav_tecnici lav_tecnici_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lav_tecnici
    ADD CONSTRAINT lav_tecnici_unique UNIQUE (id_lavorazione, id_tecnico);


--
-- Name: Mezzi mz_mezzi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Mezzi"
    ADD CONSTRAINT mz_mezzi_pkey PRIMARY KEY (id_mezzo);


--
-- Name: Noleggi noleggi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Noleggi"
    ADD CONSTRAINT noleggi_pkey PRIMARY KEY (id_noleggio);


--
-- Name: noleggi_storico noleggi_storico_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.noleggi_storico
    ADD CONSTRAINT noleggi_storico_pkey PRIMARY KEY (id_storico);


--
-- Name: Porti porti_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Porti"
    ADD CONSTRAINT porti_pkey PRIMARY KEY (id_porto);


--
-- Name: prev_interventi prev_interventi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prev_interventi
    ADD CONSTRAINT prev_interventi_pkey PRIMARY KEY (id_preventivo);


--
-- Name: Preventivi preventivi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Preventivi"
    ADD CONSTRAINT preventivi_pkey PRIMARY KEY (id_preventivo);


--
-- Name: Prodotti prodotti_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Prodotti"
    ADD CONSTRAINT prodotti_pkey PRIMARY KEY (id_prodotto);


--
-- Name: Sedi sd_sedi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Sedi"
    ADD CONSTRAINT sd_sedi_pkey PRIMARY KEY (id_sede);


--
-- Name: Subnoleggi subnoleggi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subnoleggi"
    ADD CONSTRAINT subnoleggi_pkey PRIMARY KEY (id_subnoleggio);


--
-- Name: tecnici tecnici_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tecnici
    ADD CONSTRAINT tecnici_pkey PRIMARY KEY (id_tecnico);


--
-- Name: transazioni transazioni_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transazioni
    ADD CONSTRAINT transazioni_pkey PRIMARY KEY (id);


--
-- Name: utenti utenti_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utenti
    ADD CONSTRAINT utenti_pkey PRIMARY KEY (id_utente);


--
-- Name: idx_an_contatti_id_anagrafica; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_an_contatti_id_anagrafica ON public.an_contatti USING btree (id_anagrafica);


--
-- Name: idx_anagrafiche_cliente; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_anagrafiche_cliente ON public."Anagrafiche" USING btree (is_cliente) WHERE ((is_cancellato = false) AND (is_cliente = true));


--
-- Name: idx_anagrafiche_partita_iva; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_anagrafiche_partita_iva ON public."Anagrafiche" USING btree (partita_iva) WHERE (is_cancellato = false);


--
-- Name: idx_anagrafiche_ragione_sociale; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_anagrafiche_ragione_sociale ON public."Anagrafiche" USING btree (ragione_sociale) WHERE (is_cancellato = false);


--
-- Name: idx_contratti_cliente; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contratti_cliente ON public.contratti_noleggio USING btree (id_anagrafica_cliente);


--
-- Name: idx_contratti_noleggio_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contratti_noleggio_id ON public.contratti_noleggio USING btree (id_noleggio);


--
-- Name: idx_contratti_stato; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contratti_stato ON public.contratti_noleggio USING btree (stato_contratto);


--
-- Name: idx_documenti_noleggio_id_noleggio; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documenti_noleggio_id_noleggio ON public.documenti_noleggio USING btree (id_noleggio);


--
-- Name: idx_documenti_noleggio_tipo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documenti_noleggio_tipo ON public.documenti_noleggio USING btree (tipo_documento);


--
-- Name: idx_int_lav_prod_lavorazione; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_int_lav_prod_lavorazione ON public.int_lav_prod USING btree (id_lavorazione);


--
-- Name: idx_int_lavorazioni_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_int_lavorazioni_created ON public.int_lavorazioni USING btree (created_at);


--
-- Name: idx_int_lavorazioni_intervento; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_int_lavorazioni_intervento ON public.int_lavorazioni USING btree (id_intervento) WHERE (is_cancellato = false);


--
-- Name: idx_interventi_anagrafica; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_interventi_anagrafica ON public."Interventi" USING btree (id_anagrafica) WHERE (is_cancellato = false);


--
-- Name: idx_interventi_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_interventi_created ON public."Interventi" USING btree (created_at DESC) WHERE (is_cancellato = false);


--
-- Name: idx_interventi_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_interventi_created_at ON public."Interventi" USING btree (created_at);


--
-- Name: idx_interventi_id_mezzo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_interventi_id_mezzo ON public."Interventi" USING btree (id_mezzo);


--
-- Name: idx_interventi_mezzo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_interventi_mezzo ON public."Interventi" USING btree (id_mezzo) WHERE (is_cancellato = false);


--
-- Name: idx_interventi_mezzo_attivi; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_interventi_mezzo_attivi ON public."Interventi" USING btree (id_mezzo) WHERE ((is_cancellato = false) AND (is_chiuso = false));


--
-- Name: idx_interventi_mezzo_stato; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_interventi_mezzo_stato ON public."Interventi" USING btree (id_mezzo, is_cancellato, is_chiuso) WHERE ((is_cancellato = false) AND (is_chiuso = false));


--
-- Name: idx_interventi_stato; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_interventi_stato ON public."Interventi" USING btree (stato_intervento) WHERE (is_cancellato = false);


--
-- Name: idx_lav_tecnici_composite; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lav_tecnici_composite ON public.lav_tecnici USING btree (id_lavorazione, id_tecnico);


--
-- Name: idx_lav_tecnici_lavorazione; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lav_tecnici_lavorazione ON public.lav_tecnici USING btree (id_lavorazione);


--
-- Name: idx_lav_tecnici_tecnico; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lav_tecnici_tecnico ON public.lav_tecnici USING btree (id_tecnico);


--
-- Name: idx_lavorazioni_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lavorazioni_date ON public.int_lavorazioni USING btree (data_da_prevista, data_a_prevista) WHERE (is_cancellato = false);


--
-- Name: idx_lavorazioni_intervento; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lavorazioni_intervento ON public.int_lavorazioni USING btree (id_intervento) WHERE (is_cancellato = false);


--
-- Name: idx_lavorazioni_stato; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lavorazioni_stato ON public.int_lavorazioni USING btree (stato_lavorazione) WHERE (is_cancellato = false);


--
-- Name: idx_mezzi_categoria; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mezzi_categoria ON public."Mezzi" USING btree (categoria) WHERE (is_cancellato = false);


--
-- Name: idx_mezzi_id_anagrafica; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mezzi_id_anagrafica ON public."Mezzi" USING btree (id_anagrafica);


--
-- Name: idx_mezzi_id_sede_ubicazione; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mezzi_id_sede_ubicazione ON public."Mezzi" USING btree (id_sede_ubicazione);


--
-- Name: idx_mezzi_sede_ubicazione; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mezzi_sede_ubicazione ON public."Mezzi" USING btree (id_sede_ubicazione) WHERE (is_cancellato = false);


--
-- Name: idx_mezzi_stato_funzionamento; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mezzi_stato_funzionamento ON public."Mezzi" USING btree (stato_funzionamento);


--
-- Name: idx_mezzi_ubicazione; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mezzi_ubicazione ON public."Mezzi" USING btree (id_sede_ubicazione) WHERE (is_cancellato = false);


--
-- Name: idx_noleggi_data_fine; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_noleggi_data_fine ON public."Noleggi" USING btree (data_fine);


--
-- Name: idx_noleggi_data_inizio; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_noleggi_data_inizio ON public."Noleggi" USING btree (data_inizio);


--
-- Name: idx_noleggi_id_anagrafica; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_noleggi_id_anagrafica ON public."Noleggi" USING btree (id_anagrafica);


--
-- Name: idx_noleggi_id_mezzo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_noleggi_id_mezzo ON public."Noleggi" USING btree (id_mezzo);


--
-- Name: idx_noleggi_mezzo_attivi; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_noleggi_mezzo_attivi ON public."Noleggi" USING btree (id_mezzo) WHERE ((is_cancellato = false) AND (is_terminato = false));


--
-- Name: idx_noleggi_stato; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_noleggi_stato ON public."Noleggi" USING btree (stato_noleggio);


--
-- Name: idx_noleggi_storico_cliente; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_noleggi_storico_cliente ON public.noleggi_storico USING btree (ragione_sociale_cliente);


--
-- Name: idx_noleggi_storico_composite; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_noleggi_storico_composite ON public.noleggi_storico USING btree (id_noleggio, data_evento DESC);


--
-- Name: idx_noleggi_storico_data_evento; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_noleggi_storico_data_evento ON public.noleggi_storico USING btree (data_evento DESC);


--
-- Name: idx_noleggi_storico_data_fine_periodo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_noleggi_storico_data_fine_periodo ON public.noleggi_storico USING btree (data_fine_periodo);


--
-- Name: idx_noleggi_storico_id_mezzo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_noleggi_storico_id_mezzo ON public.noleggi_storico USING btree (id_mezzo);


--
-- Name: idx_noleggi_storico_id_noleggio; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_noleggi_storico_id_noleggio ON public.noleggi_storico USING btree (id_noleggio);


--
-- Name: idx_noleggi_storico_mezzo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_noleggi_storico_mezzo ON public.noleggi_storico USING btree (mezzo_descrizione);


--
-- Name: idx_noleggi_storico_tipo_evento; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_noleggi_storico_tipo_evento ON public.noleggi_storico USING btree (tipo_evento);


--
-- Name: idx_noleggi_terminato; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_noleggi_terminato ON public."Noleggi" USING btree (is_terminato);


--
-- Name: idx_prev_interventi_id_intervento; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prev_interventi_id_intervento ON public.prev_interventi USING btree (id_intervento);


--
-- Name: idx_sedi_anagrafica; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sedi_anagrafica ON public."Sedi" USING btree (id_anagrafica) WHERE (is_cancellato = false);


--
-- Name: idx_sedi_id_anagrafica; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sedi_id_anagrafica ON public."Sedi" USING btree (id_anagrafica);


--
-- Name: idx_sedi_id_porto; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sedi_id_porto ON public."Sedi" USING btree (id_porto);


--
-- Name: idx_sedi_operativa; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sedi_operativa ON public."Sedi" USING btree (is_operativa) WHERE ((is_cancellato = false) AND (is_operativa = true));


--
-- Name: idx_sedi_search; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sedi_search ON public."Sedi" USING btree (indirizzo, citta, provincia) WHERE (is_cancellato = false);


--
-- Name: idx_subnoleggi_data_fine; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subnoleggi_data_fine ON public."Subnoleggi" USING btree (data_fine);


--
-- Name: idx_subnoleggi_data_inizio; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subnoleggi_data_inizio ON public."Subnoleggi" USING btree (data_inizio);


--
-- Name: idx_subnoleggi_id_anagrafica; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subnoleggi_id_anagrafica ON public."Subnoleggi" USING btree (id_anagrafica);


--
-- Name: idx_subnoleggi_id_mezzo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subnoleggi_id_mezzo ON public."Subnoleggi" USING btree (id_mezzo);


--
-- Name: idx_subnoleggi_mezzo_attivi; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subnoleggi_mezzo_attivi ON public."Subnoleggi" USING btree (id_mezzo) WHERE (is_cancellato = false);


--
-- Name: idx_tecnici_nome; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tecnici_nome ON public.tecnici USING btree (nome, cognome);


--
-- Name: noleggi_storico_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX noleggi_storico_id_unique ON public.noleggi_storico USING btree (id);


--
-- Name: vw_lavorazioni_complete _RETURN; Type: RULE; Schema: public; Owner: -
--

CREATE OR REPLACE VIEW public.vw_lavorazioni_complete WITH (security_invoker='on') AS
 SELECT l.id_lavorazione,
    l.id_intervento,
    l.nome_lavorazione,
    l.descrizione_lavorazione,
    l.data_da_prevista,
    l.data_a_prevista,
    l.durata_prevista,
    l.n_tecnici_previsti,
    l.prezzo_lavorazione,
    l.prezzo_manodopera,
    l.competenza_lavorazione,
    l.stato_lavorazione,
    l.data_effettiva,
    l.is_completato,
    l.created_at,
    COALESCE(json_agg(json_build_object('id_lav_prod', lp.id_lav_prod, 'id_prodotto', lp.id_prodotto, 'n_prodotto_uscita_prevista', lp.n_prodotto_uscita_prevista, 'costo_prodotto_lavorazione', lp.costo_prodotto_lavorazione, 'prezzo_prodotto_lavorazione', lp.prezzo_prodotto_lavorazione, 'prodotto_nome', p.nome, 'prodotto_codice', p.codice, 'prodotto_marca', p.marca, 'prodotto_modello', p.modello) ORDER BY lp.created_at) FILTER (WHERE (lp.id_lav_prod IS NOT NULL)), '[]'::json) AS prodotti
   FROM ((public.int_lavorazioni l
     LEFT JOIN public.int_lav_prod lp ON ((l.id_lavorazione = lp.id_lavorazione)))
     LEFT JOIN public."Prodotti" p ON ((lp.id_prodotto = p.id_prodotto)))
  WHERE (l.is_cancellato = false)
  GROUP BY l.id_lavorazione;


--
-- Name: Interventi gen_codice_intervento; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER gen_codice_intervento BEFORE INSERT ON public."Interventi" FOR EACH ROW EXECUTE FUNCTION public.generate_codice_intervento();


--
-- Name: interventi interventi_delete_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER interventi_delete_trigger INSTEAD OF DELETE ON public.interventi FOR EACH ROW EXECUTE FUNCTION public.interventi_delete();


--
-- Name: interventi interventi_insert_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER interventi_insert_trigger INSTEAD OF INSERT ON public.interventi FOR EACH ROW EXECUTE FUNCTION public.interventi_insert();


--
-- Name: interventi interventi_update_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER interventi_update_trigger INSTEAD OF UPDATE ON public.interventi FOR EACH ROW EXECUTE FUNCTION public.interventi_update();


--
-- Name: Mezzi trg_update_ubicazione; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_update_ubicazione BEFORE UPDATE OF id_sede_ubicazione ON public."Mezzi" FOR EACH ROW EXECUTE FUNCTION public.update_ubicazione();


--
-- Name: Noleggi trigger_capture_noleggio_storico; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_capture_noleggio_storico BEFORE UPDATE ON public."Noleggi" FOR EACH ROW EXECUTE FUNCTION public.capture_noleggio_storico();


--
-- Name: contratti_noleggio trigger_generate_codice_contratto; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_generate_codice_contratto BEFORE INSERT ON public.contratti_noleggio FOR EACH ROW WHEN (((new.codice_contratto IS NULL) OR (new.codice_contratto = ''::text))) EXECUTE FUNCTION public.generate_codice_contratto();


--
-- Name: lav_tecnici trigger_update_stato_on_delete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_stato_on_delete AFTER DELETE ON public.lav_tecnici FOR EACH ROW EXECUTE FUNCTION public.update_lavorazione_stato();


--
-- Name: lav_tecnici trigger_update_stato_on_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_stato_on_insert AFTER INSERT ON public.lav_tecnici FOR EACH ROW EXECUTE FUNCTION public.update_lavorazione_stato();


--
-- Name: Mezzi trigger_update_ubicazione; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_ubicazione BEFORE INSERT OR UPDATE OF id_sede_ubicazione ON public."Mezzi" FOR EACH ROW EXECUTE FUNCTION public.update_ubicazione();


--
-- Name: conti_bancari update_conti_bancari_aggiornato_il; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_conti_bancari_aggiornato_il BEFORE UPDATE ON public.conti_bancari FOR EACH ROW EXECUTE FUNCTION public.update_aggiornato_il();


--
-- Name: transazioni update_transazioni_aggiornato_il; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_transazioni_aggiornato_il BEFORE UPDATE ON public.transazioni FOR EACH ROW EXECUTE FUNCTION public.update_aggiornato_il();


--
-- Name: an_contatti an_contatti_id_anagrafica_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.an_contatti
    ADD CONSTRAINT an_contatti_id_anagrafica_fkey FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: an_contatti an_contatti_id_sede_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.an_contatti
    ADD CONSTRAINT an_contatti_id_sede_fkey FOREIGN KEY (id_sede) REFERENCES public."Sedi"(id_sede) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: an_dati_amministrativi an_dati_amministrativi_id_anagrafica_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.an_dati_amministrativi
    ADD CONSTRAINT an_dati_amministrativi_id_anagrafica_fkey FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: contratti_noleggio contratti_noleggio_id_anagrafica_cliente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contratti_noleggio
    ADD CONSTRAINT contratti_noleggio_id_anagrafica_cliente_fkey FOREIGN KEY (id_anagrafica_cliente) REFERENCES public."Anagrafiche"(id_anagrafica);


--
-- Name: contratti_noleggio contratti_noleggio_id_anagrafica_fornitore_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contratti_noleggio
    ADD CONSTRAINT contratti_noleggio_id_anagrafica_fornitore_fkey FOREIGN KEY (id_anagrafica_fornitore) REFERENCES public."Anagrafiche"(id_anagrafica);


--
-- Name: contratti_noleggio contratti_noleggio_id_noleggio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contratti_noleggio
    ADD CONSTRAINT contratti_noleggio_id_noleggio_fkey FOREIGN KEY (id_noleggio) REFERENCES public."Noleggi"(id_noleggio) ON DELETE CASCADE;


--
-- Name: documenti_noleggio documenti_noleggio_id_noleggio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documenti_noleggio
    ADD CONSTRAINT documenti_noleggio_id_noleggio_fkey FOREIGN KEY (id_noleggio) REFERENCES public."Noleggi"(id_noleggio) ON DELETE CASCADE;


--
-- Name: Interventi fk_interventi_anagrafica; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Interventi"
    ADD CONSTRAINT fk_interventi_anagrafica FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Interventi fk_interventi_mezzo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Interventi"
    ADD CONSTRAINT fk_interventi_mezzo FOREIGN KEY (id_mezzo) REFERENCES public."Mezzi"(id_mezzo) ON DELETE CASCADE;


--
-- Name: int_lavorazioni fk_lavorazioni_intervento; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.int_lavorazioni
    ADD CONSTRAINT fk_lavorazioni_intervento FOREIGN KEY (id_intervento) REFERENCES public."Interventi"(id_intervento) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Mezzi fk_mezzi_anagrafica; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Mezzi"
    ADD CONSTRAINT fk_mezzi_anagrafica FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica) ON DELETE SET NULL;


--
-- Name: Noleggi fk_noleggi_anagrafica; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Noleggi"
    ADD CONSTRAINT fk_noleggi_anagrafica FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Noleggi fk_noleggi_mezzo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Noleggi"
    ADD CONSTRAINT fk_noleggi_mezzo FOREIGN KEY (id_mezzo) REFERENCES public."Mezzi"(id_mezzo) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Noleggi fk_noleggi_sede_operativa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Noleggi"
    ADD CONSTRAINT fk_noleggi_sede_operativa FOREIGN KEY (sede_operativa) REFERENCES public."Sedi"(id_sede) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Sedi fk_sedi_anagrafica; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Sedi"
    ADD CONSTRAINT fk_sedi_anagrafica FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica) ON DELETE CASCADE;


--
-- Name: Sedi fk_sedi_porto; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Sedi"
    ADD CONSTRAINT fk_sedi_porto FOREIGN KEY (id_porto) REFERENCES public."Porti"(id_porto) ON DELETE SET NULL;


--
-- Name: Subnoleggi fk_subnoleggi_anagrafica; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subnoleggi"
    ADD CONSTRAINT fk_subnoleggi_anagrafica FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica) ON DELETE CASCADE;


--
-- Name: Subnoleggi fk_subnoleggi_mezzo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subnoleggi"
    ADD CONSTRAINT fk_subnoleggi_mezzo FOREIGN KEY (id_mezzo) REFERENCES public."Mezzi"(id_mezzo) ON DELETE CASCADE;


--
-- Name: frn_mezzi frn_mezzi_id_anagrafica_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.frn_mezzi
    ADD CONSTRAINT frn_mezzi_id_anagrafica_fkey FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: frn_ricambi frn_ricambi_id_anagrafica_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.frn_ricambi
    ADD CONSTRAINT frn_ricambi_id_anagrafica_fkey FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: frn_servizi frn_servizi_id_anagrafica_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.frn_servizi
    ADD CONSTRAINT frn_servizi_id_anagrafica_fkey FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: frn_trasporti frn_trasporti_id_anagrafica_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.frn_trasporti
    ADD CONSTRAINT frn_trasporti_id_anagrafica_fkey FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: int_lav_prod int_lav_prod_id_lavorazione_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.int_lav_prod
    ADD CONSTRAINT int_lav_prod_id_lavorazione_fkey FOREIGN KEY (id_lavorazione) REFERENCES public.int_lavorazioni(id_lavorazione) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: int_lav_prod int_lav_prod_id_prodotto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.int_lav_prod
    ADD CONSTRAINT int_lav_prod_id_prodotto_fkey FOREIGN KEY (id_prodotto) REFERENCES public."Prodotti"(id_prodotto) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: lav_tecnici lav_tecnici_id_lavorazione_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lav_tecnici
    ADD CONSTRAINT lav_tecnici_id_lavorazione_fkey FOREIGN KEY (id_lavorazione) REFERENCES public.int_lavorazioni(id_lavorazione) ON DELETE CASCADE;


--
-- Name: lav_tecnici lav_tecnici_id_tecnico_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lav_tecnici
    ADD CONSTRAINT lav_tecnici_id_tecnico_fkey FOREIGN KEY (id_tecnico) REFERENCES public.tecnici(id_tecnico) ON DELETE CASCADE;


--
-- Name: Mezzi mezzi_id_sede_assegnata_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Mezzi"
    ADD CONSTRAINT mezzi_id_sede_assegnata_fkey FOREIGN KEY (id_sede_assegnata) REFERENCES public."Sedi"(id_sede) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Mezzi mezzi_id_sede_ubicazione_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Mezzi"
    ADD CONSTRAINT mezzi_id_sede_ubicazione_fkey FOREIGN KEY (id_sede_ubicazione) REFERENCES public."Sedi"(id_sede) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: noleggi_storico noleggi_storico_id_noleggio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.noleggi_storico
    ADD CONSTRAINT noleggi_storico_id_noleggio_fkey FOREIGN KEY (id_noleggio) REFERENCES public."Noleggi"(id_noleggio) ON DELETE CASCADE;


--
-- Name: prev_interventi prev_interventi_id_intervento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prev_interventi
    ADD CONSTRAINT prev_interventi_id_intervento_fkey FOREIGN KEY (id_intervento) REFERENCES public."Interventi"(id_intervento) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: prev_interventi prev_interventi_id_preventivo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prev_interventi
    ADD CONSTRAINT prev_interventi_id_preventivo_fkey FOREIGN KEY (id_preventivo) REFERENCES public."Preventivi"(id_preventivo) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Preventivi preventivi_id_anagrafica_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Preventivi"
    ADD CONSTRAINT preventivi_id_anagrafica_fkey FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tecnici tecnici_id_utente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tecnici
    ADD CONSTRAINT tecnici_id_utente_fkey FOREIGN KEY (id_utente) REFERENCES public.utenti(id_utente) ON DELETE CASCADE;


--
-- Name: transazioni transazioni_conto_bancario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transazioni
    ADD CONSTRAINT transazioni_conto_bancario_id_fkey FOREIGN KEY (conto_bancario_id) REFERENCES public.conti_bancari(id) ON DELETE CASCADE;


--
-- Name: transazioni transazioni_transazione_collegata_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transazioni
    ADD CONSTRAINT transazioni_transazione_collegata_id_fkey FOREIGN KEY (transazione_collegata_id) REFERENCES public.transazioni(id) ON DELETE SET NULL;


--
-- Name: Anagrafiche Allow all operations on Anagrafiche; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on Anagrafiche" ON public."Anagrafiche" USING (true) WITH CHECK (true);


--
-- Name: Mezzi Allow all operations on Mezzi; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on Mezzi" ON public."Mezzi" USING (true) WITH CHECK (true);


--
-- Name: Noleggi Allow all operations on Noleggi; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on Noleggi" ON public."Noleggi" USING (true) WITH CHECK (true);


--
-- Name: Porti Allow all operations on Porti; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on Porti" ON public."Porti" USING (true) WITH CHECK (true);


--
-- Name: Preventivi Allow all operations on Preventivi; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on Preventivi" ON public."Preventivi" USING (true) WITH CHECK (true);


--
-- Name: Prodotti Allow all operations on Prodotti; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on Prodotti" ON public."Prodotti" USING (true) WITH CHECK (true);


--
-- Name: Sedi Allow all operations on Sedi; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on Sedi" ON public."Sedi" USING (true) WITH CHECK (true);


--
-- Name: Subnoleggi Allow all operations on Subnoleggi; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on Subnoleggi" ON public."Subnoleggi" USING (true) WITH CHECK (true);


--
-- Name: an_contatti Allow all operations on an_contatti; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on an_contatti" ON public.an_contatti USING (true) WITH CHECK (true);


--
-- Name: an_dati_amministrativi Allow all operations on an_dati_amministrativi; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on an_dati_amministrativi" ON public.an_dati_amministrativi USING (true) WITH CHECK (true);


--
-- Name: conti_bancari Allow all operations on conti_bancari; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on conti_bancari" ON public.conti_bancari USING (true) WITH CHECK (true);


--
-- Name: documenti_noleggio Allow all operations on documenti_noleggio; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on documenti_noleggio" ON public.documenti_noleggio USING (true) WITH CHECK (true);


--
-- Name: frn_mezzi Allow all operations on frn_mezzi; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on frn_mezzi" ON public.frn_mezzi USING (true) WITH CHECK (true);


--
-- Name: frn_ricambi Allow all operations on frn_ricambi; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on frn_ricambi" ON public.frn_ricambi USING (true) WITH CHECK (true);


--
-- Name: frn_servizi Allow all operations on frn_servizi; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on frn_servizi" ON public.frn_servizi USING (true) WITH CHECK (true);


--
-- Name: frn_trasporti Allow all operations on frn_trasporti; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on frn_trasporti" ON public.frn_trasporti USING (true) WITH CHECK (true);


--
-- Name: int_lav_prod Allow all operations on int_lav_prod; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on int_lav_prod" ON public.int_lav_prod USING (true) WITH CHECK (true);


--
-- Name: int_lavorazioni Allow all operations on int_lavorazioni; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on int_lavorazioni" ON public.int_lavorazioni USING (true) WITH CHECK (true);


--
-- Name: lav_tecnici Allow all operations on lav_tecnici; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on lav_tecnici" ON public.lav_tecnici USING (true) WITH CHECK (true);


--
-- Name: noleggi_storico Allow all operations on noleggi_storico; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on noleggi_storico" ON public.noleggi_storico USING (true) WITH CHECK (true);


--
-- Name: prev_interventi Allow all operations on prev_interventi; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on prev_interventi" ON public.prev_interventi USING (true) WITH CHECK (true);


--
-- Name: tecnici Allow all operations on tecnici; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on tecnici" ON public.tecnici USING (true) WITH CHECK (true);


--
-- Name: transazioni Allow all operations on transazioni; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on transazioni" ON public.transazioni USING (true) WITH CHECK (true);


--
-- Name: utenti Allow all operations on utenti; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on utenti" ON public.utenti USING (true) WITH CHECK (true);


--
-- Name: Anagrafiche; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Anagrafiche" ENABLE ROW LEVEL SECURITY;

--
-- Name: contratti_noleggio Contratti are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Contratti are viewable by everyone" ON public.contratti_noleggio FOR SELECT USING (true);


--
-- Name: contratti_noleggio Contratti can be deleted by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Contratti can be deleted by everyone" ON public.contratti_noleggio FOR DELETE USING (true);


--
-- Name: contratti_noleggio Contratti can be inserted by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Contratti can be inserted by everyone" ON public.contratti_noleggio FOR INSERT WITH CHECK (true);


--
-- Name: contratti_noleggio Contratti can be updated by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Contratti can be updated by everyone" ON public.contratti_noleggio FOR UPDATE USING (true);


--
-- Name: Interventi Enable delete access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable delete access for all users" ON public."Interventi" FOR DELETE USING (true);


--
-- Name: Interventi Enable insert access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert access for all users" ON public."Interventi" FOR INSERT WITH CHECK (true);


--
-- Name: Interventi Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public."Interventi" FOR SELECT USING (true);


--
-- Name: Interventi Enable update access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable update access for all users" ON public."Interventi" FOR UPDATE USING (true) WITH CHECK (true);


--
-- Name: Interventi; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Interventi" ENABLE ROW LEVEL SECURITY;

--
-- Name: Mezzi; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Mezzi" ENABLE ROW LEVEL SECURITY;

--
-- Name: Noleggi; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Noleggi" ENABLE ROW LEVEL SECURITY;

--
-- Name: Porti; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Porti" ENABLE ROW LEVEL SECURITY;

--
-- Name: Preventivi; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Preventivi" ENABLE ROW LEVEL SECURITY;

--
-- Name: Prodotti; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Prodotti" ENABLE ROW LEVEL SECURITY;

--
-- Name: Sedi; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Sedi" ENABLE ROW LEVEL SECURITY;

--
-- Name: Subnoleggi; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Subnoleggi" ENABLE ROW LEVEL SECURITY;

--
-- Name: an_contatti; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.an_contatti ENABLE ROW LEVEL SECURITY;

--
-- Name: an_dati_amministrativi; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.an_dati_amministrativi ENABLE ROW LEVEL SECURITY;

--
-- Name: conti_bancari; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.conti_bancari ENABLE ROW LEVEL SECURITY;

--
-- Name: contratti_noleggio; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contratti_noleggio ENABLE ROW LEVEL SECURITY;

--
-- Name: documenti_noleggio; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.documenti_noleggio ENABLE ROW LEVEL SECURITY;

--
-- Name: frn_mezzi; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.frn_mezzi ENABLE ROW LEVEL SECURITY;

--
-- Name: frn_ricambi; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.frn_ricambi ENABLE ROW LEVEL SECURITY;

--
-- Name: frn_servizi; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.frn_servizi ENABLE ROW LEVEL SECURITY;

--
-- Name: frn_trasporti; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.frn_trasporti ENABLE ROW LEVEL SECURITY;

--
-- Name: int_lav_prod; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.int_lav_prod ENABLE ROW LEVEL SECURITY;

--
-- Name: int_lavorazioni; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.int_lavorazioni ENABLE ROW LEVEL SECURITY;

--
-- Name: lav_tecnici; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lav_tecnici ENABLE ROW LEVEL SECURITY;

--
-- Name: noleggi_storico; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.noleggi_storico ENABLE ROW LEVEL SECURITY;

--
-- Name: prev_interventi; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.prev_interventi ENABLE ROW LEVEL SECURITY;

--
-- Name: tecnici; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tecnici ENABLE ROW LEVEL SECURITY;

--
-- Name: transazioni; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.transazioni ENABLE ROW LEVEL SECURITY;

--
-- Name: utenti; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.utenti ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;