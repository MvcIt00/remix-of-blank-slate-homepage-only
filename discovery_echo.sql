-- ==============================================================================
-- 🔍 SCRIPT DI DISCOVERY STRUTTURALE (ENTERPRISE ALIGNMENT)
-- Copia e incolla questo script nel SQL Editor di Supabase Dashboard.
-- L'output permetterà di mappare esattamente le differenze tra gli ecosistemi.
-- ==============================================================================

-- 1. STRUTTURA TABELLE FISICHE
-- Identifichiamo i campi presenti, specialmente quelli JSONB (snapshot).
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name IN ('prev_noleggi', 'contratti_noleggio', 'Noleggi', 'Preventivi')
ORDER BY table_name, ordinal_position;

-- 2. LOGICA DELLE VISTE
-- Estraiamo il codice SQL delle viste per capire come vengono aggregati i dati.
SELECT viewname, definition
FROM pg_catalog.pg_views
WHERE schemaname = 'public' 
  AND viewname IN ('vw_preventivi_completi', 'vw_noleggi_completi', 'vw_entita_anagrafica_documentale', 'vw_sedi_tutte');

-- 3. AUTOMAZIONI (TRIGGER)
-- Vediamo se ci sono logiche di snapshot automatico o cambio stato via DB.
SELECT 
    event_object_table AS table_name, 
    trigger_name, 
    event_manipulation AS event, 
    action_timing AS timing
FROM information_schema.triggers
WHERE event_object_table IN ('prev_noleggi', 'contratti_noleggio', 'Noleggi', 'Preventivi', 'documenti_noleggio');

-- 4. VINCOLI E CHIAVI ESTERNE
-- Verifichiamo le relazioni tra preventivi, contratti e noleggi.
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid::regclass::text IN ('public.prev_noleggi', 'public.contratti_noleggio', 'public."Noleggi"', 'public."Preventivi"');

-- 5. DEFINIZIONE ENUM (Stati Documento)
-- Vediamo quali stati sono ammessi per preventivi e contratti.
SELECT t.typname AS enum_name, e.enumlabel AS label
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
ORDER BY enum_name, e.enumsortorder;

-- 6. INDICI
-- Verifichiamo le performance e le univocità.
SELECT tablename, indexname, indexdef
FROM pg_catalog.pg_indexes
WHERE schemaname = 'public' 
  AND tablename IN ('prev_noleggi', 'contratti_noleggio', 'Noleggi', 'Preventivi');
