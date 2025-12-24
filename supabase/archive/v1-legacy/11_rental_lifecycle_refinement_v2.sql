-- Raffinamento del ciclo di vita dei noleggi e dei preventivi (Versione 2 - Basata su Enum)

-- 1. Pulizia: Rimuoviamo la colonna is_archiviato (se aggiunta in precedenza) 
-- per usare lo stato nell'enum come suggerito dall'utente.
ALTER TABLE public."Noleggi" DROP COLUMN IF EXISTS is_archiviato;

-- 2. Aggiornamento dell'enum stato_noleggio
-- Aggiungiamo 'archiviato' per la gestione della visibilità
-- Aggiungiamo 'terminato' per riflettere lo stato finale del noleggio nell'enum
ALTER TYPE public.stato_noleggio ADD VALUE IF NOT EXISTS 'archiviato';
ALTER TYPE public.stato_noleggio ADD VALUE IF NOT EXISTS 'terminato';

-- 3. Aggiornamento dell'enum stato_preventivo
-- Aggiungiamo lo stato 'concluso' per i preventivi il cui noleggio è terminato.
ALTER TYPE public.stato_preventivo ADD VALUE IF NOT EXISTS 'concluso';
