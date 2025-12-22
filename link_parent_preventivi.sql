-- Link prev_noleggi to Parent Table 'Preventivi'

-- 1. Inseriamo i record mancanti nella tabella padre 'Preventivi' per i record esistenti in 'prev_noleggi'
-- Questo evita errori quando andremo ad aggiungere la Foreign Key
INSERT INTO public."Preventivi" (id_preventivo, id_anagrafica, created_at)
SELECT id_preventivo, id_anagrafica, created_at
FROM public.prev_noleggi
WHERE id_preventivo NOT IN (SELECT id_preventivo FROM public."Preventivi");

-- 2. Aggiungiamo il vincolo di chiave esterna (Foreign Key)
ALTER TABLE public.prev_noleggi
DROP CONSTRAINT IF EXISTS prev_noleggi_id_preventivo_fkey;

ALTER TABLE public.prev_noleggi
ADD CONSTRAINT prev_noleggi_id_preventivo_fkey
FOREIGN KEY (id_preventivo)
REFERENCES public."Preventivi"(id_preventivo)
ON DELETE CASCADE;

-- Ricarica configurazione
NOTIFY pgrst, 'reload config';
