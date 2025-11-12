import { X, File, Trash2, CheckCircle, Clock, AlertCircle, MessageSquareOff } from 'lucide-react';

interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  status: 'processing' | 'ready' | 'error';
  pagesProcessed?: number;
  totalPages?: number;
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  documents: UploadedDocument[];
  onDeleteDocument: (id: string) => void;
  onClearHistory?: () => void;
}

export function SettingsPanel({ isOpen, onClose, documents, onDeleteDocument, onClearHistory }: SettingsPanelProps) {
  if (!isOpen) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);
  const readyDocs = documents.filter(d => d.status === 'ready').length;
  const processingDocs = documents.filter(d => d.status === 'processing').length;
  const errorDocs = documents.filter(d => d.status === 'error').length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
      <div
        className="bg-card max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        style={{ borderRadius: 'var(--radius-card)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3>Settings</h3>
            <label className="text-muted-foreground">Manage your documents and preferences</label>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary transition-colors"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 p-6 border-b border-border">
          <div className="p-4 bg-secondary" style={{ borderRadius: 'var(--radius-card)' }}>
            <label className="text-muted-foreground block mb-1">Total Documents</label>
            <p className="text-2xl">{documents.length}</p>
          </div>
          <div className="p-4 bg-secondary" style={{ borderRadius: 'var(--radius-card)' }}>
            <label className="text-muted-foreground block mb-1">Ready</label>
            <p className="text-2xl text-accent">{readyDocs}</p>
          </div>
          <div className="p-4 bg-secondary" style={{ borderRadius: 'var(--radius-card)' }}>
            <label className="text-muted-foreground block mb-1">Processing</label>
            <p className="text-2xl">{processingDocs}</p>
          </div>
          <div className="p-4 bg-secondary" style={{ borderRadius: 'var(--radius-card)' }}>
            <label className="text-muted-foreground block mb-1">Total Size</label>
            <p className="text-2xl">{formatFileSize(totalSize)}</p>
          </div>
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 flex items-center justify-between">
            <h4>Uploaded Documents</h4>
            {documents.length > 0 && (
              <label className="text-muted-foreground">
                {documents.length} document{documents.length !== 1 ? 's' : ''}
              </label>
            )}
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <File className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-2">No documents uploaded yet</p>
              <label className="text-muted-foreground">Upload documents to start asking questions</label>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map(doc => (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 p-4 bg-secondary border border-border group"
                  style={{ borderRadius: 'var(--radius-card)' }}
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                      <File className="w-6 h-6 text-accent-foreground" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="truncate mb-1">{doc.name}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <label className="text-muted-foreground">
                        {formatFileSize(doc.size)}
                      </label>
                      <span className="text-muted-foreground">•</span>
                      <label className="text-muted-foreground">
                        {formatDate(doc.uploadedAt)}
                      </label>
                      {doc.totalPages && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <label className="text-muted-foreground">
                            {doc.totalPages} page{doc.totalPages !== 1 ? 's' : ''}
                          </label>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {doc.status === 'ready' && (
                      <div
                        className="flex items-center gap-2 px-3 py-1.5 bg-accent/20 text-accent-foreground"
                        style={{ borderRadius: 'var(--radius)' }}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <label>Ready</label>
                      </div>
                    )}
                    {doc.status === 'processing' && (
                      <div
                        className="flex items-center gap-2 px-3 py-1.5 bg-muted"
                        style={{ borderRadius: 'var(--radius)' }}
                      >
                        <Clock className="w-4 h-4" />
                        <label>Processing</label>
                      </div>
                    )}
                    {doc.status === 'error' && (
                      <div
                        className="flex items-center gap-2 px-3 py-1.5 bg-destructive/20 text-destructive-foreground"
                        style={{ borderRadius: 'var(--radius)' }}
                      >
                        <AlertCircle className="w-4 h-4" />
                        <label>Error</label>
                      </div>
                    )}

                    <button
                      onClick={() => onDeleteDocument(doc.id)}
                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                      style={{ borderRadius: 'var(--radius)' }}
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          {onClearHistory && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20" style={{ borderRadius: 'var(--radius-card)' }}>
              <div className="flex items-start gap-3">
                <MessageSquareOff className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-destructive mb-1">Clear Chat History</p>
                  <label className="text-sm text-muted-foreground mb-3 block">
                    This will delete all conversations from your browser. This action cannot be undone.
                  </label>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
                        onClearHistory();
                      }
                    }}
                    className="px-4 py-2 transition-all text-sm font-medium"
                    style={{ 
                      borderRadius: 'var(--radius-button)',
                      backgroundColor: '#000000',
                      color: '#900d0dffff',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1a1a1a';
                      e.currentTarget.style.color = '#ef4444';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#000000';
                      e.currentTarget.style.color = '#dc2626';
                    }}
                  >
                    Clear All Conversations
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <label className="text-muted-foreground">
              Documents are processed using LangChain and stored in vector embeddings
            </label>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              style={{ borderRadius: 'var(--radius-button)' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
