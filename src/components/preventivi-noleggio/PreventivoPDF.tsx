/**
 * Template PDF Preventivo Noleggio — Design coerente con ContrattoPDF
 * Usa la stessa carta intestata e struttura per coerenza aziendale
 */

import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import {
  LetterheadHeader,
  LetterheadFooter,
  formatDataItaliana,
  formatEuro,
  DatiAziendaOwner,
} from "@/components/pdf";

/* =======================
   Types
======================= */

export interface DatiClientePreventivo {
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
}

export interface DatiMezzoPreventivo {
  marca: string | null;
  modello: string | null;
  matricola: string | null;
  id_interno: string | null;
  anno: string | null;
  categoria: string | null;
  ore_moto: number | null;
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
   Styles (identici a ContrattoPDF)
======================= */

const styles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingBottom: 22,
    paddingHorizontal: 28,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111827",
  },

  titleWrap: { marginTop: 12, marginBottom: 10 },
  docTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  docMetaRow: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  docMeta: { fontSize: 9, color: "#374151" },

  hr: {
    marginTop: 10,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  grid2: {
    flexDirection: "row",
    gap: 10,
  },
  col: { flex: 1 },

  section: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 2,
    padding: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    letterSpacing: 0.2,
    color: "#111827",
  },
  sectionHint: {
    fontSize: 9,
    color: "#6B7280",
  },

  kvRow: {
    flexDirection: "row",
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  kvLabel: {
    width: "42%",
    fontSize: 9,
    color: "#374151",
  },
  kvValue: {
    width: "58%",
    fontSize: 9,
    color: "#111827",
    fontFamily: "Helvetica-Bold",
  },

  table: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  th: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  td: { fontSize: 9, color: "#111827" },

  right: { textAlign: "right" },

  noteBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  paragraph: { fontSize: 9.5, lineHeight: 1.35, color: "#111827" },

  validitaBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#FEF3C7",
    borderRadius: 2,
  },
  validitaText: {
    fontSize: 9,
    color: "#92400E",
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },

  small: { fontSize: 9, color: "#374151" },
});

/* =======================
   Componenti riutilizzabili
======================= */

function Section({
  title,
  hint,
  children,
  wrap = false,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  wrap?: boolean;
}) {
  return (
    <View wrap={wrap} style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {hint ? <Text style={styles.sectionHint}>{hint}</Text> : <Text style={styles.sectionHint}> </Text>}
      </View>
      {children}
    </View>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.kvRow}>
      <Text style={styles.kvLabel}>{label}</Text>
      <Text style={styles.kvValue}>{value}</Text>
    </View>
  );
}

function MoneyTable({ rows }: { rows: Array<{ descrizione: string; importo: string }> }) {
  return (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.th, { width: "70%" }]}>Descrizione</Text>
        <Text style={[styles.th, { width: "30%" }, styles.right]}>Importo</Text>
      </View>
      {rows.map((r, idx) => (
        <View
          key={`${r.descrizione}-${idx}`}
          style={[styles.tableRow, idx === rows.length - 1 ? { borderBottomWidth: 0 } : undefined]}
        >
          <Text style={[styles.td, { width: "70%" }]}>{r.descrizione}</Text>
          <Text style={[styles.td, { width: "30%" }, styles.right]}>{r.importo}</Text>
        </View>
      ))}
    </View>
  );
}

/* =======================
   Main Component
======================= */

