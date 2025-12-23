/**
 * PATTERN CENTRALIZZATO CARTA INTESTATA PDF
 * 
 * Versione 4.0 - Compact Enterprise Design
 * Standard professionale con ottimizzazione spazi
 */

import type { ReactNode } from "react";
import { Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import logoMvc from "@/assets/logo_mvc.png";

// Margini compatti professionali
export const PDF_MARGINS = {
  top: 25,
  bottom: 50,
  horizontal: 30,
  footerPosition: 18,
};

// Palette enterprise sobria
export const PDF_COLORS = {
  primary: "#1e293b",
  secondary: "#475569",
  accent: "#d97706",
  textMain: "#1e293b",
  textMuted: "#64748b",
  border: "#cbd5e1",
  borderLight: "#e2e8f0",
  bgLight: "#f8fafc",
  white: "#ffffff",
};

export const pdfStyles = StyleSheet.create({
  page: {
    paddingTop: PDF_MARGINS.top,
    paddingBottom: PDF_MARGINS.bottom,
    paddingHorizontal: PDF_MARGINS.horizontal,
    fontSize: 9,
    fontFamily: "Helvetica",
    backgroundColor: PDF_COLORS.white,
  },
  // Header compatto inline
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.primary,
  },
  logoContainer: {
    width: 100,
  },
  logo: {
    width: 90,
    height: "auto",
  },
  companyInfo: {
    textAlign: "right",
    flex: 1,
    paddingLeft: 15,
  },
  companyName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: PDF_COLORS.primary,
    marginBottom: 2,
  },
  companyDetails: {
    fontSize: 6.5,
    color: PDF_COLORS.textMuted,
    lineHeight: 1.3,
  },
  // Titolo documento compatto
  documentTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    color: PDF_COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 2,
  },
  documentCode: {
    fontSize: 8,
    textAlign: "center",
    color: PDF_COLORS.textMuted,
    marginBottom: 12,
  },
  // Griglia Layout ottimizzata
  contentGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  gridColumn: {
    flex: 1,
  },
  // Sezioni compatte
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: PDF_COLORS.primary,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    paddingBottom: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: PDF_COLORS.border,
  },
  content: {
    paddingTop: 3,
  },
  // Testi
  text: {
    fontSize: 8,
    lineHeight: 1.35,
    color: PDF_COLORS.textMain,
  },
  textBold: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.35,
    color: PDF_COLORS.primary,
  },
  label: {
    width: 80,
    fontSize: 7.5,
    color: PDF_COLORS.textMuted,
  },
  value: {
    fontSize: 8,
    color: PDF_COLORS.primary,
    fontFamily: "Helvetica-Bold",
  },
  row: {
    flexDirection: "row",
    marginBottom: 2,
  },
  // Tabelle compatte
  tableHeader: {
    flexDirection: "row",
    backgroundColor: PDF_COLORS.primary,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  tableHeaderText: {
    color: PDF_COLORS.white,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: PDF_COLORS.borderLight,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  tableCell: {
    fontSize: 8,
    color: PDF_COLORS.textMain,
  },
  // Footer minimo
  footer: {
    position: "absolute",
    bottom: PDF_MARGINS.footerPosition,
    left: PDF_MARGINS.horizontal,
    right: PDF_MARGINS.horizontal,
    textAlign: "center",
    fontSize: 6,
    color: PDF_COLORS.textMuted,
    borderTopWidth: 0.5,
    borderTopColor: PDF_COLORS.borderLight,
    paddingTop: 5,
  },
  // Firma compatta
  signatureSection: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: {
    width: "45%",
  },
  signatureLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    marginBottom: 25,
    color: PDF_COLORS.secondary,
    textTransform: "uppercase",
  },
  signatureLine: {
    borderTopWidth: 0.5,
    borderTopColor: PDF_COLORS.primary,
    paddingTop: 3,
    fontSize: 6,
    color: PDF_COLORS.textMuted,
  },
});

/* ==========================================================================
   COMPONENTI WRAPPER (PAGE SHELL)
   ========================================================================== */

export interface DatiAziendaOwner {
  ragione_sociale: string;
  partita_iva: string | null;
  indirizzo: string | null;
  citta: string | null;
  cap: string | null;
  provincia: string | null;
  telefono: string | null;
  email: string | null;
  pec: string | null;
  codice_univoco: string | null;
  iban: string | null;
}

