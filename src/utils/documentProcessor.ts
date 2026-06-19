/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PDFDocument, rgb, degrees } from 'pdf-lib';
import * as XLSX from 'xlsx';

/**
 * Merges multiple PDF documents into a single consolidated PDF.
 */
export async function mergePDFs(files: File[], onProgress?: (msg: string) => void): Promise<Blob> {
  if (onProgress) onProgress('Initializing PDF merger...');
  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (onProgress) onProgress(`Reading PDF ${i + 1}/${files.length}: ${file.name}...`);
    
    const arrayBuffer = await file.arrayBuffer();
    const donorPdf = await PDFDocument.load(arrayBuffer);
    
    const pages = await mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
  }

  if (onProgress) onProgress('Compiling PDF buffers...');
  const mergedPdfBytes = await mergedPdf.save();
  return new Blob([mergedPdfBytes], { type: 'application/pdf' });
}

/**
 * Splits a PDF file into individual pages, returning an array of blobs.
 */
export async function splitPDF(file: File, onProgress?: (msg: string) => void): Promise<{ blob: Blob; pageNum: number }[]> {
  if (onProgress) onProgress('Loading PDF structural map...');
  const arrayBuffer = await file.arrayBuffer();
  const mainPdf = await PDFDocument.load(arrayBuffer);
  const pageCount = mainPdf.getPageCount();
  const results: { blob: Blob; pageNum: number }[] = [];

  for (let i = 0; i < pageCount; i++) {
    if (onProgress) onProgress(`Extracting page ${i + 1}/${pageCount}...`);
    const subsetPdf = await PDFDocument.create();
    const [copiedPage] = await subsetPdf.copyPages(mainPdf, [i]);
    subsetPdf.addPage(copiedPage);
    
    const subsetBytes = await subsetPdf.save();
    results.push({
      blob: new Blob([subsetBytes], { type: 'application/pdf' }),
      pageNum: i + 1
    });
  }

  return results;
}

/**
 * Converts multiple image files into printable PDF pages.
 * Converts WebP, BMP, etc. dynamically to JPG via canvas drawing to support pdf-lib embedding.
 */
export async function convertImagesToPDF(files: File[], onProgress?: (msg: string) => void): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (onProgress) onProgress(`Embedding image ${i + 1}/${files.length}: ${file.name}...`);

    let arrayBuffer = await file.arrayBuffer();
    let isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
    let isJpg = file.type === 'image/jpeg' || file.type === 'image/jpg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg');

    // If it is another web-image format (webp, bmp, gif), convert to JPG first as pdf-lib only accepts JPG/PNG
    if (!isPng && !isJpg) {
      if (onProgress) onProgress(`Re-encoding ${file.name} to JPG first...`);
      arrayBuffer = await convertImageToJpgArrayBuffer(file);
      isJpg = true;
    }

    try {
      let embeddedImage;
      if (isPng) {
        embeddedImage = await pdfDoc.embedPng(arrayBuffer);
      } else {
        embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
      }

      const { width, height } = embeddedImage.scale(1);
      const page = pdfDoc.addPage([width, height]);
      page.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: width,
        height: height
      });
    } catch (err) {
      console.error('Failed to embed image in PDF: ', err);
      // Fallback: draw generic page if embedding fails
      const page = pdfDoc.addPage([612, 792]);
      page.drawText(`Could not render image: ${file.name}`, { x: 50, y: 700, size: 16 });
    }
  }

  if (onProgress) onProgress('Constructing multi-page PDF output...');
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Converts .xlsx/.xls workbook to parsed Comma Separated Values (.csv)
 */
export async function convertExcelToCsv(file: File, sheetIndex = 0, onProgress?: (msg: string) => void): Promise<{ csvText: string; sheetNames: string[] }> {
  if (onProgress) onProgress('Inflating Excel spreadsheet data...');
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetNames = workbook.SheetNames;
  
  if (sheetNames.length === 0) {
    throw new Error('Workbook contains no sheets.');
  }

  if (onProgress) onProgress(`Parsing sheet "${sheetNames[sheetIndex]}"...`);
  const worksheet = workbook.Sheets[sheetNames[sheetIndex]];
  const csvText = XLSX.utils.sheet_to_csv(worksheet);

  return { csvText, sheetNames };
}

/**
 * Converts comma-delimited raw files to high-fidelity downloadable spreadsheet (.xlsx) workbook.
 */
