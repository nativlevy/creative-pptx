import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Upload, FileText, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { uploadDocument, getDocuments, deleteDocument, sendChatMessage, seedSampleData } from '../lib/api';
import type { RagDocument, ChatMessage } from '../lib/rag-types';

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

export function ChatbotPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [documents, setDocuments] = useState<RagDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initializeDocuments();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeDocuments = async () => {
    try {
      const docs = await getDocuments();
      if (docs.length === 0) {
        // Auto-seed sample data if no documents exist
        setIsSeeding(true);
        try {
          const result = await seedSampleData();
          if (result.seeded) {
            console.log('Sample data seeded:', result);
            // Reload documents after seeding
            const newDocs = await getDocuments();
            setDocuments(newDocs);
          }
        } catch (seedError) {
          console.error('Failed to seed sample data:', seedError);
        } finally {
          setIsSeeding(false);
        }
      } else {
        setDocuments(docs);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

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
            setTimeout(() => inputRef.current?.focus(), 100);
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
            setTimeout(() => inputRef.current?.focus(), 100);
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
      setTimeout(() => inputRef.current?.focus(), 100);
    }
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
    <div className="flex-1 flex overflow-hidden">
      {/* Documents Sidebar */}
      <div className="w-72 border-r border-phantom-200 bg-white/50 flex flex-col">
        <div className="p-4 border-b border-phantom-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-phantom-900">Documents</h2>
            <span className="text-xs text-phantom-500 bg-phantom-100 px-2 py-0.5 rounded-full">
              {readyDocuments.length}
            </span>
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
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-500 text-white text-sm font-medium rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {isUploading ? 'Processing...' : 'Upload Document'}
          </button>
          <p className="text-[10px] text-phantom-400 mt-2 text-center">
            PDF, PPTX, TXT, MD supported
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-10 h-10 text-phantom-300 mx-auto mb-3" />
              <p className="text-sm text-phantom-500">No documents yet</p>
              <p className="text-xs text-phantom-400 mt-1">Upload files to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map(doc => (
                <div
                  key={doc._id}
                  className="group p-3 rounded-lg bg-white border border-phantom-200 hover:border-phantom-300 transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-xl">{getFileIcon(doc.mimeType)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-phantom-800 truncate">
                        {doc.originalName}
                      </p>
                      <p className="text-xs text-phantom-500 mt-0.5">
                        {formatFileSize(doc.fileSize)}
                        {doc.status === 'ready' && ` · ${doc.chunkCount} chunks`}
                      </p>
                      {doc.status === 'processing' && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Loader2 className="w-3 h-3 animate-spin text-violet-500" />
                          <span className="text-xs text-violet-600">Processing...</span>
                        </div>
                      )}
                      {doc.status === 'error' && (
                        <p className="text-xs text-red-500 mt-1">Error processing file</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteDocument(doc._id)}
                      className="p-1 text-phantom-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-phantom-50/50 to-white">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-phantom-200 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <img
              src="https://leave-mark.com/pp/wp-content/uploads/2021/11/%D7%9C%D7%95%D7%92%D7%95-%D7%9C%D7%99%D7%91-%D7%90-%D7%90%D7%9E%D7%90%D7%A8%D7%A7-%D7%97%D7%93%D7%A9.png"
              alt="Leave a Mark Brain"
              className="w-10 h-10 object-contain"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-phantom-900">Leave a Mark Brain</h1>
                <Sparkles className="w-4 h-4 text-violet-500" />
              </div>
              <p className="text-xs text-phantom-500">
                {readyDocuments.length > 0
                  ? `${readyDocuments.length} document${readyDocuments.length !== 1 ? 's' : ''} loaded`
                  : 'Upload documents to enable RAG'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {messages.length === 0 ? (
            <div className="max-w-2xl mx-auto text-center py-16">
              <img
                src="https://leave-mark.com/pp/wp-content/uploads/2021/11/%D7%9C%D7%95%D7%92%D7%95-%D7%9C%D7%99%D7%91-%D7%90-%D7%90%D7%9E%D7%90%D7%A8%D7%A7-%D7%97%D7%93%D7%A9.png"
                alt="Leave a Mark Brain"
                className="w-16 h-16 mx-auto mb-5 object-contain"
              />
              <h2 className="text-xl font-semibold text-phantom-900 mb-2">
                Welcome to Leave a Mark Brain
              </h2>
              {isSeeding ? (
                <div className="flex items-center justify-center gap-2 text-phantom-500 mb-8">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading sample marketing content...</span>
                </div>
              ) : (
                <p className="text-phantom-500 mb-8 max-w-md mx-auto">
                  {readyDocuments.length > 0
                    ? 'Ask me anything about Leave a Mark services, case studies, and marketing insights.'
                    : 'Upload some documents using the sidebar, then ask me questions about them.'}
                </p>
              )}
              {readyDocuments.length > 0 && !isSeeding && (
                <div className="flex flex-wrap justify-center gap-2">
                  {['What services does Leave a Mark offer?', 'Tell me about the case studies', 'What makes Leave a Mark different?'].map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => setMessage(suggestion)}
                      className="px-4 py-2 text-sm text-phantom-600 bg-white border border-phantom-200 rounded-lg hover:border-violet-300 hover:text-violet-600 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && (
                    <img
                      src="https://leave-mark.com/pp/wp-content/uploads/2021/11/%D7%9C%D7%95%D7%92%D7%95-%D7%9C%D7%99%D7%91-%D7%90-%D7%90%D7%9E%D7%90%D7%A8%D7%A7-%D7%97%D7%93%D7%A9.png"
                      alt="Leave a Mark Brain"
                      className="w-8 h-8 object-contain flex-shrink-0"
                    />
                  )}
                  <div className={`flex-1 max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block px-4 py-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-violet-500 text-white rounded-br-md'
                        : 'bg-white border border-phantom-200 text-phantom-700 rounded-bl-md'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <div className="text-sm leading-relaxed prose prose-sm prose-phantom max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-headings:text-phantom-800 prose-headings:font-semibold prose-h1:text-base prose-h2:text-sm prose-h3:text-[13px] prose-code:text-violet-600 prose-code:bg-violet-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[12px] prose-code:before:content-none prose-code:after:content-none prose-pre:bg-phantom-900 prose-pre:text-phantom-100 prose-pre:text-[12px] prose-a:text-violet-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-phantom-800">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                          {msg.isStreaming && <span className="animate-pulse">|</span>}
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      )}
                    </div>

                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2">
                        <button
                          onClick={() => toggleSources(msg.id)}
                          className="inline-flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-700"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          {msg.sources.length} source{msg.sources.length !== 1 ? 's' : ''}
                          {expandedSources.has(msg.id) ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {expandedSources.has(msg.id) && (
                          <div className="mt-2 space-y-2">
                            {msg.sources.map((source, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded-lg bg-phantom-50 border border-phantom-200"
                              >
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="text-xs font-medium text-phantom-700">
                                    {source.filename}
                                  </span>
                                  <span className="text-[10px] text-phantom-400 bg-phantom-100 px-1.5 py-0.5 rounded">
                                    {(source.score * 100).toFixed(0)}% match
                                  </span>
                                </div>
                                <p className="text-xs text-phantom-500 line-clamp-3">
                                  {source.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-phantom-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-phantom-600 text-xs font-medium">You</span>
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-phantom-200 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-phantom-50 border border-phantom-200 focus-within:border-violet-400 focus-within:bg-white transition-all">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={readyDocuments.length > 0 ? 'Ask about your documents...' : 'Upload documents to start chatting...'}
                className="flex-1 bg-transparent text-phantom-900 text-sm placeholder-phantom-400 focus:outline-none"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className={`p-2 rounded-lg transition-all ${
                  message.trim() && !isLoading
                    ? 'bg-violet-500 text-white hover:bg-violet-600 shadow-sm'
                    : 'bg-phantom-200 text-phantom-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
