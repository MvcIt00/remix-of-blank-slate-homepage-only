\pset pager off
SELECT table_schema, table_name FROM information_schema.tables WHERE table_name ILIKE '%nolegg%';
SELECT trigger_schema, trigger_name, event_object_table FROM information_schema.triggers WHERE event_object_table ILIKE '%nolegg%';
