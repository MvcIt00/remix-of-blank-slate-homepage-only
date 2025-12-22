import React from "react";
import { Page, Text, View, Document, StyleSheet, Font, Image, Svg, Polygon } from "@react-pdf/renderer";
import { formatDataItaliana, formatEuro, getModalitaPagamentoLabel } from "../pdf/LetterheadPDF";
import { PDFColors, sharedStyles, PDFSection, PDFKeyValue, PDFTable, PDFSignatureBox } from "../pdf";
import logoMvc from "@/assets/logo_mvc.png";

// Register fonts if needed (using Helvetiva as default)

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
  },

  // Clean Corporate Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: PDFColors.primary,
    paddingBottom: 20,
    marginBottom: 20,
  },
  logo: {
    width: 140,
    height: "auto",
  },
  headerContact: {
    textAlign: "right",
    maxWidth: 250,
  },
  ownerName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: PDFColors.primary,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  ownerDetails: {
    fontSize: 8,
    color: PDFColors.textMuted,
    lineHeight: 1.4,
  },

  // Document Info
  documentInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: PDFColors.bgLight,
    padding: 10,
    borderRadius: 4,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: PDFColors.accent,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 7,
    textTransform: "uppercase",
    color: PDFColors.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: PDFColors.primary,
  },

  // Financial Summary Section
  financials: {
    marginTop: 20,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 0.5,
    borderTopColor: PDFColors.borderLight,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: PDFColors.textMuted,
  },
});

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
  datiOwner: any; // Using vw_anagrafiche_complete structure
  datiCliente: DatiCliente;
  datiMezzo: DatiMezzo;
  datiContratto: DatiContratto;
}

