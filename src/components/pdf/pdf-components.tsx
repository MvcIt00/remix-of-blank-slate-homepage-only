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
   DATA TYPES
   ========================================================================== */

export type SectionSpacing = 'none' | 'tight' | 'normal' | 'section' | 'break' | 'final';

const SPACING_MAP: Record<SectionSpacing, number> = {
    none: 0,
    tight: 8,
    normal: 15,
    section: 25,
    break: 40,
    final: 50
};

interface BaseSection {
    id: string;
    spacingTop?: SectionSpacing;
}

export interface StandardSectionData extends BaseSection {
    type: 'standard';
    title: string;
    data: Array<{ label: string; value: string | number | null | undefined }>;
}

export interface EconomicSectionData extends BaseSection {
    type: 'economic';
    tableHeaders: string[];
    columnWidths: string[];
    rows: string[][];
    totalLabel: string;
    totalValue: string;
}

export interface TextSectionData extends BaseSection {
    type: 'text';
    title?: string;
    content: string;
}

export interface SignatureSectionData extends BaseSection {
    type: 'signatures';
    labels: string[];
}

export interface GroupSectionData extends BaseSection {
    type: 'group';
    sections: DocumentSection[];
    keepTogether: boolean;
}

export interface BreakPageSectionData extends BaseSection {
    type: 'break-page';
}

export type DocumentSection =
    | StandardSectionData
    | EconomicSectionData
    | TextSectionData
    | SignatureSectionData
    | GroupSectionData
    | BreakPageSectionData;


/* ==========================================================================
   ATOMIC COMPONENTS (Simplified)
   ========================================================================== */

/**
 * Key-Value Row - ULTRA SIMPLIFIED
 * Removed all flex hacks on the container.
 * Just a simple row that sizes itself based on content.
 */
export function PDFKeyValue({ label, value }: { label: string; value: any }) {
    return (
        <View style={{
            flexDirection: 'row',
            marginBottom: 6, // Changed from margin to ensure consistent gap
            alignItems: 'flex-start' // Ensure alignment with multi-line text
        }}>
            {/* Label Column - Fixed Width */}
            <View style={{ width: 90 }}>
                <Text style={{ fontSize: 8, color: "#718096" }}>{label}</Text>
            </View>

            {/* Separator */}
            <View style={{ width: 10 }}>
                <Text style={{ fontSize: 8, color: "#718096" }}>:</Text>
            </View>

            {/* Value Column - Takes remaining space */}
            <View style={{ flex: 1 }}>
                <Text style={{
                    fontSize: 8.5,
                    color: "#1a365d",
                    fontFamily: "Helvetica-Bold",
                    lineHeight: 1.3 // Better readability for multiline
                }}>
                    {value || "-"}
                </Text>
            </View>
        </View>
    );
}

/**
 * Table Component
 */
