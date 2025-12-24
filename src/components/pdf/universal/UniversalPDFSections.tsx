import React from "react";
import { StandardSectionData } from "../pdf-components";
import { EntitaAnagraficaDocumentale, EntitaMezzoDocumentale } from "@/types/database_views";

/**
 * Universal Client/Anagrafica Section
 * Standardizes how client details appear in EVERY PDF header/section.
 */
export function UniversalClientSection(
    data: EntitaAnagraficaDocumentale,
    options: {
        title?: string;
        id?: string;
        minimalist?: boolean; // If true, only shows Legal Name, P.IVA, and HQ Address
    } = {}
): StandardSectionData {
    const { title = "Cliente", id = "cliente", minimalist = false } = options;

    const addressParts = [
        data.sede_legale_indirizzo,
        `${data.sede_legale_cap || ""} ${data.sede_legale_citta || ""}`.trim(),
        data.sede_legale_provincia ? `(${data.sede_legale_provincia})` : ""
    ].filter(Boolean).join(", ");

    const baseData = [
        { label: 'Ragione Sociale', value: data.ragione_sociale },
        { label: 'P.IVA', value: data.partita_iva || "-" },
        { label: 'Sede Legale', value: addressParts || "-" },
    ];

    const extendedData = minimalist ? [] : [
        { label: 'Contatto', value: data.nome_contatto_principale || "-" },
        { label: 'Email', value: data.email_principale || "-" },
        { label: 'Tel', value: data.telefono_principale || "-" },
        ...(data.pec ? [{ label: 'PEC', value: data.pec }] : []),
        ...(data.codice_univoco ? [{ label: 'SDI/Univoco', value: data.codice_univoco }] : [])
    ];

    return {
        id,
        type: 'standard',
        title,
        spacingTop: 'normal',
        data: [...baseData, ...extendedData]
    };
}

/**
 * Universal Vehicle Section
 * Standardizes vehicle technical specs across Quotes, Contracts, and Sheets.
 */
export function UniversalMezzoSection(
    data: EntitaMezzoDocumentale,
    options: {
        title?: string;
        id?: string;
        mode?: 'standard' | 'minimalist' | 'contract';
    } = {}
): StandardSectionData {
    const { title = "Dati del Mezzo", id = "mezzo", mode = 'standard' } = options;

    const mezzoLabel = `${data.marca || ""} ${data.modello || ""}`.trim() || "-";

    if (mode === 'minimalist') {
        return {
            id,
            type: 'standard',
            title,
            spacingTop: 'section',
            data: [{ label: 'Mezzo', value: mezzoLabel }]
        };
    }

    if (mode === 'contract') {
        // Contract mode: Combined Matricola + ID Interno
        const matricolaEstesa = [data.matricola, data.id_interno].filter(Boolean).join(" / ");
        return {
            id,
            type: 'standard',
            title,
            spacingTop: 'section',
            data: [
                { label: 'Mezzo', value: mezzoLabel },
                { label: 'Matricola', value: matricolaEstesa || "-" },
                { label: 'Anno', value: data.anno || "-" },
                { label: 'Ubicazione', value: data.ubicazione_attuale_dettaglio || "-" }
            ]
        };
    }

    // Standard mode (Legacy/Full)
    return {
        id,
        type: 'standard',
        title,
        spacingTop: 'section',
        data: [
            { label: 'Mezzo', value: mezzoLabel },
            { label: 'Matricola', value: data.matricola || "-" },
            { label: 'ID Interno', value: data.id_interno || "-" },
            { label: 'Anno', value: data.anno || "-" },
            { label: 'Categoria', value: data.categoria || "-" },
            { label: 'Ore Moto', value: data.ore_moto != null ? String(data.ore_moto) : "-" },
            { label: 'Ubicazione', value: data.ubicazione_attuale_dettaglio || "-" }
        ]
    };
}
