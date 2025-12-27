/**
 * Template PDF Preventivo Noleggio — Enterprise Level 3
 * Design con CARATTERE, coerente con ContrattoPDF ma con identità specifica.
 * Basato su Logica "Zero-Draft" e Immutable Snapshots.
 */

import React from "react";
import { Document, View, Text } from "@react-pdf/renderer";
import {
  PageShell,
  DatiAziendaOwner,
  formatDataItaliana,
  formatEuro,
  pdfStyles,
  PDF_COLORS,
} from "../pdf/LetterheadPDF";
import {
  PDFDocumentBuilder,
  StandardSectionData,
  EconomicSectionData,
  SignatureSectionData,
  TextSectionData,
  DocumentSection,
  PDFKeyValue,
} from "../pdf/pdf-components";
import {
  UniversalClientSection,
  UniversalMezzoSection,
} from "../pdf/universal/UniversalPDFSections";

/* =======================
   Types (Allineati a database_views.ts)
   ======================= */

export interface DatiClientePreventivo {
  ragione_sociale: string;
  partita_iva: string | null;
  indirizzo?: string | null;
  citta?: string | null;
  cap?: string | null;
  provincia?: string | null;
  telefono?: string | null;
  email?: string | null;
  pec?: string | null;
  codice_univoco?: string | null;
  sede_legale_indirizzo?: string | null; // Supporto per sezioni universali
  sede_legale_citta?: string | null;
  sede_legale_cap?: string | null;
  sede_legale_provincia?: string | null;
  nome_contatto_principale?: string | null;
  email_principale?: string | null;
  telefono_principale?: string | null;
}

export interface DatiMezzoPreventivo {
  marca: string | null;
  modello: string | null;
  matricola: string | null;
  id_interno: string | null;
  anno: string | number | null;
  categoria: string | null;
  ore_moto: number | null;
  ubicazione_attuale_dettaglio?: string | null;
}

export interface DatiPreventivo {
  codice_preventivo: string;
  data_creazione: string;
  data_inizio: string | null;
  data_fine: string | null;
  tempo_indeterminato: boolean;
  canone_noleggio: number | null;
  tipo_canone: string | null;
  costo_trasporto: number | null;
  note: string | null;
  validita_giorni?: number;
}

interface PreventivoPDFProps {
  datiOwner: DatiAziendaOwner;
  datiCliente: DatiClientePreventivo;
  datiMezzo: DatiMezzoPreventivo;
  datiPreventivo: DatiPreventivo;
}

/* =======================
   Main Component (TOP LEVEL)
   ======================= */

export function PreventivoPDF({ datiOwner, datiCliente, datiMezzo, datiPreventivo }: PreventivoPDFProps) {
  // 1. Preparazione Dati per Sezioni Universali
  // Mappatura sicura per UniversalClientSection
  const clientData: any = {
    ...datiCliente,
    sede_legale_indirizzo: datiCliente.sede_legale_indirizzo || datiCliente.indirizzo,
    sede_legale_citta: datiCliente.sede_legale_citta || datiCliente.citta,
    sede_legale_cap: datiCliente.sede_legale_cap || datiCliente.cap,
    sede_legale_provincia: datiCliente.sede_legale_provincia || datiCliente.provincia,
    email_principale: datiCliente.email_principale || datiCliente.email,
    telefono_principale: datiCliente.telefono_principale || datiCliente.telefono,
  };

  const mezzoData: any = {
    ...datiMezzo,
    anno: datiMezzo.anno ? String(datiMezzo.anno) : null,
  };

  // 2. Definizione Sezioni (Data-Driven Architecture)

  const sectionParti: DocumentSection = {
    id: 'parti',
    type: 'text',
    spacingTop: 'none',
    content: [
      'DESTINATARIO',
      clientData.ragione_sociale || '',
      clientData.sede_legale_indirizzo || '',
      `${clientData.sede_legale_cap || ''} ${clientData.sede_legale_citta || ''}${clientData.sede_legale_provincia ? ` (${clientData.sede_legale_provincia})` : ''}`.trim(),
      clientData.partita_iva ? `P.IVA ${clientData.partita_iva}` : ''
    ].filter(Boolean).join('\n')
  };

  const sectionMezzo: DocumentSection = UniversalMezzoSection(mezzoData, {
    title: "Oggetto: Proposta di Noleggio Mezzo",
    mode: 'standard'
  });

  const sectionCondizioni: StandardSectionData = {
    id: 'condizioni',
    type: 'standard',
    title: 'Condizioni e Durata',
    spacingTop: 'section',
    data: [
      { label: 'Inizio Previsto', value: formatDataItaliana(datiPreventivo.data_inizio) },
      { label: 'Fine Prevista', value: datiPreventivo.tempo_indeterminato ? "Tempo Indeterminato" : formatDataItaliana(datiPreventivo.data_fine) },
      { label: 'Validità Proposta', value: `${datiPreventivo.validita_giorni || 30} giorni` }
    ]
  };

  const economicheRows = [
    [
      `Canone di noleggio (${datiPreventivo.tipo_canone || "mensile"})`,
      formatEuro(datiPreventivo.canone_noleggio),
      datiPreventivo.tipo_canone === "giornaliero" ? "al giorno" : "al mese"
    ]
  ];

  if (datiPreventivo.costo_trasporto) {
    economicheRows.push([
      "Costo trasporto (A/R)",
      formatEuro(datiPreventivo.costo_trasporto),
      "Una tantum"
    ]);
  }

  const sectionEconomica: EconomicSectionData = {
    id: 'economica',
    type: 'economic',
    spacingTop: 'section',
    tableHeaders: ["Descrizione", "Importo (IVA escl.)", "Note"],
    columnWidths: ["50%", "25%", "25%"],
    rows: economicheRows,
    totalLabel: "TOTALE CANONE",
    totalValue: formatEuro((datiPreventivo.canone_noleggio || 0) + (datiPreventivo.costo_trasporto || 0))
  };

  const sectionNote: TextSectionData | null = datiPreventivo.note ? {
    id: 'note',
    type: 'text',
    title: 'Note aggiuntive',
    spacingTop: 'normal',
    content: datiPreventivo.note
  } : null;

  const sectionFirme: SignatureSectionData = {
    id: 'firme',
    type: 'signatures',
    spacingTop: 'normal',
    labels: ["Il Cliente (per Accettazione / Timbro e Firma)"]
  };

  const documentSections: DocumentSection[] = [
    sectionParti,
    {
      id: 'oggetto_mezzo',
      type: 'group',
      keepTogether: true,
      sections: [
        sectionMezzo,
        sectionCondizioni
      ]
    },
    { id: 'page_split', type: 'break-page' }, // FORZA SALTO PAGINA SEMANTICO
    {
      id: 'economica_firme',
      type: 'group',
      keepTogether: true,
      sections: [
        sectionEconomica,
        ...(sectionNote ? [sectionNote] : []),
        sectionFirme
      ]
    }
  ];

  return (
    <Document title={`Preventivo_${datiPreventivo.codice_preventivo}`}>
      <PageShell
        titolo="Preventivo di Noleggio"
        sottoTitolo={`Rif. ${datiPreventivo.codice_preventivo}`}
        datiOwner={datiOwner}
        documentId={datiPreventivo.codice_preventivo}
        disclaimer="* I prezzi indicati non includono l'IVA. La presente proposta non costituisce contratto sino a conferma scritta delle parti. Il mezzo viene consegnato in perfetto stato di funzionamento e deve essere restituito nelle medesime condizioni."
      >
        <PDFDocumentBuilder sections={documentSections} />
      </PageShell>
    </Document>
  );
}