interface PageShellProps {
  children: ReactNode;
  titolo?: string;
  sottoTitolo?: string;
  datiOwner?: DatiAziendaOwner;
}

/**
 * PageShell V4 - Compact Enterprise Layout
 */
export function PageShell({ children, titolo, sottoTitolo, datiOwner }: PageShellProps) {
  if (!datiOwner) return null;

  return (
    <Page size="A4" style={pdfStyles.page}>
      <LetterheadHeader
        titolo={titolo}
        sottoTitolo={sottoTitolo}
        datiOwner={datiOwner}
      />
      <View style={{ flex: 1 }}>
        {children}
      </View>
      <LetterheadFooter datiOwner={datiOwner} />
    </Page>
  );
}

interface LetterheadHeaderProps {
  datiOwner: DatiAziendaOwner;
  titolo?: string;
  sottoTitolo?: string;
}

/**
 * Header compatto inline: logo sx, dati dx, titolo sotto
 */
export function LetterheadHeader({ datiOwner, titolo, sottoTitolo }: LetterheadHeaderProps) {
  const indirizzoCompatto = [
    datiOwner.indirizzo,
    datiOwner.cap,
    datiOwner.citta,
    datiOwner.provincia ? `(${datiOwner.provincia})` : "",
  ].filter(Boolean).join(" ");

  return (
    <View>
      {/* Header row: logo + info */}
      <View style={pdfStyles.header}>
        <View style={pdfStyles.logoContainer}>
          <Image style={pdfStyles.logo} src={logoMvc} />
        </View>
        <View style={pdfStyles.companyInfo}>
          <Text style={pdfStyles.companyName}>{datiOwner.ragione_sociale}</Text>
          <Text style={pdfStyles.companyDetails}>
            P.IVA {datiOwner.partita_iva} | {indirizzoCompatto}
            {"\n"}
            {datiOwner.telefono && `Tel ${datiOwner.telefono}`}
            {datiOwner.telefono && datiOwner.email && " | "}
            {datiOwner.email}
            {datiOwner.pec && ` | PEC: ${datiOwner.pec}`}
          </Text>
        </View>
      </View>

      {/* Titolo centrato compatto */}
      {(titolo || sottoTitolo) && (
        <View>
          {titolo && <Text style={pdfStyles.documentTitle}>{titolo}</Text>}
          {sottoTitolo && <Text style={pdfStyles.documentCode}>{sottoTitolo}</Text>}
        </View>
      )}
    </View>
  );
}

interface LetterheadFooterProps {
  datiOwner: DatiAziendaOwner;
  pageNumber?: boolean;
}

/**
 * Footer minimalista
 */
export function LetterheadFooter({ datiOwner, pageNumber = true }: LetterheadFooterProps) {
  return (
    <View style={pdfStyles.footer} fixed>
      <Text>
        {datiOwner.ragione_sociale} | P.IVA {datiOwner.partita_iva}
        {datiOwner.iban && ` | IBAN: ${datiOwner.iban}`}
      </Text>
      {pageNumber && (
        <Text render={({ pageNumber: pn, totalPages }) => `Pag. ${pn}/${totalPages}`} />
      )}
    </View>
  );
}

/* ==========================================================================
   HELPERS
   ========================================================================== */

export function formatDataItaliana(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatDataBreve(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatEuro(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "-";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export const MODALITA_PAGAMENTO_LABELS: Record<string, string> = {
  bonifico_anticipato: "Bonifico Anticipato",
  bonifico_30gg: "Bonifico 30gg",
  bonifico_60gg: "Bonifico 60gg",
  bonifico_90gg: "Bonifico 90gg",
  riba_30gg: "Ri.Ba. 30gg",
  riba_60gg: "Ri.Ba. 60gg",
  riba_90gg: "Ri.Ba. 90gg",
  rimessa_diretta: "Rimessa Diretta",
  contrassegno: "Contrassegno",
};

export function getModalitaPagamentoLabel(modalita: string | null | undefined): string {
  if (!modalita) return "-";
  return MODALITA_PAGAMENTO_LABELS[modalita] || modalita;
}
