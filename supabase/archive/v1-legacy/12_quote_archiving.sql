-- Raffinamento del ciclo di vita dei preventivi (Archiviazione)

-- 1. Aggiornamento dell'enum stato_preventivo
-- Aggiungiamo lo stato 'archiviato' per permettere la rimozione logica dei preventivi dalla vista principale.
ALTER TYPE public.stato_preventivo ADD VALUE IF NOT EXISTS 'archiviato';
