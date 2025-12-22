-- Create lowercase aliases/views for all PascalCase tables to allow Cloud UI access
-- These views will inherit RLS from the base tables

-- Drop existing lowercase views if they exist
DROP VIEW IF EXISTS public.anagrafiche CASCADE;
DROP VIEW IF EXISTS public.mezzi CASCADE;
DROP VIEW IF EXISTS public.noleggi CASCADE;
DROP VIEW IF EXISTS public.porti CASCADE;
DROP VIEW IF EXISTS public.preventivi CASCADE;
DROP VIEW IF EXISTS public.prodotti CASCADE;
DROP VIEW IF EXISTS public.sedi CASCADE;
DROP VIEW IF EXISTS public.subnoleggi CASCADE;

-- Create updatable views with lowercase names pointing to PascalCase tables
CREATE OR REPLACE VIEW public.anagrafiche WITH (security_invoker = on) AS
SELECT * FROM public."Anagrafiche";

CREATE OR REPLACE VIEW public.mezzi WITH (security_invoker = on) AS
SELECT * FROM public."Mezzi";

CREATE OR REPLACE VIEW public.noleggi WITH (security_invoker = on) AS
SELECT * FROM public."Noleggi";

CREATE OR REPLACE VIEW public.porti WITH (security_invoker = on) AS
SELECT * FROM public."Porti";

CREATE OR REPLACE VIEW public.preventivi WITH (security_invoker = on) AS
SELECT * FROM public."Preventivi";

CREATE OR REPLACE VIEW public.prodotti WITH (security_invoker = on) AS
SELECT * FROM public."Prodotti";

CREATE OR REPLACE VIEW public.sedi WITH (security_invoker = on) AS
SELECT * FROM public."Sedi";

CREATE OR REPLACE VIEW public.subnoleggi WITH (security_invoker = on) AS
SELECT * FROM public."Subnoleggi";

-- Create INSTEAD OF triggers to make the views updatable

-- Anagrafiche triggers
CREATE OR REPLACE FUNCTION public.anagrafiche_view_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public."Anagrafiche" 
  SELECT NEW.*;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.anagrafiche_view_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public."Anagrafiche" SET
    ragione_sociale = NEW.ragione_sociale,
    partita_iva = NEW.partita_iva,
    is_cliente = NEW.is_cliente,
    is_fornitore = NEW.is_fornitore,
    is_owner = NEW.is_owner,
    is_cancellato = NEW.is_cancellato,
    richiede_contratto_noleggio = NEW.richiede_contratto_noleggio,
    created_at = NEW.created_at
  WHERE id_anagrafica = OLD.id_anagrafica;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.anagrafiche_view_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public."Anagrafiche" WHERE id_anagrafica = OLD.id_anagrafica;
  RETURN OLD;
END;
$$;

CREATE TRIGGER anagrafiche_view_insert_trigger
INSTEAD OF INSERT ON public.anagrafiche
FOR EACH ROW EXECUTE FUNCTION public.anagrafiche_view_insert();

CREATE TRIGGER anagrafiche_view_update_trigger
INSTEAD OF UPDATE ON public.anagrafiche
FOR EACH ROW EXECUTE FUNCTION public.anagrafiche_view_update();

CREATE TRIGGER anagrafiche_view_delete_trigger
INSTEAD OF DELETE ON public.anagrafiche
FOR EACH ROW EXECUTE FUNCTION public.anagrafiche_view_delete();

-- Mezzi triggers
CREATE OR REPLACE FUNCTION public.mezzi_view_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public."Mezzi" SELECT NEW.*;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.mezzi_view_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public."Mezzi" SET
    id_interno = NEW.id_interno,
    marca = NEW.marca,
    modello = NEW.modello,
    matricola = NEW.matricola,
    anno = NEW.anno,
    categoria = NEW.categoria,
    stato_funzionamento = NEW.stato_funzionamento,
    stato_funzionamento_descrizione = NEW.stato_funzionamento_descrizione,
    ubicazione = NEW.ubicazione,
    ore_moto = NEW.ore_moto,
    is_disponibile_noleggio = NEW.is_disponibile_noleggio,
    is_cancellato = NEW.is_cancellato,
    id_anagrafica = NEW.id_anagrafica,
    id_sede_assegnata = NEW.id_sede_assegnata,
    id_sede_ubicazione = NEW.id_sede_ubicazione,
    specifiche_tecniche = NEW.specifiche_tecniche
  WHERE id_mezzo = OLD.id_mezzo;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.mezzi_view_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public."Mezzi" WHERE id_mezzo = OLD.id_mezzo;
  RETURN OLD;
