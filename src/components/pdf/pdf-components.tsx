import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfStyles, PDF_COLORS } from "./LetterheadPDF";

/* ==========================================================================
   DESIGN TOKENS & LEGACY EXPORTS
   ========================================================================== */

export const PDFColors = PDF_COLORS;

export const sharedStyles = StyleSheet.create({
    text: { fontSize: 8, color: PDF_COLORS.textMain },
    textBold: { fontSize: 8, fontFamily: "Helvetica-Bold", color: PDF_COLORS.primary },
});

/* ==========================================================================
   REUSABLE COMPONENTS - Compact Design V4
   ========================================================================== */

interface PDFSectionProps {
    title: string;
    children: React.ReactNode;
}

/**
 * Section compatta con titolo underline
 */
export function PDFSection({ title, children }: PDFSectionProps) {
    return (
        <View style={{ marginBottom: 10 }}>
            <Text style={pdfStyles.sectionHeader}>{title}</Text>
            <View style={{ marginTop: 3 }}>
                {children}
            </View>
        </View>
    );
}

interface PDFKeyValueProps {
    label: string;
    value: string | number | null | undefined;
    labelWidth?: number;
}

/**
 * Key-Value compatto ottimizzato per griglie strette
 */
export function PDFKeyValue({ label, value, labelWidth = 70 }: PDFKeyValueProps) {
    return (
        <View style={{ flexDirection: 'row', marginBottom: 2, minHeight: 10 }}>
            <View style={{ width: labelWidth }}>
                <Text style={{ fontSize: 7, color: PDF_COLORS.textMuted }}>{label}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 8, color: PDF_COLORS.primary, fontFamily: "Helvetica-Bold" }}>
                    {value || "-"}
                </Text>
            </View>
        </View>
    );
}

/**
 * Inline Key-Value per layout ancora più compatto
 */
export function PDFInlineKV({ label, value }: { label: string; value: string | number | null | undefined }) {
    return (
        <Text style={{ fontSize: 7.5, marginBottom: 1 }}>
            <Text style={{ color: PDF_COLORS.textMuted }}>{label}: </Text>
            <Text style={{ color: PDF_COLORS.primary, fontFamily: "Helvetica-Bold" }}>{value || "-"}</Text>
        </Text>
    );
}

/**
 * Grid ottimizzata con gap ridotto
 */
export function PDFGrid({ children, gap = 10 }: { children: React.ReactNode; gap?: number }) {
    return <View style={[pdfStyles.contentGrid, { gap }]}>{children}</View>;
}

export function PDFGridCol({ children, width = "48%" }: { children: React.ReactNode; width?: string | number }) {
    return <View style={[pdfStyles.gridColumn, { width }]}>{children}</View>;
}

interface PDFTableProps {
    headers: string[];
    rows: (string | number)[][];
    columnWidths: string[];
}

/**
 * Tabella compatta enterprise
 */
export function PDFTable({ headers, rows, columnWidths }: PDFTableProps) {
    return (
        <View style={{ marginTop: 3, marginBottom: 8 }}>
            <View style={pdfStyles.tableHeader}>
                {headers.map((header, idx) => (
                    <Text
                        key={idx}
                        style={[
                            pdfStyles.tableHeaderText,
                            { width: columnWidths[idx] },
                            isNumericHeader(header) ? { textAlign: "right" } : {},
                        ]}
                    >
                        {header}
                    </Text>
                ))}
            </View>
            {rows.map((row, rowIdx) => (
                <View key={rowIdx} style={pdfStyles.tableRow}>
                    {row.map((cell, cellIdx) => (
                        <Text
                            key={cellIdx}
                            style={[
                                pdfStyles.tableCell,
                                { width: columnWidths[cellIdx] },
                                isNumericHeader(headers[cellIdx]) ? { textAlign: "right" } : {},
                            ]}
                        >
                            {cell}
                        </Text>
                    ))}
                </View>
            ))}
        </View>
    );
}

function isNumericHeader(header: string): boolean {
    const numericKeywords = ["prezzo", "subtotale", "iva", "totale", "importo", "canone"];
    return numericKeywords.some(k => header.toLowerCase().includes(k));
}

/**
 * Box totale evidenziato
 */
export function PDFTotalBox({ label, value }: { label: string; value: string }) {
    return (
        <View style={{ alignItems: 'flex-end', marginTop: 5 }}>
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: 150,
                borderTopWidth: 1,
                borderTopColor: PDF_COLORS.primary,
                paddingTop: 4,
            }}>
                <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: PDF_COLORS.primary }}>{label}</Text>
                <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: PDF_COLORS.primary }}>{value}</Text>
            </View>
        </View>
    );
}

/**
 * Signature box compatto affiancato
 */
export function PDFSignatureRow({ leftLabel, rightLabel, date }: { leftLabel: string; rightLabel: string; date?: string }) {
    return (
        <View style={pdfStyles.signatureSection} wrap={false}>
            <View style={pdfStyles.signatureBox}>
                <Text style={pdfStyles.signatureLabel}>{leftLabel}</Text>
                <View style={pdfStyles.signatureLine}>
                    <Text>Firma e Timbro</Text>
                </View>
            </View>
            <View style={pdfStyles.signatureBox}>
                <Text style={pdfStyles.signatureLabel}>{rightLabel}</Text>
                <View style={pdfStyles.signatureLine}>
                    <Text>Firma e Timbro</Text>
                </View>
            </View>
        </View>
    );
}

/**
 * Legacy signature box - backward compatibility
 */
export function PDFSignatureBox({ label, date }: { label: string; date?: string }) {
    return (
        <View style={{ marginBottom: 12 }} wrap={false}>
            <Text style={pdfStyles.signatureLabel}>{label}</Text>
            <View style={[pdfStyles.signatureLine, { width: 180 }]}>
                <Text style={{ fontSize: 6, color: PDF_COLORS.textMuted }}>Firma e Timbro</Text>
            </View>
            {date && (
                <Text style={{ fontSize: 7, color: PDF_COLORS.textMuted, marginTop: 3 }}>Data: {date}</Text>
            )}
        </View>
    );
}
