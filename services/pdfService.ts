import { PDFDocument } from 'pdf-lib';

/**
 * Merges multiple PDF files into a single PDF Document.
 */
export const mergePdfs = async (files: File[]): Promise<Uint8Array> => {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    // Load the source PDF
    const pdf = await PDFDocument.load(arrayBuffer);
    // Copy all pages
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    // Add pages to the merged PDF
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedPdfBytes = await mergedPdf.save();
  return mergedPdfBytes;
};

/**
 * Extracts text from the first page of the first PDF.
 * This is a simplified extraction to give context to Gemini.
 * Note: pdf-lib doesn't support advanced text extraction out of the box.
 * For a production app, we might strictly rely on metadata or user input,
 * but here we will return a placeholder or attempt basic metadata reading.
 */
export const extractMetadataForAI = async (file: File): Promise<string> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const title = pdf.getTitle() || "";
        const author = pdf.getAuthor() || "";
        const subject = pdf.getSubject() || "";
        
        return `Title: ${title}, Author: ${author}, Subject: ${subject}, Filename: ${file.name}`;
    } catch (e) {
        return `Filename: ${file.name}`;
    }
}
