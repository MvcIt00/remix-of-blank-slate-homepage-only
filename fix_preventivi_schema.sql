-- MIGRAZIONE PREVENTIVI: CODICI E PDF STORAGE (NXUS)
BEGIN;

-- 1. AGGIUNTA CAMPI MANCANTI
-- Tabella padre (per numbering centralizzato)
ALTER TABLE public."Preventivi" 
ADD COLUMN IF NOT EXISTS codice TEXT UNIQUE;

-- Tabella figlio (noleggi)
ALTER TABLE public.prev_noleggi 
ADD COLUMN IF NOT EXISTS pdf_bozza_path TEXT,
ADD COLUMN IF NOT EXISTS pdf_firmato_path TEXT;

-- 2. ATTIVAZIONE TRIGGER NUMERAZIONE
-- Assicuriamoci che il trigger esista sulla tabella Preventivi
DROP TRIGGER IF EXISTS trg_set_preventivo_code ON public."Preventivi";
CREATE TRIGGER trg_set_preventivo_code
BEFORE INSERT ON public."Preventivi"
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_preventivo_code();

-- 3. AGGIORNAMENTO VIEW (vw_preventivi_completi)
-- PostgreSQL non permette di cambiare signature alle view esistenti con CREATE OR REPLACE
-- Quindi la droppiamo e ricreiamo (Enterprise Standard)
DROP VIEW IF EXISTS public.vw_preventivi_completi;

CREATE OR REPLACE VIEW public.vw_preventivi_completi AS
SELECT 
    p.id_preventivo,
    p.codice,
    pn.id_anagrafica,
    pn.id_anagrafica_fornitore,
    pn.id_mezzo,
    pn.data_inizio,
    pn.data_fine,
    pn.tempo_indeterminato,
    pn.prezzo_noleggio,
    pn.prezzo_trasporto,
    pn.tipo_canone,
    pn.note,
    pn.stato,
    pn.convertito_in_noleggio_id,
    pn.pdf_bozza_path,
    pn.pdf_firmato_path,
    p.created_at,
    p.is_cancellato,
    a.ragione_sociale as cliente_ragione_sociale,
    a.partita_iva as cliente_piva,
    m.marca,
    m.modello,
    m.matricola,
    n.is_terminato as noleggio_is_terminato
FROM public."Preventivi" p
JOIN public.prev_noleggi pn ON p.id_preventivo = pn.id_preventivo
LEFT JOIN public."Anagrafiche" a ON pn.id_anagrafica = a.id_anagrafica
LEFT JOIN public."Mezzi" m ON pn.id_mezzo = m.id_mezzo
LEFT JOIN public."Noleggi" n ON pn.convertito_in_noleggio_id = n.id_noleggio;

-- 4. POLICIES DI STORAGE (Per la sottocartella preventivi)
-- Permettiamo accesso alla nuova struttura cartelle
CREATE POLICY "Gestione Preventivi Storage"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'contratti' AND name LIKE 'preventivi/%');

COMMIT;
