-- Fix FK constraint to allow Noleggi deletion
-- When a Noleggio is deleted, the referencing Preventivo should just lose the link (SET NULL)
-- instead of blocking the deletion.

ALTER TABLE prev_noleggi 
DROP CONSTRAINT IF EXISTS prev_noleggi_convertito_in_noleggio_id_fkey;

ALTER TABLE prev_noleggi 
DROP CONSTRAINT IF EXISTS "prev_noleggi_convertito_in_noleggio_id_fkey"; -- Check for double quotes variant just in case

ALTER TABLE prev_noleggi
ADD CONSTRAINT prev_noleggi_convertito_in_noleggio_id_fkey
FOREIGN KEY (convertito_in_noleggio_id)
REFERENCES "Noleggi" (id_noleggio)
ON DELETE SET NULL;
