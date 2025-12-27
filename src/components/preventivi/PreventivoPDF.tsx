import React from "react";
import { Document } from "@react-pdf/renderer";
import {
    PageShell,
    DatiAziendaOwner,
    formatDataItaliana,
    formatEuro,
} from "@/components/pdf/LetterheadPDF";
import {
    PDFDocumentBuilder,
    DocumentSection,
    StandardSectionData,
    EconomicSectionData,
    SignatureSectionData,
} from "@/components/pdf/pdf-components";
import {
    UniversalClientSection,
    UniversalMezzoSection
} from "@/components/pdf/universal/UniversalPDFSections";

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
    sede_legale_indirizzo?: string;
    sede_legale_citta?: string;
    sede_legale_cap?: string;
    sede_legale_provincia?: string;
    nome_contatto_principale?: string;
    email_principale?: string;
    telefono_principale?: string;
}

export interface DatiMezzo {
    marca: string;
    modello: string;
    matricola: string;
    id_interno?: string;
    anno?: string;
    categoria?: string;
    ore_moto?: number;
    ubicazione_attuale_dettaglio?: string;
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
    // 1. Preparazione Sezioni Universali
    const clientSection = UniversalClientSection(datiCliente as any, {
        title: "Destinatario",
        id: "cliente_header"
    });

    const mezzoSection = UniversalMezzoSection(datiMezzo as any, {
        title: "Oggetto: Proposta di Noleggio",
        mode: 'standard'
    });

    // 2. Condizioni Operative
    const sectionCondizioni: StandardSectionData = {
        id: 'condizioni',
        type: 'standard',
        title: 'Riferimenti e Durata',
        spacingTop: 'section',
        data: [
            { label: 'Data Preventivo', value: formatDataItaliana(datiPreventivo.data_creazione) },
            { label: 'Inizio Previsto', value: datiPreventivo.data_inizio ? formatDataItaliana(datiPreventivo.data_inizio) : "Da concordare" },
            { label: 'Durata Stima', value: datiPreventivo.tempo_indeterminato ? "Tempo indeterminato" : "Da concordare" },
            { label: 'Valido fino al', value: datiPreventivo.valido_fino ? formatDataItaliana(datiPreventivo.valido_fino) : "30 giorni" }
        ].filter(d => d.value)
    };

    // 3. Proposta Economica
    const rows = [
        [
            `Canone di Noleggio (${datiPreventivo.tipo_canone || "mensile"})`,
            formatEuro(datiPreventivo.prezzo_noleggio || 0),
            datiPreventivo.tipo_canone || "Mese"
        ]
    ];

    if (datiPreventivo.prezzo_trasporto) {
        rows.push([
            "Costi di Trasporto (A/R)",
            formatEuro(datiPreventivo.prezzo_trasporto),
            "Una Tantum"
        ]);
    }

    const sectionEconomica: EconomicSectionData = {
        id: 'economica',
        type: 'economic',
        spacingTop: 'section',
        tableHeaders: ["Descrizione", "Importo (IVA escl.)", "Frequenza"],
        columnWidths: ["50%", "25%", "25%"],
        rows: rows,
        totalLabel: "TOTALE PREVENTIVO",
        totalValue: formatEuro((datiPreventivo.prezzo_noleggio || 0) + (datiPreventivo.prezzo_trasporto || 0))
    };

    // 4. Firme
    const sectionFirme: SignatureSectionData = {
        id: 'firme',
        type: 'signatures',
        spacingTop: 'final',
        labels: ["Il Cliente (per Accettazione)", "Toscana Carrelli S.r.l."]
    };

    const documentSections: DocumentSection[] = [
        clientSection,
        {
            id: 'dati_oggettivi',
            type: 'group',
            keepTogether: true,
            sections: [mezzoSection, sectionCondizioni]
        },
        { id: 'split', type: 'break-page' }, // ATOMIC SPLIT
        {
            id: 'economia_firme',
            type: 'group',
            keepTogether: true,
            sections: [
                sectionEconomica,
                ...(datiPreventivo.note ? [{ id: 'note', type: 'text', content: `Note: ${datiPreventivo.note}`, spacingTop: 'normal' } as DocumentSection] : []),
                sectionFirme
            ]
        }
    ];

    return (
        <Document title={`Preventivo_${datiPreventivo.codice_preventivo}`}>
            <PageShell
                titolo="PREVENTIVO DI NOLEGGIO"
                sottoTitolo={`N. ${datiPreventivo.codice_preventivo}`}
                datiOwner={datiOwner}
                documentId={datiPreventivo.codice_preventivo}
                disclaimer="* I prezzi indicati non includono l'IVA. La proposta ha validità 30gg salvo il venduto. Il noleggio è regolato dalle condizioni generali di Toscana Carrelli."
            >
                <PDFDocumentBuilder sections={documentSections} />
            </PageShell>
        </Document>
    );
}