export function PreventivoPDF({ datiOwner, datiCliente, datiMezzo, datiPreventivo }: PreventivoPDFProps) {
  const indirizzoCliente = [
    datiCliente.indirizzo,
    `${datiCliente.cap || ""} ${datiCliente.citta || ""}`.trim(),
    datiCliente.provincia ? `(${datiCliente.provincia})` : "",
  ]
    .filter(Boolean)
    .join(", ");

  const tipoCanoneLabel = datiPreventivo.tipo_canone === "giornaliero" ? "/giorno" : "/mese";

  const durataFineLabel = datiPreventivo.tempo_indeterminato
    ? "Tempo indeterminato"
    : datiPreventivo.data_fine
      ? formatDataItaliana(datiPreventivo.data_fine)
      : "-";

  const economicheRows: Array<{ descrizione: string; importo: string }> = [
    {
      descrizione: `Canone di noleggio (${datiPreventivo.tipo_canone || "mensile"})`,
      importo: `${formatEuro(datiPreventivo.canone_noleggio)}${tipoCanoneLabel}`,
    },
  ];

  if (datiPreventivo.costo_trasporto) {
    economicheRows.push({
      descrizione: "Costo trasporto (consegna e ritiro)",
      importo: formatEuro(datiPreventivo.costo_trasporto),
    });
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <LetterheadHeader datiOwner={datiOwner} />

        <View style={styles.titleWrap}>
          <Text style={styles.docTitle}>PREVENTIVO NOLEGGIO</Text>
          <View style={styles.docMetaRow}>
            <Text style={styles.docMeta}>Preventivo N° {datiPreventivo.codice_preventivo}</Text>
            <Text style={styles.docMeta}>Data: {formatDataItaliana(datiPreventivo.data_creazione)}</Text>
          </View>
        </View>

        <View style={styles.hr} />

        {/* Parti */}
        <View wrap={false} style={styles.grid2}>
          <View style={styles.col}>
            <Section title="FORNITORE" hint="Dati azienda" wrap={false}>
              <KV label="Ragione sociale" value={datiOwner.ragione_sociale || "-"} />
              <KV label="P.IVA" value={datiOwner.partita_iva || "-"} />
              {datiOwner.indirizzo && <KV label="Sede" value={datiOwner.indirizzo} />}
            </Section>
          </View>

          <View style={styles.col}>
            <Section title="CLIENTE" hint="Dati anagrafici" wrap={false}>
              <KV label="Ragione sociale" value={datiCliente.ragione_sociale || "-"} />
              <KV label="P.IVA" value={datiCliente.partita_iva || "-"} />
              <KV label="Sede" value={indirizzoCliente || "-"} />
              <KV label="Email" value={datiCliente.email || "-"} />
              <KV label="PEC" value={datiCliente.pec || "-"} />
            </Section>
          </View>
        </View>

        {/* Mezzo + Durata */}
        <View wrap={false} style={styles.grid2}>
          <View style={styles.col}>
            <Section title="DATI DEL MEZZO" hint="Identificazione" wrap={false}>
              <KV label="Mezzo" value={`${datiMezzo.marca || "-"} ${datiMezzo.modello || ""}`.trim()} />
              <KV label="Matricola" value={datiMezzo.matricola || "-"} />
              <KV label="ID interno" value={datiMezzo.id_interno || "-"} />
              <KV label="Anno" value={datiMezzo.anno || "-"} />
              <KV label="Categoria" value={datiMezzo.categoria || "-"} />
              <KV label="Ore moto" value={datiMezzo.ore_moto != null ? String(datiMezzo.ore_moto) : "-"} />
            </Section>
          </View>

          <View style={styles.col}>
            <Section title="PERIODO NOLEGGIO" hint="Durata prevista" wrap={false}>
              <KV label="Data inizio" value={datiPreventivo.data_inizio ? formatDataItaliana(datiPreventivo.data_inizio) : "-"} />
              <KV label="Data fine" value={durataFineLabel} />
            </Section>
          </View>
        </View>

        {/* Economiche */}
        <Section title="CONDIZIONI ECONOMICHE" hint="Importi" wrap={false}>
          <MoneyTable rows={economicheRows} />
          <View style={styles.noteBox}>
            <Text style={styles.small}>Gli importi si intendono IVA esclusa, salvo diversa indicazione.</Text>
          </View>
        </Section>

        {/* Note */}
        {datiPreventivo.note && (
          <Section title="NOTE" wrap={false}>
            <Text style={styles.paragraph}>{datiPreventivo.note}</Text>
          </Section>
        )}

        {/* Validità */}
        <View style={styles.validitaBox}>
          <Text style={styles.validitaText}>
            Il presente preventivo ha validità di {datiPreventivo.validita_giorni || 30} giorni dalla data di emissione.
          </Text>
        </View>

        <LetterheadFooter datiOwner={datiOwner} />
      </Page>
    </Document>
  );
}
