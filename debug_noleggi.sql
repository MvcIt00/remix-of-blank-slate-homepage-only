SELECT table_schema, table_name FROM information_schema.tables WHERE table_name = 'Noleggi';

SELECT trigger_name, event_manipulation, event_object_table, action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'Noleggi';

\d "Noleggi"
