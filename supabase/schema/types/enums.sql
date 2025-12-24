-- AUTH SCHEMA TYPES
CREATE TYPE auth.aal_level AS ENUM ('aal1', 'aal2', 'aal3');
CREATE TYPE auth.code_challenge_method AS ENUM ('s256', 'plain');
CREATE TYPE auth.factor_status AS ENUM ('unverified', 'verified');
CREATE TYPE auth.factor_type AS ENUM ('totp', 'webauthn', 'phone');
CREATE TYPE auth.oauth_authorization_status AS ENUM ('pending', 'approved', 'denied', 'expired');
CREATE TYPE auth.oauth_client_type AS ENUM ('public', 'confidential');
CREATE TYPE auth.oauth_registration_type AS ENUM ('dynamic', 'manual');
CREATE TYPE auth.oauth_response_type AS ENUM ('code');
CREATE TYPE auth.one_time_token_type AS ENUM ('confirmation_token', 'reauthentication_token', 'recovery_token', 'email_change_token_new', 'email_change_token_current', 'phone_change_token');

-- PUBLIC SCHEMA TYPES
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.categoria_mezzo AS ENUM ('sollevamento', 'trasporto', 'escavazione', 'compattazione', 'altro');
CREATE TYPE public.categoria_uscita AS ENUM ('Spese Bancarie', 'Fornitori', 'Tasse/Imposte', 'Varie');
CREATE TYPE public.categorie_prodotti AS ENUM ('ricambio', 'componente', 'materiale_consumo', 'attrezzatura', 'altro');
CREATE TYPE public.competenza_lavorazione AS ENUM ('meccanica', 'elettrica', 'idraulica', 'generale');
CREATE TYPE public.modalita_pagamento AS ENUM ('bonifico_anticipato', 'bonifico_30gg', 'bonifico_60gg', 'bonifico_90gg', 'riba_30gg', 'riba_60gg', 'riba_90gg', 'rimessa_diretta', 'contrassegno');
CREATE TYPE public.stato_contratto AS ENUM ('bozza', 'inviato', 'firmato', 'attivo', 'annullato');
CREATE TYPE public.stato_funzionamento AS ENUM ('funzionante', 'intervenire', 'ritirare');
CREATE TYPE public.stato_intervento AS ENUM ('aperto', 'in lavorazione', 'chiuso', 'preventivazione');
CREATE TYPE public.stato_lavorazione AS ENUM ('prevista', 'aperta', 'in lavorazione', 'chiusa', 'pronta', 'assegnata', 'in_lavorazione', 'completata');
CREATE TYPE public.stato_noleggio AS ENUM ('futuro', 'attivo', 'scaduto', 'archiviato', 'terminato');
CREATE TYPE public.stato_preventivo AS ENUM ('bozza', 'inviato', 'approvato', 'rifiutato', 'concluso', 'archiviato');
CREATE TYPE public.tipo_canone AS ENUM ('giornaliero', 'mensile');
CREATE TYPE public.tipo_documento_noleggio AS ENUM ('contratto_firmato', 'verbale_consegna', 'ddt', 'foto_consegna', 'foto_ritiro', 'altro');
CREATE TYPE public.tipo_evento_storico AS ENUM ('creazione', 'modifica', 'terminazione', 'cancellazione', 'riattivazione', 'cambio_sede');
CREATE TYPE public.tipo_movimento AS ENUM ('BONIFICO', 'RICEVUTA_BANCARIA', 'ASSEGNO', 'CONTANTI', 'ALTRO');
CREATE TYPE public.tipo_transazione AS ENUM ('ENTRATA', 'USCITA', 'TRASFERIMENTO');

-- REALTIME SCHEMA TYPES
CREATE TYPE realtime.action AS ENUM ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'ERROR');
CREATE TYPE realtime.equality_op AS ENUM ('eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'in');
CREATE TYPE realtime.user_defined_filter AS (column_name text, op realtime.equality_op, value text);
CREATE TYPE realtime.wal_column AS (name text, type_name text, type_oid oid, value jsonb, is_pkey boolean, is_selectable boolean);
CREATE TYPE realtime.wal_rls AS (wal jsonb, is_rls_enabled boolean, subscription_ids uuid[], errors text[]);

-- STORAGE SCHEMA TYPES
CREATE TYPE storage.buckettype AS ENUM ('STANDARD', 'ANALYTICS', 'VECTOR');
