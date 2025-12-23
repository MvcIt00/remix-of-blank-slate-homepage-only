import React from "react";
import { Document } from "@react-pdf/renderer";
import {
  PageShell,
  DatiAziendaOwner,
  formatDataItaliana,
  formatEuro,
  getModalitaPagamentoLabel
} from "../pdf/LetterheadPDF";
import {
  PDFDocumentBuilder,
  StandardSectionData,
  EconomicSectionData,
  GroupSectionData,
  SignatureSectionData,
  TextSectionData,
  DocumentSection
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
  tipo_tariffa: string; // Added to match interface requirements
  canone_mensile: number; // Added to match existing interface
}

export interface ContrattoPDFProps {
  datiOwner: DatiAziendaOwner;
  datiCliente: DatiCliente;
  datiMezzo: DatiMezzo;
  datiContratto: DatiContratto;
}

export function ContrattoPDF({ datiOwner, datiCliente, datiMezzo, datiContratto }: ContrattoPDFProps) {
  // Calcoli Tabella
  const rows = [
    [
      `Noleggio ${datiMezzo.marca} ${datiMezzo.modello}`,
      formatEuro(datiContratto.canone_mensile || datiContratto.canone_noleggio || 0),
      `Tariffa ${datiContratto.tipo_tariffa || datiContratto.tipo_canone}`
    ],
  ];

  if (datiContratto.costo_trasporto) {
    rows.push([
      "Costi di Trasporto (Andata/Ritorno)",
      formatEuro(datiContratto.costo_trasporto),
      "Una Tantum"
    ]);
  }

  const totale = (datiContratto.canone_mensile || datiContratto.canone_noleggio || 0) + (datiContratto.costo_trasporto || 0);

  // ===========================================================================
  // COSTRUZIONE DEL DOCUMENTO (Data-Driven)
  // ===========================================================================

  // 1. Definiamo le sezioni standard
  const sectionDatiCliente: StandardSectionData = {
    id: 'cliente',
    type: 'standard',
    title: 'Dati Cliente',
    spacingTop: 'normal',
    data: [
      { label: 'Ragione Sociale', value: datiCliente.ragione_sociale },
      { label: 'Partita IVA', value: datiCliente.p_iva },
      { label: 'Sede Operativa', value: `${datiCliente.indirizzo}, ${datiCliente.cap} ${datiCliente.citta} (${datiCliente.provincia})` },
      { label: 'Email / PEC', value: datiCliente.pec || datiCliente.email }
    ]
  };

  const sectionMezzo: StandardSectionData = {
    id: 'mezzo',
    type: 'standard',
    title: 'Dettaglio Mezzo',
    spacingTop: 'section',
    data: [
      { label: 'Marca / Modello', value: `${datiMezzo.marca} ${datiMezzo.modello}` },
      { label: 'Matricola', value: datiMezzo.matricola },
      { label: 'Anno / Ore', value: `${datiMezzo.anno || "-"} / ${datiMezzo.ore_moto || "-"}` },
      { label: 'Targa', value: datiMezzo.targa }
    ]
  };

  const sectionCondizioni: StandardSectionData = {
    id: 'condizioni',
    type: 'standard',
    title: 'Condizioni del Servizio',
    spacingTop: 'section',
    data: [
      { label: 'Data Inizio', value: formatDataItaliana(datiContratto.data_inizio) },
      { label: 'Data Scadenza', value: datiContratto.tempo_indeterminato ? "Tempo Indeterminato" : formatDataItaliana(datiContratto.data_fine) },
      { label: 'Pagamento', value: getModalitaPagamentoLabel(datiContratto.modalita_pagamento) },
      { label: 'Cauzione', value: formatEuro(datiContratto.deposito_cauzionale) }
    ]
  };

  // 2. Prepariamo la sezione Economica
  const sectionEconomica: EconomicSectionData = {
    id: 'economica',
    type: 'economic',
    spacingTop: 'break',
    tableHeaders: ["Descrizione", "Importo (IVA escl.)", "Note"],
    columnWidths: ["55%", "20%", "25%"],
    rows: rows,
    totalLabel: "TOTALE DOC.",
    totalValue: formatEuro(totale)
  };

  // 3. Prepariamo eventuali Note
  const sectionNote: TextSectionData | null = datiContratto.clausole_speciali ? {
    id: 'note',
    type: 'text',
    title: 'Note e Clausole Speciali',
    spacingTop: 'normal',
    content: datiContratto.clausole_speciali
  } : null;

  // 4. Prepariamo le Firme
  const sectionFirme: SignatureSectionData = {
    id: 'firme',
    type: 'signatures',
    spacingTop: 'final',
    labels: ["Il Cliente", "Toscana Carrelli S.r.l."]
  };

  // ===========================================================================
  // LOGICA "ANTI-ORFANA" (Smart Grouping)
  // ===========================================================================

  const bottomGroup: GroupSectionData = {
    id: 'bottom-group',
    type: 'group',
    keepTogether: true, // NON SPEZZARE
    spacingTop: 'none',
    sections: [
      sectionEconomica,
      ...(sectionNote ? [sectionNote] : []),
      sectionFirme
    ]
  };

  // LISTA FINALE DELLE SEZIONI DA RENDERIZZARE
  const documentSections: DocumentSection[] = [
    sectionDatiCliente,
    sectionMezzo,
    sectionCondizioni,
    bottomGroup
  ];

  return (
    <Document title={`Contratto_${datiContratto.codice_contratto}`}>
      {/* PAGE 1: GENERATED CONTENT */}
      <PageShell
        titolo="Contratto di Noleggio"
        sottoTitolo={`Rif. ${datiContratto.codice_contratto}`}
        datiOwner={datiOwner}
      >
        <PDFDocumentBuilder sections={documentSections} />
      </PageShell>
    </Document>
  );
}