export function ContrattoPDF({ datiOwner, datiCliente, datiMezzo, datiContratto }: ContrattoPDFProps) {
  const isBozza = datiContratto.codice_contratto === "ANTEPRIMA";

  // Calculate totals for the table
  const rows = [
    ["Canone di Noleggio (" + (datiContratto.tipo_canone || "mensile") + ")", "1", formatEuro(datiContratto.canone_noleggio || 0), formatEuro(datiContratto.canone_noleggio || 0)],
  ];

  if (datiContratto.costo_trasporto) {
    rows.push(["Costi di Trasporto", "1", formatEuro(datiContratto.costo_trasporto), formatEuro(datiContratto.costo_trasporto)]);
  }

  const totale = (datiContratto.canone_noleggio || 0) + (datiContratto.costo_trasporto || 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* CORPORATE HEADER */}
        <View style={styles.header}>
          <Image src={logoMvc} style={styles.logo} />

          <View style={styles.headerContact}>
            <Text style={styles.ownerName}>{datiOwner.ragione_sociale || "MVC S.r.l."}</Text>
            <Text style={styles.ownerDetails}>{datiOwner.sede_legale_indirizzo}</Text>
            <Text style={styles.ownerDetails}>
              {datiOwner.sede_legale_cap} {datiOwner.sede_legale_citta} ({datiOwner.sede_legale_provincia})
            </Text>
            <Text style={styles.ownerDetails}>P.IVA: {datiOwner.partita_iva}</Text>
            <Text style={styles.ownerDetails}>Tel: {datiOwner.contatto_principale_telefono || "-"}</Text>
            <Text style={styles.ownerDetails}>PEC/Email: {datiOwner.pec || datiOwner.contatto_principale_email || "-"}</Text>
          </View>
        </View>

        {/* DOCUMENT INFO BOX */}
        <View style={styles.documentInfo}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Tipo Documento</Text>
            <Text style={styles.infoValue}>Contratto di Noleggio</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Codice Contratto</Text>
            <Text style={styles.infoValue}>{datiContratto.codice_contratto}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Data Emissione</Text>
            <Text style={styles.infoValue}>{formatDataItaliana(datiContratto.data_creazione)}</Text>
          </View>
        </View>

        <View>
          {/* CLIENT SECTION */}
          <PDFSection title="CLIENTE">
            <PDFKeyValue label="Ragione Sociale" value={datiCliente.ragione_sociale} />
            <PDFKeyValue label="Indirizzo" value={datiCliente.indirizzo + " - " + datiCliente.cap + " " + datiCliente.citta + " (" + datiCliente.provincia + ")"} />
            <PDFKeyValue label="Partita IVA" value={datiCliente.p_iva} />
            <PDFKeyValue label="Email / PEC" value={datiCliente.email || datiCliente.pec} />
            <PDFKeyValue label="Contatto" value={datiCliente.telefono} />
          </PDFSection>

          {/* VEHICLE SECTION */}
          <PDFSection title="DETTAGLIO MEZZO">
            <PDFKeyValue label="Marca / Modello" value={datiMezzo.marca + " " + datiMezzo.modello} />
            <PDFKeyValue label="Matricola" value={datiMezzo.matricola} />
            {datiMezzo.targa && <PDFKeyValue label="Targa" value={datiMezzo.targa} />}
            <PDFKeyValue label="Ore Moto" value={datiMezzo.ore_moto} />
          </PDFSection>

          {/* RENTAL INFO SECTION */}
          <PDFSection title="DETTAGLI NOLEGGIO">
            <PDFKeyValue label="Data Inizio" value={formatDataItaliana(datiContratto.data_inizio)} />
            <PDFKeyValue
              label="Data Fine"
              value={datiContratto.tempo_indeterminato ? "Tempo Indeterminato" : formatDataItaliana(datiContratto.data_fine)}
            />
            <PDFKeyValue label="Canone" value={datiContratto.tipo_canone} />
            <PDFKeyValue label="Pagamento" value={getModalitaPagamentoLabel(datiContratto.modalita_pagamento)} />
          </PDFSection>

          {/* TABLE */}
          <PDFTable
            headers={[
              { label: "Descrizione", width: "50%" },
              { label: "Qtà", width: "10%" },
              { label: "Prezzo", width: "20%" },
              { label: "Subtotale", width: "20%" }
            ]}
            rows={rows}
          />

          {/* TOTALS */}
          <View style={{ marginTop: -10 }}>
            <View style={sharedStyles.summaryRow}>
              <Text style={sharedStyles.summaryLabel}>Totale Imponibile</Text>
              <Text style={sharedStyles.summaryValue}>{formatEuro(totale)}</Text>
            </View>
            <View style={[sharedStyles.summaryRow, { backgroundColor: PDFColors.secondary }]}>
              <Text style={sharedStyles.summaryLabel}>TOTALE GENERALE</Text>
              <Text style={sharedStyles.summaryValue}>{formatEuro(totale)}</Text>
            </View>
          </View>

          {/* NOTES */}
          {datiContratto.clausole_speciali && (
            <PDFSection title="NOTE / CLAUSOLE">
              <Text style={{ fontSize: 9, color: PDFColors.textDark, lineHeight: 1.4 }}>
                {datiContratto.clausole_speciali}
              </Text>
            </PDFSection>
          )}

          {/* SIGNATURES PAGE 1 */}
          <View style={{ marginTop: 20, borderTopWidth: 0.5, borderTopColor: PDFColors.borderLight, paddingTop: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ width: "45%" }}>
                <PDFSignatureBox label="Il Cliente" date={formatDataItaliana(new Date().toISOString())} />
              </View>
              <View style={{ width: "45%" }}>
                <PDFSignatureBox label="Il Fornitore" date={formatDataItaliana(new Date().toISOString())} />
              </View>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Pagina 1 di 2</Text>
          <Text style={styles.footerText}>{datiOwner.ragione_sociale} - Generato da NXUS</Text>
        </View>
      </Page>

      {/* PAGE 2 - CONDIZIONI GENERALI */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src={logoMvc} style={styles.logo} />
          <Text style={[styles.ownerName, { marginTop: 10 }]}>CONDIZIONI GENERALI DI NOLEGGIO</Text>
        </View>

        <View style={{ marginTop: 10 }}>
          <Text style={{ fontSize: 8, textAlign: "justify", lineHeight: 1.5, marginBottom: 10 }}>
            Art. 1 - OGGETTO DEL CONTRATTO: Il locatore concede in noleggio al locatario il bene descritto nella prima pagina del presente contratto...
          </Text>
          <Text style={{ fontSize: 8, textAlign: "justify", lineHeight: 1.5, marginBottom: 10 }}>
            Art. 2 - CONSEGNA E RICONSEGNA: Il mezzo viene consegnato in perfetto stato di funzionamento e deve essere riconsegnato nelle medesime condizioni...
          </Text>
          <Text style={{ fontSize: 8, textAlign: "justify", lineHeight: 1.5, marginBottom: 10 }}>
            Art. 3 - RESPONSABILITÀ: Il locatario è custode del bene e responsabile per ogni danno causato a terzi o al bene stesso durante il periodo di noleggio...
          </Text>

          <View style={{ marginTop: 20, padding: 10, backgroundColor: PDFColors.bgLight, borderLeftWidth: 2, borderLeftColor: PDFColors.accent }}>
            <Text style={{ fontSize: 7, color: PDFColors.textMuted }}>
              Nota: Questo è un testo segnaposto. Le condizioni definitive devono essere caricate o modificate nel componente ContrattoPDF.tsx.
            </Text>
          </View>
        </View>

        {/* SIGNATURES PAGE 2 */}
        <View style={{ marginTop: 40 }}>
          <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 10 }}>
            Per accettazione specifica delle clausole vessatorie (Art. 2, 3, 5, 8):
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <View style={{ width: "45%" }}>
              <PDFSignatureBox label="Il Cliente" />
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Pagina 2 di 2</Text>
          <Text style={styles.footerText}>{datiOwner.ragione_sociale} - Generato da NXUS</Text>
        </View>
      </Page>
    </Document>
  );
}
