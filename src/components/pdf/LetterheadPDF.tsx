/**
 * PATTERN CENTRALIZZATO CARTA INTESTATA PDF
 *
 * Versione 4.0 - Premium Modern Design System
 */

import React from "react";
import { Page, View, Text, Image, StyleSheet, Document } from "@react-pdf/renderer";
import logoMvc from "@/assets/logo_mvc.png";

// Costanti per margini standard
export const PDF_MARGINS = {
  top: 30,
  bottom: 75,
  horizontal: 40,
  footerPosition: 25,
};

// Tavolozza colori Premium (Identità Aziendale)
export const PDF_COLORS = {
  primary: "#1a365d", // Blu Scuro Aziendale
  secondary: "#2d3748",
  accent: "#FFC107", // Giallo Caterpillar
  textMain: "#1a202c",
  textMuted: "#718096",
  border: "#e2e8f0",
  borderDark: "#cbd5e0",
  bgLight: "#f7fafc",
  white: "#ffffff",
  black: "#000000",
};

// Dati Aziendali STATIC (Fallback / Legacy)
export const CONST_OWNER_DATA: DatiAziendaOwner = {
  ragione_sociale: "Mvc Toscana Carrelli",
  partita_iva: "000000001",
  indirizzo: "Viale magri 115",
  citta: "Livorno",
  cap: null,
  provincia: null,
  telefono: "0586.000000",
  email: "info@toscanacarrelli.it",
  pec: null,
  codice_univoco: null,
  iban: null,
};

export const pdfStyles = StyleSheet.create({
  page: {
    paddingTop: 125,
    paddingBottom: 75,
    paddingHorizontal: PDF_MARGINS.horizontal,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },

  // Header Premium con design moderno
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 95,
  },

  // Banda decorativa superiore
  headerAccentBand: {
    height: 6,
    backgroundColor: PDF_COLORS.accent,
    width: "100%",
  },

  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: PDF_MARGINS.horizontal,
    paddingTop: 20,
    paddingBottom: 15,
  },

  logoContainer: {
    width: 160,
    position: "relative",
  },

  logo: {
    width: 150,
    height: "auto",
  },

  // Accento decorativo sotto il logo
  logoAccent: {
    width: 60,
    height: 3,
    backgroundColor: PDF_COLORS.accent,
    marginTop: 8,
  },

  companyInfo: {
    textAlign: "right",
    alignItems: "flex-end",
    maxWidth: 260,
    paddingLeft: 20,
  },

  companyName: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: PDF_COLORS.primary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    textAlign: "right",
  },

  companyDetails: {
    fontSize: 7.5,
    color: PDF_COLORS.textMain,
    lineHeight: 1.6,
    textAlign: "right",
  },

  // Linea di separazione elegante sotto l'header
  headerDivider: {
    position: "absolute",
    bottom: 0,
    left: PDF_MARGINS.horizontal,
    right: PDF_MARGINS.horizontal,
    height: 1,
    backgroundColor: PDF_COLORS.border,
  },

  // Accento giallo sotto l'header (piccolo dettaglio)
  headerAccentLine: {
    position: "absolute",
    bottom: 0,
    left: PDF_MARGINS.horizontal,
    width: 80,
    height: 2,
    backgroundColor: PDF_COLORS.accent,
  },

  // Titolo documento con stile moderno
  documentTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    textAlign: "left",
    marginTop: 0,
    marginBottom: 4,
    color: PDF_COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    borderLeftWidth: 4,
    borderLeftColor: PDF_COLORS.accent,
    paddingLeft: 12,
  },

  documentCode: {
    fontSize: 9,
    fontFamily: "Helvetica",
    textAlign: "left",
    marginBottom: 20,
    color: PDF_COLORS.textMuted,
    paddingLeft: 16,
  },

  // Griglia Layout
  contentGrid: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 25,
  },

  gridColumn: {
    flex: 1,
  },

  // Sezioni con design contemporaneo
  section: {
    marginTop: 8,
    marginBottom: 20,
  },

  // Sezione Header ridisegnata
  sectionHeader: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: PDF_COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: PDF_COLORS.white,
    borderLeftWidth: 4,
    borderLeftColor: PDF_COLORS.accent,
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.border,
  },

  content: {
    paddingTop: 5,
  },

  // Testi
  text: {
    fontSize: 9,
    lineHeight: 1.5,
    color: PDF_COLORS.textMain,
  },

  textBold: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.5,
    color: PDF_COLORS.primary,
  },

  label: {
    width: 110,
    fontSize: 8.5,
    color: PDF_COLORS.textMuted,
    fontFamily: "Helvetica",
  },

  value: {
    fontSize: 8.5,
    color: PDF_COLORS.textMain,
    fontFamily: "Helvetica-Bold",
  },

  row: {
    flexDirection: "row",
    marginBottom: 5,
    alignItems: "flex-start",
  },

  // Tabelle con design moderno
  table: {
    width: "100%",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: PDF_COLORS.border,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: PDF_COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 2,
    borderBottomColor: PDF_COLORS.accent,
  },

  tableHeaderText: {
    color: PDF_COLORS.white,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.border,
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: PDF_COLORS.white,
  },

  tableRowAlt: {
    backgroundColor: PDF_COLORS.bgLight,
  },

  tableCell: {
    fontSize: 8.5,
    color: PDF_COLORS.textMain,
  },

  tableCellText: {
    fontSize: 8.5,
    color: PDF_COLORS.textMain,
  },

  // Footer ridisegnato
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingBottom: PDF_MARGINS.footerPosition,
    paddingHorizontal: PDF_MARGINS.horizontal,
    borderTopWidth: 1,
    borderTopColor: PDF_COLORS.border,
    backgroundColor: PDF_COLORS.bgLight,
  },

  footerAccentBand: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: PDF_COLORS.accent,
  },

  footerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  footerText: {
    fontSize: 7,
    color: PDF_COLORS.textMuted,
    lineHeight: 1.4,
  },

  footerTextBold: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: PDF_COLORS.textMain,
  },

  // Firma
  signatureSection: {
    marginTop: 35,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 30,
  },

  signatureBox: {
    width: "45%",
  },

  signatureLabel: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    marginBottom: 40,
    color: PDF_COLORS.textMain,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  signatureLine: {
    borderTopWidth: 1.5,
    borderTopColor: PDF_COLORS.primary,
    paddingTop: 5,
    fontSize: 7,
    color: PDF_COLORS.textMuted,
    textAlign: "center",
  },
});

