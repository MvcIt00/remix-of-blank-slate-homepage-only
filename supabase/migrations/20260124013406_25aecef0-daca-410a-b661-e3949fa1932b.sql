-- Aggiungi stato 'scaduto' all'enum stato_preventivo
-- Rappresenta un preventivo inviato che ha superato la data_scadenza senza risposta
ALTER TYPE stato_preventivo ADD VALUE IF NOT EXISTS 'scaduto' AFTER 'inviato';