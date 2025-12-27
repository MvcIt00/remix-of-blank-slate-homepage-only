import { Document, View, Text } from "@react-pdf/renderer";
import {
    PageShell,
    DatiAziendaOwner,
    formatDataItaliana,
    formatEuro,
    getModalitaPagamentoLabel
} from "@/components/pdf/LetterheadPDF";
import {
    PDFSection,
    PDFKeyValue,
    PDFTable,
    PDFGrid,
    PDFGridCol,
    PDFSignatureBox
} from "@/components/pdf/pdf-components";
import { pdfStyles } from "@/components/pdf/LetterheadPDF";

export interface DatiCliente {
    ragione_sociale: string;
    indirizzo?: string;
    citta?: string;
    cap?: string;
    provincia?: string;
    piva?: string;
    cf?: string;
    email?: string;
    pec?: string;
    telefono?: string;
}

export interface DatiMezzo {
    marca: string;
    modello: string;
    matricola: string;
    id_interno?: string;
}

export interface DatiPreventivo {
    codice_preventivo: string;
    data_creazione: string;
    valido_fino?: string;
    data_inizio?: string;
    data_fine?: string;
    tempo_indeterminato: boolean;
    prezzo_noleggio: number | null;
    prezzo_trasporto: number | null;
    tipo_canone: string | null;
    note?: string;
}

interface PreventivoPDFProps {
    datiOwner: DatiAziendaOwner;
    datiCliente: DatiCliente;
    datiMezzo: DatiMezzo;
    datiPreventivo: DatiPreventivo;
}

export function PreventivoPDF({ datiOwner, datiCliente, datiMezzo, datiPreventivo }: PreventivoPDFProps) {
    const rows = [
        [
            `Canone di Noleggio (${datiPreventivo.tipo_canone || "mensile"})`,
            formatEuro(datiPreventivo.prezzo_noleggio || 0),
            datiPreventivo.tipo_canone || "Mese"
        ]
    ];

    if (datiPreventivo.prezzo_trasporto) {
        rows.push([
            "Costi di Trasporto (Andata/Ritorno)",
            formatEuro(datiPreventivo.prezzo_trasporto),
            "Una Tantum"
        ]);
    }

    const totale = (datiPreventivo.prezzo_noleggio || 0) + (datiPreventivo.prezzo_trasporto || 0);

    return (
        <Document title={`Preventivo_${datiPreventivo.codice_preventivo}`}>
            <PageShell
                titolo="PREVENTIVO DI NOLEGGIO"
                sottoTitolo={`N. ${datiPreventivo.codice_preventivo}`}
                datiOwner={datiOwner}
            >
                {/* 1. Cliente e Riferimenti - Deterministic Grid */}
                <PDFGrid>
                    <PDFGridCol width="50%">
                        <PDFSection title="DESTINATARIO">
                            <Text style={pdfStyles.textBold}>{datiCliente.ragione_sociale}</Text>
                            <View style={{ marginTop: 2 }}>
                                <Text style={pdfStyles.text}>{datiCliente.indirizzo}</Text>
                                <Text style={pdfStyles.text}>{datiCliente.cap} {datiCliente.citta} ({datiCliente.provincia})</Text>
                                {datiCliente.piva && <Text style={pdfStyles.text}>P.IVA {datiCliente.piva}</Text>}
                            </View>
                        </PDFSection>
                    </PDFGridCol>
                    <PDFGridCol width="45%">
                        <PDFSection title="Riferimenti">
                            <PDFKeyValue label="Data Documento" value={formatDataItaliana(datiPreventivo.data_creazione)} />
                            <PDFKeyValue label="Codice Prev." value={datiPreventivo.codice_preventivo} />
                            {datiPreventivo.valido_fino && (
                                <PDFKeyValue label="Valido fino al" value={formatDataItaliana(datiPreventivo.valido_fino)} />
                            )}
                        </PDFSection>
                    </PDFGridCol>
                </PDFGrid>

                {/* 2. Dettaglio Mezzo */}
                <PDFSection title="Dettagli Mezzo Preventivato">
                    <PDFGrid>
                        <PDFGridCol width="50%">
                            <PDFKeyValue label="Marca / Modello" value={`${datiMezzo.marca} ${datiMezzo.modello}`} />
                        </PDFGridCol>
                        <PDFGridCol width="45%">
                            <PDFKeyValue label="Matricola" value={datiMezzo.matricola} />
                        </PDFGridCol>
                    </PDFGrid>
                </PDFSection>

                {/* 3. Proposta Economica */}
                <PDFSection title="Proposta Economica">
                    <PDFTable
                        headers={["Descrizione", "Importo (IVA escl.)", "Frequenza"]}
                        columnWidths={["55%", "20%", "25%"]}
                        rows={rows}
                    />

                    <View style={{ marginTop: 5, alignItems: 'flex-end' }}>
                        <View style={{ width: 180, borderTopWidth: 1, borderTopColor: '#1a365d', paddingTop: 8 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>TOTALE PREV.</Text>
                                <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>{formatEuro(totale)}</Text>
                            </View>
                        </View>
                    </View>
                </PDFSection>

                {/* 4. Note e Condizioni */}
                <PDFSection title="Note e Condizioni di Noleggio">
                    <PDFGrid>
                        <PDFGridCol width="50%">
                            <PDFKeyValue label="Disponibilità" value="Da confermare" />
                            <PDFKeyValue
                                label="Inizio previsto"
                                value={datiPreventivo.data_inizio ? formatDataItaliana(datiPreventivo.data_inizio) : "Da concordare"}
                            />
                        </PDFGridCol>
                        <PDFGridCol width="45%">
                            <PDFKeyValue
                                label="Durata stimata"
                                value={datiPreventivo.tempo_indeterminato ? "Tempo indeterminato" : "Da concordare"}
                            />
                        </PDFGridCol>
                    </PDFGrid>

                    {datiPreventivo.note && (
                        <View style={{ marginTop: 10 }}>
                            <Text style={[pdfStyles.text, { fontStyle: 'italic', fontSize: 8 }]}>Note: {datiPreventivo.note}</Text>
                        </View>
                    )}
                </PDFSection>

                {/* 5. Firme - Grouped */}
                <View style={{ marginTop: 25 }} wrap={false}>
                    <PDFSignatureBox label="Per Accettazione (Il Cliente)" />
                    <PDFSignatureBox label="Toscana Carrelli S.r.l." />
                </View>

            </PageShell>
        </Document>
    );
}
