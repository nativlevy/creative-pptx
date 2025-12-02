import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDB, ObjectId } from '../db';
import { generateEmbedding, cosineSimilarity } from './embeddings';
import { extractText } from './extractors';
import { chunkText, TextChunk } from './chunker';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Types
export interface RagDocument {
  _id?: ObjectId;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  status: 'processing' | 'ready' | 'error';
  errorMessage?: string;
  chunkCount: number;
  uploadedAt: Date;
}

export interface RagChunk {
  _id?: ObjectId;
  documentId: ObjectId;
  content: string;
  embedding: number[];
  metadata: {
    chunkIndex: number;
    sourceFile: string;
    startChar: number;
    endChar: number;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    documentId: string;
    filename: string;
    content: string;
    score: number;
  }>;
}

export interface RetrievedContext {
  content: string;
  documentId: string;
  filename: string;
  score: number;
}

// Collection names
const DOCUMENTS_COLLECTION = 'rag_documents';
const CHUNKS_COLLECTION = 'rag_chunks';

/**
 * Process an uploaded file: extract text, chunk it, generate embeddings, store in DB
 */
export async function processDocument(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  fileSize: number
): Promise<RagDocument> {
  const db = await getDB();

  // Create document record
  const document: RagDocument = {
    filename,
    originalName: filename,
    mimeType,
    fileSize,
    status: 'processing',
    chunkCount: 0,
    uploadedAt: new Date()
  };

  const insertResult = await db.collection(DOCUMENTS_COLLECTION).insertOne(document);
  const documentId = insertResult.insertedId;

  try {
    // Extract text
    console.log(`Extracting text from ${filename}...`);
    const extracted = await extractText(buffer, filename, mimeType);
    console.log(`Extracted ${extracted.text.length} characters`);

    // Chunk text
    console.log('Chunking text...');
    const chunks = chunkText(extracted.text, { sourceFile: filename });
    console.log(`Created ${chunks.length} chunks`);

    // Generate embeddings for all chunks
    console.log('Generating embeddings...');
    const chunkContents = chunks.map(c => c.content);

    // Process chunks one at a time to avoid rate limits
    const ragChunks: RagChunk[] = [];
    for (let i = 0; i < chunks.length; i++) {
      console.log(`Embedding chunk ${i + 1}/${chunks.length}`);
      const embedding = await generateEmbedding(chunks[i].content);

      ragChunks.push({
        documentId,
        content: chunks[i].content,
        embedding,
        metadata: {
          chunkIndex: chunks[i].index,
          sourceFile: chunks[i].metadata.sourceFile,
          startChar: chunks[i].metadata.startChar,
          endChar: chunks[i].metadata.endChar
        }
      });

      // Small delay to avoid rate limits
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Store chunks in DB
    if (ragChunks.length > 0) {
      await db.collection(CHUNKS_COLLECTION).insertMany(ragChunks);
    }

    // Update document status
    await db.collection(DOCUMENTS_COLLECTION).updateOne(
      { _id: documentId },
      {
        $set: {
          status: 'ready',
          chunkCount: ragChunks.length
        }
      }
    );

    return {
      ...document,
      _id: documentId,
      status: 'ready',
      chunkCount: ragChunks.length
    };
  } catch (error) {
    console.error('Error processing document:', error);

    // Update document with error status
    await db.collection(DOCUMENTS_COLLECTION).updateOne(
      { _id: documentId },
      {
        $set: {
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    );

    throw error;
  }
}

/**
 * Search for relevant chunks using vector similarity
 * Falls back to in-memory search if Atlas Vector Search is not available
 */
export async function searchChunks(
  query: string,
  limit: number = 5
): Promise<RetrievedContext[]> {
  const db = await getDB();

  // Generate query embedding
  console.log('Generating query embedding...');
  const queryEmbedding = await generateEmbedding(query);

  // Try Atlas Vector Search first
  try {
    const results = await db.collection(CHUNKS_COLLECTION).aggregate([
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit
        }
      },
      {
        $project: {
          content: 1,
          documentId: 1,
          metadata: 1,
          score: { $meta: 'vectorSearchScore' }
        }
      }
    ]).toArray();

    if (results.length > 0) {
      // Get document info for results
      const documentIds = [...new Set(results.map(r => r.documentId))];
      const documents = await db.collection(DOCUMENTS_COLLECTION)
        .find({ _id: { $in: documentIds } })
        .toArray();

      const docMap = new Map(documents.map(d => [d._id.toString(), d]));

      return results.map(r => ({
        content: r.content,
        documentId: r.documentId.toString(),
        filename: docMap.get(r.documentId.toString())?.originalName || 'Unknown',
        score: r.score
      }));
    }
  } catch (error) {
    console.log('Atlas Vector Search not available, falling back to in-memory search');
  }

  // Fallback: In-memory cosine similarity search
  const allChunks = await db.collection(CHUNKS_COLLECTION).find().toArray();

  if (allChunks.length === 0) {
    return [];
  }

  // Calculate similarities
  const scored = allChunks.map(chunk => ({
    ...chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding)
  }));

  // Sort by similarity and take top results
  scored.sort((a, b) => b.score - a.score);
  const topResults = scored.slice(0, limit);

  // Get document info
  const documentIds = [...new Set(topResults.map(r => r.documentId))];
  const documents = await db.collection(DOCUMENTS_COLLECTION)
    .find({ _id: { $in: documentIds } })
    .toArray();

  const docMap = new Map(documents.map(d => [d._id.toString(), d]));

  return topResults.map(r => ({
    content: r.content,
    documentId: r.documentId.toString(),
    filename: docMap.get(r.documentId.toString())?.originalName || 'Unknown',
    score: r.score
  }));
}

