-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policy for user_roles: users can only read their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy for admins to manage roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Drop all existing permissive RLS policies and replace with authenticated-only policies

-- Anagrafiche
DROP POLICY IF EXISTS "Allow all operations on Anagrafiche" ON public."Anagrafiche";
CREATE POLICY "Authenticated users can access Anagrafiche"
ON public."Anagrafiche"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Interventi
DROP POLICY IF EXISTS "Enable delete access for all users" ON public."Interventi";
DROP POLICY IF EXISTS "Enable insert access for all users" ON public."Interventi";
DROP POLICY IF EXISTS "Enable read access for all users" ON public."Interventi";
DROP POLICY IF EXISTS "Enable update access for all users" ON public."Interventi";
CREATE POLICY "Authenticated users can access Interventi"
ON public."Interventi"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Mezzi
DROP POLICY IF EXISTS "Allow all operations on Mezzi" ON public."Mezzi";
CREATE POLICY "Authenticated users can access Mezzi"
ON public."Mezzi"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Noleggi
DROP POLICY IF EXISTS "Allow all operations on Noleggi" ON public."Noleggi";
CREATE POLICY "Authenticated users can access Noleggi"
ON public."Noleggi"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Porti
DROP POLICY IF EXISTS "Allow all operations on Porti" ON public."Porti";
CREATE POLICY "Authenticated users can access Porti"
ON public."Porti"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Preventivi
DROP POLICY IF EXISTS "Allow all operations on Preventivi" ON public."Preventivi";
CREATE POLICY "Authenticated users can access Preventivi"
ON public."Preventivi"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Prodotti
DROP POLICY IF EXISTS "Allow all operations on Prodotti" ON public."Prodotti";
CREATE POLICY "Authenticated users can access Prodotti"
ON public."Prodotti"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Sedi
DROP POLICY IF EXISTS "Allow all operations on Sedi" ON public."Sedi";
CREATE POLICY "Authenticated users can access Sedi"
ON public."Sedi"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Subnoleggi
DROP POLICY IF EXISTS "Allow all operations on Subnoleggi" ON public."Subnoleggi";
CREATE POLICY "Authenticated users can access Subnoleggi"
ON public."Subnoleggi"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- an_contatti
DROP POLICY IF EXISTS "Allow all operations on an_contatti" ON public.an_contatti;
CREATE POLICY "Authenticated users can access an_contatti"
ON public.an_contatti
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- an_dati_amministrativi
DROP POLICY IF EXISTS "Allow all operations on an_dati_amministrativi" ON public.an_dati_amministrativi;
CREATE POLICY "Authenticated users can access an_dati_amministrativi"
ON public.an_dati_amministrativi
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- conti_bancari
DROP POLICY IF EXISTS "Allow all operations on conti_bancari" ON public.conti_bancari;
CREATE POLICY "Authenticated users can access conti_bancari"
ON public.conti_bancari
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- contratti_noleggio
DROP POLICY IF EXISTS "Contratti are viewable by everyone" ON public.contratti_noleggio;
DROP POLICY IF EXISTS "Contratti can be deleted by everyone" ON public.contratti_noleggio;
DROP POLICY IF EXISTS "Contratti can be inserted by everyone" ON public.contratti_noleggio;
DROP POLICY IF EXISTS "Contratti can be updated by everyone" ON public.contratti_noleggio;
CREATE POLICY "Authenticated users can access contratti_noleggio"
ON public.contratti_noleggio
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- documenti_noleggio
DROP POLICY IF EXISTS "Allow all operations on documenti_noleggio" ON public.documenti_noleggio;
CREATE POLICY "Authenticated users can access documenti_noleggio"
ON public.documenti_noleggio
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- frn_mezzi
DROP POLICY IF EXISTS "Allow all operations on frn_mezzi" ON public.frn_mezzi;
CREATE POLICY "Authenticated users can access frn_mezzi"
ON public.frn_mezzi
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- frn_ricambi
DROP POLICY IF EXISTS "Allow all operations on frn_ricambi" ON public.frn_ricambi;
CREATE POLICY "Authenticated users can access frn_ricambi"
ON public.frn_ricambi
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- frn_servizi
DROP POLICY IF EXISTS "Allow all operations on frn_servizi" ON public.frn_servizi;
CREATE POLICY "Authenticated users can access frn_servizi"
ON public.frn_servizi
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- frn_trasporti
DROP POLICY IF EXISTS "Allow all operations on frn_trasporti" ON public.frn_trasporti;
CREATE POLICY "Authenticated users can access frn_trasporti"
ON public.frn_trasporti
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- int_lav_prod
DROP POLICY IF EXISTS "Allow all operations on int_lav_prod" ON public.int_lav_prod;
CREATE POLICY "Authenticated users can access int_lav_prod"
ON public.int_lav_prod
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- int_lavorazioni
DROP POLICY IF EXISTS "Allow all operations on int_lavorazioni" ON public.int_lavorazioni;
CREATE POLICY "Authenticated users can access int_lavorazioni"
ON public.int_lavorazioni
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- lav_tecnici
DROP POLICY IF EXISTS "Allow all operations on lav_tecnici" ON public.lav_tecnici;
CREATE POLICY "Authenticated users can access lav_tecnici"
ON public.lav_tecnici
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- noleggi_storico
DROP POLICY IF EXISTS "Allow all operations on noleggi_storico" ON public.noleggi_storico;
CREATE POLICY "Authenticated users can access noleggi_storico"
ON public.noleggi_storico
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- prev_interventi
DROP POLICY IF EXISTS "Allow all operations on prev_interventi" ON public.prev_interventi;
CREATE POLICY "Authenticated users can access prev_interventi"
ON public.prev_interventi
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- prev_noleggi
DROP POLICY IF EXISTS "Accesso completo prev_noleggi" ON public.prev_noleggi;
CREATE POLICY "Authenticated users can access prev_noleggi"
ON public.prev_noleggi
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- tecnici
DROP POLICY IF EXISTS "Allow all operations on tecnici" ON public.tecnici;
CREATE POLICY "Authenticated users can access tecnici"
ON public.tecnici
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- transazioni
DROP POLICY IF EXISTS "Allow all operations on transazioni" ON public.transazioni;
CREATE POLICY "Authenticated users can access transazioni"
ON public.transazioni
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- utenti
DROP POLICY IF EXISTS "Allow all operations on utenti" ON public.utenti;
CREATE POLICY "Authenticated users can access utenti"
ON public.utenti
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Storage bucket policies for 'contratti'
-- Ensure bucket is private (if it doesn't exist, it was already created as public:false)
UPDATE storage.buckets SET public = false WHERE id = 'contratti';

-- Drop any existing storage policies for contratti bucket
DROP POLICY IF EXISTS "Authenticated users can upload contracts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read contracts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update contracts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete contracts" ON storage.objects;

-- Create storage policies for authenticated access
CREATE POLICY "Authenticated users can upload contracts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'contratti');

CREATE POLICY "Authenticated users can read contracts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'contratti');

CREATE POLICY "Authenticated users can update contracts"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'contratti');

CREATE POLICY "Authenticated users can delete contracts"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'contratti');