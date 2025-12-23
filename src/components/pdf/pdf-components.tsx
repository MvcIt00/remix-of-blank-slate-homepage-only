import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfStyles, PDF_COLORS } from "./LetterheadPDF";

/* ==========================================================================
   DESIGN TOKENS & LEGACY EXPORTS
   ========================================================================== */

// Legacy export - use PDF_COLORS from LetterheadPDF instead
export const PDFColors = PDF_COLORS;

// Backward compatibility styles
export const sharedStyles = StyleSheet.create({
    text: { fontSize: 9, color: PDF_COLORS.textMain },
    textBold: { fontSize: 9, fontFamily: "Helvetica-Bold", color: PDF_COLORS.primary },
});

/* ==========================================================================
   REUSABLE COMPONENTS
   ========================================================================== */

interface PDFSectionProps {
    title: string;
    children: React.ReactNode;
    spacing?: 'tight' | 'normal' | 'section' | 'break';
}

// Spacing scale based on visual hierarchy
const SPACING_MAP = {
    tight: 8,      // Within related content
    normal: 15,    // Default between sections
    section: 25,   // Between major data sections
    break: 40,     // Before major visual breaks
};

/**
 * Section with hierarchical spacing control
 * NUCLEAR FIX: wrap={false} forces atomic rendering to prevent overlaps
 */
export function PDFSection({ title, children, spacing = 'section' }: PDFSectionProps) {
    return (
        <View style={{ marginTop: SPACING_MAP[spacing], marginBottom: 15 }} wrap={false}>
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
        <View style={{ flexDirection: 'row', marginBottom: 8, flex, minHeight: 14 }}>
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
 * Signature Group - Minimal layout
 */
export function PDFSignatureGroup({ children }: { children: React.ReactNode }) {
    return (
        <View style={{ marginTop: 35, flexDirection: "row", justifyContent: "space-between", gap: 60 }} wrap={false}>
            {children}
        </View>
    );
}

/**
 * Single Signature Box - Minimal style
 */
export function PDFSignatureBox({ label, date }: { label: string; date?: string }) {
    return (
        <View style={{ flex: 1 }}>
            <Text style={{
                fontSize: 7,
                color: "#718096",
                textTransform: "uppercase",
                marginBottom: 30
            }}>
                {label}
            </Text>
            <View style={{
                borderTopWidth: 0.5,
                borderTopColor: "#000000",
                paddingTop: 2
            }}>
                <Text style={{ fontSize: 6, color: "#718096", textAlign: 'center' }}>Firma e Timbro</Text>
            </View>
        </View>
    );
}
