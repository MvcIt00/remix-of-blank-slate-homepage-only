-- VIEW PER IL PARCO MACCHINE (Ottimizzazione letture)
DROP VIEW IF EXISTS public.vw_mezzi_completi CASCADE;
CREATE OR REPLACE VIEW public.vw_mezzi_completi AS
SELECT 
    m.id_mezzo,
    m.id_anagrafica,
    m.id_sede_assegnata,
    m.id_sede_ubicazione,
    m.marca,
    m.modello,
    m.matricola,
    m.id_interno,
    m.stato_funzionamento,
    m.stato_funzionamento_descrizione,
    m.is_cancellato,
    m.created_at,
    -- Dati Sede Assegnata
    s.nome_sede,
    s.citta AS sede_citta,
    s.indirizzo AS sede_indirizzo,
    -- Dati Sede Ubicazione (Dove si trova fisicamente il mezzo)
    s_ubi.nome_sede AS nome_sede_ubicazione,
    s_ubi.citta AS sede_ubicazione_citta,
    s_ubi.indirizzo AS sede_ubicazione_indirizzo,
    -- Dati Proprietario (Anagrafica)
    a.ragione_sociale
FROM public."Mezzi" m
LEFT JOIN public."Sedi" s ON m.id_sede_assegnata = s.id_sede
LEFT JOIN public."Sedi" s_ubi ON m.id_sede_ubicazione = s_ubi.id_sede
LEFT JOIN public."Anagrafiche" a ON m.id_anagrafica = a.id_anagrafica
WHERE m.is_cancellato = false;

-- PERMISSIONI
GRANT SELECT ON public.vw_mezzi_completi TO authenticated;

-- INDEX PER RICERCHE VELOCI
CREATE INDEX IF NOT EXISTS idx_mezzi_anagrafica ON public."Mezzi" (id_anagrafica);
CREATE INDEX IF NOT EXISTS idx_mezzi_sede ON public."Mezzi" (id_sede_assegnata);
CREATE INDEX IF NOT EXISTS idx_mezzi_ubicazione ON public."Mezzi" (id_sede_ubicazione);