/* ==========================================================================
   COMPONENTI WRAPPER (PAGE SHELL)
   ========================================================================== */

// Interfaccia per i dati aziendali owner
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
  children: React.ReactNode;
  titolo?: string;
  sottoTitolo?: string;
  datiOwner?: DatiAziendaOwner;
  documentId?: string;
  disclaimer?: string;
}

/**
 * PageShell - Il componente più 'sicuro' per generare documenti.
 * Enforces standardized margins, header, and footer.
 */
export function PageShell({ children, titolo, sottoTitolo, datiOwner, documentId, disclaimer }: PageShellProps) {
  // Usa i dati passati o il fallback statico
  const effectiveOwner = datiOwner || CONST_OWNER_DATA;

  // Genera un Hash-ID di validazione deterministico se non fornito
  const validationId = React.useMemo(() => {
    if (documentId) return documentId.slice(-8).toUpperCase();
    const hash = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `TMP-${hash}`;
  }, [documentId]);

  const indirizzoCompleto = [
    effectiveOwner.indirizzo,
    `${effectiveOwner.cap || ""} ${effectiveOwner.citta || ""}`.trim(),
    effectiveOwner.provincia ? `(${effectiveOwner.provincia})` : "",
  ]
    .filter(Boolean)
    .join(" - ");

  return (
    <Page size="A4" style={pdfStyles.page}>
      {/* HEADER FISSO SU OGNI PAGINA */}
      <View fixed style={pdfStyles.header}>
        {/* Banda decorativa superiore */}
        <View style={pdfStyles.headerAccentBand} />

        {/* Contenuto header */}
        <View style={pdfStyles.headerContent}>
          {/* Logo a sinistra con accento */}
          <View style={pdfStyles.logoContainer}>
            <Image style={pdfStyles.logo} src={logoMvc} />
            <View style={pdfStyles.logoAccent} />
          </View>

          {/* Dati aziendali a destra */}
          <View style={pdfStyles.companyInfo}>
            <Text style={pdfStyles.companyName}>{effectiveOwner.ragione_sociale}</Text>
            <Text style={pdfStyles.companyDetails}>
              {effectiveOwner.partita_iva && `P.IVA: ${effectiveOwner.partita_iva}`}
              {"\n"}
              {indirizzoCompleto}
              {"\n"}
              {effectiveOwner.telefono && `Tel: ${effectiveOwner.telefono}`}
              {effectiveOwner.telefono && effectiveOwner.email && " - "}
              {effectiveOwner.email && `Email: ${effectiveOwner.email}`}
              {"\n"}
              {effectiveOwner.pec && `PEC: ${effectiveOwner.pec}`}
              {"\n"}
              {effectiveOwner.codice_univoco && `SDI: ${effectiveOwner.codice_univoco}`}
            </Text>
          </View>
        </View>

        {/* Linea di separazione con accento giallo */}
        <View style={pdfStyles.headerDivider} />
        <View style={pdfStyles.headerAccentLine} />
      </View>

      <View style={{ marginTop: 0, paddingBottom: 0 }}>
        {/* TITOLO DEL DOCUMENTO */}
        {titolo && (
          <View style={{ marginBottom: 20 }}>
            <Text style={pdfStyles.documentTitle}>{titolo}</Text>
            {sottoTitolo && <Text style={pdfStyles.documentCode}>{sottoTitolo}</Text>}
          </View>
        )}

        {children}
      </View>

      <LetterheadFooter datiOwner={effectiveOwner} validationId={validationId} disclaimer={disclaimer} />
    </Page>
  );
}

