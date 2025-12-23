import React from "react";
import { Document, View, Text } from "@react-pdf/renderer";
import {
  PageShell,
  DatiAziendaOwner,
  formatDataBreve,
  formatEuro,
  getModalitaPagamentoLabel,
  PDF_COLORS,
  pdfStyles
} from "../pdf/LetterheadPDF";
import {
  PDFSection,
  PDFKeyValue,
  PDFTable,
  PDFGrid,
  PDFGridCol,
  PDFTotalBox,
  PDFSignatureRow,
  PDFInlineKV
} from "../pdf/pdf-components";

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
  // Costruzione righe tabella economica
  const rows: (string | number)[][] = [];
  
  const tipoCanoneLabel = datiContratto.tipo_canone === "giornaliero" ? "Giornaliero" : "Mensile";
  rows.push([
    `Canone Noleggio (${tipoCanoneLabel})`,
    formatEuro(datiContratto.canone_noleggio || 0),
    tipoCanoneLabel
  ]);

  if (datiContratto.costo_trasporto) {
    rows.push([
      "Trasporto A/R",
      formatEuro(datiContratto.costo_trasporto),
      "Una Tantum"
    ]);
  }

  if (datiContratto.deposito_cauzionale) {
    rows.push([
      "Deposito Cauzionale",
      formatEuro(datiContratto.deposito_cauzionale),
      "Rimborsabile"
    ]);
  }

  const totaleDocumento = (datiContratto.canone_noleggio || 0) + (datiContratto.costo_trasporto || 0);

  // Indirizzo cliente compatto
  const indirizzoCliente = `${datiCliente.indirizzo}, ${datiCliente.cap} ${datiCliente.citta} (${datiCliente.provincia})`;

  return (
    <Document title={`Contratto_${datiContratto.codice_contratto}`}>
      <PageShell
        titolo="Contratto di Noleggio"
        sottoTitolo={datiContratto.codice_contratto}
        datiOwner={datiOwner}
      >
        {/* SEZIONE 1: Cliente + Mezzo side-by-side */}
        <PDFGrid gap={15}>
          <PDFGridCol width="52%">
            <PDFSection title="Conduttore">
              <PDFKeyValue label="Rag. Sociale" value={datiCliente.ragione_sociale} labelWidth={65} />
              <PDFKeyValue label="P.IVA" value={datiCliente.p_iva} labelWidth={65} />
              <PDFKeyValue label="Indirizzo" value={indirizzoCliente} labelWidth={65} />
              {datiCliente.pec && <PDFKeyValue label="PEC" value={datiCliente.pec} labelWidth={65} />}
              {!datiCliente.pec && datiCliente.email && <PDFKeyValue label="Email" value={datiCliente.email} labelWidth={65} />}
              {datiCliente.telefono && <PDFKeyValue label="Tel" value={datiCliente.telefono} labelWidth={65} />}
            </PDFSection>
          </PDFGridCol>

          <PDFGridCol width="45%">
            <PDFSection title="Bene Locato">
              <PDFKeyValue label="Mezzo" value={`${datiMezzo.marca} ${datiMezzo.modello}`} labelWidth={55} />
              <PDFKeyValue label="Matricola" value={datiMezzo.matricola} labelWidth={55} />
              {datiMezzo.targa && <PDFKeyValue label="Targa" value={datiMezzo.targa} labelWidth={55} />}
              {datiMezzo.telaio && <PDFKeyValue label="Telaio" value={datiMezzo.telaio} labelWidth={55} />}
              <PDFKeyValue 
                label="Anno/Ore" 
                value={`${datiMezzo.anno || "-"} / ${datiMezzo.ore_moto || "-"} h`} 
                labelWidth={55} 
              />
            </PDFSection>
          </PDFGridCol>
        </PDFGrid>

        {/* SEZIONE 2: Condizioni contrattuali */}
        <PDFSection title="Condizioni Contrattuali">
          <PDFGrid gap={10}>
            <PDFGridCol width="50%">
              <PDFInlineKV label="Data Inizio" value={formatDataBreve(datiContratto.data_inizio)} />
              <PDFInlineKV 
                label="Scadenza" 
                value={datiContratto.tempo_indeterminato ? "Tempo Indeterminato" : formatDataBreve(datiContratto.data_fine)} 
              />
            </PDFGridCol>
            <PDFGridCol width="50%">
              <PDFInlineKV label="Pagamento" value={getModalitaPagamentoLabel(datiContratto.modalita_pagamento)} />
              {datiContratto.deposito_cauzionale && (
                <PDFInlineKV label="Cauzione" value={formatEuro(datiContratto.deposito_cauzionale)} />
              )}
            </PDFGridCol>
          </PDFGrid>
        </PDFSection>

        {/* SEZIONE 3: Riepilogo Economico */}
        <PDFSection title="Corrispettivo">
          <PDFTable
            headers={["Descrizione", "Importo", "Frequenza"]}
            columnWidths={["55%", "25%", "20%"]}
            rows={rows}
          />
          <PDFTotalBox label="TOTALE DOCUMENTO" value={formatEuro(totaleDocumento)} />
          <Text style={{ fontSize: 6.5, color: PDF_COLORS.textMuted, marginTop: 3 }}>
            Importi IVA esclusa. IVA applicata secondo normativa vigente.
          </Text>
        </PDFSection>

        {/* SEZIONE 4: Clausole (opzionale) */}
        {datiContratto.clausole_speciali && (
          <PDFSection title="Clausole Speciali">
            <Text style={pdfStyles.text}>{datiContratto.clausole_speciali}</Text>
          </PDFSection>
        )}

        {/* SEZIONE 5: Firme affiancate */}
        <View style={{ marginTop: 15 }}>
          <PDFSignatureRow 
            leftLabel="Il Conduttore" 
            rightLabel="Il Locatore" 
          />
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 7, color: PDF_COLORS.textMuted, textAlign: "center" }}>
              Luogo e Data: _________________________, {formatDataBreve(new Date().toISOString())}
            </Text>
          </View>
        </View>

      </PageShell>
    </Document>
  );
}
