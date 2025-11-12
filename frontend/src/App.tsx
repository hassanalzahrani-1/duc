import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Settings, Moon, Sun, X, FileText, Filter, Check } from 'lucide-react';
import axios from 'axios';
import { ChatMessage } from './components/ChatMessage';
import { DocumentUpload } from './components/DocumentUpload';
import { ConversationList } from './components/ConversationList';
import { DuckIcon } from './components/DuckIcon';
import { SettingsPanel } from './components/SettingsPanel';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: {
    source: string;
    page?: number | null;
    snippet?: string;
  }[];
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
  messages: Message[];
  selectedDocuments: string[]; // Documents to search for this conversation
}

interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  status: 'processing' | 'ready' | 'error';
  pagesProcessed?: number;
  totalPages?: number;
}

const STORAGE_KEY = 'duc_conversations';
const ACTIVE_CONV_KEY = 'duc_active_conversation';

// Helper to load conversations from localStorage
const loadConversations = (): Conversation[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert timestamp strings back to Date objects
      return parsed.map((conv: any) => ({
        ...conv,
        timestamp: new Date(conv.timestamp),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    }
  } catch (error) {
    console.error('Error loading conversations from localStorage:', error);
  }
  return [];
};

// Helper to save conversations to localStorage
const saveConversations = (convs: Conversation[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
  } catch (error) {
    console.error('Error saving conversations to localStorage:', error);
  }
};

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(loadConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ACTIVE_CONV_KEY);
    } catch {
      return null;
    }
  });

  // Helper to strip markdown from text for clean display
  const stripMarkdown = (text: string): string => {
    return text
      .replace(/^#{1,6}\s+/gm, '') // Remove headings (start of line)
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links, keep text
      .replace(/\*\*\*(.+?)\*\*\*/g, '$1') // Remove bold+italic
      .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.+?)\*/g, '$1') // Remove italic
      .replace(/__(.+?)__/g, '$1') // Remove underline bold
      .replace(/_(.+?)_/g, '$1') // Remove underline italic
      .replace(/~~(.+?)~~/g, '$1') // Remove strikethrough
      .replace(/`{3}[\s\S]*?`{3}/g, '') // Remove code blocks
      .replace(/`(.+?)`/g, '$1') // Remove inline code
      .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
      .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
      .replace(/^\s*>\s+/gm, '') // Remove blockquotes
      .replace(/\n+/g, ' ') // Replace newlines with space
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  };
  const [inputMessage, setInputMessage] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [showDocumentSelector, setShowDocumentSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      saveConversations(conversations);
    }
  }, [conversations]);

  // Save active conversation ID to localStorage
  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem(ACTIVE_CONV_KEY, activeConversationId);
    }
  }, [activeConversationId]);

  // Load documents from backend on mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.get('/api/documents');
        if (response.data.documents && response.data.documents.length > 0) {
          setUploadedDocuments(response.data.documents.map((doc: any) => ({
            id: doc.upload_id || Date.now().toString(),
            name: doc.filename,
            size: doc.file_size || 0,
            uploadedAt: doc.upload_timestamp ? new Date(doc.upload_timestamp) : new Date(),
            status: 'ready' as const,
            pagesProcessed: doc.chunks,
            totalPages: doc.chunks,
          })));
          
          // Create initial conversation if we have documents but no conversations
          if (conversations.length === 0) {
            handleNewConversation();
          }
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setDocumentsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleSuggestedPrompt = async (question: string) => {
    if (!activeConversation || loading) return;
    setInputMessage(question);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    };

    // Add user message immediately and update title if first message
    setConversations(prev =>
      prev.map(conv =>
        conv.id === activeConversationId
          ? {
              ...conv,
              title: conv.messageCount === 0 ? question.substring(0, 50) + (question.length > 50 ? '...' : '') : conv.title,
              messages: [...conv.messages, userMessage],
              lastMessage: stripMarkdown(question).substring(0, 60) + (question.length > 60 ? '...' : ''),
              timestamp: new Date(),
              messageCount: conv.messageCount + 1,
            }
          : conv
      )
    );

    setInputMessage('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('question', question);
      formData.append('session_id', activeConversationId || '');
      
      if (activeConversation?.selectedDocuments && activeConversation.selectedDocuments.length > 0) {
        formData.append('documents', activeConversation.selectedDocuments.join(','));
      }

      const response = await axios.post('/api/chat', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.answer,
        citations: response.data.citations || [],
        timestamp: new Date(),
      };

      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [...conv.messages, assistantMessage],
                lastMessage: stripMarkdown(assistantMessage.content).substring(0, 60) + (assistantMessage.content.length > 60 ? '...' : ''),
                timestamp: new Date(),
                messageCount: conv.messageCount + 1,
              }
            : conv
        )
      );
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };

      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [...conv.messages, errorMessage],
                lastMessage: stripMarkdown(errorMessage.content).substring(0, 60) + (errorMessage.content.length > 60 ? '...' : ''),
                timestamp: new Date(),
                messageCount: conv.messageCount + 1,
              }
            : conv
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeConversation || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    // Add user message immediately and update title if first message
    setConversations(prev =>
      prev.map(conv =>
        conv.id === activeConversationId
          ? {
              ...conv,
              title: conv.messageCount === 0 ? inputMessage.substring(0, 50) + (inputMessage.length > 50 ? '...' : '') : conv.title,
              messages: [...conv.messages, userMessage],
              lastMessage: stripMarkdown(inputMessage).substring(0, 60) + (inputMessage.length > 60 ? '...' : ''),
              timestamp: new Date(),
              messageCount: conv.messageCount + 1,
            }
          : conv
      )
    );

    setInputMessage('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('question', inputMessage);
      formData.append('session_id', activeConversationId || '');
      
      // Add document filter if specific documents are selected for this conversation
      if (activeConversation?.selectedDocuments && activeConversation.selectedDocuments.length > 0) {
        formData.append('documents', activeConversation.selectedDocuments.join(','));
      }

      const response = await axios.post('/api/chat', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.answer,
        citations: response.data.citations || [],
        timestamp: new Date(),
      };

      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [...conv.messages, assistantMessage],
                lastMessage: stripMarkdown(assistantMessage.content).substring(0, 60) + (assistantMessage.content.length > 60 ? '...' : ''),
                timestamp: new Date(),
                messageCount: conv.messageCount + 1,
              }
            : conv
        )
      );
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };

      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [...conv.messages, errorMessage],
                lastMessage: stripMarkdown(errorMessage.content).substring(0, 60) + (errorMessage.content.length > 60 ? '...' : ''),
                timestamp: new Date(),
                messageCount: conv.messageCount + 1,
              }
            : conv
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      lastMessage: '',
      timestamp: new Date(),
      messageCount: 0,
      messages: [],
      selectedDocuments: [], // Default: search all documents
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
  };

  const handleDeleteConversation = (id: string) => {
    const remainingConvs = conversations.filter(c => c.id !== id);
    setConversations(remainingConvs);
    
    // Clear localStorage if no conversations left
    if (remainingConvs.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ACTIVE_CONV_KEY);
      setActiveConversationId(null);
    } else if (activeConversationId === id) {
      // Switch to first remaining conversation
      setActiveConversationId(remainingConvs[0].id);
    }
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === id ? { ...conv, title: newTitle } : conv
      )
    );
  };

  const handleClearHistory = () => {
    // Clear all conversations and create a fresh one
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      lastMessage: '',
      timestamp: new Date(),
      messageCount: 0,
      messages: [],
      selectedDocuments: [],
    };
    
    setConversations([newConversation]);
    setActiveConversationId(newConversation.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newConversation]));
    localStorage.setItem(ACTIVE_CONV_KEY, newConversation.id);
    setShowSettingsPanel(false);
  };

  const handleDeleteDocument = async (id: string) => {
    const doc = uploadedDocuments.find(d => d.id === id);
    if (!doc) return;

    try {
      // Delete from backend
      await axios.delete(`/api/documents/${encodeURIComponent(doc.name)}`);
      
      // Remove from local state
      setUploadedDocuments(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document. Please try again.');
    }
  };

  const toggleDocumentSelection = (filename: string) => {
    if (!activeConversationId) return;
    
    setConversations(prev =>
      prev.map(conv =>
        conv.id === activeConversationId
          ? {
              ...conv,
              selectedDocuments: conv.selectedDocuments.includes(filename)
                ? conv.selectedDocuments.filter(d => d !== filename)
                : [...conv.selectedDocuments, filename]
            }
          : conv
      )
    );
  };

  const clearDocumentSelection = () => {
    if (!activeConversationId) return;
    
    setConversations(prev =>
      prev.map(conv =>
        conv.id === activeConversationId
          ? { ...conv, selectedDocuments: [] }
          : conv
      )
    );
  };

  const selectAllDocuments = () => {
    if (!activeConversationId) return;
    
    setConversations(prev =>
      prev.map(conv =>
        conv.id === activeConversationId
          ? { ...conv, selectedDocuments: uploadedDocuments.map(d => d.name) }
          : conv
      )
    );
  };

  const handleUploadComplete = async () => {
    // Reload documents from backend
    try {
      const response = await axios.get('/api/documents');
      if (response.data.documents && response.data.documents.length > 0) {
        setUploadedDocuments(response.data.documents.map((doc: any) => ({
          id: doc.upload_id || Date.now().toString(),
          name: doc.filename,
          size: doc.file_size || 0,
          uploadedAt: doc.upload_timestamp ? new Date(doc.upload_timestamp) : new Date(),
          status: 'ready' as const,
          pagesProcessed: doc.chunks,
          totalPages: doc.chunks,
        })));
        
        // Create a conversation if none exists
        if (conversations.length === 0) {
          handleNewConversation();
        }
      }
    } catch (error) {
      console.error('Error reloading documents:', error);
    }
    
    setShowUploadModal(false);
  };

  return (
    <div className="h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0">
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={handleRenameConversation}
        />
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <DuckIcon size={40} />
            <div>
              <h4>{activeConversation?.title || 'Duc'}</h4>
              <label className="text-muted-foreground">Intelligent Document Assistant</label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 hover:bg-secondary transition-colors"
              style={{ borderRadius: 'var(--radius-button)' }}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowSettingsPanel(true)}
              className="p-2.5 hover:bg-secondary transition-colors"
              style={{ borderRadius: 'var(--radius-button)' }}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-transparent">
          {!activeConversation || activeConversation?.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center">
              <div className="animate-float mb-8">
                <div className="w-40 h-40 rounded-full flex items-center justify-center">
                  <DuckIcon size={140} />
                </div>
              </div>
              <h2 className="mb-3 text-2xl font-bold">Welcome to Duc</h2>
              <p className="text-muted-foreground mb-8 max-w-md text-lg">
                Your intelligent document assistant powered by LangChain. Upload documents and ask questions to get accurate, source-backed answers.
              </p>
              
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-6 py-3 bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                style={{ borderRadius: 'var(--radius-button)' }}
              >
                Upload Documents to Get Started
              </button>

              <div className="grid grid-cols-2 gap-4 mt-12 w-full max-w-2xl">
                {[
                  { title: 'Summarize', question: 'Summarize the key points from my documents' },
                  { title: 'Extract Info', question: 'What are the main topics discussed in the documents?' },
                  { title: 'Find Details', question: 'Find specific information about deadlines and dates' },
                  { title: 'Compare', question: 'Compare and contrast different sections of the documents' },
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedPrompt(example.question)}
                    className="p-4 text-left bg-card border border-border hover:border-accent transition-colors h-28 flex flex-col"
                    style={{ borderRadius: 'var(--radius-card)' }}
                  >
                    <p className="mb-2 font-medium">{example.title}</p>
                    <label className="text-muted-foreground text-sm line-clamp-2">
                      {example.question}
                    </label>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {activeConversation?.messages.map(message => (
                <ChatMessage key={message.id} {...message} />
              ))}
              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0">
                    <DuckIcon size={40} />
                  </div>
                  <div className="px-4 py-3 bg-card border border-border" style={{ borderRadius: 'var(--radius-card)' }}>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>


        {/* Input Area */}
        <div className="border-t border-border p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <button
                onClick={() => setShowUploadModal(true)}
                className="p-3 hover:bg-secondary transition-colors flex-shrink-0"
                style={{ borderRadius: 'var(--radius-button)' }}
                title="Upload documents"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              
              {/* Compact Document Filter Button */}
              {uploadedDocuments.length > 0 && activeConversation && (
                <button
                  onClick={() => setShowDocumentSelector(true)}
                  className={`p-3 hover:bg-secondary transition-colors flex-shrink-0 relative ${
                    activeConversation.selectedDocuments.length > 0 ? 'bg-primary/10 text-primary' : ''
                  }`}
                  style={{ borderRadius: 'var(--radius-button)' }}
                  title={
                    activeConversation.selectedDocuments.length === 0
                      ? 'Filter documents (All)'
                      : `Filter documents (${activeConversation.selectedDocuments.length} selected)`
                  }
                >
                  <Filter className="w-5 h-5" />
                  {activeConversation.selectedDocuments.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-semibold">
                      {activeConversation.selectedDocuments.length}
                    </span>
                  )}
                </button>
              )}
              
              <div className="flex-1 relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask a question about your documents..."
                  className="w-full px-4 py-3 bg-input-background border border-border resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  style={{ borderRadius: 'var(--radius)' }}
                  rows={1}
                />
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="p-3 bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                style={{ borderRadius: 'var(--radius-button)' }}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div 
            className="bg-card max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
            style={{ borderRadius: 'var(--radius-card)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3>Upload Documents</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-secondary transition-colors"
                style={{ borderRadius: 'var(--radius)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <DocumentUpload onUploadComplete={handleUploadComplete} />
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-5 py-2.5 hover:bg-secondary transition-colors"
                style={{ borderRadius: 'var(--radius-button)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-5 py-2.5 bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                style={{ borderRadius: 'var(--radius-button)' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettingsPanel}
        onClose={() => setShowSettingsPanel(false)}
        documents={uploadedDocuments}
        onDeleteDocument={handleDeleteDocument}
        onClearHistory={handleClearHistory}
      />

      {/* Document Selector Modal */}
      {showDocumentSelector && activeConversation && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDocumentSelector(false)}
        >
          <div 
            className="bg-card border border-border p-6 max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
            style={{ borderRadius: 'var(--radius-large)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Filter Documents</h3>
              </div>
              <button
                onClick={() => setShowDocumentSelector(false)}
                className="p-2 hover:bg-secondary transition-colors"
                style={{ borderRadius: 'var(--radius)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status */}
            <div className="mb-4 p-3 bg-secondary/30" style={{ borderRadius: 'var(--radius)' }}>
              <p className="text-sm text-muted-foreground">
                {activeConversation.selectedDocuments.length === 0 ? (
                  <>Searching in <span className="font-semibold text-foreground">all {uploadedDocuments.length} documents</span></>
                ) : (
                  <>Searching in <span className="font-semibold text-foreground">{activeConversation.selectedDocuments.length} of {uploadedDocuments.length} documents</span></>
                )}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={selectAllDocuments}
                className="flex-1 px-3 py-2 text-sm hover:bg-secondary transition-colors"
                style={{ borderRadius: 'var(--radius)' }}
              >
                Select All
              </button>
              <button
                onClick={clearDocumentSelection}
                className="flex-1 px-3 py-2 text-sm hover:bg-secondary transition-colors"
                style={{ borderRadius: 'var(--radius)' }}
              >
                Clear All
              </button>
            </div>

            {/* Document List */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {uploadedDocuments.map(doc => {
                const isSelected = activeConversation.selectedDocuments.includes(doc.name);
                return (
                  <button
                    key={doc.id}
                    onClick={() => toggleDocumentSelection(doc.name)}
                    className={`w-full p-3 text-left transition-colors flex items-start gap-3 ${
                      isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-secondary border-border'
                    } border`}
                    style={{ borderRadius: 'var(--radius)' }}
                  >
                    {/* Checkbox */}
                    <div className={`w-5 h-5 flex-shrink-0 border-2 flex items-center justify-center ${
                      isSelected ? 'bg-primary border-primary' : 'border-border'
                    }`} style={{ borderRadius: 'var(--radius-sm)' }}>
                      {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                    </div>
                    
                    {/* Document Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <p className="font-medium truncate">{doc.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {doc.pagesProcessed || 0} chunks • {doc.status}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <button
                onClick={() => setShowDocumentSelector(false)}
                className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
                style={{ borderRadius: 'var(--radius-button)' }}
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}