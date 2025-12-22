/**
 * Centralized PDF Components Library (v2 - Teal Theme)
 * Reusable components for professional PDF documents
 */

import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

/* =======================
   COLOR PALETTE
======================= */

export const PDFColors = {
    primary: "#1a365d",        // Corporate Navy Blue
    secondary: "#2c5282",      // Medium Blue
    accent: "#FBBF24",         // Corporate Yellow/Gold
    bgLight: "#F7FAFC",        // Light gray background
    borderLight: "#CBD5E0",    // Subtle borders
    textDark: "#000000ff",       // Main text
    textMuted: "#718096",      // Secondary text
    white: "#FFFFFF",
};

/* =======================
   SHARED STYLES
======================= */

export const sharedStyles = StyleSheet.create({
    // Section heading (e.g., BILL TO)
    sectionHeader: {
        fontSize: 10,
        fontFamily: "Helvetica-Bold",
        color: PDFColors.primary,
        marginBottom: 8,
        marginTop: 12,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },

    // Key-value row with COLON alignment
    kvRow: {
        flexDirection: "row",
        paddingVertical: 3,
        alignItems: "flex-start",
    },
    kvLabel: {
        width: "100pt",
        fontSize: 9,
        fontFamily: "Helvetica",
        color: PDFColors.textDark,
    },
    kvSeparator: {
        width: "15pt",
        fontSize: 9,
        fontFamily: "Helvetica",
        color: PDFColors.textDark,
    },
    kvValue: {
        flex: 1,
        fontSize: 9,
        fontFamily: "Helvetica-Bold",
        color: PDFColors.textDark,
    },

    // Table styles
    table: {
        marginTop: 10,
        marginBottom: 10,
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: PDFColors.primary,
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    tableHeaderText: {
        fontSize: 9,
        fontFamily: "Helvetica-Bold",
        color: PDFColors.white,
        textTransform: "uppercase",
    },
    tableRow: {
        flexDirection: "row",
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: PDFColors.white,
        borderBottomWidth: 0.5,
        borderBottomColor: PDFColors.borderLight,
    },
    tableRowAlt: {
        backgroundColor: PDFColors.bgLight,
    },
    tableCell: {
        fontSize: 9,
        fontFamily: "Helvetica",
        color: PDFColors.textDark,
    },

    // Financial Summary Rows
    summaryRow: {
        flexDirection: "row",
        backgroundColor: PDFColors.primary,
        paddingVertical: 6,
        paddingHorizontal: 10,
        marginTop: 1,
    },
    summaryLabel: {
        flex: 1,
        fontSize: 9,
        fontFamily: "Helvetica-Bold",
        color: PDFColors.white,
        textAlign: "right",
        paddingRight: 20,
    },
    summaryValue: {
        width: "80pt",
        fontSize: 9,
        fontFamily: "Helvetica-Bold",
        color: PDFColors.white,
        textAlign: "right",
    },

    // Signature box
    signatureContainer: {
        marginTop: 30,
        alignItems: "flex-end",
    },
    signatureBox: {
        width: "180pt",
        alignItems: "center",
    },
    signatureLine: {
        width: "100%",
        borderBottomWidth: 1,
        borderBottomColor: PDFColors.textDark,
        marginBottom: 5,
        marginTop: 20,
    },
    signatureLabel: {
        fontSize: 9,
        fontFamily: "Helvetica-Bold",
        color: PDFColors.textDark,
    },
    signatureSubLabel: {
        fontSize: 8,
        fontFamily: "Helvetica",
        color: PDFColors.textMuted,
    },
});

/* =======================
   REUSABLE COMPONENTS
======================= */

interface PDFSectionProps {
    title: string;
    children: React.ReactNode;
}

export function PDFSection({ title, children }: PDFSectionProps) {
    return (
        <View wrap={false} style={{ marginBottom: 15 }}>
            <Text style={sharedStyles.sectionHeader}>{title}</Text>
            {children}
        </View>
    );
}

interface PDFKeyValueProps {
    label: string;
    value: string | null | undefined;
}

export function PDFKeyValue({ label, value }: PDFKeyValueProps) {
    return (
        <View style={sharedStyles.kvRow}>
            <Text style={sharedStyles.kvLabel}>{label}</Text>
            <Text style={sharedStyles.kvSeparator}>:</Text>
            <Text style={sharedStyles.kvValue}>{value || "-"}</Text>
        </View>
    );
}

interface PDFTableProps {
    headers: Array<{ label: string; width: string }>;
    rows: Array<Array<string>>;
}

export function PDFTable({ headers, rows }: PDFTableProps) {
    return (
        <View style={sharedStyles.table}>
            {/* Header */}
            <View style={sharedStyles.tableHeader}>
                {headers.map((header, idx) => (
                    <Text
                        key={idx}
                        style={[
                            sharedStyles.tableHeaderText,
                            { width: header.width },
                            header.label === "Importo" || header.label === "Subtotale" ? { textAlign: "right" } : {},
                        ]}
                    >
                        {header.label}
                    </Text>
                ))}
            </View>

            {/* Rows */}
            {rows.map((row, rowIdx) => (
                <View
                    key={rowIdx}
                    style={[
                        sharedStyles.tableRow,
                        rowIdx % 2 === 1 && sharedStyles.tableRowAlt,
                    ]}
                >
                    {row.map((cell, cellIdx) => (
                        <Text
                            key={cellIdx}
                            style={[
                                sharedStyles.tableCell,
                                { width: headers[cellIdx].width },
                                headers[cellIdx].label === "Importo" || headers[cellIdx].label === "Subtotale" ? { textAlign: "right" } : {},
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

interface PDFSignatureBoxProps {
    label: string;
    date?: string;
}

export function PDFSignatureBox({ label, date }: PDFSignatureBoxProps) {
    return (
        <View style={sharedStyles.signatureContainer}>
            {date && <Text style={{ fontSize: 9, marginBottom: 5 }}>Data: {date}</Text>}
            <View style={sharedStyles.signatureBox}>
                <View style={sharedStyles.signatureLine} />
                <Text style={sharedStyles.signatureLabel}>{label}</Text>
                <Text style={sharedStyles.signatureSubLabel}>Authorized Sign</Text>
            </View>
        </View>
    );
}
