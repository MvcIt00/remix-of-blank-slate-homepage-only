/**
 * PATTERN CENTRALIZZATO CARTA INTESTATA PDF
 * 
 * Versione 3.0 - Enterprise Design System
 */

import { Page, View, Text, Image, StyleSheet, Document } from "@react-pdf/renderer";
import logoMvc from "@/assets/logo_mvc.png";

// Costanti per margini standard (COMPATTI)
export const PDF_MARGINS = {
  top: 25,
  bottom: 70,
  horizontal: 35,
  footerPosition: 25,
};

// Tavolozza colori Premium (Figma Design System)
export const PDF_COLORS = {
  primary: "#1e293b", // Slate 800
  secondary: "#334155", // Slate 700
  accent: "#b45309", // Amber 700 (Toscana Carrelli)
  textMain: "#1e293b",
  textMuted: "#64748b", // Slate 500
  border: "#e2e8f0", // Slate 200
  bgLight: "#f8fafc", // Slate 50
  white: "#ffffff",
};

export const pdfStyles = StyleSheet.create({
  page: {
    paddingTop: PDF_MARGINS.top,
    paddingBottom: PDF_MARGINS.bottom,
    paddingHorizontal: PDF_MARGINS.horizontal,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  // Header Premium con logo e dati aziendali (COMPATTO)
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 10,
  },
  logoContainer: {
    width: 150,
  },
  logo: {
    width: 140,
    height: "auto",
  },
  companyInfo: {
    textAlign: "right",
    alignItems: "flex-end",
    maxWidth: 250,
  },
  companyName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    marginBottom: 6,
    textTransform: "uppercase",
    textAlign: "right",
  },
  companyDetails: {
    fontSize: 7.5,
    color: "#000000",
    lineHeight: 1.5,
    textAlign: "right",
  },
  // Titolo documento (COMPATTO)
  documentTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginTop: 5,
    marginBottom: 3,
    color: "#1a365d",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  documentCode: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 3,
    color: "#718096",
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
  // Sezioni (PIÙ SPAZIO SOPRA)
  section: {
    marginTop: 8,
    marginBottom: 20,
  },
  // Sezione Header (SPAZIO CHIARO)
  sectionHeader: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#1a365d",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#f8fafc",
    borderLeftWidth: 3,
    borderLeftColor: "#FBBF24",
  },
  content: {
    paddingTop: 5,
  },
  // Testi
  text: {
    fontSize: 9,
    lineHeight: 1.4,
    color: "#2d3748",
  },
  textBold: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.4,
    color: "#1a365d",
  },
  label: {
    width: 110,
    fontSize: 8.5,
    color: "#718096",
  },
  value: {
    fontSize: 8.5,
    color: "#1a365d",
    fontFamily: "Helvetica-Bold",
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  // Tabelle
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1a365d",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    color: "#ffffff",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableCell: {
    fontSize: 8.5,
    color: "#2d3748",
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: PDF_MARGINS.footerPosition,
    left: PDF_MARGINS.horizontal,
    right: PDF_MARGINS.horizontal,
    textAlign: "center",
    fontSize: 7,
    color: "#a0aec0",
    borderTopWidth: 0.5,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
  },
  // Firma - non spezzabile
  signatureSection: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: {
    width: "45%",
  },
  signatureLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    marginBottom: 35,
    color: "#4a5568",
    textTransform: "uppercase",
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#2d3748",
    paddingTop: 4,
    fontSize: 7,
    color: "#718096",
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
}

/**
 * PageShell - Il componente più 'sicuro' per generare documenti.
 * Enforces standardized margins, header, and footer.
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

      <View style={{ marginTop: 10, paddingBottom: 40 }}>
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
 * Componente Header della carta intestata
 */
export function LetterheadHeader({ datiOwner, titolo, sottoTitolo }: LetterheadHeaderProps) {
  const indirizzoCompleto = [
    datiOwner.indirizzo,
    `${datiOwner.cap || ""} ${datiOwner.citta || ""}`.trim(),
    datiOwner.provincia ? `(${datiOwner.provincia})` : "",
  ]
    .filter(Boolean)
    .join(" - ");

  return (
    <View>
      <View style={pdfStyles.header}>
        {/* Logo a sinistra */}
        <View style={pdfStyles.logoContainer}>
          <Image style={pdfStyles.logo} src={logoMvc} />
        </View>

        {/* Dati aziendali a destra */}
        <View style={pdfStyles.companyInfo}>
          <Text style={pdfStyles.companyName}>{datiOwner.ragione_sociale}</Text>
          <Text style={pdfStyles.companyDetails}>
            {datiOwner.partita_iva && `P.IVA: ${datiOwner.partita_iva}`}
            {"\n"}
            {indirizzoCompleto}
            {"\n"}
            {datiOwner.telefono && `Tel: ${datiOwner.telefono}`}
            {datiOwner.telefono && datiOwner.email && " - "}
            {datiOwner.email && `Email: ${datiOwner.email}`}
            {"\n"}
            {datiOwner.pec && `PEC: ${datiOwner.pec}`}
            {"\n"}
            {datiOwner.codice_univoco && `SDI: ${datiOwner.codice_univoco}`}
          </Text>
        </View>
      </View>

      {/* Titolo Documento centrato se presente */}
      {(titolo || sottoTitolo) && (
        <View style={{ marginBottom: 20 }}>
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
 * Componente Footer della carta intestata
 */
export function LetterheadFooter({ datiOwner, pageNumber = true }: LetterheadFooterProps) {
  return (
    <View style={pdfStyles.footer} fixed>
      <Text>
        {datiOwner.ragione_sociale} - P.IVA {datiOwner.partita_iva}
        {datiOwner.iban && ` - IBAN: ${datiOwner.iban}`}
      </Text>
      {pageNumber && (
        <Text
          render={({ pageNumber: pn, totalPages }) => `Pagina ${pn} di ${totalPages}`}
        />
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
