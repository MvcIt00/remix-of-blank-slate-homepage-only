-- 🔍 AUDIT COMPLETO LOGICA STORAGE
-- Esegui questo script per identificare dove nasce il percorso "noleggi/".

-- 1. CERCA NEI TRIGGER
-- I trigger potrebbero chiamare funzioni che generano percorsi.
SELECT 
    event_object_table AS tabella, 
    trigger_name AS nome_trigger, 
    action_statement AS corpo_trigger
FROM information_schema.triggers 
WHERE action_statement ILIKE '%noleggi/%';

-- 2. CERCA NELLE FUNZIONI (PROCEDURE)
-- Molti rami Supabase usano plpgsql per generare i nomi dei file.
SELECT 
    p.proname AS nome_funzione,
    p.prosrc AS sorgente_codice
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.prosrc ILIKE '%noleggi/%';

-- 3. CERCA NELLE VISTE
-- Controlliamo se qualche vista sta ancora "iniettando" questo percorso.
SELECT 
    table_name AS nome_vista, 
    view_definition
FROM information_schema.views 
WHERE view_definition ILIKE '%noleggi/%'
  AND table_schema = 'public';

-- 4. CERCA NELLE POLICY DI STORAGE
-- Anche le policy RLS possono contenere stringhe di controllo del path.
SELECT 
    name AS nome_policy,
    definition AS definizione_policy
FROM pg_policies
WHERE schemaname = 'storage'
  AND (definition ILIKE '%noleggi/%' OR name ILIKE '%noleggi/%');
