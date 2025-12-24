-- PUBLIC SCHEMA FUNCTIONS
-- Generated from monolithic schema.sql

CREATE OR REPLACE FUNCTION public.anagrafiche_view_delete() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN DELETE FROM public."Anagrafiche" WHERE id_anagrafica = OLD.id_anagrafica; RETURN OLD; END; $$;

CREATE OR REPLACE FUNCTION public.anagrafiche_view_insert() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN INSERT INTO public."Anagrafiche" SELECT NEW.*; RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.anagrafiche_view_update() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE public."Anagrafiche" SET
    ragione_sociale = NEW.ragione_sociale, partita_iva = NEW.partita_iva,
    is_cliente = NEW.is_cliente, is_fornitore = NEW.is_fornitore,
    is_owner = NEW.is_owner, is_cancellato = NEW.is_cancellato,
    richiede_contratto_noleggio = NEW.richiede_contratto_noleggio, created_at = NEW.created_at
  WHERE id_anagrafica = OLD.id_anagrafica;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.capture_noleggio_storico() RETURNS trigger
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
  IF TG_OP = 'UPDATE' AND NEW.is_terminato = false AND OLD.is_terminato = true THEN
    RETURN NEW;
  END IF;

  SELECT ragione_sociale INTO v_ragione_sociale
  FROM "Anagrafiche"
  WHERE id_anagrafica = NEW.id_anagrafica;

  SELECT CONCAT_WS(' - ', id_interno, marca, modello, matricola) INTO v_mezzo_desc
  FROM "Mezzi"
  WHERE id_mezzo = NEW.id_mezzo;

  IF NEW.sede_operativa IS NOT NULL THEN
    SELECT CONCAT_WS(', ', nome_sede, indirizzo, citta) INTO v_sede_desc
    FROM "Sedi"
    WHERE id_sede = NEW.sede_operativa;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.is_terminato = true AND (OLD.is_terminato = false OR OLD.is_terminato IS NULL) THEN
    v_tipo_evento := 'terminazione';
    v_should_create_record := true;
    v_data_inizio_periodo := OLD.data_inizio;
    v_data_fine_periodo := COALESCE(NEW.data_terminazione_effettiva, CURRENT_DATE);

  ELSIF TG_OP = 'UPDATE' AND 
        NEW.sede_operativa IS DISTINCT FROM OLD.sede_operativa AND 
        OLD.sede_operativa IS NOT NULL AND
        (NEW.is_terminato = false OR NEW.is_terminato IS NULL) AND
        (OLD.is_terminato = false OR OLD.is_terminato IS NULL) THEN
    v_tipo_evento := 'cambio_sede';
    v_should_create_record := true;
    v_data_inizio_periodo := OLD.data_inizio;
    v_data_fine_periodo := CURRENT_DATE;
    
    SELECT CONCAT_WS(', ', nome_sede, indirizzo, citta) INTO v_sede_precedente_desc
    FROM "Sedi"
    WHERE id_sede = OLD.sede_operativa;
    
    NEW.data_inizio := CURRENT_DATE;

  ELSIF TG_OP = 'UPDATE' AND NEW.is_cancellato = true AND (OLD.is_cancellato = false OR OLD.is_cancellato IS NULL) THEN
    v_tipo_evento := 'cancellazione';
    v_should_create_record := true;
    v_data_inizio_periodo := OLD.data_inizio;
    v_data_fine_periodo := CURRENT_DATE;
  END IF;

  IF v_should_create_record THEN
    INSERT INTO noleggi_storico (
      id_noleggio, id_anagrafica, id_mezzo, sede_operativa, data_inizio, data_fine,
      data_fine_periodo, sede_precedente_id, sede_precedente_descrizione,
      tempo_indeterminato, prezzo_noleggio, prezzo_trasporto, contratto,
      stato_noleggio, is_terminato, tipo_canone, tipo_evento,
      ragione_sociale_cliente, mezzo_descrizione, sede_operativa_descrizione,
      note, data_terminazione_effettiva
    ) VALUES (
      NEW.id_noleggio, NEW.id_anagrafica, NEW.id_mezzo,
      CASE WHEN v_tipo_evento = 'cambio_sede' THEN OLD.sede_operativa ELSE NEW.sede_operativa END,
      v_data_inizio_periodo,
      CASE WHEN v_tipo_evento = 'cambio_sede' THEN OLD.data_fine ELSE NEW.data_fine END,
      v_data_fine_periodo,
      CASE WHEN v_tipo_evento = 'cambio_sede' THEN OLD.sede_operativa ELSE NULL END,
      v_sede_precedente_desc,
      CASE WHEN v_tipo_evento = 'cambio_sede' THEN OLD.tempo_indeterminato ELSE NEW.tempo_indeterminato END,
      CASE WHEN v_tipo_evento = 'cambio_sede' THEN OLD.prezzo_noleggio ELSE NEW.prezzo_noleggio END,
      CASE WHEN v_tipo_evento = 'cambio_sede' THEN OLD.prezzo_trasporto ELSE NEW.prezzo_trasporto END,
      NEW.contratto, NEW.stato_noleggio, NEW.is_terminato,
      CASE WHEN v_tipo_evento = 'cambio_sede' THEN OLD.tipo_canone ELSE NEW.tipo_canone END,
      v_tipo_evento, v_ragione_sociale, v_mezzo_desc,
      CASE WHEN v_tipo_evento = 'cambio_sede' THEN v_sede_precedente_desc ELSE v_sede_desc END,
      NEW.note, NEW.data_terminazione_effettiva
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_codice_contratto() RETURNS trigger
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

CREATE OR REPLACE FUNCTION public.generate_codice_intervento() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  anno_corrente TEXT;
  numero_intervento INTEGER;
BEGIN
  anno_corrente := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  SELECT COALESCE(MAX(
    CASE 
      WHEN codice_intervento LIKE 'INT_' || anno_corrente || '_%' 
      THEN SUBSTRING(codice_intervento FROM LENGTH('INT_' || anno_corrente || '_') + 1)::INTEGER
      ELSE 0
    END
  ), 0) + 1
  INTO numero_intervento
  FROM public."Interventi";
  
  NEW.codice_intervento := 'INT_' || anno_corrente || '_' || numero_intervento::TEXT;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_next_document_code(p_doc_type text) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'extensions'
    AS $$
DECLARE
    v_year INTEGER;
    v_new_value INTEGER;
    v_code TEXT;
BEGIN
    v_year := date_part('year', CURRENT_DATE);

    -- Upsert: Inserisce o Incrementa
    INSERT INTO public.document_sequences (doc_type, year, current_value)
    VALUES (p_doc_type, v_year, 1)
    ON CONFLICT (doc_type, year)
    DO UPDATE SET
        current_value = document_sequences.current_value + 1,
        updated_at = timezone('utc'::text, now())
    RETURNING current_value INTO v_new_value;

    -- Formatta: TIPO-ANNO-NUMERO (es. CNT-2024-00150)
    v_code := p_doc_type || '-' || v_year || '-' || LPAD(v_new_value::TEXT, 5, '0');

    RETURN v_code;
END;
$$;

CREATE OR REPLACE FUNCTION public.hasrole(p_userid uuid, p_role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = p_userid
      AND ur.role = p_role
  );
$$;

CREATE OR REPLACE FUNCTION public.interventi_delete() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  DELETE FROM public."Interventi"
  WHERE id_intervento = OLD.id_intervento;
  RETURN OLD;
END;
$$;

CREATE OR REPLACE FUNCTION public.interventi_insert() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  INSERT INTO public."Interventi" (
    codice_intervento, id_mezzo, id_anagrafica, descrizione_intervento,
    stato_intervento, stato_preventivo, is_cancellato, is_fatturato, is_chiuso
  ) VALUES (
    NEW.codice_intervento, NEW.id_mezzo, NEW.id_anagrafica, NEW.descrizione_intervento,
    NEW.stato_intervento, NEW.stato_preventivo,
    COALESCE(NEW.is_cancellato, false),
    COALESCE(NEW.is_fatturato, false),
    COALESCE(NEW.is_chiuso, false)
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.interventi_update() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
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

CREATE OR REPLACE FUNCTION public.trigger_set_contratto_code() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.codice_contratto IS NULL THEN
        NEW.codice_contratto := public.get_next_document_code('CNT');
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_set_preventivo_code() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.codice IS NULL THEN
        NEW.codice := public.get_next_document_code('PRV');
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_aggiornato_il() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.aggiornato_il = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_lavorazione_stato() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_n_tecnici_previsti INTEGER;
  v_n_tecnici_assegnati INTEGER;
  v_nuovo_stato stato_lavorazione;
BEGIN
  SELECT n_tecnici_previsti INTO v_n_tecnici_previsti
  FROM public.int_lavorazioni
  WHERE id_lavorazione = COALESCE(NEW.id_lavorazione, OLD.id_lavorazione);
  
  SELECT COUNT(*) INTO v_n_tecnici_assegnati
  FROM public.lav_tecnici
  WHERE id_lavorazione = COALESCE(NEW.id_lavorazione, OLD.id_lavorazione);
  
  IF v_n_tecnici_assegnati = 0 THEN
    v_nuovo_stato := 'pronta';
  ELSIF v_n_tecnici_assegnati >= COALESCE(v_n_tecnici_previsti, 0) AND v_n_tecnici_previsti > 0 THEN
    v_nuovo_stato := 'assegnata';
  ELSE
    v_nuovo_stato := 'pronta';
  END IF;
  
  UPDATE public.int_lavorazioni
  SET stato_lavorazione = v_nuovo_stato
  WHERE id_lavorazione = COALESCE(NEW.id_lavorazione, OLD.id_lavorazione)
    AND stato_lavorazione != 'completata';
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.update_prev_noleggi_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_ubicazione() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF NEW.id_sede_ubicazione IS DISTINCT FROM OLD.id_sede_ubicazione THEN
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
