-- Allineamento tipi e vincoli per sede_operativa in preventivi noleggio
-- Questo script trasforma la colonna sede_operativa da TEXT a UUID e aggiunge la foreign key verso la tabella Sedi

-- 1. Pulizia dati: assicuriamoci che i valori attuali siano UUID validi o NULL
UPDATE public.prev_noleggi 
SET sede_operativa = NULL 
WHERE sede_operativa IS NOT NULL 
  AND sede_operativa !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- 2. Cambio tipo colonna
ALTER TABLE public.prev_noleggi 
  ALTER COLUMN sede_operativa TYPE uuid USING sede_operativa::uuid;

-- 3. Aggiunta Foreign Key (per integrità dati)
ALTER TABLE ONLY public.prev_noleggi
    ADD CONSTRAINT prev_noleggi_sede_operativa_fkey 
    FOREIGN KEY (sede_operativa) REFERENCES public."Sedi"(id_sede) 
    ON UPDATE CASCADE ON DELETE SET NULL;