/**
 * Generate a streaming response for a chat message
 */
export async function* generateChatResponse(
  query: string,
  chatHistory: ChatMessage[] = []
): AsyncGenerator<{ type: 'token' | 'sources' | 'done'; data: string }> {
  // Retrieve relevant context
  const contexts = await searchChunks(query, 5);

  // Yield sources first
  yield {
    type: 'sources',
    data: JSON.stringify(contexts)
  };

  // Build context for prompt
  const contextText = contexts.length > 0
    ? contexts.map((c, i) => `[Source ${i + 1}: ${c.filename}]\n${c.content}`).join('\n\n')
    : 'No relevant documents found.';

  // Build chat history for context
  const historyText = chatHistory
    .slice(-6) // Last 3 turns
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  const prompt = `You are a helpful AI assistant for "Leave a Mark", a presentation agency. Answer the user's question based on the provided context from their uploaded documents.

${contexts.length > 0 ? `CONTEXT FROM DOCUMENTS:
${contextText}

` : ''}${historyText ? `CONVERSATION HISTORY:
${historyText}

` : ''}USER QUESTION: ${query}

Instructions:
- Answer based on the provided context when available
- If the context doesn't contain relevant information, say so honestly
- Be concise but thorough
- When referencing information, mention which source it came from
- Format your response in a clear, readable way`;

  // Generate streaming response
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContentStream(prompt);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      yield { type: 'token', data: text };
    }
  }

  yield { type: 'done', data: '' };
}

/**
 * Get all documents
 */
export async function getDocuments(): Promise<RagDocument[]> {
  const db = await getDB();
  const docs = await db.collection(DOCUMENTS_COLLECTION)
    .find()
    .sort({ uploadedAt: -1 })
    .toArray();

  return docs as unknown as RagDocument[];
}

/**
 * Delete a document and its chunks
 */
export async function deleteDocument(documentId: string): Promise<void> {
  const db = await getDB();
  const objId = new ObjectId(documentId);

  // Delete chunks first
  await db.collection(CHUNKS_COLLECTION).deleteMany({ documentId: objId });

  // Delete document
  await db.collection(DOCUMENTS_COLLECTION).deleteOne({ _id: objId });
}
