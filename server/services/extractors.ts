import * as pdfParse from 'pdf-parse';
import officeParser from 'officeparser';
import { readFile } from 'fs/promises';
import path from 'path';

export interface ExtractedContent {
  text: string;
  metadata: {
    filename: string;
    mimeType: string;
    pageCount?: number;
    slideCount?: number;
  };
}

/**
 * Extract text from PDF files
 */
export async function extractFromPDF(buffer: Buffer, filename: string): Promise<ExtractedContent> {
  const pdf = (pdfParse as any).default || pdfParse;
  const data = await pdf(buffer);

  return {
    text: data.text,
    metadata: {
      filename,
      mimeType: 'application/pdf',
      pageCount: data.numpages
    }
  };
}

/**
 * Extract text from PPTX files (slides + speaker notes)
 */
export async function extractFromPPTX(buffer: Buffer, filename: string): Promise<ExtractedContent> {
  const text = await officeParser.parseOfficeAsync(buffer);

  // Count approximate slides by looking for slide markers
  const slideCount = (text.match(/Slide \d+|slide\d+/gi) || []).length || 1;

  return {
    text,
    metadata: {
      filename,
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      slideCount
    }
  };
}

/**
 * Extract text from plain text files (TXT, MD)
 */
export async function extractFromText(buffer: Buffer, filename: string): Promise<ExtractedContent> {
  const text = buffer.toString('utf-8');
  const ext = path.extname(filename).toLowerCase();

  const mimeType = ext === '.md' ? 'text/markdown' : 'text/plain';

  return {
    text,
    metadata: {
      filename,
      mimeType
    }
  };
}

/**
 * Main extraction function - routes to appropriate extractor based on file type
 */
export async function extractText(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<ExtractedContent> {
  const ext = path.extname(filename).toLowerCase();

  // Route based on mime type or extension
  if (mimeType === 'application/pdf' || ext === '.pdf') {
    return extractFromPDF(buffer, filename);
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    ext === '.pptx'
  ) {
    return extractFromPPTX(buffer, filename);
  }

  if (
    mimeType === 'text/plain' ||
    mimeType === 'text/markdown' ||
    ['.txt', '.md'].includes(ext)
  ) {
    return extractFromText(buffer, filename);
  }

  throw new Error(`Unsupported file type: ${mimeType || ext}`);
}

/**
 * Extract text from a file path
 */
export async function extractTextFromFile(filePath: string): Promise<ExtractedContent> {
  const buffer = await readFile(filePath);
  const filename = path.basename(filePath);
  const ext = path.extname(filename).toLowerCase();

  // Determine mime type from extension
  const mimeTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.txt': 'text/plain',
    '.md': 'text/markdown'
  };

  const mimeType = mimeTypes[ext] || 'application/octet-stream';

  return extractText(buffer, filename, mimeType);
}
