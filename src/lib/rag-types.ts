export interface RagDocument {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  status: 'processing' | 'ready' | 'error';
  errorMessage?: string;
  chunkCount: number;
  uploadedAt: string;
}

export interface ChatSource {
  documentId: string;
  filename: string;
  content: string;
  score: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
  isStreaming?: boolean;
}
