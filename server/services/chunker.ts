export interface TextChunk {
  content: string;
  index: number;
  metadata: {
    startChar: number;
    endChar: number;
    sourceFile: string;
  };
}

export interface ChunkingOptions {
  chunkSize?: number;      // Target chunk size in characters
  chunkOverlap?: number;   // Overlap between chunks
  sourceFile: string;      // Source filename for metadata
}

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 200;

/**
 * Split text into sentences (basic implementation)
 */
function splitIntoSentences(text: string): string[] {
  // Split on sentence-ending punctuation followed by whitespace
  return text
    .split(/(?<=[.!?])\s+/)
    .filter(s => s.trim().length > 0);
}

/**
 * Split text into paragraphs
 */
function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .filter(p => p.trim().length > 0);
}

/**
 * Chunk text with overlap, respecting sentence/paragraph boundaries
 */
export function chunkText(text: string, options: ChunkingOptions): TextChunk[] {
  const chunkSize = options.chunkSize || DEFAULT_CHUNK_SIZE;
  const chunkOverlap = options.chunkOverlap || DEFAULT_CHUNK_OVERLAP;
  const sourceFile = options.sourceFile;

  // Clean and normalize text
  const cleanedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanedText.length === 0) {
    return [];
  }

  // If text is smaller than chunk size, return as single chunk
  if (cleanedText.length <= chunkSize) {
    return [{
      content: cleanedText,
      index: 0,
      metadata: {
        startChar: 0,
        endChar: cleanedText.length,
        sourceFile
      }
    }];
  }

  // Split into sentences for better boundary handling
  const sentences = splitIntoSentences(cleanedText);
  const chunks: TextChunk[] = [];

  let currentChunk: string[] = [];
  let currentLength = 0;
  let chunkIndex = 0;
  let startChar = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const sentenceLength = sentence.length + (currentChunk.length > 0 ? 1 : 0); // +1 for space

    // If adding this sentence exceeds chunk size
    if (currentLength + sentenceLength > chunkSize && currentChunk.length > 0) {
      // Save current chunk
      const chunkContent = currentChunk.join(' ');
      chunks.push({
        content: chunkContent,
        index: chunkIndex,
        metadata: {
          startChar,
          endChar: startChar + chunkContent.length,
          sourceFile
        }
      });

      // Calculate overlap: keep last sentences that fit within overlap size
      const overlapSentences: string[] = [];
      let overlapLength = 0;

      for (let j = currentChunk.length - 1; j >= 0; j--) {
        const sentLen = currentChunk[j].length + (overlapSentences.length > 0 ? 1 : 0);
        if (overlapLength + sentLen > chunkOverlap) break;
        overlapSentences.unshift(currentChunk[j]);
        overlapLength += sentLen;
      }

      // Start new chunk with overlap
      currentChunk = overlapSentences;
      currentLength = overlapLength;
      startChar = startChar + chunkContent.length - overlapLength;
      chunkIndex++;
    }

    // Add sentence to current chunk
    currentChunk.push(sentence);
    currentLength += sentenceLength;
  }

  // Don't forget the last chunk
  if (currentChunk.length > 0) {
    const chunkContent = currentChunk.join(' ');
    chunks.push({
      content: chunkContent,
      index: chunkIndex,
      metadata: {
        startChar,
        endChar: startChar + chunkContent.length,
        sourceFile
      }
    });
  }

  return chunks;
}

/**
 * Chunk multiple documents and merge results
 */
export function chunkDocuments(
  documents: Array<{ text: string; filename: string }>,
  options?: Omit<ChunkingOptions, 'sourceFile'>
): TextChunk[] {
  const allChunks: TextChunk[] = [];

  for (const doc of documents) {
    const chunks = chunkText(doc.text, {
      ...options,
      sourceFile: doc.filename
    });
    allChunks.push(...chunks);
  }

  // Re-index all chunks
  return allChunks.map((chunk, index) => ({
    ...chunk,
    index
  }));
}