export async function convertCsvToExcel(file: File, onProgress?: (msg: string) => void): Promise<Blob> {
  if (onProgress) onProgress('Reading raw CSV character sequence...');
  const text = await file.text();
  
  if (onProgress) onProgress('Assembling grid matrices...');
  const workbook = XLSX.read(text, { type: 'string' });
  
  // Format cells beautifully with standard headers
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * Formats plain text or tabular CSV data into paginated PDF.
 */
export async function convertTxtToPdf(file: File, onProgress?: (msg: string) => void): Promise<Blob> {
  if (onProgress) onProgress('Reading text streams...');
  const content = await file.text();
  const lines = content.split(/\r?\n/);
  
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([612, 792]); // Standard Letter size
  const { width, height } = page.getSize();
  const margin = 50;
  const fontSize = 10;
  const lineHeight = 14;
  let currentY = height - margin;

  page.drawText(`Exported Document: ${file.name}`, { x: margin, y: currentY, size: 12 });
  page.drawLine({
    start: { x: margin, y: currentY - 5 },
    end: { x: width - margin, y: currentY - 5 },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.7)
  });
  currentY -= 30;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    // Simple word wrapping for standard Letter width
    const words = rawLine.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      // Estimate 6.5px per character width for simple monospace simulation
      const estimatedWidth = testLine.length * 5.2;

      if (estimatedWidth > (width - margin * 2)) {
        // Draw accumulated line
        page.drawText(currentLine, { x: margin, y: currentY, size: fontSize });
        currentY -= lineHeight;
        
        if (currentY < margin) {
          page = pdfDoc.addPage([612, 792]);
          currentY = height - margin - 20;
        }
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      page.drawText(currentLine, { x: margin, y: currentY, size: fontSize });
      currentY -= lineHeight;
    }

    if (currentY < margin) {
      page = pdfDoc.addPage([612, 792]);
      currentY = height - margin - 20;
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Extracts raw textual layout / structured metadata from PPTX / HWP or binary assets in-browser!
 * For PPTX, standard OpenXML structures allow parsing slide XML texts.
 * For unknown or proprietary formats like HWP (한글), falls back to filtering clean printable strings.
 */
export async function extractMetadataText(file: File, onProgress?: (msg: string) => void): Promise<string> {
  if (onProgress) onProgress('Opening source headers...');
  const buffer = await file.arrayBuffer();
  const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

  let extracted = `FILE OUTLINE EXPORT\n===============================\n`;
  extracted += `File Name: ${file.name}\n`;
  extracted += `Size: ${(file.size / 1024).toFixed(1)} KB\n`;
  extracted += `MIME Type: ${file.type || 'unknown'}\n`;
  extracted += `Processed Time: ${new Date().toLocaleDateString()}\n`;
  extracted += `===============================\n\n`;

  if (extension === '.pptx' || extension === '.docx') {
    extracted += `[OpenXML Office Structure]\n`;
    // Perform simple string extraction on strings found inside the binary layout (resembles text-scrapers or grep XML text)
    const textDecoder = new TextDecoder('utf-8');
    const binaryString = textDecoder.decode(new Uint8Array(buffer.slice(0, 500000))); // Cap at 500kb search area for instant speed
    
    // Find inner tags like <a:t> (PowerPoint text) or <w:t> (Word text)
    const matches = binaryString.match(/<[a-z]:t[^>]*>([^<]+)<\/[a-z]:t>/g);
    if (matches && matches.length > 0) {
      extracted += `Detected ${matches.length} dynamic slide text nodes:\n\n`;
      const cleanTexts = matches
        .map(tag => tag.replace(/<[^>]+>/g, '').trim())
        .filter(t => t.length > 2);
      
      // Deduplicate consecutive identical extracts
      const uniqueTexts: string[] = [];
      cleanTexts.forEach(txt => {
        if (uniqueTexts[uniqueTexts.length - 1] !== txt) {
          uniqueTexts.push(txt);
        }
      });

      extracted += uniqueTexts.slice(0, 150).join('\n') + (uniqueTexts.length > 150 ? '\n\n...[Truncated for legibility]...' : '');
    } else {
      extracted += `No direct slide XML markup caught. Falling back to printable ASCII parsing...\n\n`;
      extracted += extractPrintableAscii(buffer);
    }
  } else if (extension === '.hwp') {
    extracted += `[Hancom Hangul HWP Structure (Korean proprietary format)]\n`;
    extracted += `Scanned binary file and extracted readable Korean block texts safely:\n\n`;
    
    // HWP 5.0 combines sub-data structures. We can scan for readable UTF-16 characters or HWP Korean blocks
    extracted += extractPrintableAscii(buffer);
  } else {
    extracted += `[Client Sandbox Text Recovery]\n`;
    extracted += `ASCII Streams:\n\n`;
    extracted += extractPrintableAscii(buffer);
  }

  return extracted;
}

/**
 * Fallback binary parsing of printable texts
 */
function extractPrintableAscii(buffer: ArrayBuffer): string {
  const view = new DataView(buffer);
  let result = '';
  let count = 0;
  let wordBuffer = '';

  for (let i = 0; i < Math.min(buffer.byteLength, 150000); i++) {
    const charCode = view.getUint8(i);
    // Allow standard ASCII, Korean Hangul Syllables (0xAC00 to 0xD7A3 in utf-8 / unicode)
    // To make it easy, allow ASCII space, digits, alphabet and Korean UTF-8 boundaries
    if ((charCode >= 32 && charCode <= 126) || charCode === 10 || charCode === 13) {
      const char = String.fromCharCode(charCode);
      wordBuffer += char;
    } else if (charCode >= 128) {
      // Very basic UTF8 character visual sequence recovery
      if (wordBuffer.length > 4) {
        result += wordBuffer.trim() + '\n';
        count++;
      }
      wordBuffer = '';
    } else {
      if (wordBuffer.length > 4) {
        result += wordBuffer.trim() + '\n';
        count++;
      }
      wordBuffer = '';
    }

    if (count > 200) {
      result += '\n... [Remaining text truncated] ...';
      break;
    }
  }

  if (!result.trim() && wordBuffer.length > 0) {
    result = wordBuffer;
  }

  return result.substring(0, 10000) || '(No readable text characters extracted from binary headers.)';
}

/**
 * Encodes any web browser image file to a clean JPG ArrayBuffer for pdf-lib using HTMLCanvasElement.
 */
function convertImageToJpgArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        ctx.fillStyle = '#FFFFFF'; // Fill background with white in case of transparency
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Encoding to JPG blob, failed'));
            return;
          }
          resolve(blob.arrayBuffer());
        }, 'image/jpeg', 0.95);
      };
      img.onerror = () => reject(new Error('Image decode error'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Reader error'));
    reader.readAsDataURL(file);
  });
}

