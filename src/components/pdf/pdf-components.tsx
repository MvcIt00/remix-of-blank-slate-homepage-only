import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfStyles } from "./LetterheadPDF";

/* ==========================================================================
   DESIGN TOKENS & LEGACY EXPORTS
   ========================================================================== */

export const PDFColors = {
    primary: "#1a365d",
    secondary: "#2c5282",
    accent: "#FBBF24",
    bgLight: "#F7FAFC",
    borderLight: "#CBD5E0",
    border: "#E2E8F0",
    textDark: "#000000ff",
    textMuted: "#718096",
    white: "#FFFFFF",
};

// Dummy styles for backward compatibility during transition
export const sharedStyles = StyleSheet.create({
    text: { fontSize: 9, color: PDFColors.textDark },
    textBold: { fontSize: 9, fontFamily: "Helvetica-Bold", color: PDFColors.primary },
});

/* ==========================================================================
   REUSABLE COMPONENTS
   ========================================================================== */

interface PDFSectionProps {
    title: string;
    children: React.ReactNode;
}

/**
 * Standard section with title and bottom border
 */
export function PDFSection({ title, children }: PDFSectionProps) {
    return (
        <View style={{ marginBottom: 25 }}>
            <Text style={pdfStyles.sectionHeader}>{title}</Text>
            <View style={{ marginTop: 5 }}>
                {children}
            </View>
        </View>
    );
}

interface PDFKeyValueProps {
    label: string;
    value: string | number | null | undefined;
    flex?: number;
}

/**
 * Key-Value row with optimized spacing for side-by-side grids.
 * Enforces a strict label width to prevent layout bleeding.
 */
export function PDFKeyValue({ label, value, flex = 1 }: PDFKeyValueProps) {
    return (
        <View style={{ flexDirection: 'row', marginBottom: 4, flex, minHeight: 12 }}>
            <View style={{ width: 85 }}>
                <Text style={{ fontSize: 8, color: "#718096" }}>{label}</Text>
            </View>
            <View style={{ width: 10 }}>
                <Text style={{ fontSize: 8, color: "#718096" }}>:</Text>
            </View>
            <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={{ fontSize: 8.5, color: "#1a365d", fontFamily: "Helvetica-Bold" }}>
                    {value || "-"}
                </Text>
            </View>
        </View>
    );
}

/**
 * Grid component with deterministic percentage based columns
 */
export function PDFGrid({ children }: { children: React.ReactNode }) {
    return <View style={[pdfStyles.contentGrid, { gap: 15 }]}>{children}</View>;
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
 * Premium data table
 */
export function PDFTable({ headers, rows, columnWidths }: PDFTableProps) {
    return (
        <View style={{ marginTop: 5, marginBottom: 15 }}>
            {/* Header */}
            <View style={pdfStyles.tableHeader}>
                {headers.map((header, idx) => (
                    <Text
                        key={idx}
                        style={[
                            pdfStyles.tableHeaderText,
                            { width: columnWidths[idx] },
                            header.toLowerCase().includes("prezzo") ||
                                header.toLowerCase().includes("subtotale") ||
                                header.toLowerCase().includes("iva") ||
                                header === "Totale" ? { textAlign: "right" } : {},
                        ]}
                    >
                        {header}
                    </Text>
                ))}
            </View>

            {/* Rows */}
            {rows.map((row, rowIdx) => (
                <View
                    key={rowIdx}
                    style={pdfStyles.tableRow}
                >
                    {row.map((cell, cellIdx) => (
                        <Text
                            key={cellIdx}
                            style={[
                                pdfStyles.tableCell,
                                { width: columnWidths[cellIdx] },
                                headers[cellIdx].toLowerCase().includes("prezzo") ||
                                    headers[cellIdx].toLowerCase().includes("subtotale") ||
                                    headers[cellIdx].toLowerCase().includes("iva") ||
                                    headers[cellIdx] === "Totale" ? { textAlign: "right" } : {},
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

/**
 * Signature section with date
 */
export function PDFSignatureBox({ label, date }: { label: string; date?: string }) {
    return (
        <View style={[pdfStyles.signatureSection, { marginBottom: 15 }]}>
            <View style={pdfStyles.signatureBox}>
                <Text style={pdfStyles.signatureLabel}>{label}</Text>
                <View style={[pdfStyles.signatureLine, { width: 180 }]}>
                    <Text style={{ fontSize: 7, color: '#CBD5E0', paddingTop: 8 }}>Firma e Timbro</Text>
                </View>
            </View>
            {date && (
                <View style={[pdfStyles.signatureBox, { justifyContent: 'flex-end', alignItems: 'flex-end' }]}>
                    <Text style={{ fontSize: 8.5, color: '#4a5568' }}>Data: {date}</Text>
                </View>
            )}
        </View>
    );
}
