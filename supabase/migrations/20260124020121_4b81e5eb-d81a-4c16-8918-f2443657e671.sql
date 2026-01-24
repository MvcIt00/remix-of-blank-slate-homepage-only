-- Aggiungere stato 'da_inviare' all'enum stato_preventivo
-- Ordine: bozza → da_inviare → inviato → scaduto → in_revisione → approvato → rifiutato → concluso → archiviato
ALTER TYPE stato_preventivo ADD VALUE IF NOT EXISTS 'da_inviare' AFTER 'bozza';