import { useState, useRef, useEffect } from 'react';
import { Ghost, Send, Sparkles, Upload, FileText, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { uploadDocument, getDocuments, deleteDocument, sendChatMessage } from '../lib/api';
import type { RagDocument, ChatMessage } from '../lib/rag-types';

interface SuggestionChipProps {
  text: string;
  onClick?: () => void;
}

function SuggestionChip({ text, onClick }: SuggestionChipProps) {
  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1.5 text-[11px] text-phantom-600 bg-phantom-50/80 hover:bg-phantom-100 border border-phantom-200/80 hover:border-phantom-300 rounded-lg transition-all duration-150 whitespace-nowrap"
    >
      {text}
    </button>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getFileIcon(mimeType: string) {
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('presentation')) return '📊';
  if (mimeType.includes('markdown')) return '📝';
  return '📃';
}

export function AIChat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [documents, setDocuments] = useState<RagDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadDocuments = async () => {
    try {
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadDocument(file);
      await loadDocuments();
      setShowDocuments(true);
    } catch (error) {
      console.error('Upload failed:', error);
      alert(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await deleteDocument(id);
      await loadDocuments();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      isStreaming: true
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));

      await sendChatMessage(
        userMessage.content,
        history,
        {
          onSources: (sources) => {
            setMessages(prev => {
              const updated = [...prev];
              const lastIndex = updated.length - 1;
              if (updated[lastIndex]?.role === 'assistant') {
                updated[lastIndex] = { ...updated[lastIndex], sources };
              }
              return updated;
            });
          },
          onToken: (token) => {
            setMessages(prev => {
              const updated = [...prev];
              const lastIndex = updated.length - 1;
              if (updated[lastIndex]?.role === 'assistant') {
                updated[lastIndex] = {
                  ...updated[lastIndex],
                  content: updated[lastIndex].content + token
                };
              }
              return updated;
            });
          },
          onDone: () => {
            setMessages(prev => {
              const updated = [...prev];
              const lastIndex = updated.length - 1;
              if (updated[lastIndex]?.role === 'assistant') {
                updated[lastIndex] = { ...updated[lastIndex], isStreaming: false };
              }
              return updated;
            });
            setIsLoading(false);
          },
          onError: (error) => {
            console.error('Chat error:', error);
            setMessages(prev => {
              const updated = [...prev];
              const lastIndex = updated.length - 1;
              if (updated[lastIndex]?.role === 'assistant') {
                updated[lastIndex] = {
                  ...updated[lastIndex],
                  content: 'Sorry, an error occurred. Please try again.',
                  isStreaming: false
                };
              }
              return updated;
            });
            setIsLoading(false);
          }
        }
      );
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (updated[lastIndex]?.role === 'assistant') {
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: 'Sorry, an error occurred. Please try again.',
            isStreaming: false
          };
        }
        return updated;
      });
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (text: string) => {
    setMessage(text);
  };

  const toggleSources = (messageId: string) => {
    setExpandedSources(prev => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  };

  const readyDocuments = documents.filter(d => d.status === 'ready');

  return (
    <div className="rounded-xl border border-phantom-200/80 bg-white/80 backdrop-blur-sm flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-phantom-200/60 bg-phantom-50/30">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-phantom-900 font-semibold text-[13px]">Use the Phantom</h3>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-phantom-500">
              {readyDocuments.length} doc{readyDocuments.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => setShowDocuments(!showDocuments)}
              className="p-1.5 text-phantom-400 hover:text-phantom-600 hover:bg-phantom-100 rounded-md transition-all"
            >
              {showDocuments ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Agent Card */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/80 border border-phantom-200/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-sm">
              <Ghost className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-phantom-900 text-[13px] font-medium">Phantom Brain</span>
                <Sparkles className="w-3 h-3 text-violet-500" />
              </div>
              <span className="text-phantom-500 text-[11px]">RAG-powered AI</span>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.pptx,.txt,.md"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-lg transition-all disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        {/* Documents Panel */}
        {showDocuments && (
          <div className="mt-2.5 p-2.5 rounded-lg bg-white/60 border border-phantom-200/80 max-h-40 overflow-y-auto">
            {documents.length === 0 ? (
              <p className="text-phantom-400 text-[11px] text-center py-2">
                No documents uploaded yet
              </p>
            ) : (
              <div className="space-y-1.5">
                {documents.map(doc => (
                  <div
                    key={doc._id}
                    className="flex items-center justify-between p-2 rounded-md bg-phantom-50/50 hover:bg-phantom-50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">{getFileIcon(doc.mimeType)}</span>
                      <div className="min-w-0">
                        <p className="text-[11px] text-phantom-800 truncate">{doc.originalName}</p>
                        <p className="text-[10px] text-phantom-400">
                          {formatFileSize(doc.fileSize)} • {doc.chunkCount} chunks
                          {doc.status === 'processing' && ' • Processing...'}
                          {doc.status === 'error' && ' • Error'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteDocument(doc._id)}
                      className="p-1 text-phantom-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <>
            {/* Welcome Message */}
            <div className="flex gap-2.5 mb-5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Ghost className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-phantom-700 text-[13px] leading-relaxed">
                  {readyDocuments.length > 0
                    ? `I have access to ${readyDocuments.length} document${readyDocuments.length !== 1 ? 's' : ''}. Ask me anything about them!`
                    : 'Upload some documents and I\'ll help you find insights and craft perfect presentations.'}
                </p>
              </div>
            </div>

            {/* Suggestion Chips */}
            <div className="flex flex-wrap gap-1.5">
              <SuggestionChip text="Summarize all documents" onClick={() => handleSuggestionClick('Summarize all the documents')} />
              <SuggestionChip text="Find key insights" onClick={() => handleSuggestionClick('What are the key insights from these documents?')} />
              <SuggestionChip text="Help me write a Big Idea" onClick={() => handleSuggestionClick('Help me write a Big Idea based on these documents')} />
              <SuggestionChip text="What are the main topics?" onClick={() => handleSuggestionClick('What are the main topics discussed in the documents?')} />
            </div>
          </>
        ) : (
          <>
            {/* Message History */}
            {messages.map((msg) => (
              <div key={msg.id} className="mb-4">
                <div className="flex gap-2.5">
                  {msg.role === 'assistant' ? (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Ghost className="w-3.5 h-3.5 text-white" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-phantom-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-phantom-600 text-[11px] font-medium">You</span>
                    </div>
                  )}
                  <div className="flex-1 pt-0.5">
                    <p className="text-phantom-700 text-[13px] leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                      {msg.isStreaming && <span className="animate-pulse">|</span>}
                    </p>

                    {/* Sources */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2">
                        <button
                          onClick={() => toggleSources(msg.id)}
                          className="flex items-center gap-1 text-[11px] text-violet-600 hover:text-violet-700"
                        >
                          <FileText className="w-3 h-3" />
                          {msg.sources.length} source{msg.sources.length !== 1 ? 's' : ''}
                          {expandedSources.has(msg.id) ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>

                        {expandedSources.has(msg.id) && (
                          <div className="mt-2 space-y-1.5">
                            {msg.sources.map((source, idx) => (
                              <div
                                key={idx}
                                className="p-2 rounded-md bg-phantom-50/80 border border-phantom-200/60"
                              >
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="text-[10px] font-medium text-phantom-600">
                                    {source.filename}
                                  </span>
                                  <span className="text-[9px] text-phantom-400">
                                    ({(source.score * 100).toFixed(0)}% match)
                                  </span>
                                </div>
                                <p className="text-[11px] text-phantom-500 line-clamp-3">
                                  {source.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-phantom-200/60">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-phantom-50/80 border border-phantom-200/80 focus-within:border-violet-400 focus-within:bg-white transition-all">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={readyDocuments.length > 0 ? 'Ask about your documents...' : 'Upload documents to get started...'}
            className="flex-1 bg-transparent text-phantom-900 text-[13px] placeholder-phantom-400 focus:outline-none"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            className={`p-1.5 rounded-md transition-all duration-150 ${
              message.trim() && !isLoading
                ? 'bg-violet-500 text-white hover:bg-violet-600 shadow-sm'
                : 'text-phantom-300 cursor-not-allowed'
            }`}
            disabled={!message.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