export function PDFTable({ headers, rows, columnWidths }: { headers: string[]; rows: string[][]; columnWidths: string[] }) {
    return (
        <View style={pdfStyles.table}>
            {/* Header */}
            <View style={[pdfStyles.tableHeader, { borderTopWidth: 2, borderTopColor: PDF_COLORS.accent }]}>
                {headers.map((h, i) => (
                    <View key={i} style={{ width: columnWidths[i] }}>
                        <Text style={[pdfStyles.tableHeaderText, { color: "#ffffff" }]}>{h}</Text>
                    </View>
                ))}
            </View>
            {/* Rows */}
            {rows.map((row, i) => (
                <View key={i} style={[pdfStyles.tableRow, i % 2 !== 0 && pdfStyles.tableRowAlt]}>
                    {row.map((cell, j) => (
                        <View key={j} style={{ width: columnWidths[j] }}>
                            <Text style={pdfStyles.tableCellText}>{cell}</Text>
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );
}

/**
 * Signature Components
 */
export function PDFSignatureGroup({ children }: { children: React.ReactNode }) {
    return (
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 60 }} wrap={false}>
            {children}
        </View>
    );
}

export function PDFSignatureBox({ label }: { label: string; date?: string }) {
    return (
        <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 7, color: "#718096", textTransform: "uppercase", marginBottom: 35 }}>
                {label}
            </Text>
            <View style={{ borderTopWidth: 0.5, borderTopColor: "#000000", paddingTop: 4 }}>
                <Text style={{ fontSize: 6, color: "#718096", textAlign: 'center' }}>Firma e Timbro</Text>
            </View>
        </View>
    );
}


/* ==========================================================================
   ENGINE (Simplified - No Nested Wrappers)
   ========================================================================== */

const SectionRenderer = ({ section }: { section: DocumentSection }) => {
    // 1. Calculate Spacer Height
    const spacing = SPACING_MAP[section.spacingTop || 'normal'];

    // 2. Determine Content
    const renderContent = () => {
        switch (section.type) {
            case 'standard':
                return (
                    <View wrap={false}>
                        <Text style={pdfStyles.sectionHeader}>{section.title}</Text>
                        <View style={{ marginTop: 8, flexDirection: 'column' }}>
                            {section.data.map((item, idx) => (
                                <PDFKeyValue key={idx} label={item.label} value={item.value} />
                            ))}
                        </View>
                    </View>
                );

            case 'economic':
                return (
                    <View wrap={false}>
                        <PDFTable
                            headers={section.tableHeaders}
                            columnWidths={section.columnWidths}
                            rows={section.rows}
                        />
                        <View style={{ marginTop: 5, alignItems: 'flex-end' }}>
                            <View style={{ width: 180, borderTopWidth: 1, borderTopColor: '#1a365d', paddingTop: 8 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>{section.totalLabel}</Text>
                                    <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>{section.totalValue}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                );

            case 'text':
                return (
                    <View wrap={false}>
                        {section.title && <Text style={pdfStyles.sectionHeader}>{section.title}</Text>}
                        <View style={{ marginTop: section.title ? 5 : 0 }}>
                            <Text style={pdfStyles.text}>{section.content}</Text>
                        </View>
                    </View>
                );

            case 'signatures':
                return (
                    <PDFSignatureGroup>
                        {section.labels.map((label, idx) => (
                            <PDFSignatureBox key={idx} label={label} />
                        ))}
                    </PDFSignatureGroup>
                );

            case 'group':
                return (
                    <View wrap={!section.keepTogether}>
                        {section.sections.map((sub, idx) => (
                            <SectionRenderer key={sub.id || idx} section={sub} />
                        ))}
                    </View>
                );

            case 'break-page':
                return <View break />;

            default:
                return null;
        }
    };

    return (
        <View style={{ flexDirection: 'column' }}>
            {spacing > 0 && <View style={{ height: spacing }} />}
            {renderContent()}
        </View>
    );
};

export function PDFDocumentBuilder({ sections }: { sections: DocumentSection[] }) {
    return (
        <View style={{ paddingBottom: 20, flexDirection: 'column' }}>
            {sections.map((section, idx) => (
                <SectionRenderer key={section.id || idx} section={section} />
            ))}
        </View>
    );
}

// Backward Compatibility Alias
export function PDFSectionLegacy({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View style={{ marginTop: 25, marginBottom: 15 }} wrap={false}>
            <Text style={pdfStyles.sectionHeader}>{title}</Text>
            <View style={{ marginTop: 5 }}>
                {children}
            </View>
        </View>
    );
}
export const PDFSection = PDFSectionLegacy;
export function PDFGrid({ children }: { children: React.ReactNode }) { return <View style={pdfStyles.contentGrid}>{children}</View>; }
export function PDFGridCol({ children, size = 1 }: { children: React.ReactNode; size?: number }) { return <View style={{ flex: size }}>{children}</View>; }
