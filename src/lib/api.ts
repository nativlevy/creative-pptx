const API_BASE = 'http://localhost:3001';

export interface Project {
  _id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  transcript: string | null;
  analysis: AnalysisResult | null;
  slides: Slide[];
  wizardStep: string;
  wizardData: Record<string, unknown>;
}

export interface AnalysisResult {
  keyInsights: string[];
  audienceProfile: {
    primaryAudience: string;
    concerns: string[];
    motivations: string[];
  };
  challenges: string[];
  opportunities: string[];
  bigIdea: string;
  suggestedSlides: {
    section: string;
    slides: string[];
  }[];
}

export interface Slide {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  bulletPoints: string[];
  speakerNotes?: string;
}

// Projects API
export async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/api/projects`);
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export async function getProject(id: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/api/projects/${id}`);
  if (!res.ok) throw new Error('Failed to fetch project');
  return res.json();
}

export async function createProject(name?: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  const res = await fetch(`${API_BASE}/api/projects/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update project');
  return res.json();
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/projects/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete project');
}

// AI Analysis API
export async function analyzeTranscript(transcript: string, projectId?: string): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, projectId })
  });
  if (!res.ok) throw new Error('Failed to analyze transcript');
  return res.json();
}

export async function generateSlideContent(slideType: string, context: {
  bigIdea: string;
  audience: string;
  challenges: string[];
  opportunities: string[];
}): Promise<{
  title: string;
  subtitle?: string;
  bulletPoints: string[];
  speakerNotes: string;
}> {
  const res = await fetch(`${API_BASE}/api/generate-slide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slideType, context })
  });
  if (!res.ok) throw new Error('Failed to generate slide content');
  return res.json();
}

// Wizard API
export async function saveWizardStep(projectId: string, step: string, data: unknown): Promise<Project> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/wizard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step, data })
  });
  if (!res.ok) throw new Error('Failed to save wizard step');
  return res.json();
}

// RAG API
import type { RagDocument, ChatSource } from './rag-types';

export async function uploadDocument(file: File): Promise<RagDocument> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/api/rag/documents`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || 'Failed to upload document');
  }

  return res.json();
}

export async function getDocuments(): Promise<RagDocument[]> {
  const res = await fetch(`${API_BASE}/api/rag/documents`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function deleteDocument(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/rag/documents/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete document');
}

export interface ChatStreamCallbacks {
  onSources?: (sources: ChatSource[]) => void;
  onToken?: (token: string) => void;
  onDone?: () => void;
  onError?: (error: string) => void;
}

export async function sendChatMessage(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  callbacks: ChatStreamCallbacks
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/rag/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history })
  });

  if (!res.ok) {
    throw new Error('Failed to send chat message');
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Parse SSE events
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        continue;
      }

      if (line.startsWith('data: ')) {
        const data = line.slice(6);

        // Find the event type from the previous line
        const eventIndex = lines.indexOf(line) - 1;
        const eventLine = eventIndex >= 0 ? lines[eventIndex] : '';
        const eventType = eventLine.startsWith('event: ') ? eventLine.slice(7) : 'token';

        switch (eventType) {
          case 'sources':
            try {
              const sources = JSON.parse(data);
              callbacks.onSources?.(sources);
            } catch (e) {
              console.error('Failed to parse sources:', e);
            }
            break;
          case 'token':
            callbacks.onToken?.(data);
            break;
          case 'done':
            callbacks.onDone?.();
            break;
          case 'error':
            callbacks.onError?.(data);
            break;
        }
      }
    }
  }

  callbacks.onDone?.();
}
