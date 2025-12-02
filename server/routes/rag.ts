import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { processDocument, getDocuments, deleteDocument, generateChatResponse, getDocumentFile, ChatMessage } from '../services/rag';

const ragRoutes = new Hono();

// Sample data files for seeding
const SAMPLE_FILES = [
  { name: 'leave-a-mark-about.md', description: 'About Leave a Mark Agency' },
  { name: 'leave-a-mark-services.md', description: 'Services offered by Leave a Mark' },
  { name: 'leave-a-mark-case-studies.md', description: 'Case studies and success stories' }
];

/**
 * Upload a document for RAG processing
 * POST /api/rag/documents
 */
ragRoutes.post('/documents', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/markdown'
    ];

    const ext = file.name.toLowerCase().split('.').pop();
    const allowedExts = ['pdf', 'pptx', 'txt', 'md'];

    if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext || '')) {
      return c.json({ error: 'Unsupported file type. Allowed: PDF, PPTX, TXT, MD' }, 400);
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`Received file: ${file.name}, size: ${file.size}, type: ${file.type}`);

    // Process document (async - returns immediately with processing status)
    const document = await processDocument(buffer, file.name, file.type, file.size);

    return c.json(document, 201);
  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ error: 'Failed to upload document' }, 500);
  }
});

/**
 * List all uploaded documents
 * GET /api/rag/documents
 */
ragRoutes.get('/documents', async (c) => {
  try {
    const documents = await getDocuments();
    return c.json(documents);
  } catch (error) {
    console.error('List documents error:', error);
    return c.json({ error: 'Failed to fetch documents' }, 500);
  }
});

/**
 * Delete a document
 * DELETE /api/rag/documents/:id
 */
ragRoutes.delete('/documents/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await deleteDocument(id);
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete document error:', error);
    return c.json({ error: 'Failed to delete document' }, 500);
  }
});

/**
 * Download original file
 * GET /api/rag/documents/:id/download
 */
ragRoutes.get('/documents/:id/download', async (c) => {
  try {
    const id = c.req.param('id');
    const file = await getDocumentFile(id);

    if (!file) {
      return c.json({ error: 'File not found' }, 404);
    }

    return new Response(file.buffer, {
      headers: {
        'Content-Type': file.mimeType,
        'Content-Disposition': `attachment; filename="${file.filename}"`,
        'Content-Length': file.buffer.length.toString()
      }
    });
  } catch (error) {
    console.error('Download file error:', error);
    return c.json({ error: 'Failed to download file' }, 500);
  }
});

/**
 * Chat with documents using SSE streaming
 * POST /api/rag/chat
 */
ragRoutes.post('/chat', async (c) => {
  try {
    const { message, history = [] } = await c.req.json() as {
      message: string;
      history?: ChatMessage[];
    };

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return c.json({ error: 'Message is required' }, 400);
    }

    return streamSSE(c, async (stream) => {
      try {
        for await (const chunk of generateChatResponse(message, history)) {
          await stream.writeSSE({
            event: chunk.type,
            data: chunk.data
          });
        }
      } catch (error) {
        console.error('Chat streaming error:', error);
        await stream.writeSSE({
          event: 'error',
          data: 'An error occurred while generating the response'
        });
      }
    });
  } catch (error) {
    console.error('Chat error:', error);
    return c.json({ error: 'Failed to process chat message' }, 500);
  }
});

// Track if seeding is in progress to prevent race conditions
let isSeedingInProgress = false;

/**
 * Seed sample marketing documents
 * POST /api/rag/seed
 */
ragRoutes.post('/seed', async (c) => {
  try {
    // Prevent concurrent seeding
    if (isSeedingInProgress) {
      return c.json({
        message: 'Seeding already in progress',
        seeded: false
      });
    }

    // Check if documents already exist
    const existingDocs = await getDocuments();
    if (existingDocs.length > 0) {
      return c.json({
        message: 'Sample data already loaded',
        documentCount: existingDocs.length,
        seeded: false
      });
    }

    isSeedingInProgress = true;

    const dataDir = join(process.cwd(), 'server', 'data');
    const results = [];

    for (const file of SAMPLE_FILES) {
      const filePath = join(dataDir, file.name);

      if (!existsSync(filePath)) {
        console.warn(`Sample file not found: ${filePath}`);
        continue;
      }

      console.log(`Seeding: ${file.name}`);
      const content = readFileSync(filePath);
      const buffer = Buffer.from(content);

      try {
        const document = await processDocument(
          buffer,
          file.name,
          'text/markdown',
          buffer.length
        );
        results.push({ name: file.name, status: 'success', documentId: document._id });
        console.log(`Successfully seeded: ${file.name}`);
      } catch (error) {
        console.error(`Failed to seed ${file.name}:`, error);
        results.push({ name: file.name, status: 'error', error: String(error) });
      }
    }

    isSeedingInProgress = false;
    return c.json({
      message: 'Sample data seeded successfully',
      results,
      seeded: true
    }, 201);
  } catch (error) {
    isSeedingInProgress = false;
    console.error('Seed error:', error);
    return c.json({ error: 'Failed to seed sample data' }, 500);
  }
});

export default ragRoutes;
