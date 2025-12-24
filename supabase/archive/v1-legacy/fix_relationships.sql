-- Aggiunta delle relazioni mancanti alla tabella prev_noleggi

-- 1. Relazione con Anagrafiche (Cliente)
ALTER TABLE public.prev_noleggi
DROP CONSTRAINT IF EXISTS prev_noleggi_id_anagrafica_fkey;

ALTER TABLE public.prev_noleggi
ADD CONSTRAINT prev_noleggi_id_anagrafica_fkey
FOREIGN KEY (id_anagrafica)
REFERENCES public."Anagrafiche"(id_anagrafica);

-- 2. Relazione con Mezzi
ALTER TABLE public.prev_noleggi
DROP CONSTRAINT IF EXISTS prev_noleggi_id_mezzo_fkey;

ALTER TABLE public.prev_noleggi
ADD CONSTRAINT prev_noleggi_id_mezzo_fkey
FOREIGN KEY (id_mezzo)
REFERENCES public."Mezzi"(id_mezzo);

-- 3. Relazione con Anagrafiche (Fornitore)
ALTER TABLE public.prev_noleggi
DROP CONSTRAINT IF EXISTS prev_noleggi_id_anagrafica_fornitore_fkey;

ALTER TABLE public.prev_noleggi
ADD CONSTRAINT prev_noleggi_id_anagrafica_fornitore_fkey
FOREIGN KEY (id_anagrafica_fornitore)
REFERENCES public."Anagrafiche"(id_anagrafica);

-- 4. Relazione con Noleggi (per conversione)
ALTER TABLE public.prev_noleggi
DROP CONSTRAINT IF EXISTS prev_noleggi_convertito_in_noleggio_id_fkey;

ALTER TABLE public.prev_noleggi
ADD CONSTRAINT prev_noleggi_convertito_in_noleggio_id_fkey
FOREIGN KEY (convertito_in_noleggio_id)
REFERENCES public."Noleggi"(id_noleggio);

-- Ricarica la configurazione per applicare le modifiche alla cache di Supabase
NOTIFY pgrst, 'reload config';