// LetterheadHeader rimossa/vuota perché integrata in PageShell
export function LetterheadHeader({ datiOwner }: any) {
  return null;
}

interface LetterheadFooterProps {
  datiOwner: DatiAziendaOwner;
  pageNumber?: boolean;
  validationId?: string;
  disclaimer?: string;
}

/**
 * Componente Footer della carta intestata
 */
export function LetterheadFooter({ datiOwner, pageNumber = true, validationId, disclaimer }: LetterheadFooterProps) {
  return (
    <View style={pdfStyles.footer} fixed>
      {/* Banda decorativa superiore */}
      <View style={pdfStyles.footerAccentBand} />

      {/* Disclaimer opzionale */}
      {disclaimer && (
        <Text style={{ fontSize: 6, color: PDF_COLORS.textMuted, marginBottom: 6, marginTop: 4, fontStyle: "italic" }}>
          {disclaimer}
        </Text>
      )}

      {/* Contenuto footer */}
      <View style={pdfStyles.footerContent}>
        {/* Info azienda a sinistra */}
        <View style={{ flex: 1, textAlign: "left" }}>
          <Text style={pdfStyles.footerTextBold}>{datiOwner.ragione_sociale}</Text>
          <Text style={pdfStyles.footerText}>{datiOwner.partita_iva && `P.IVA ${datiOwner.partita_iva}`}</Text>
          {datiOwner.iban && <Text style={pdfStyles.footerText}>IBAN: {datiOwner.iban}</Text>}
        </View>

        {/* ID Validazione al centro */}
        {validationId && (
          <View style={{ flex: 1, textAlign: "center", alignItems: "center" }}>
            <Text
              style={{
                fontSize: 6.5,
                fontFamily: "Helvetica-Bold",
                color: PDF_COLORS.primary,
                backgroundColor: PDF_COLORS.white,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 2,
                borderWidth: 1,
                borderColor: PDF_COLORS.border,
              }}
            >
              ID: {validationId}
            </Text>
          </View>
        )}

        {/* Numero pagina a destra */}
        <View style={{ flex: 1, textAlign: "right", alignItems: "flex-end" }}>
          {pageNumber && (
            <Text
              style={pdfStyles.footerText}
              render={({ pageNumber: pn, totalPages }) => `Pagina ${pn} di ${totalPages}`}
            />
          )}
          <Text style={{ fontSize: 6, color: PDF_COLORS.textMuted, marginTop: 2 }}>
            {new Date().toLocaleDateString("it-IT")}
          </Text>
        </View>
      </View>
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

export function formatEuro(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "-";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export const MODALITA_PAGAMENTO_LABELS: Record<string, string> = {
  bonifico_anticipato: "Bonifico Anticipato",
  bonifico_30gg: "Bonifico 30 giorni",
  bonifico_60gg: "Bonifico 60 giorni",
  bonifico_90gg: "Bonifico 90 giorni",
  riba_30gg: "Ri.Ba. 30 giorni",
  riba_60gg: "Ri.Ba. 60 giorni",
  riba_90gg: "Ri.Ba. 90 giorni",
  rimessa_diretta: "Rimessa Diretta",
  contrassegno: "Contrassegno",
};

export function getModalitaPagamentoLabel(modalita: string | null | undefined): string {
  if (!modalita) return "-";
  return MODALITA_PAGAMENTO_LABELS[modalita] || modalita;
}
