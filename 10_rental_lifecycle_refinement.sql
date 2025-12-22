-- Raffinamento del ciclo di vita dei noleggi e dei preventivi

-- 1. Aggiunta della colonna is_archiviato alla tabella Noleggi
-- Questa colonna permetterà di tenere i noleggi terminati visibili fino all'archiviazione manuale.
ALTER TABLE public."Noleggi" 
ADD COLUMN is_archiviato BOOLEAN DEFAULT false;

-- 2. Aggiornamento dell'enum stato_preventivo
-- Aggiungiamo lo stato 'concluso' per riflettere quando il noleggio associato è terminato.
-- Nota: In PostgreSQL, non è possibile aggiungere direttamente un valore a un enum all'interno di una transazione in alcune versioni, 
-- ma Supabase/Postgres 15+ lo permette fuori dalle transazioni o con cautela.

ALTER TYPE public.stato_preventivo ADD VALUE IF NOT EXISTS 'concluso';
