import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { processDocument, getDocuments, deleteDocument, generateChatResponse, ChatMessage } from '../services/rag';

const ragRoutes = new Hono();

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

export default ragRoutes;
