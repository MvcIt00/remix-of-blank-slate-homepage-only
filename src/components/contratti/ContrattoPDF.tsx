import React from "react";
import { Document, View, Text } from "@react-pdf/renderer";
import {
  PageShell,
  DatiAziendaOwner,
  formatDataItaliana,
  formatEuro,
  getModalitaPagamentoLabel
} from "../pdf/LetterheadPDF";
import {
  PDFSection,
  PDFKeyValue,
  PDFTable,
  PDFGrid,
  PDFGridCol,
  PDFSignatureGroup,
  PDFSignatureBox
} from "../pdf/pdf-components";
import { pdfStyles } from "../pdf/LetterheadPDF";

export interface DatiCliente {
  ragione_sociale: string;
  indirizzo: string;
  citta: string;
  cap: string;
  provincia: string;
  p_iva: string;
  pec?: string;
  codice_univoco?: string;
  telefono?: string;
  email?: string;
}

export interface DatiMezzo {
  marca: string;
  modello: string;
  matricola: string;
  targa?: string;
  telaio?: string;
  anno?: string;
  ore_moto?: string;
}

export interface DatiContratto {
  codice_contratto: string;
  data_inizio: string;
  data_fine: string | null;
  tempo_indeterminato: boolean;
  canone_noleggio: number | null;
  tipo_canone: string | null;
  costo_trasporto: number | null;
  deposito_cauzionale: number | null;
  modalita_pagamento: string | null;
  termini_pagamento: string | null;
  clausole_speciali: string | null;
  data_creazione: string;
}

interface ContrattoPDFProps {
  datiOwner: DatiAziendaOwner;
  datiCliente: DatiCliente;
  datiMezzo: DatiMezzo;
  datiContratto: DatiContratto;
}

export function ContrattoPDF({ datiOwner, datiCliente, datiMezzo, datiContratto }: ContrattoPDFProps) {
  const canoneRow = [
    "Canone di Noleggio (" + (datiContratto.tipo_canone || "mensile") + ")",
    formatEuro(datiContratto.canone_noleggio || 0),
    datiContratto.tipo_canone || "Mese"
  ];

  const rows = [canoneRow];

  if (datiContratto.costo_trasporto) {
    rows.push([
      "Costi di Trasporto (Andata/Ritorno)",
      formatEuro(datiContratto.costo_trasporto),
      "Una Tantum"
    ]);
  }

  const totale = (datiContratto.canone_noleggio || 0) + (datiContratto.costo_trasporto || 0);

  return (
    <Document title={`Contratto_${datiContratto.codice_contratto}`}>
      <PageShell
        titolo="Contratto di Noleggio"
        sottoTitolo={datiContratto.codice_contratto}
        datiOwner={datiOwner}
      >
        {/* 1. Dati Cliente - spacing='normal' (15pt, closer to title) */}
        <PDFSection title="Dati Cliente" spacing="normal">
          <PDFKeyValue label="Ragione Sociale" value={datiCliente.ragione_sociale} />
          <PDFKeyValue label="Partita IVA" value={datiCliente.p_iva} />
          <PDFKeyValue label="Sede Operativa" value={`${datiCliente.indirizzo}, ${datiCliente.cap} ${datiCliente.citta} (${datiCliente.provincia})`} />
          <PDFKeyValue label="Email / PEC" value={datiCliente.pec || datiCliente.email} />
        </PDFSection>

        {/* 2. Dettaglio Mezzo - spacing='section' (25pt) */}
        <PDFSection title="Dettaglio Mezzo" spacing="section">
          <PDFKeyValue label="Marca / Modello" value={`${datiMezzo.marca} ${datiMezzo.modello}`} />
          <PDFKeyValue label="Matricola" value={datiMezzo.matricola} />
          <PDFKeyValue label="Anno / Ore" value={`${datiMezzo.anno || "-"} / ${datiMezzo.ore_moto || "-"}`} />
          <PDFKeyValue label="Targa" value={datiMezzo.targa} />
        </PDFSection>

        {/* 3. Condizioni del Servizio - spacing='section' (25pt) */}
        <PDFSection title="Condizioni del Servizio" spacing="section">
          <PDFKeyValue label="Data Inizio" value={formatDataItaliana(datiContratto.data_inizio)} />
          <PDFKeyValue label="Data Scadenza" value={datiContratto.tempo_indeterminato ? "Tempo Indeterminato" : formatDataItaliana(datiContratto.data_fine)} />
          <PDFKeyValue label="Pagamento" value={getModalitaPagamentoLabel(datiContratto.modalita_pagamento)} />
          <PDFKeyValue label="Cauzione" value={formatEuro(datiContratto.deposito_cauzionale)} />
        </PDFSection>

        {/* 4. Tabella Economica - VISUAL BREAK (40pt) */}
        <View style={{ marginTop: 40 }}>
          <PDFTable
            headers={["Descrizione", "Importo (IVA escl.)", "Note"]}
            columnWidths={["55%", "20%", "25%"]}
            rows={rows}
          />

          <View style={{ marginTop: 5, alignItems: 'flex-end' }}>
            <View style={{ width: 180, borderTopWidth: 1, borderTopColor: '#1a365d', paddingTop: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>TOTALE DOC.</Text>
                <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>{formatEuro(totale)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 5. Note / Clausole - spacing='normal' (15pt) */}
        {datiContratto.clausole_speciali && (
          <PDFSection title="Note e Clausole Speciali" spacing="normal">
            <Text style={pdfStyles.text}>{datiContratto.clausole_speciali}</Text>
          </PDFSection>
        )}

        {/* 6. Firme - FINAL BREAK (50pt) */}
        <View style={{ marginTop: 50 }}>
          <PDFSignatureGroup>
            <PDFSignatureBox label="Il Cliente" />
            <PDFSignatureBox label="Toscana Carrelli S.r.l." />
          </PDFSignatureGroup>
        </View>

      </PageShell>
    </Document>
  );
}
