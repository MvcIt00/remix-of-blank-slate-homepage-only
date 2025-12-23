--
-- PostgreSQL database dump
--

\restrict AYAKk0TyKJdNwBanxCIbzRuIh5hvHPnG7qPHj1ojJMz4c9pq00pxrzeaOfaYRXq

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
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user'
);


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
    'scaduto',
    'archiviato',
    'terminato'
);


--
-- Name: stato_preventivo; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.stato_preventivo AS ENUM (
    'bozza',
    'inviato',
    'approvato',
    'rifiutato',
    'concluso',
    'archiviato'
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
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


--
-- Name: anagrafiche_view_delete(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.anagrafiche_view_delete() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN DELETE FROM public."Anagrafiche" WHERE id_anagrafica = OLD.id_anagrafica; RETURN OLD; END; $$;


--
-- Name: anagrafiche_view_insert(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.anagrafiche_view_insert() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN INSERT INTO public."Anagrafiche" SELECT NEW.*; RETURN NEW; END; $$;


--
-- Name: anagrafiche_view_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.anagrafiche_view_update() RETURNS trigger
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


--
-- Name: get_next_document_code(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_next_document_code(p_doc_type text) RETURNS text
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


--
-- Name: hasrole(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.hasrole(p_userid uuid, p_role public.app_role) RETURNS boolean
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


--
-- Name: interventi_delete(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.interventi_delete() RETURNS trigger
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


--
-- Name: interventi_insert(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.interventi_insert() RETURNS trigger
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


--
-- Name: interventi_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.interventi_update() RETURNS trigger
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


--
-- Name: trigger_set_contratto_code(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_set_contratto_code() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.codice_contratto IS NULL THEN
        NEW.codice_contratto := public.get_next_document_code('CNT');
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: trigger_set_preventivo_code(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_set_preventivo_code() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.codice IS NULL THEN
        NEW.codice := public.get_next_document_code('PRV');
    END IF;
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


--
-- Name: update_prev_noleggi_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_prev_noleggi_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
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


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    -- Generate a new UUID for the id
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: delete_leaf_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_rows_deleted integer;
BEGIN
    LOOP
        WITH candidates AS (
            SELECT DISTINCT
                t.bucket_id,
                unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        ),
        uniq AS (
             SELECT
                 bucket_id,
                 name,
                 storage.get_level(name) AS level
             FROM candidates
             WHERE name <> ''
             GROUP BY bucket_id, name
        ),
        leaf AS (
             SELECT
                 p.bucket_id,
                 p.name,
                 p.level
             FROM storage.prefixes AS p
                  JOIN uniq AS u
                       ON u.bucket_id = p.bucket_id
                           AND u.name = p.name
                           AND u.level = p.level
             WHERE NOT EXISTS (
                 SELECT 1
                 FROM storage.objects AS o
                 WHERE o.bucket_id = p.bucket_id
                   AND o.level = p.level + 1
                   AND o.name COLLATE "C" LIKE p.name || '/%'
             )
             AND NOT EXISTS (
                 SELECT 1
                 FROM storage.prefixes AS c
                 WHERE c.bucket_id = p.bucket_id
                   AND c.level = p.level + 1
                   AND c.name COLLATE "C" LIKE p.name || '/%'
             )
        )
        DELETE
        FROM storage.prefixes AS p
            USING leaf AS l
        WHERE p.bucket_id = l.bucket_id
          AND p.name = l.name
          AND p.level = l.level;

        GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;
        EXIT WHEN v_rows_deleted = 0;
    END LOOP;
END;
$$;


--
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


--
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


--
-- Name: lock_top_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.lock_top_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket text;
    v_top text;
BEGIN
    FOR v_bucket, v_top IN
        SELECT DISTINCT t.bucket_id,
            split_part(t.name, '/', 1) AS top
        FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        WHERE t.name <> ''
        ORDER BY 1, 2
        LOOP
            PERFORM pg_advisory_xact_lock(hashtextextended(v_bucket || '/' || v_top, 0));
        END LOOP;
END;
$$;


--
-- Name: objects_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


--
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


--
-- Name: objects_update_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    -- NEW - OLD (destinations to create prefixes for)
    v_add_bucket_ids text[];
    v_add_names      text[];

    -- OLD - NEW (sources to prune)
    v_src_bucket_ids text[];
    v_src_names      text[];
BEGIN
    IF TG_OP <> 'UPDATE' THEN
        RETURN NULL;
    END IF;

    -- 1) Compute NEWâˆ’OLD (added paths) and OLDâˆ’NEW (moved-away paths)
    WITH added AS (
        SELECT n.bucket_id, n.name
        FROM new_rows n
        WHERE n.name <> '' AND position('/' in n.name) > 0
        EXCEPT
        SELECT o.bucket_id, o.name FROM old_rows o WHERE o.name <> ''
    ),
    moved AS (
         SELECT o.bucket_id, o.name
         FROM old_rows o
         WHERE o.name <> ''
         EXCEPT
         SELECT n.bucket_id, n.name FROM new_rows n WHERE n.name <> ''
    )
    SELECT
        -- arrays for ADDED (dest) in stable order
        COALESCE( (SELECT array_agg(a.bucket_id ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        COALESCE( (SELECT array_agg(a.name      ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        -- arrays for MOVED (src) in stable order
        COALESCE( (SELECT array_agg(m.bucket_id ORDER BY m.bucket_id, m.name) FROM moved m), '{}' ),
        COALESCE( (SELECT array_agg(m.name      ORDER BY m.bucket_id, m.name) FROM moved m), '{}' )
    INTO v_add_bucket_ids, v_add_names, v_src_bucket_ids, v_src_names;

    -- Nothing to do?
    IF (array_length(v_add_bucket_ids, 1) IS NULL) AND (array_length(v_src_bucket_ids, 1) IS NULL) THEN
        RETURN NULL;
    END IF;

    -- 2) Take per-(bucket, top) locks: ALL prefixes in consistent global order to prevent deadlocks
    DECLARE
        v_all_bucket_ids text[];
        v_all_names text[];
    BEGIN
        -- Combine source and destination arrays for consistent lock ordering
        v_all_bucket_ids := COALESCE(v_src_bucket_ids, '{}') || COALESCE(v_add_bucket_ids, '{}');
        v_all_names := COALESCE(v_src_names, '{}') || COALESCE(v_add_names, '{}');

        -- Single lock call ensures consistent global ordering across all transactions
        IF array_length(v_all_bucket_ids, 1) IS NOT NULL THEN
            PERFORM storage.lock_top_prefixes(v_all_bucket_ids, v_all_names);
        END IF;
    END;

    -- 3) Create destination prefixes (NEWâˆ’OLD) BEFORE pruning sources
    IF array_length(v_add_bucket_ids, 1) IS NOT NULL THEN
        WITH candidates AS (
            SELECT DISTINCT t.bucket_id, unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(v_add_bucket_ids, v_add_names) AS t(bucket_id, name)
            WHERE name <> ''
        )
        INSERT INTO storage.prefixes (bucket_id, name)
        SELECT c.bucket_id, c.name
        FROM candidates c
        ON CONFLICT DO NOTHING;
    END IF;

    -- 4) Prune source prefixes bottom-up for OLDâˆ’NEW
    IF array_length(v_src_bucket_ids, 1) IS NOT NULL THEN
        -- re-entrancy guard so DELETE on prefixes won't recurse
        IF current_setting('storage.gc.prefixes', true) <> '1' THEN
            PERFORM set_config('storage.gc.prefixes', '1', true);
        END IF;

        PERFORM storage.delete_leaf_prefixes(v_src_bucket_ids, v_src_names);
    END IF;

    RETURN NULL;
END;
$$;


--
-- Name: objects_update_level_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_level_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Set the new level
        NEW."level" := "storage"."get_level"(NEW."name");
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: prefixes_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.prefixes_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


--
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    sort_col text;
    sort_ord text;
    cursor_op text;
    cursor_expr text;
    sort_expr text;
BEGIN
    -- Validate sort_order
    sort_ord := lower(sort_order);
    IF sort_ord NOT IN ('asc', 'desc') THEN
        sort_ord := 'asc';
    END IF;

    -- Determine cursor comparison operator
    IF sort_ord = 'asc' THEN
        cursor_op := '>';
    ELSE
        cursor_op := '<';
    END IF;
    
    sort_col := lower(sort_column);
    -- Validate sort column  
    IF sort_col IN ('updated_at', 'created_at') THEN
        cursor_expr := format(
            '($5 = '''' OR ROW(date_trunc(''milliseconds'', %I), name COLLATE "C") %s ROW(COALESCE(NULLIF($6, '''')::timestamptz, ''epoch''::timestamptz), $5))',
            sort_col, cursor_op
        );
        sort_expr := format(
            'COALESCE(date_trunc(''milliseconds'', %I), ''epoch''::timestamptz) %s, name COLLATE "C" %s',
            sort_col, sort_ord, sort_ord
        );
    ELSE
        cursor_expr := format('($5 = '''' OR name COLLATE "C" %s $5)', cursor_op);
        sort_expr := format('name COLLATE "C" %s', sort_ord);
    END IF;

    RETURN QUERY EXECUTE format(
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    NULL::uuid AS id,
                    updated_at,
                    created_at,
                    NULL::timestamptz AS last_accessed_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
            UNION ALL
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    id,
                    updated_at,
                    created_at,
                    last_accessed_at,
                    metadata
                FROM storage.objects
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
        ) obj
        ORDER BY %s
        LIMIT $3
        $sql$,
        cursor_expr,    -- prefixes WHERE
        sort_expr,      -- prefixes ORDER BY
        cursor_expr,    -- objects WHERE
        sort_expr,      -- objects ORDER BY
        sort_expr       -- final ORDER BY
    )
    USING prefix, bucket_name, limits, levels, start_after, sort_column_after;
END;
$_$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048))
);


--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


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
    id_sede_ubicazione uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    stato_funzionamento_descrizione text,
    stato_funzionamento public.stato_funzionamento,
    marca text,
    modello text,
    matricola text,
    id_interno text,
    anno text,
    categoria public.categoria_mezzo,
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
    id_anagrafica uuid NOT NULL,
    sede_operativa uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
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
    is_cancellato boolean DEFAULT false,
    codice text
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
    id_anagrafica uuid NOT NULL,
    id_mezzo uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
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
    id_contatto uuid DEFAULT gen_random_uuid() NOT NULL,
    id_anagrafica uuid NOT NULL,
    id_sede uuid,
    nome text,
    email text,
    telefono text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_aziendale boolean,
    is_referente boolean,
    is_cancellato boolean DEFAULT false
);


--
-- Name: an_dati_amministrativi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.an_dati_amministrativi (
    id_anagrafica uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
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
-- Name: anagrafiche; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.anagrafiche WITH (security_invoker='on') AS
 SELECT id_anagrafica,
    ragione_sociale,
    partita_iva,
    is_cliente,
    is_fornitore,
    is_owner,
    created_at,
    is_cancellato,
    richiede_contratto_noleggio
   FROM public."Anagrafiche";


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
-- Name: document_sequences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_sequences (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    doc_type text NOT NULL,
    year integer NOT NULL,
    current_value integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
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
    id_anagrafica uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
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
    id_anagrafica uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
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

CREATE VIEW public.interventi WITH (security_invoker='on') AS
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
-- Name: mezzi; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.mezzi WITH (security_invoker='on') AS
 SELECT id_mezzo,
    id_anagrafica,
    id_sede_assegnata,
    id_sede_ubicazione,
    created_at,
    stato_funzionamento_descrizione,
    stato_funzionamento,
    marca,
    modello,
    matricola,
    id_interno,
    anno,
    categoria,
    ore_moto,
    ubicazione,
    specifiche_tecniche,
    is_cancellato,
    is_disponibile_noleggio
   FROM public."Mezzi";


--
-- Name: noleggi; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.noleggi WITH (security_invoker='on') AS
 SELECT id_noleggio,
    id_mezzo,
    id_anagrafica,
    sede_operativa,
    created_at,
    data_inizio,
    data_fine,
    tempo_indeterminato,
    prezzo_noleggio,
    prezzo_trasporto,
    contratto,
    is_cancellato,
    stato_noleggio,
    is_terminato,
    tipo_canone,
    note,
    data_terminazione_effettiva
   FROM public."Noleggi";


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
-- Name: porti; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.porti WITH (security_invoker='on') AS
 SELECT id_porto,
    nome_porto,
    created_at,
    is_cancellato
   FROM public."Porti";


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
-- Name: prev_noleggi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prev_noleggi (
    id_preventivo uuid DEFAULT gen_random_uuid() NOT NULL,
    id_anagrafica uuid NOT NULL,
    id_anagrafica_fornitore uuid,
    id_mezzo uuid NOT NULL,
    data_inizio date,
    data_fine date,
    tempo_indeterminato boolean DEFAULT false NOT NULL,
    prezzo_noleggio numeric,
    prezzo_trasporto numeric,
    tipo_canone character varying,
    note text,
    stato public.stato_preventivo DEFAULT 'bozza'::public.stato_preventivo NOT NULL,
    convertito_in_noleggio_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    sede_operativa uuid
);


--
-- Name: preventivi; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.preventivi WITH (security_invoker='on') AS
 SELECT id_preventivo,
    id_anagrafica,
    created_at,
    is_cancellato
   FROM public."Preventivi";


--
-- Name: prodotti; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.prodotti WITH (security_invoker='on') AS
 SELECT id_prodotto,
    created_at,
    codice,
    nome,
    descrizione,
    marca,
    modello,
    categoria,
    is_cancellato,
    costo_prodotto,
    prezzo_prodotto
   FROM public."Prodotti";


--
-- Name: sedi; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.sedi WITH (security_invoker='on') AS
 SELECT id_sede,
    created_at,
    id_anagrafica,
    is_legale,
    is_operativa,
    indirizzo,
    citta,
    provincia,
    cap,
    nome_sede,
    id_porto,
    is_nave,
    is_banchina,
    is_officina,
    is_cancellato
   FROM public."Sedi";


--
-- Name: subnoleggi; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.subnoleggi WITH (security_invoker='on') AS
 SELECT id_subnoleggio,
    id_anagrafica,
    id_mezzo,
    created_at,
    data_inizio,
    data_fine,
    tempo_indeterminato,
    costo_subnoleggio,
    valore_residuo,
    contratto,
    is_cancellato
   FROM public."Subnoleggi";


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
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
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
-- Name: vw_anagrafiche_complete; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_anagrafiche_complete WITH (security_invoker='on') AS
 SELECT a.id_anagrafica,
    a.ragione_sociale,
    a.partita_iva,
    a.is_cliente,
    a.is_fornitore,
    a.is_owner,
    dm.pec,
    dm.codice_univoco,
    dm.iban,
    dm.pagamento AS modalita_pagamento_default,
    dm.esente_iva,
    (( SELECT row_to_json(sl.*) AS row_to_json
           FROM ( SELECT "Sedi".indirizzo,
                    "Sedi".citta,
                    "Sedi".cap,
                    "Sedi".provincia,
                    "Sedi".nome_sede
                   FROM public."Sedi"
                  WHERE (("Sedi".id_anagrafica = a.id_anagrafica) AND ("Sedi".is_legale = true) AND ("Sedi".is_cancellato = false))
                 LIMIT 1) sl))::jsonb AS sede_legale,
    COALESCE(( SELECT jsonb_agg(row_to_json(s.*)) AS jsonb_agg
           FROM ( SELECT "Sedi".id_sede,
                    "Sedi".nome_sede,
                    "Sedi".indirizzo,
                    "Sedi".citta,
                    "Sedi".cap,
                    "Sedi".provincia,
                    "Sedi".is_legale,
                    "Sedi".is_operativa
                   FROM public."Sedi"
                  WHERE (("Sedi".id_anagrafica = a.id_anagrafica) AND ("Sedi".is_cancellato = false))) s), '[]'::jsonb) AS sedi,
    COALESCE(( SELECT jsonb_agg(row_to_json(c.*)) AS jsonb_agg
           FROM ( SELECT an_contatti.id_contatto,
                    an_contatti.nome,
                    an_contatti.email,
                    an_contatti.telefono,
                    an_contatti.is_referente,
                    an_contatti.is_aziendale
                   FROM public.an_contatti
                  WHERE ((an_contatti.id_anagrafica = a.id_anagrafica) AND (an_contatti.is_cancellato = false))) c), '[]'::jsonb) AS contatti
   FROM (public."Anagrafiche" a
     LEFT JOIN public.an_dati_amministrativi dm ON ((a.id_anagrafica = dm.id_anagrafica)))
  WHERE (a.is_cancellato = false);


--
-- Name: vw_anagrafiche_owners; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_anagrafiche_owners WITH (security_invoker='on') AS
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
-- Name: vw_anagrafiche_selettore; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_anagrafiche_selettore AS
 SELECT a.id_anagrafica,
    a.ragione_sociale,
    a.partita_iva,
    a.is_cliente,
    a.is_fornitore,
    a.is_owner,
    sl.nome_sede AS sede_legale_nome,
    sl.citta AS sede_legale_citta,
    sl.provincia AS sede_legale_provincia,
    ( SELECT count(*) AS count
           FROM public."Sedi" s
          WHERE ((s.id_anagrafica = a.id_anagrafica) AND (s.is_cancellato = false))) AS num_sedi,
    ((((COALESCE(a.ragione_sociale, ''::text) || ' '::text) || COALESCE(a.partita_iva, ''::text)) || ' '::text) || COALESCE(sl.citta, ''::text)) AS search_text
   FROM (public."Anagrafiche" a
     LEFT JOIN public."Sedi" sl ON (((a.id_anagrafica = sl.id_anagrafica) AND (sl.is_legale = true) AND (sl.is_cancellato = false))))
  WHERE (a.is_cancellato = false);


--
-- Name: VIEW vw_anagrafiche_selettore; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON VIEW public.vw_anagrafiche_selettore IS 'View ottimizzata per il selettore anagrafiche. Include ragione sociale, sede legale, e conteggi per display efficiente.';


--
-- Name: vw_lav_tecnici_count; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_lav_tecnici_count WITH (security_invoker='on') AS
 SELECT lt.id_lavorazione,
    count(lt.id_tecnico) AS n_tecnici_assegnati,
    array_agg(concat(t.nome, ' ', t.cognome) ORDER BY t.nome, t.cognome) FILTER (WHERE (t.id_tecnico IS NOT NULL)) AS nomi_tecnici
   FROM (public.lav_tecnici lt
     LEFT JOIN public.tecnici t ON ((lt.id_tecnico = t.id_tecnico)))
  GROUP BY lt.id_lavorazione;


--
-- Name: vw_int_lavorazioni_dettaglio; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_int_lavorazioni_dettaglio WITH (security_invoker='on') AS
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

CREATE VIEW public.vw_gestione_interventi WITH (security_invoker='on') AS
 SELECT i.id_intervento,
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
    m.categoria AS mezzo_categoria,
    m.stato_funzionamento,
    m.ubicazione,
    count(DISTINCT l.id_lavorazione) AS n_lavorazioni,
    min(l.data_da_prevista) AS prima_data_prevista,
    max(l.data_a_prevista) AS ultima_data_prevista,
    sum(COALESCE(l.n_tecnici_previsti, (0)::numeric)) AS totale_tecnici_previsti,
    sum(COALESCE(ld.n_tecnici_assegnati, (0)::bigint)) AS totale_tecnici_assegnati,
    string_agg(DISTINCT array_to_string(ld.nomi_tecnici, ', '::text), ', '::text) AS nomi_tecnici_aggregati
   FROM ((((public."Interventi" i
     LEFT JOIN public."Anagrafiche" a ON ((i.id_anagrafica = a.id_anagrafica)))
     LEFT JOIN public."Mezzi" m ON ((i.id_mezzo = m.id_mezzo)))
     LEFT JOIN public.int_lavorazioni l ON (((i.id_intervento = l.id_intervento) AND (l.is_cancellato = false))))
     LEFT JOIN public.vw_int_lavorazioni_dettaglio ld ON ((l.id_lavorazione = ld.id_lavorazione)))
  WHERE (i.is_cancellato = false)
  GROUP BY i.id_intervento, i.id_mezzo, i.id_anagrafica, i.codice_intervento, i.descrizione_intervento, i.stato_intervento, i.stato_preventivo, i.is_chiuso, i.is_fatturato, i.created_at, a.ragione_sociale, a.partita_iva, m.marca, m.modello, m.matricola, m.id_interno, m.categoria, m.stato_funzionamento, m.ubicazione;


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

CREATE VIEW public.vw_mezzi_guasti WITH (security_invoker='on') AS
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
-- Name: vw_sedi_tutte; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_sedi_tutte WITH (security_invoker='on') AS
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
-- Name: vw_mezzi_selettore; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_mezzi_selettore AS
 SELECT m.id_mezzo,
    m.marca,
    m.modello,
    m.matricola,
    m.id_interno,
    m.anno,
    m.categoria,
    m.stato_funzionamento,
    m.is_disponibile_noleggio,
    m.ore_moto,
    m.id_anagrafica,
    m.id_sede_assegnata,
    m.id_sede_ubicazione,
    a.ragione_sociale AS owner_ragione_sociale,
    sa.nome_sede AS sede_assegnata_nome,
    sa.ubicazione_completa AS sede_assegnata_ubicazione,
    su.nome_sede AS ubicazione_nome,
    su.ubicazione_completa,
    ((((((((COALESCE(m.marca, ''::text) || ' '::text) || COALESCE(m.modello, ''::text)) || ' '::text) || COALESCE(m.matricola, ''::text)) || ' '::text) || COALESCE(m.id_interno, ''::text)) || ' '::text) || COALESCE(a.ragione_sociale, ''::text)) AS search_text
   FROM (((public."Mezzi" m
     LEFT JOIN public."Anagrafiche" a ON ((m.id_anagrafica = a.id_anagrafica)))
     LEFT JOIN public.vw_sedi_tutte sa ON ((m.id_sede_assegnata = sa.id_sede)))
     LEFT JOIN public.vw_sedi_tutte su ON ((m.id_sede_ubicazione = su.id_sede)))
  WHERE (m.is_cancellato = false);


--
-- Name: VIEW vw_mezzi_selettore; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON VIEW public.vw_mezzi_selettore IS 'View ottimizzata per il selettore mezzi. Include tutti i dati necessari per display e ricerca con JOIN pre-computati per massime performance.';


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
    m.ore_moto,
    m.stato_funzionamento,
    m.stato_funzionamento_descrizione,
    m.is_disponibile_noleggio,
    m.specifiche_tecniche,
    m.created_at,
    m.id_anagrafica AS id_proprietario,
    a_prop.ragione_sociale AS proprietario,
    a_prop.is_owner AS is_proprietario_owner,
    m.id_sede_assegnata,
    s_ass.nome_sede AS sede_assegnata_nome,
    s_ass.indirizzo AS sede_assegnata_indirizzo,
    s_ass.citta AS sede_assegnata_citta,
    s_ass.provincia AS sede_assegnata_provincia,
    s_ass.ubicazione_completa AS sede_assegnata_completa,
    m.id_sede_ubicazione,
    s_ub.nome_sede AS ubicazione_nome,
    s_ub.indirizzo AS ubicazione_indirizzo,
    s_ub.citta AS ubicazione_citta,
    s_ub.provincia AS ubicazione_provincia,
    s_ub.ubicazione_completa,
    n.id_noleggio,
    n.data_inizio AS noleggio_data_inizio,
    n.data_fine AS noleggio_data_fine,
    n.tempo_indeterminato AS noleggio_tempo_indeterminato,
    n.prezzo_noleggio,
    n.prezzo_trasporto,
    n.stato_noleggio,
    n.tipo_canone,
    n.contratto AS noleggio_contratto,
    n.note AS noleggio_note,
    n.id_anagrafica AS id_cliente_noleggio,
    a_cliente.ragione_sociale AS cliente_noleggio,
    n.sede_operativa AS id_sede_operativa_noleggio,
    s_op.nome_sede AS sede_operativa_nome,
    s_op.indirizzo AS sede_operativa_indirizzo,
    s_op.citta AS sede_operativa_citta,
    s_op.provincia AS sede_operativa_provincia,
    s_op.ubicazione_completa AS sede_operativa_completa,
    sub.id_subnoleggio,
    sub.data_inizio AS sub_data_inizio,
    sub.data_fine AS sub_data_fine,
    sub.tempo_indeterminato AS sub_tempo_indeterminato,
    sub.costo_subnoleggio,
    sub.valore_residuo,
    sub.contratto AS sub_contratto,
    sub.id_anagrafica AS id_fornitore_subnoleggio,
    a_forn.ragione_sociale AS fornitore_subnoleggio
   FROM ((((((((public."Mezzi" m
     LEFT JOIN public."Anagrafiche" a_prop ON ((m.id_anagrafica = a_prop.id_anagrafica)))
     LEFT JOIN public.vw_sedi_tutte s_ass ON ((m.id_sede_assegnata = s_ass.id_sede)))
     LEFT JOIN public.vw_sedi_tutte s_ub ON ((m.id_sede_ubicazione = s_ub.id_sede)))
     LEFT JOIN public."Noleggi" n ON (((m.id_mezzo = n.id_mezzo) AND (n.is_terminato = false) AND ((n.is_cancellato = false) OR (n.is_cancellato IS NULL)))))
     LEFT JOIN public."Anagrafiche" a_cliente ON ((n.id_anagrafica = a_cliente.id_anagrafica)))
     LEFT JOIN public.vw_sedi_tutte s_op ON ((n.sede_operativa = s_op.id_sede)))
     LEFT JOIN public."Subnoleggi" sub ON (((m.id_mezzo = sub.id_mezzo) AND ((sub.is_cancellato = false) OR (sub.is_cancellato IS NULL)))))
     LEFT JOIN public."Anagrafiche" a_forn ON ((sub.id_anagrafica = a_forn.id_anagrafica)))
  WHERE ((m.is_cancellato = false) OR (m.is_cancellato IS NULL));


--
-- Name: VIEW vw_mezzo_completo; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON VIEW public.vw_mezzo_completo IS 'Complete aggregated view of mezzo data including ownership, location, active rentals, and subleases';


--
-- Name: vw_mezzo_noleggi_attivi; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_mezzo_noleggi_attivi WITH (security_invoker='on') AS
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

CREATE VIEW public.vw_mezzo_subnoleggi_attivi WITH (security_invoker='on') AS
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
-- Name: vw_owner_info; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_owner_info WITH (security_invoker='on') AS
 SELECT a.id_anagrafica,
    a.ragione_sociale,
    a.partita_iva,
    dm.pec,
    dm.iban,
    dm.codice_univoco,
    sl.indirizzo AS sede_legale_indirizzo,
    sl.citta AS sede_legale_citta,
    sl.cap AS sede_legale_cap,
    sl.provincia AS sede_legale_provincia,
    c.email AS contatto_email,
    c.telefono AS contatto_telefono
   FROM (((public."Anagrafiche" a
     LEFT JOIN public.an_dati_amministrativi dm ON ((a.id_anagrafica = dm.id_anagrafica)))
     LEFT JOIN public."Sedi" sl ON (((a.id_anagrafica = sl.id_anagrafica) AND (sl.is_legale = true) AND (sl.is_cancellato = false))))
     LEFT JOIN LATERAL ( SELECT an_contatti.email,
            an_contatti.telefono
           FROM public.an_contatti
          WHERE ((an_contatti.id_anagrafica = a.id_anagrafica) AND (an_contatti.is_aziendale = true) AND (an_contatti.is_cancellato = false))
         LIMIT 1) c ON (true))
  WHERE ((a.is_owner = true) AND (a.is_cancellato = false));


--
-- Name: vw_sedi_per_anagrafica; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_sedi_per_anagrafica WITH (security_invoker='on') AS
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
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: Anagrafiche Anagrafiche_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Anagrafiche"
    ADD CONSTRAINT "Anagrafiche_pkey" PRIMARY KEY (id_anagrafica);


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
-- Name: Mezzi Mezzi_matricola_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Mezzi"
    ADD CONSTRAINT "Mezzi_matricola_unique" UNIQUE (matricola);


--
-- Name: Mezzi Mezzi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Mezzi"
    ADD CONSTRAINT "Mezzi_pkey" PRIMARY KEY (id_mezzo);


--
-- Name: Noleggi Noleggi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Noleggi"
    ADD CONSTRAINT "Noleggi_pkey" PRIMARY KEY (id_noleggio);


--
-- Name: Porti Porti_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Porti"
    ADD CONSTRAINT "Porti_pkey" PRIMARY KEY (id_porto);


--
-- Name: Preventivi Preventivi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Preventivi"
    ADD CONSTRAINT "Preventivi_pkey" PRIMARY KEY (id_preventivo);


--
-- Name: Prodotti Prodotti_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Prodotti"
    ADD CONSTRAINT "Prodotti_pkey" PRIMARY KEY (id_prodotto);


--
-- Name: Sedi Sedi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Sedi"
    ADD CONSTRAINT "Sedi_pkey" PRIMARY KEY (id_sede);


--
-- Name: Subnoleggi Subnoleggi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subnoleggi"
    ADD CONSTRAINT "Subnoleggi_pkey" PRIMARY KEY (id_subnoleggio);


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
-- Name: document_sequences document_sequences_doc_type_year_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_sequences
    ADD CONSTRAINT document_sequences_doc_type_year_key UNIQUE (doc_type, year);


--
-- Name: document_sequences document_sequences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_sequences
    ADD CONSTRAINT document_sequences_pkey PRIMARY KEY (id);


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
-- Name: lav_tecnici lav_tecnici_id_lavorazione_id_tecnico_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lav_tecnici
    ADD CONSTRAINT lav_tecnici_id_lavorazione_id_tecnico_key UNIQUE (id_lavorazione, id_tecnico);


--
-- Name: lav_tecnici lav_tecnici_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lav_tecnici
    ADD CONSTRAINT lav_tecnici_pkey PRIMARY KEY (id_lav_tecnico);


--
-- Name: noleggi_storico noleggi_storico_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.noleggi_storico
    ADD CONSTRAINT noleggi_storico_pkey PRIMARY KEY (id_storico);


--
-- Name: prev_interventi prev_interventi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prev_interventi
    ADD CONSTRAINT prev_interventi_pkey PRIMARY KEY (id_preventivo);


--
-- Name: prev_noleggi prev_noleggi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prev_noleggi
    ADD CONSTRAINT prev_noleggi_pkey PRIMARY KEY (id_preventivo);


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
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: utenti utenti_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utenti
    ADD CONSTRAINT utenti_pkey PRIMARY KEY (id_utente);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


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
-- Name: idx_anagrafiche_search; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_anagrafiche_search ON public."Anagrafiche" USING btree (ragione_sociale, partita_iva) WHERE (is_cancellato = false);


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
-- Name: idx_mezzi_search; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mezzi_search ON public."Mezzi" USING btree (marca, modello, matricola, id_interno) WHERE (is_cancellato = false);


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
-- Name: idx_preventivi_codice; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_preventivi_codice ON public."Preventivi" USING btree (codice);


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
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


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
-- Name: anagrafiche anagrafiche_view_delete_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER anagrafiche_view_delete_trigger INSTEAD OF DELETE ON public.anagrafiche FOR EACH ROW EXECUTE FUNCTION public.anagrafiche_view_delete();


--
-- Name: anagrafiche anagrafiche_view_insert_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER anagrafiche_view_insert_trigger INSTEAD OF INSERT ON public.anagrafiche FOR EACH ROW EXECUTE FUNCTION public.anagrafiche_view_insert();


--
-- Name: anagrafiche anagrafiche_view_update_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER anagrafiche_view_update_trigger INSTEAD OF UPDATE ON public.anagrafiche FOR EACH ROW EXECUTE FUNCTION public.anagrafiche_view_update();


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
-- Name: contratti_noleggio trg_set_contratto_code; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_contratto_code BEFORE INSERT ON public.contratti_noleggio FOR EACH ROW EXECUTE FUNCTION public.trigger_set_contratto_code();


--
-- Name: Preventivi trg_set_preventivo_code; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_preventivo_code BEFORE INSERT ON public."Preventivi" FOR EACH ROW EXECUTE FUNCTION public.trigger_set_preventivo_code();


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
-- Name: prev_noleggi update_prev_noleggi_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_prev_noleggi_updated_at BEFORE UPDATE ON public.prev_noleggi FOR EACH ROW EXECUTE FUNCTION public.update_prev_noleggi_updated_at();


--
-- Name: transazioni update_transazioni_aggiornato_il; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_transazioni_aggiornato_il BEFORE UPDATE ON public.transazioni FOR EACH ROW EXECUTE FUNCTION public.update_aggiornato_il();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: Interventi Interventi_id_anagrafica_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Interventi"
    ADD CONSTRAINT "Interventi_id_anagrafica_fkey" FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Interventi Interventi_id_mezzo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Interventi"
    ADD CONSTRAINT "Interventi_id_mezzo_fkey" FOREIGN KEY (id_mezzo) REFERENCES public."Mezzi"(id_mezzo) ON DELETE CASCADE;


--
-- Name: Mezzi Mezzi_id_anagrafica_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Mezzi"
    ADD CONSTRAINT "Mezzi_id_anagrafica_fkey" FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica) ON DELETE SET NULL;


--
-- Name: Mezzi Mezzi_id_sede_assegnata_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Mezzi"
    ADD CONSTRAINT "Mezzi_id_sede_assegnata_fkey" FOREIGN KEY (id_sede_assegnata) REFERENCES public."Sedi"(id_sede) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Mezzi Mezzi_id_sede_ubicazione_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Mezzi"
    ADD CONSTRAINT "Mezzi_id_sede_ubicazione_fkey" FOREIGN KEY (id_sede_ubicazione) REFERENCES public."Sedi"(id_sede) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Noleggi Noleggi_id_anagrafica_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Noleggi"
    ADD CONSTRAINT "Noleggi_id_anagrafica_fkey" FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Noleggi Noleggi_id_mezzo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Noleggi"
    ADD CONSTRAINT "Noleggi_id_mezzo_fkey" FOREIGN KEY (id_mezzo) REFERENCES public."Mezzi"(id_mezzo) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Noleggi Noleggi_sede_operativa_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Noleggi"
    ADD CONSTRAINT "Noleggi_sede_operativa_fkey" FOREIGN KEY (sede_operativa) REFERENCES public."Sedi"(id_sede) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Preventivi Preventivi_id_anagrafica_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Preventivi"
    ADD CONSTRAINT "Preventivi_id_anagrafica_fkey" FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Sedi Sedi_id_anagrafica_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Sedi"
    ADD CONSTRAINT "Sedi_id_anagrafica_fkey" FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica) ON DELETE CASCADE;


--
-- Name: Sedi Sedi_id_porto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Sedi"
    ADD CONSTRAINT "Sedi_id_porto_fkey" FOREIGN KEY (id_porto) REFERENCES public."Porti"(id_porto) ON DELETE SET NULL;


--
-- Name: Subnoleggi Subnoleggi_id_anagrafica_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subnoleggi"
    ADD CONSTRAINT "Subnoleggi_id_anagrafica_fkey" FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica) ON DELETE CASCADE;


--
-- Name: Subnoleggi Subnoleggi_id_mezzo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subnoleggi"
    ADD CONSTRAINT "Subnoleggi_id_mezzo_fkey" FOREIGN KEY (id_mezzo) REFERENCES public."Mezzi"(id_mezzo) ON DELETE CASCADE;


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
-- Name: int_lavorazioni int_lavorazioni_id_intervento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.int_lavorazioni
    ADD CONSTRAINT int_lavorazioni_id_intervento_fkey FOREIGN KEY (id_intervento) REFERENCES public."Interventi"(id_intervento) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: prev_noleggi prev_noleggi_convertito_in_noleggio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prev_noleggi
    ADD CONSTRAINT prev_noleggi_convertito_in_noleggio_id_fkey FOREIGN KEY (convertito_in_noleggio_id) REFERENCES public."Noleggi"(id_noleggio) ON DELETE SET NULL;


--
-- Name: prev_noleggi prev_noleggi_id_anagrafica_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prev_noleggi
    ADD CONSTRAINT prev_noleggi_id_anagrafica_fkey FOREIGN KEY (id_anagrafica) REFERENCES public."Anagrafiche"(id_anagrafica);


--
-- Name: prev_noleggi prev_noleggi_id_anagrafica_fornitore_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prev_noleggi
    ADD CONSTRAINT prev_noleggi_id_anagrafica_fornitore_fkey FOREIGN KEY (id_anagrafica_fornitore) REFERENCES public."Anagrafiche"(id_anagrafica);


--
-- Name: prev_noleggi prev_noleggi_id_mezzo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prev_noleggi
    ADD CONSTRAINT prev_noleggi_id_mezzo_fkey FOREIGN KEY (id_mezzo) REFERENCES public."Mezzi"(id_mezzo);


--
-- Name: prev_noleggi prev_noleggi_id_preventivo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prev_noleggi
    ADD CONSTRAINT prev_noleggi_id_preventivo_fkey FOREIGN KEY (id_preventivo) REFERENCES public."Preventivi"(id_preventivo) ON DELETE CASCADE;


--
-- Name: prev_noleggi prev_noleggi_sede_operativa_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prev_noleggi
    ADD CONSTRAINT prev_noleggi_sede_operativa_fkey FOREIGN KEY (sede_operativa) REFERENCES public."Sedi"(id_sede) ON UPDATE CASCADE ON DELETE SET NULL;


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
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: prev_noleggi Accesso completo prev_noleggi; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Accesso completo prev_noleggi" ON public.prev_noleggi USING (true) WITH CHECK (true);


--
-- Name: user_roles Admins can manage all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all roles" ON public.user_roles TO authenticated USING (public.hasrole(( SELECT auth.uid() AS uid), 'admin'::public.app_role)) WITH CHECK (public.hasrole(( SELECT auth.uid() AS uid), 'admin'::public.app_role));


--
-- Name: Anagrafiche; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Anagrafiche" ENABLE ROW LEVEL SECURITY;

--
-- Name: Anagrafiche Authenticated users can access Anagrafiche; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can access Anagrafiche" ON public."Anagrafiche" TO authenticated USING (true) WITH CHECK (true);


--
-- Name: Interventi Authenticated users can access Interventi; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can access Interventi" ON public."Interventi" TO authenticated USING (true) WITH CHECK (true);


--
-- Name: Mezzi Authenticated users can access Mezzi; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can access Mezzi" ON public."Mezzi" TO authenticated USING (true) WITH CHECK (true);


--
-- Name: Noleggi Authenticated users can access Noleggi; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can access Noleggi" ON public."Noleggi" TO authenticated USING (true) WITH CHECK (true);


--
-- Name: Porti Authenticated users can access Porti; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can access Porti" ON public."Porti" TO authenticated USING (true) WITH CHECK (true);


--
-- Name: Preventivi Authenticated users can access Preventivi; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can access Preventivi" ON public."Preventivi" TO authenticated USING (true) WITH CHECK (true);


--
-- Name: Prodotti Authenticated users can access Prodotti; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can access Prodotti" ON public."Prodotti" TO authenticated USING (true) WITH CHECK (true);


--
-- Name: Sedi Authenticated users can access Sedi; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can access Sedi" ON public."Sedi" TO authenticated USING (true) WITH CHECK (true);


--
-- Name: Subnoleggi Authenticated users can access Subnoleggi; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can access Subnoleggi" ON public."Subnoleggi" TO authenticated USING (true) WITH CHECK (true);


--
-- Name: an_contatti Authenticated users can access an_contatti; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can access an_contatti" ON public.an_contatti TO authenticated USING (true) WITH CHECK (true);


--
-- Name: an_dati_amministrativi Authenticated users can access an_dati_amministrativi; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can access an_dati_amministrativi" ON public.an_dati_amministrativi TO authenticated USING (true) WITH CHECK (true);


--
-- Name: conti_bancari Authenticated users can access conti_bancari; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can access conti_bancari" ON public.conti_bancari TO authenticated USING (true) WITH CHECK (true);


--
-- Name: contratti_noleggio Authenticated users can access contratti_noleggio; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can access contratti_noleggio" ON public.contratti_noleggio TO authenticated USING (true) WITH CHECK (true);


--
-- Name: documenti_noleggio Authenticated users can access documenti_noleggio; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can access documenti_noleggio" ON public.documenti_noleggio TO authenticated USING (true) WITH CHECK (true);


--
-- Name: frn_mezzi Authenticated users can access frn_mezzi; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can access frn_mezzi" ON public.frn_mezzi TO authenticated USING (true) WITH CHECK (true);


--
-- Name: frn_ricambi Authenticated users can access frn_ricambi; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can access frn_ricambi" ON public.frn_ricambi TO authenticated USING (true) WITH CHECK (true);


--
-- Name: frn_servizi Authenticated users can access frn_servizi; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can access frn_servizi" ON public.frn_servizi TO authenticated USING (true) WITH CHECK (true);


--
-- Name: frn_trasporti Authenticated users can access frn_trasporti; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can access frn_trasporti" ON public.frn_trasporti TO authenticated USING (true) WITH CHECK (true);


--
-- Name: int_lav_prod Authenticated users can access int_lav_prod; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can access int_lav_prod" ON public.int_lav_prod TO authenticated USING (true) WITH CHECK (true);


--
-- Name: int_lavorazioni Authenticated users can access int_lavorazioni; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can access int_lavorazioni" ON public.int_lavorazioni TO authenticated USING (true) WITH CHECK (true);


--
-- Name: lav_tecnici Authenticated users can access lav_tecnici; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can access lav_tecnici" ON public.lav_tecnici TO authenticated USING (true) WITH CHECK (true);


--
-- Name: noleggi_storico Authenticated users can access noleggi_storico; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can access noleggi_storico" ON public.noleggi_storico TO authenticated USING (true) WITH CHECK (true);


--
-- Name: prev_interventi Authenticated users can access prev_interventi; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can access prev_interventi" ON public.prev_interventi TO authenticated USING (true) WITH CHECK (true);


--
-- Name: prev_noleggi Authenticated users can access prev_noleggi; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can access prev_noleggi" ON public.prev_noleggi TO authenticated USING (true) WITH CHECK (true);


--
-- Name: tecnici Authenticated users can access tecnici; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can access tecnici" ON public.tecnici TO authenticated USING (true) WITH CHECK (true);


--
-- Name: transazioni Authenticated users can access transazioni; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can access transazioni" ON public.transazioni TO authenticated USING (true) WITH CHECK (true);


--
-- Name: utenti Authenticated users can access utenti; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can access utenti" ON public.utenti TO authenticated USING (true) WITH CHECK (true);


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
-- Name: user_roles Users can view own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING ((( SELECT auth.uid() AS uid) = user_id));


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
-- Name: prev_noleggi; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.prev_noleggi ENABLE ROW LEVEL SECURITY;

--
-- Name: tecnici; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tecnici ENABLE ROW LEVEL SECURITY;

--
-- Name: transazioni; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.transazioni ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: utenti; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.utenti ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: objects Authenticated users can delete contracts; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Authenticated users can delete contracts" ON storage.objects FOR DELETE TO authenticated USING ((bucket_id = 'contratti'::text));


--
-- Name: objects Authenticated users can read contracts; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Authenticated users can read contracts" ON storage.objects FOR SELECT TO authenticated USING ((bucket_id = 'contratti'::text));


--
-- Name: objects Authenticated users can update contracts; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Authenticated users can update contracts" ON storage.objects FOR UPDATE TO authenticated USING ((bucket_id = 'contratti'::text));


--
-- Name: objects Authenticated users can upload contracts; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Authenticated users can upload contracts" ON storage.objects FOR INSERT TO authenticated WITH CHECK ((bucket_id = 'contratti'::text));


--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

\unrestrict AYAKk0TyKJdNwBanxCIbzRuIh5hvHPnG7qPHj1ojJMz4c9pq00pxrzeaOfaYRXq

