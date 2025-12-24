-- PUBLIC SCHEMA VIEW: vw_transazioni_complete
-- Generated from monolithic schema.sql

CREATE OR REPLACE VIEW public.vw_transazioni_complete WITH (security_invoker='on') AS
 SELECT t.id,
    t.conto_bancario_id,
    t.data_transazione,
    t.descrizione,
    t.importo,
    t.tipo,
    t.categoria,
    t.note,
    t.creato_il,
    t.aggiornato_il,
    t.transazione_collegata_id,
    c.banca AS conto_banca,
    c.iban AS conto_iban,
    t_coll.descrizione AS transazione_collegata_desc
   FROM ((public.transazioni t
     LEFT JOIN public.conti_bancari c ON ((t.conto_bancario_id = c.id)))
     LEFT JOIN public.transazioni t_coll ON ((t.transazione_collegata_id = t_coll.id)));

COMMENT ON VIEW public.vw_transazioni_complete IS 'View completa delle transazioni con dettagli del conto bancario e transazioni collegate.';
