-- PUBLIC SCHEMA VIEW: anagrafiche
-- Generated from monolithic schema.sql

CREATE OR REPLACE VIEW public.anagrafiche WITH (security_invoker='on') AS
 SELECT id_anagrafica,
    ragione_sociale,
    partita_iva,
    is_cliente,
    is_fornitore,
    is_owner,
    created_at,
    is_cancellato,
    richiede_contratto_noleggio
   FROM public."Anagrafiche";

-- TRIGGERS
CREATE TRIGGER anagrafiche_view_delete_trigger INSTEAD OF DELETE ON public.anagrafiche FOR EACH ROW EXECUTE FUNCTION public.anagrafiche_view_delete();
CREATE TRIGGER anagrafiche_view_insert_trigger INSTEAD OF INSERT ON public.anagrafiche FOR EACH ROW EXECUTE FUNCTION public.anagrafiche_view_insert();
CREATE TRIGGER anagrafiche_view_update_trigger INSTEAD OF UPDATE ON public.anagrafiche FOR EACH ROW EXECUTE FUNCTION public.anagrafiche_view_update();