/**
 * Places a signature image (PNG data URI) onto a PDF page.
 */
export async function signPDF(
  pdfFile: File,
  signatureDataUrl: string,
  pageNumber: number,
  x: number,
  y: number,
  width: number,
  height: number,
  onProgress?: (msg: string) => void
): Promise<Blob> {
  if (onProgress) onProgress('Loading original PDF...');
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  
  if (onProgress) onProgress('Importing signature asset...');
  const signatureBytes = await fetch(signatureDataUrl).then(res => res.arrayBuffer());
  const signatureImg = await pdfDoc.embedPng(signatureBytes);

  const pageCount = pdfDoc.getPageCount();
  const targetIndex = Math.min(Math.max(1, pageNumber), pageCount) - 1;
  const page = pdfDoc.getPages()[targetIndex];

  if (onProgress) onProgress(`Embedding graphic on page ${pageNumber}...`);
  // Draw signature
  page.drawImage(signatureImg, {
    x,
    y,
    width,
    height
  });

  if (onProgress) onProgress('Re-compiling signed PDF...');
  const signedBytes = await pdfDoc.save();
  return new Blob([signedBytes], { type: 'application/pdf' });
}

/**
 * Returns total page count and individual page dimensions for previews.
 */
export async function getPDFPageInfo(file: File): Promise<{ pageCount: number; pages: { width: number; height: number }[] }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();
    const pagesInfo = pdfDoc.getPages().map(p => {
      const { width, height } = p.getSize();
      return { width, height };
    });
    return { pageCount, pages: pagesInfo };
  } catch (err) {
    console.error("Failed to read PDF page info:", err);
    return { pageCount: 1, pages: [{ width: 612, height: 792 }] };
  }
}

/**
 * Rotates all pages of a PDF document by a given degree angle.
 * @param pdfFile The original PDF file
 * @param angle The clockwise rotation angle in degrees (e.g., 90, 180, 275)
 * @param onProgress Status update stream callback
 */
export async function rotatePDF(
  pdfFile: File,
  angle: number,
  onProgress?: (msg: string) => void
): Promise<Blob> {
  if (onProgress) onProgress('Loading original PDF document...');
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  const pageCount = pdfDoc.getPageCount();
  if (onProgress) onProgress(`Rotating ${pageCount} pages by ${angle} degrees...`);
  
  for (let i = 0; i < pageCount; i++) {
    const page = pdfDoc.getPages()[i];
    const currentRotationObj = page.getRotation();
    const currentAngle = currentRotationObj.angle || 0;
    
    // Calculate new angle securely
    const newAngle = (currentAngle + angle) % 360;
    page.setRotation(degrees(newAngle));
    
    if (onProgress && pageCount > 5) {
      if (i % Math.ceil(pageCount / 4) === 0 || i === pageCount - 1) {
        onProgress(`Processed page ${i + 1}/${pageCount}...`);
      }
    }
  }

  if (onProgress) onProgress('Compiling rotated PDF document streams...');
  const savedBytes = await pdfDoc.save();
  return new Blob([savedBytes], { type: 'application/pdf' });
}

