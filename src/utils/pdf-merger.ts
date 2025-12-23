import { PDFDocument } from 'pdf-lib';

/**
 * Merges multiple PDF documents into a single PDF blob.
 * @param pdfBuffers Array of ArrayBuffer or Uint8Array representing the PDFs to merge.
 * @returns A promise that resolves to a Blob of the merged PDF.
 */
export async function mergePdfs(pdfBuffers: (ArrayBuffer | Uint8Array)[]): Promise<Blob> {
    const mergedPdf = await PDFDocument.create();

    for (const buffer of pdfBuffers) {
        const pdf = await PDFDocument.load(buffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    return new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
}
