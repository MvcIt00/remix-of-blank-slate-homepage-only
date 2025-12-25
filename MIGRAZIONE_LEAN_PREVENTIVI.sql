-- ==============================================================================
-- 🚀 REFACTORING: LEAN & SCALABLE PREVENTIVI ARCHITECTURE
-- Specializzazione del codice documento e isolamento dei domini.
-- ==============================================================================

-- 1. PREPARAZIONE TABELLA FIGLIO (Noleggio)
-- Aggiungiamo il codice alla tabella specifica
ALTER TABLE public.prev_noleggi ADD COLUMN IF NOT EXISTS codice text;

-- 2. MIGRAZIONE DATI ESISTENTI
-- Spostiamo i codici dal padre al figlio se presenti
UPDATE public.prev_noleggi pn
SET codice = p.codice
FROM public."Preventivi" p
WHERE pn.id_preventivo = p.id_preventivo
AND p.codice IS NOT NULL;

-- 3. NUOVA LOGICA DI GENERAZIONE CODICE (Scalabile)
-- Creiamo una funzione specifica per i preventivi NOLEGGIO
CREATE OR REPLACE FUNCTION public.fn_set_preventivo_noleggio_code()
RETURNS TRIGGER AS $$
BEGIN
    -- Usiamo un prefisso specifico per il reparto noleggio
    IF NEW.codice IS NULL THEN
        NEW.codice := public.get_next_document_code('PN');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sulla tabella specifica (Figlio)
DROP TRIGGER IF EXISTS trg_set_prev_noleggio_code ON public.prev_noleggi;
CREATE TRIGGER trg_set_prev_noleggio_code
BEFORE INSERT ON public.prev_noleggi
FOR EACH ROW
EXECUTE FUNCTION public.fn_set_preventivo_noleggio_code();

-- 4. CLEANUP TABELLA PADRE (Anagrafica Pura)
-- Rimuoviamo il codice e il trigger generico dalla tabella padre
DROP TRIGGER IF EXISTS trg_set_preventivo_code ON public."Preventivi";
ALTER TABLE public."Preventivi" DROP COLUMN IF EXISTS codice;

-- 5. AGGIORNAMENTO VISTA (Single Source of Truth)
-- La vista ora prende il codice direttamente dalla tabella noleggio
CREATE OR REPLACE VIEW public.vw_preventivi_completi AS
SELECT 
    pn.*,
    a.ragione_sociale AS cliente_ragione_sociale,
    a.partita_iva AS cliente_piva,
    a.email AS cliente_email,
    m.marca,
    m.modello,
    m.matricola,
    s.nome_sede AS sede_operativa_nome,
    s.indirizzo AS sede_indirizzo,
    s.citta AS sede_citta,
    s.cap AS sede_cap,
    s.provincia AS sede_provincia
FROM public.prev_noleggi pn
JOIN public."Preventivi" p ON pn.id_preventivo = p.id_preventivo
LEFT JOIN public."Anagrafiche" a ON pn.id_anagrafica = a.id_anagrafica
LEFT JOIN public."Mezzi" m ON pn.id_mezzo = m.id_mezzo
LEFT JOIN public."Sedi" s ON pn.sede_operativa = s.id_sede
WHERE pn.is_cancellato = false;

-- 6. AZIONE MANUALE STORAGE (Istruzione per utente)
-- -- IMPORTANTE: Creare il bucket 'noleggio_docs' con permessi pubblici/protetti in Supabase Dashboard.
-- -- Inseriamo un commento record per traccia.
COMMENT ON TABLE public.prev_noleggi IS 'Tabella specializzata per preventivi noleggio. Documenti archiviati nel bucket: noleggio_docs';
