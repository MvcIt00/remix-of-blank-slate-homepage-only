-- PUBLIC SCHEMA VIEW: vw_gestione_interventi
-- Generated from monolithic schema.sql

CREATE OR REPLACE VIEW public.vw_gestione_interventi WITH (security_invoker='on') AS
 SELECT i.id_intervento,
    i.id_mezzo,
    i.id_anagrafica,
    i.codice_intervento,
    i.descrizione_intervento,
    i.stato_intervento,
    i.stato_preventivo,
    i.is_chiuso,
    i.is_fatturato,
    i.created_at,
    a.ragione_sociale,
    a.partita_iva,
    m.marca,
    m.modello,
    m.matricola,
    m.id_interno,
    m.categoria AS mezzo_categoria,
    m.stato_funzionamento,
    m.ubicazione,
    count(DISTINCT l.id_lavorazione) AS n_lavorazioni,
    min(l.data_da_prevista) AS prima_data_prevista,
    max(l.data_a_prevista) AS ultima_data_prevista,
    sum(COALESCE(l.n_tecnici_previsti, (0)::numeric)) AS totale_tecnici_previsti,
    sum(COALESCE(ld.n_tecnici_assegnati, (0)::bigint)) AS totale_tecnici_assegnati,
    string_agg(DISTINCT array_to_string(ld.nomi_tecnici, ', '::text), ', '::text) AS nomi_tecnici_aggregati
   FROM ((((public."Interventi" i
     LEFT JOIN public."Anagrafiche" a ON ((i.id_anagrafica = a.id_anagrafica)))
     LEFT JOIN public."Mezzi" m ON ((i.id_mezzo = m.id_mezzo)))
     LEFT JOIN public.int_lavorazioni l ON (((i.id_intervento = l.id_intervento) AND (l.is_cancellato = false))))
     LEFT JOIN public.vw_int_lavorazioni_dettaglio ld ON ((l.id_lavorazione = ld.id_lavorazione)))
  WHERE (i.is_cancellato = false)
  GROUP BY i.id_intervento, i.id_mezzo, i.id_anagrafica, i.codice_intervento, i.descrizione_intervento, i.stato_intervento, i.stato_preventivo, i.is_chiuso, i.is_fatturato, i.created_at, a.ragione_sociale, a.partita_iva, m.marca, m.modello, m.matricola, m.id_interno, m.categoria, m.stato_funzionamento, m.ubicazione;
