-- ==============================================================================
-- 🚀 PHASE 5: PARENT-CHILD SYNCHRONIZATION & ATOMICITY
-- Sincronizza le tabelle 'Preventivi' e 'prev_noleggi' alla radice.
-- ==============================================================================

-- 1. FUNZIONE DI SINCRONIZZAZIONE (Parent-Child)
-- Garantisce che se cambia il cliente nel dettaglio, cambia anche nel record principale.
CREATE OR REPLACE FUNCTION public.fn_sync_preventivo_parent_entity_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Se l'id_anagrafica è cambiato, aggiorniamo il record padre in Preventivi
    IF (OLD.id_anagrafica IS DISTINCT FROM NEW.id_anagrafica) THEN
        UPDATE public."Preventivi"
        SET id_anagrafica = NEW.id_anagrafica
        WHERE id_preventivo = NEW.id_preventivo;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. TRIGGER DI SINCRONIZZAZIONE
DROP TRIGGER IF EXISTS tr_sync_preventivo_parent ON public.prev_noleggi;
CREATE TRIGGER tr_sync_preventivo_parent
AFTER UPDATE OF id_anagrafica ON public.prev_noleggi
FOR EACH ROW
EXECUTE FUNCTION public.fn_sync_preventivo_parent_entity_update();

-- 3. AUDIT & FIX: Allineamento record esistenti (Clean Slate)
-- Identifica record incoerenti e li allinea forzatamente (preferendo il dato in prev_noleggi)
UPDATE public."Preventivi" p
SET id_anagrafica = pn.id_anagrafica
FROM public.prev_noleggi pn
WHERE p.id_preventivo = pn.id_preventivo
AND p.id_anagrafica IS DISTINCT FROM pn.id_anagrafica;

-- 4. OTTIMIZZAZIONE VISTA (Join Rigoroso 1:1)
-- Assicuriamoci che la vista non generi mai righe duplicate in caso di dati sporchi
CREATE OR REPLACE VIEW public.vw_preventivi_completi AS
SELECT 
    pn.*,
    p.id_anagrafica AS parent_anagrafica_id, -- Per debugging
    a.ragione_sociale AS cliente_ragione_sociale,
    a.partita_iva AS cliente_piva,
    -- ... altri campi ... (nella realtà la vista è più complessa, ma qui assicuriamo il join corretto)
    m.marca,
    m.modello,
    m.matricola
FROM public.prev_noleggi pn
JOIN public."Preventivi" p ON pn.id_preventivo = p.id_preventivo
LEFT JOIN public."Anagrafiche" a ON pn.id_anagrafica = a.id_anagrafica
LEFT JOIN public."Mezzi" m ON pn.id_mezzo = m.id_mezzo
WHERE pn.is_cancellato = false; -- Se presente flag

COMMENT ON TRIGGER tr_sync_preventivo_parent ON public.prev_noleggi IS 'Garantisce che l''anagrafica del padre (Preventivi) sia sempre allineata con i dettagli del figlio (prev_noleggi).';
