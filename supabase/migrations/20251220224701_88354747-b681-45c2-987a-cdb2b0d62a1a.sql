-- Tabella preventivi noleggio
CREATE TABLE public.prev_noleggi (
  id_preventivo UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  id_mezzo UUID NOT NULL REFERENCES public."Mezzi"(id_mezzo),
  id_anagrafica UUID NOT NULL REFERENCES public."Anagrafiche"(id_anagrafica),
  id_anagrafica_fornitore UUID REFERENCES public."Anagrafiche"(id_anagrafica),
  data_inizio DATE,
  data_fine DATE,
  tempo_indeterminato BOOLEAN NOT NULL DEFAULT false,
  prezzo_noleggio NUMERIC(10,2),
  prezzo_trasporto NUMERIC(10,2),
  tipo_canone VARCHAR(20) CHECK (tipo_canone IN ('giornaliero', 'mensile')),
  note TEXT,
  stato VARCHAR(20) NOT NULL DEFAULT 'bozza' CHECK (stato IN ('bozza', 'inviato', 'approvato', 'rifiutato', 'convertito')),
  convertito_in_noleggio_id UUID REFERENCES public."Noleggi"(id_noleggio),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- Trigger per updated_at
CREATE OR REPLACE FUNCTION public.update_prev_noleggi_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prev_noleggi_updated_at
  BEFORE UPDATE ON public.prev_noleggi
  FOR EACH ROW
  EXECUTE FUNCTION public.update_prev_noleggi_updated_at();

-- Enable RLS
ALTER TABLE public.prev_noleggi ENABLE ROW LEVEL SECURITY;

-- Policy per accesso pubblico (no auth in questo progetto)
CREATE POLICY "Accesso completo prev_noleggi" ON public.prev_noleggi
  FOR ALL USING (true) WITH CHECK (true);