END;
$$;

CREATE TRIGGER mezzi_view_insert_trigger
INSTEAD OF INSERT ON public.mezzi
FOR EACH ROW EXECUTE FUNCTION public.mezzi_view_insert();

CREATE TRIGGER mezzi_view_update_trigger
INSTEAD OF UPDATE ON public.mezzi
FOR EACH ROW EXECUTE FUNCTION public.mezzi_view_update();

CREATE TRIGGER mezzi_view_delete_trigger
INSTEAD OF DELETE ON public.mezzi
FOR EACH ROW EXECUTE FUNCTION public.mezzi_view_delete();

-- Noleggi triggers
CREATE OR REPLACE FUNCTION public.noleggi_view_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public."Noleggi" SELECT NEW.*;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.noleggi_view_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public."Noleggi" SET
    id_anagrafica = NEW.id_anagrafica,
    id_mezzo = NEW.id_mezzo,
    sede_operativa = NEW.sede_operativa,
    data_inizio = NEW.data_inizio,
    data_fine = NEW.data_fine,
    tempo_indeterminato = NEW.tempo_indeterminato,
    prezzo_noleggio = NEW.prezzo_noleggio,
    prezzo_trasporto = NEW.prezzo_trasporto,
    tipo_canone = NEW.tipo_canone,
    stato_noleggio = NEW.stato_noleggio,
    is_terminato = NEW.is_terminato,
    is_cancellato = NEW.is_cancellato,
    contratto = NEW.contratto,
    note = NEW.note,
    data_terminazione_effettiva = NEW.data_terminazione_effettiva
  WHERE id_noleggio = OLD.id_noleggio;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.noleggi_view_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public."Noleggi" WHERE id_noleggio = OLD.id_noleggio;
  RETURN OLD;
END;
$$;

CREATE TRIGGER noleggi_view_insert_trigger
INSTEAD OF INSERT ON public.noleggi
FOR EACH ROW EXECUTE FUNCTION public.noleggi_view_insert();

CREATE TRIGGER noleggi_view_update_trigger
INSTEAD OF UPDATE ON public.noleggi
FOR EACH ROW EXECUTE FUNCTION public.noleggi_view_update();

CREATE TRIGGER noleggi_view_delete_trigger
INSTEAD OF DELETE ON public.noleggi
FOR EACH ROW EXECUTE FUNCTION public.noleggi_view_delete();

-- Porti triggers
CREATE OR REPLACE FUNCTION public.porti_view_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public."Porti" SELECT NEW.*;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.porti_view_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public."Porti" SET
    nome_porto = NEW.nome_porto,
    is_cancellato = NEW.is_cancellato
  WHERE id_porto = OLD.id_porto;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.porti_view_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public."Porti" WHERE id_porto = OLD.id_porto;
  RETURN OLD;
END;
$$;

CREATE TRIGGER porti_view_insert_trigger
INSTEAD OF INSERT ON public.porti
FOR EACH ROW EXECUTE FUNCTION public.porti_view_insert();

CREATE TRIGGER porti_view_update_trigger
INSTEAD OF UPDATE ON public.porti
FOR EACH ROW EXECUTE FUNCTION public.porti_view_update();

CREATE TRIGGER porti_view_delete_trigger
INSTEAD OF DELETE ON public.porti
FOR EACH ROW EXECUTE FUNCTION public.porti_view_delete();

-- Preventivi triggers
CREATE OR REPLACE FUNCTION public.preventivi_view_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public."Preventivi" SELECT NEW.*;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.preventivi_view_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public."Preventivi" SET
    id_anagrafica = NEW.id_anagrafica,
    is_cancellato = NEW.is_cancellato
  WHERE id_preventivo = OLD.id_preventivo;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.preventivi_view_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public."Preventivi" WHERE id_preventivo = OLD.id_preventivo;
  RETURN OLD;
END;
$$;

CREATE TRIGGER preventivi_view_insert_trigger
INSTEAD OF INSERT ON public.preventivi
FOR EACH ROW EXECUTE FUNCTION public.preventivi_view_insert();

CREATE TRIGGER preventivi_view_update_trigger
INSTEAD OF UPDATE ON public.preventivi
FOR EACH ROW EXECUTE FUNCTION public.preventivi_view_update();

