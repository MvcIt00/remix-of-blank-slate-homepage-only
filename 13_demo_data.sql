-- ==========================================================
-- SCRIPT SQL: SIMULAZIONE FULL DEMO V3 (NXUS)
-- Include: Cleanup, 10 Clienti Full, 20 Mezzi con Sedi, Contatti diffusi
-- ==========================================================

BEGIN;

-- 1. PULIZIA DATI PRECEDENTI (Basata sui nomi usati negli script precedenti)
DELETE FROM public."Anagrafiche" 
WHERE ragione_sociale IN (
    'Logistica Nord S.r.l.', 'Edilizia Toscana S.p.A.', 'Meccanica Veloce S.r.l.', 
    'Trasporti Veloci S.n.c.', 'Alimentare Fresco S.r.l.', 'Costruzioni Moderne S.p.A.', 
    'Riparazioni Navali S.r.l.', 'Servizi Ecologici S.r.l.', 'Manifattura Italiana S.p.A.', 
    'Distribuzione Sud S.r.l.'
);

DO $$
DECLARE
    -- ID Anagrafiche
    c1 UUID; c2 UUID; c3 UUID; c4 UUID; c5 UUID;
    c6 UUID; c7 UUID; c8 UUID; c9 UUID; c10 UUID;
    mvc_id UUID := 'ffb079e8-4eee-4b23-a080-de285f0a8985';
    
    -- ID Sedi
    s1a UUID; s1b UUID; s2a UUID; s3a UUID; s3b UUID; 
    s4a UUID; s5a UUID; s5b UUID; s6a UUID; s7a UUID; 
    s8a UUID; s9a UUID; s10a UUID; mvc_s1 UUID; mvc_s2 UUID;
