/**
 * PATTERN CENTRALIZZATO CARTA INTESTATA PDF
 * 
 * Questo componente definisce lo stile standard per tutti i PDF generati:
 * - Logo in alto a sinistra
 * - Dati aziendali in alto a destra (testuale)
 * - Footer con informazioni legali
 * 
 * Da importare e riutilizzare in tutti i documenti PDF del sistema.
 */

import { Page, View, Text, Image, StyleSheet, Document } from "@react-pdf/renderer";
import logoMvc from "@/assets/logo_mvc.png";

// Stili condivisi per tutti i PDF
// Costanti per margini standard
export const PDF_MARGINS = {
  top: 40,
  bottom: 80, // Spazio per footer fisso
  horizontal: 40,
  footerPosition: 30,
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
  // Header con logo e dati aziendali
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#1a365d",
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
    maxWidth: 250,
  },
  companyName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#1a365d",
    marginBottom: 4,
  },
  companyDetails: {
    fontSize: 8,
    color: "#4a5568",
    lineHeight: 1.4,
  },
  // Titolo documento
  documentTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1a365d",
  },
  documentCode: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 20,
    color: "#718096",
  },
  // Sezioni - con wrap=false applicato nel componente
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    color: "#2d3748",
  },
  // Testo paragrafo con controllo orfane/vedove
  paragraph: {
    fontSize: 8,
    lineHeight: 1.5,
    color: "#4a5568",
  },
  // Tabelle dati
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    width: 120,
    fontSize: 9,
    color: "#718096",
  },
  value: {
    flex: 1,
    fontSize: 9,
    color: "#2d3748",
  },
  // Box info
  infoBox: {
    backgroundColor: "#f7fafc",
    padding: 12,
    borderRadius: 4,
    marginBottom: 15,
  },
  // Tabella condizioni economiche
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1a365d",
    padding: 8,
  },
  tableHeaderCell: {
    color: "#ffffff",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    padding: 8,
  },
  tableCell: {
    fontSize: 9,
    color: "#2d3748",
  },
  // Footer - posizione assoluta fissa
  footer: {
    position: "absolute",
    bottom: PDF_MARGINS.footerPosition,
    left: PDF_MARGINS.horizontal,
    right: PDF_MARGINS.horizontal,
    textAlign: "center",
    fontSize: 7,
    color: "#a0aec0",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
  },
  // Firma - non spezzabile
  signatureSection: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: {
    width: "45%",
  },
  signatureLabel: {
    fontSize: 9,
    marginBottom: 40,
    color: "#4a5568",
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#2d3748",
    paddingTop: 5,
    fontSize: 8,
    color: "#718096",
  },
});

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

interface LetterheadHeaderProps {
  datiOwner: DatiAziendaOwner;
}

/**
 * Componente Header della carta intestata
 * Logo a sinistra, dati aziendali a destra
 */
export function LetterheadHeader({ datiOwner }: LetterheadHeaderProps) {
  const indirizzoCompleto = [
    datiOwner.indirizzo,
    `${datiOwner.cap || ""} ${datiOwner.citta || ""}`.trim(),
    datiOwner.provincia ? `(${datiOwner.provincia})` : "",
  ]
    .filter(Boolean)
    .join(" - ");

  return (
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

/**
 * Helper per formattare la data in italiano
 */
export function formatDataItaliana(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Helper per formattare importi in Euro
 */
export function formatEuro(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "-";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

/**
 * Mapping modalità pagamento per display
 */
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