CREATE TRIGGER preventivi_view_delete_trigger
INSTEAD OF DELETE ON public.preventivi
FOR EACH ROW EXECUTE FUNCTION public.preventivi_view_delete();

-- Prodotti triggers
CREATE OR REPLACE FUNCTION public.prodotti_view_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public."Prodotti" SELECT NEW.*;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.prodotti_view_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public."Prodotti" SET
    codice = NEW.codice,
    nome = NEW.nome,
    marca = NEW.marca,
    modello = NEW.modello,
    categoria = NEW.categoria,
    descrizione = NEW.descrizione,
    costo_prodotto = NEW.costo_prodotto,
    prezzo_prodotto = NEW.prezzo_prodotto,
    is_cancellato = NEW.is_cancellato
  WHERE id_prodotto = OLD.id_prodotto;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.prodotti_view_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public."Prodotti" WHERE id_prodotto = OLD.id_prodotto;
  RETURN OLD;
END;
$$;

CREATE TRIGGER prodotti_view_insert_trigger
INSTEAD OF INSERT ON public.prodotti
FOR EACH ROW EXECUTE FUNCTION public.prodotti_view_insert();

CREATE TRIGGER prodotti_view_update_trigger
INSTEAD OF UPDATE ON public.prodotti
FOR EACH ROW EXECUTE FUNCTION public.prodotti_view_update();

CREATE TRIGGER prodotti_view_delete_trigger
INSTEAD OF DELETE ON public.prodotti
FOR EACH ROW EXECUTE FUNCTION public.prodotti_view_delete();

-- Sedi triggers
CREATE OR REPLACE FUNCTION public.sedi_view_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public."Sedi" SELECT NEW.*;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sedi_view_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public."Sedi" SET
    id_anagrafica = NEW.id_anagrafica,
    nome_sede = NEW.nome_sede,
    indirizzo = NEW.indirizzo,
    citta = NEW.citta,
    provincia = NEW.provincia,
    cap = NEW.cap,
    is_legale = NEW.is_legale,
    is_operativa = NEW.is_operativa,
    is_officina = NEW.is_officina,
    is_banchina = NEW.is_banchina,
    is_nave = NEW.is_nave,
    id_porto = NEW.id_porto,
    is_cancellato = NEW.is_cancellato
  WHERE id_sede = OLD.id_sede;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sedi_view_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public."Sedi" WHERE id_sede = OLD.id_sede;
  RETURN OLD;
END;
$$;

CREATE TRIGGER sedi_view_insert_trigger
INSTEAD OF INSERT ON public.sedi
FOR EACH ROW EXECUTE FUNCTION public.sedi_view_insert();

CREATE TRIGGER sedi_view_update_trigger
INSTEAD OF UPDATE ON public.sedi
FOR EACH ROW EXECUTE FUNCTION public.sedi_view_update();

CREATE TRIGGER sedi_view_delete_trigger
INSTEAD OF DELETE ON public.sedi
FOR EACH ROW EXECUTE FUNCTION public.sedi_view_delete();

-- Subnoleggi triggers
CREATE OR REPLACE FUNCTION public.subnoleggi_view_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public."Subnoleggi" SELECT NEW.*;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.subnoleggi_view_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public."Subnoleggi" SET
    id_anagrafica = NEW.id_anagrafica,
    id_mezzo = NEW.id_mezzo,
    data_inizio = NEW.data_inizio,
    data_fine = NEW.data_fine,
    tempo_indeterminato = NEW.tempo_indeterminato,
    costo_subnoleggio = NEW.costo_subnoleggio,
    valore_residuo = NEW.valore_residuo,
    contratto = NEW.contratto,
    is_cancellato = NEW.is_cancellato
  WHERE id_subnoleggio = OLD.id_subnoleggio;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.subnoleggi_view_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public."Subnoleggi" WHERE id_subnoleggio = OLD.id_subnoleggio;
  RETURN OLD;
END;
$$;

CREATE TRIGGER subnoleggi_view_insert_trigger
INSTEAD OF INSERT ON public.subnoleggi
FOR EACH ROW EXECUTE FUNCTION public.subnoleggi_view_insert();

CREATE TRIGGER subnoleggi_view_update_trigger
INSTEAD OF UPDATE ON public.subnoleggi
FOR EACH ROW EXECUTE FUNCTION public.subnoleggi_view_update();

CREATE TRIGGER subnoleggi_view_delete_trigger
INSTEAD OF DELETE ON public.subnoleggi
FOR EACH ROW EXECUTE FUNCTION public.subnoleggi_view_delete();