BEGIN
    -- 2. CREAZIONE ANAGRAFICHE FULL
    INSERT INTO public."Anagrafiche" (ragione_sociale, partita_iva, is_cliente, is_fornitore, is_owner) VALUES
    ('Logistica Nord S.r.l.', '01234567890', true, false, false) RETURNING id_anagrafica INTO c1;
    INSERT INTO public."Anagrafiche" (ragione_sociale, partita_iva, is_cliente, is_fornitore, is_owner) VALUES
    ('Edilizia Toscana S.p.A.', '09876543210', true, false, false) RETURNING id_anagrafica INTO c2;
    INSERT INTO public."Anagrafiche" (ragione_sociale, partita_iva, is_cliente, is_fornitore, is_owner) VALUES
    ('Meccanica Veloce S.r.l.', '05647382910', true, false, false) RETURNING id_anagrafica INTO c3;
    INSERT INTO public."Anagrafiche" (ragione_sociale, partita_iva, is_cliente, is_fornitore, is_owner) VALUES
    ('Trasporti Veloci S.n.c.', '01122334455', true, false, false) RETURNING id_anagrafica INTO c4;
    INSERT INTO public."Anagrafiche" (ragione_sociale, partita_iva, is_cliente, is_fornitore, is_owner) VALUES
    ('Alimentare Fresco S.r.l.', '06677889900', true, false, false) RETURNING id_anagrafica INTO c5;
    INSERT INTO public."Anagrafiche" (ragione_sociale, partita_iva, is_cliente, is_fornitore, is_owner) VALUES
    ('Costruzioni Moderne S.p.A.', '08899776655', true, false, false) RETURNING id_anagrafica INTO c6;
    INSERT INTO public."Anagrafiche" (ragione_sociale, partita_iva, is_cliente, is_fornitore, is_owner) VALUES
    ('Riparazioni Navali S.r.l.', '04433221100', true, false, false) RETURNING id_anagrafica INTO c7;
    INSERT INTO public."Anagrafiche" (ragione_sociale, partita_iva, is_cliente, is_fornitore, is_owner) VALUES
    ('Servizi Ecologici S.r.l.', '05544332211', true, false, false) RETURNING id_anagrafica INTO c8;
    INSERT INTO public."Anagrafiche" (ragione_sociale, partita_iva, is_cliente, is_fornitore, is_owner) VALUES
    ('Manifattura Italiana S.p.A.', '02233445566', true, false, false) RETURNING id_anagrafica INTO c9;
    INSERT INTO public."Anagrafiche" (ragione_sociale, partita_iva, is_cliente, is_fornitore, is_owner) VALUES
    ('Distribuzione Sud S.r.l.', '09988776655', true, false, false) RETURNING id_anagrafica INTO c10;

    -- 3. SEDI (Multiple per alcuni, assegnazione precisa)
    -- MVC (Owner)
    INSERT INTO public."Sedi" (id_anagrafica, nome_sede, indirizzo, citta, provincia, cap, is_legale, is_operativa, is_officina)
    VALUES (mvc_id, 'Sede Centrale MVC', 'Via dei Carristi 1', 'Livorno', 'LI', 57100, true, true, true) RETURNING id_sede INTO mvc_s1;
    INSERT INTO public."Sedi" (id_anagrafica, nome_sede, indirizzo, citta, provincia, cap, is_legale, is_operativa)
    VALUES (mvc_id, 'Deposito Noleggio MVC', 'Via Portuale 12', 'Livorno', 'LI', 57100, false, true) RETURNING id_sede INTO mvc_s2;

    -- Logistica Nord
    INSERT INTO public."Sedi" (id_anagrafica, nome_sede, indirizzo, citta, provincia, cap, is_legale, is_operativa)
    VALUES (c1, 'Sede Legale Milano', 'Via Brera 15', 'Milano', 'MI', 20121, true, true) RETURNING id_sede INTO s1a;
    INSERT INTO public."Sedi" (id_anagrafica, nome_sede, indirizzo, citta, provincia, cap, is_legale, is_operativa)
    VALUES (c1, 'Hub Operativo Toscana', 'Via del Collaudo 3', 'Guasticce', 'LI', 57017, false, true) RETURNING id_sede INTO s1b;

    -- Edilizia Toscana
    INSERT INTO public."Sedi" (id_anagrafica, nome_sede, indirizzo, citta, provincia, cap, is_legale, is_operativa)
    VALUES (c2, 'Cantiere Principale', 'Viale dei Pini 50', 'Firenze', 'FI', 50144, true, true) RETURNING id_sede INTO s2a;

    -- Meccanica Veloce
    INSERT INTO public."Sedi" (id_anagrafica, nome_sede, indirizzo, citta, provincia, cap, is_legale, is_operativa)
    VALUES (c3, 'Officina Meccanica', 'Via Fermi 22', 'Pisa', 'PI', 56121, true, true) RETURNING id_sede INTO s3a;
    INSERT INTO public."Sedi" (id_anagrafica, nome_sede, indirizzo, citta, provincia, cap, is_legale, is_operativa)
    VALUES (c3, 'Magazzino Nord', 'Via Newton 5', 'Pontedera', 'PI', 56025, false, true) RETURNING id_sede INTO s3b;

    -- Altri (1 sede a testa)
    INSERT INTO public."Sedi" (id_anagrafica, nome_sede, indirizzo, citta, provincia, cap, is_legale, is_operativa) VALUES (c4, 'Garage Trasporti', 'Viale Italia 1', 'Livorno', 'LI', 57125, true, true) RETURNING id_sede INTO s4a;
    INSERT INTO public."Sedi" (id_anagrafica, nome_sede, indirizzo, citta, provincia, cap, is_legale, is_operativa) VALUES (c5, 'Magazzino Alimentare', 'Via del Gelo 8', 'Empoli', 'FI', 50053, true, true) RETURNING id_sede INTO s5a;
    INSERT INTO public."Sedi" (id_anagrafica, nome_sede, indirizzo, citta, provincia, cap, is_legale, is_operativa) VALUES (c5, 'Deposito Frigo', 'Via Polare 2', 'Empoli', 'FI', 50053, false, true) RETURNING id_sede INTO s5b;
    INSERT INTO public."Sedi" (id_anagrafica, nome_sede, indirizzo, citta, provincia, cap, is_legale, is_operativa) VALUES (c6, 'Cantiere Moderno', 'Via dei Sassi 4', 'Grosseto', 'GR', 58100, true, true) RETURNING id_sede INTO s6a;
    INSERT INTO public."Sedi" (id_anagrafica, nome_sede, indirizzo, citta, provincia, cap, is_legale, is_operativa, is_officina) VALUES (c7, 'Officina Navale', 'Molo Mediceo 1', 'Livorno', 'LI', 57123, true, true, true) RETURNING id_sede INTO s7a;
    INSERT INTO public."Sedi" (id_anagrafica, nome_sede, indirizzo, citta, provincia, cap, is_legale, is_operativa) VALUES (c8, 'Centro Raccolta', 'Via Ecologia 9', 'Piombino', 'LI', 57025, true, true) RETURNING id_sede INTO s8a;
    INSERT INTO public."Sedi" (id_anagrafica, nome_sede, indirizzo, citta, provincia, cap, is_legale, is_operativa) VALUES (c9, 'Fabbrica Nord', 'Via Artigiana 12', 'Prato', 'PO', 59100, true, true) RETURNING id_sede INTO s9a;
    INSERT INTO public."Sedi" (id_anagrafica, nome_sede, indirizzo, citta, provincia, cap, is_legale, is_operativa) VALUES (c10, 'Centro Distribuzione', 'Via Salento 1', 'Lecce', 'LE', 73100, true, true) RETURNING id_sede INTO s10a;

    -- 4. DATI AMMINISTRATIVI (FULL)
    INSERT INTO public.an_dati_amministrativi (id_anagrafica, pec, codice_univoco, iban, pagamento, esente_iva, prezzo_manodopera) VALUES
    (c1, 'logistico_nord@legalmail.it', 'KRRH6B9', 'IT60X0503402800000001234567', 'riba_60gg', false, 55.00),
    (c2, 'amministrazione@ediliziato.pec.it', 'SUBM70N', 'IT45L020080500000011223344', 'bonifico_30gg', false, 60.00),
    (c3, 'meccanica.veloce@pec.it', '1234567', 'IT12M0306905020100000009988', 'rimessa_diretta', true, 45.00),
    (c4, 'trasporti.veloci@pec.com', 'T5R4E3W', 'IT88H032680240000008877665', 'bonifico_30gg', false, 50.00),
    (c5, 'alimentare_fresco@pec.it', 'AFR1234', 'IT77K010100101000000112233', 'riba_90gg', false, 50.00),
    (c6, 'moderna_costruzioni@pec.it', 'MOD1111', 'IT99Z030300303000000998877', 'bonifico_60gg', false, 65.00),
    (c7, 'rip.navali@legal.it', 'NAV7788', 'IT22Y050500505000000554433', 'bonifico_30gg', false, 75.00),
    (c8, 'ecologici@pec.org', 'ECO9900', 'IT11W040400404000000443322', 'rimessa_diretta', false, 40.00),
    (c9, 'manifattura@it.pec.it', 'MAN4433', 'IT33P080800808000000887766', 'riba_60gg', false, 55.00),
    (c10, 'distribuzione.sud@pec.it', 'DSU6655', 'IT44Q020200202000000221100', 'bonifico_90gg', false, 45.00);

    -- 5. CONTATTI (Tutte le anagrafiche tranne C9 e C10 hanno contatti)
    -- C1
    INSERT INTO public.an_contatti (id_anagrafica, id_sede, nome, email, telefono, is_aziendale, is_referente) VALUES
    (c1, s1a, 'Mario Rossi', 'mario.rossi@loginord.it', '02445566', true, false),
    (c1, s1b, 'Gianni Magazziniere', 'gianni.m@loginord.it', '333998877', false, true);
    -- C2
    INSERT INTO public.an_contatti (id_anagrafica, id_sede, nome, email, telefono, is_aziendale, is_referente) VALUES
    (c2, s2a, 'Arch. Bruni', 'bruni@ediliziato.it', '055887766', true, true);
    -- C3
    INSERT INTO public.an_contatti (id_anagrafica, id_sede, nome, email, telefono, is_aziendale, is_referente) VALUES
    (c3, s3a, 'Elena Ferrari', 'e.ferrari@meccanicaveloce.it', '050112233', true, false),
    (c3, s3b, 'Ufficio Acquisti', 'acquisti@meccanicaveloce.it', '050998877', true, false);
    -- C4
    INSERT INTO public.an_contatti (id_anagrafica, id_sede, nome, email, telefono, is_aziendale, is_referente) VALUES
    (c4, s4a, 'Pietro Veloci', 'pietro@trasportiveloci.it', '05861122', true, true);
    -- C5
    INSERT INTO public.an_contatti (id_anagrafica, id_sede, nome, email, telefono, is_aziendale, is_referente) VALUES
    (c5, s5b, 'Roberto Frigo', 'frigo@alimfresco.it', '347112233', false, true);
    -- C6
    INSERT INTO public.an_contatti (id_anagrafica, id_sede, nome, email, telefono, is_aziendale, is_referente) VALUES
    (c6, s6a, 'Geom. Mori', 'mori@modcostruzioni.it', '0564998877', true, true);
    -- C7
    INSERT INTO public.an_contatti (id_anagrafica, id_sede, nome, email, telefono, is_aziendale, is_referente) VALUES
    (c7, s7a, 'Luca Porto', 'porto@ripnavali.it', '0586990011', true, true);
    -- C8
    INSERT INTO public.an_contatti (id_anagrafica, id_sede, nome, email, telefono, is_aziendale, is_referente) VALUES
    (c8, s8a, 'Amministrazione Eco', 'info@ecologici.it', '0565112233', true, false);

    -- 6. MEZZI (20 TOTALI) - Con sede assegnata e ubicazione
    -- 5 Mezzi MVC (Disponibili a Noleggio)
    INSERT INTO public."Mezzi" (id_anagrafica, id_sede_assegnata, id_sede_ubicazione, marca, modello, matricola, id_interno, anno, categoria, is_disponibile_noleggio, stato_funzionamento) VALUES
    (mvc_id, mvc_s1, mvc_s1, 'Linde', 'H25T', 'L392A12345', 'M01', '2021', 'sollevamento', true, 'funzionante'),
    (mvc_id, mvc_s2, mvc_s2, 'Toyota', '8FG25', 'T7FGF10099', 'M02', '2022', 'sollevamento', true, 'funzionante'),
    (mvc_id, mvc_s1, mvc_s1, 'Still', 'RX20-20', 'S51621234', 'M03', '2020', 'sollevamento', true, 'funzionante'),
    (mvc_id, mvc_s2, mvc_s1, 'Jungheinrich', 'EFG 215', 'J5802345', 'M04', '2023', 'sollevamento', true, 'funzionante'), -- Ubicato altrove per test
    (mvc_id, mvc_s1, mvc_s1, 'Baoli', 'KBD25', 'B8820011', 'M05', '2022', 'sollevamento', true, 'funzionante');

    -- 15 Mezzi Clienti (NON Disponibili) - Mappati alle loro sedi
    INSERT INTO public."Mezzi" (id_anagrafica, id_sede_assegnata, id_sede_ubicazione, marca, modello, matricola, id_interno, anno, categoria) VALUES
    (c1, s1b, s1b, 'Linde', 'H30D', 'L393D556677', 'CL01', '2019', 'sollevamento'),
    (c1, s1b, s1b, 'Toyota', '7FB15', 'T7FB998877', 'CL02', '2018', 'sollevamento'),
    (c2, s2a, s2a, 'Hyster', 'H3.0FT', 'H177B5544', 'CL03', '2020', 'sollevamento'),
    (c3, s3a, s3a, 'OM', 'XE20', 'O76554432', 'CL04', '2017', 'sollevamento'),
    (c4, s4a, s4a, 'Still', 'RX60-25', 'S51666771', 'CL05', '2021', 'sollevamento'),
    (c5, s5b, s5b, 'Jungheinrich', 'ETV 214', 'JETV112233', 'CL06', '2022', 'sollevamento'),
    (c6, s6a, s6a, 'Mitsubishi', 'FG25N', 'M12345A6', 'CL07', '2019', 'sollevamento'),
    (c7, s7a, s7a, 'Cesab', 'Blitz 315', 'C315001X', 'CL08', '2022', 'sollevamento'),
    (c8, s8a, s8a, 'Caterpillar', 'DP30N', 'C112233Y', 'CL09', '2020', 'sollevamento'),
    (c9, s9a, s9a, 'Nissan', '1N1', 'N120221Z', 'CL10', '2017', 'sollevamento'),
    (c10, s10a, s10a, 'Yale', 'GLP20VX', 'Y1209988W', 'CL11', '2021', 'sollevamento'),
    (c6, s6a, s6a, 'Manitou', 'MSI 30', 'MANI8877K', 'CL12', '2019', 'sollevamento'),
    (c7, s7a, s7a, 'Komatsu', 'FG25T', 'K665544L', 'CL13', '2018', 'sollevamento'),
    (c8, s8a, s8a, 'Toyota', 'M8FG15', 'TM8FG001', 'CL14', '2020', 'sollevamento'),
    (c9, s9a, s9a, 'Linde', 'E16', 'L335A5566F', 'CL15', '2018', 'sollevamento');

END $$;

COMMIT;
