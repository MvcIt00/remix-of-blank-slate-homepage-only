\pset pager off
SELECT 
    trg.tgname AS trigger_name,
    tbl.relname AS table_name,
    ns.nspname AS schema_name
FROM pg_trigger trg
JOIN pg_class tbl ON trg.tgrelid = tbl.oid
JOIN pg_namespace ns ON tbl.relnamespace = ns.oid
WHERE trg.tgname LIKE '%nolegg%';
