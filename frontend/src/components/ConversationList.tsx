import { useState } from 'react';
import { MessageSquare, Plus, Trash2, Pencil } from 'lucide-react';
import { DuckIcon } from './DuckIcon';

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
}: ConversationListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartEdit = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveEdit = (id: string) => {
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-full flex flex-col bg-sidebar border-r border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border">
        <button
          onClick={onNewConversation}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-sidebar-primary text-sidebar-primary-foreground hover:opacity-90 transition-opacity"
          style={{ borderRadius: 'var(--radius-button)' }}
        >
          <Plus className="w-5 h-5" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {conversations.map(conversation => (
            <div
              key={conversation.id}
              className={`group relative px-3 py-3 cursor-pointer transition-colors ${
                activeConversationId === conversation.id
                  ? 'bg-sidebar-accent'
                  : 'hover:bg-sidebar-accent'
              }`}
              style={{ borderRadius: 'var(--radius)' }}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex items-start gap-3">
                <MessageSquare className="w-4 h-4 text-sidebar-foreground/60 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  {editingId === conversation.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(conversation.id);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      onBlur={() => handleSaveEdit(conversation.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-2 py-1 bg-background border border-border text-sm"
                      style={{ borderRadius: 'var(--radius)' }}
                      autoFocus
                    />
                  ) : (
                    <p className="truncate mb-1">
                      {conversation.title}
                    </p>
                  )}
                  <label className="text-sidebar-foreground/60 truncate block">
                    {conversation.lastMessage}
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <label className="text-sidebar-foreground/40">
                      {formatTimestamp(conversation.timestamp)}
                    </label>
                    <span className="text-sidebar-foreground/40">•</span>
                    <label className="text-sidebar-foreground/40">
                      {conversation.messageCount} messages
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartEdit(conversation.id, conversation.title);
                  }}
                  className="p-1.5 hover:bg-sidebar-border transition-colors"
                  style={{ borderRadius: 'var(--radius)' }}
                  title="Rename chat"
                >
                  <Pencil className="w-4 h-4 text-sidebar-foreground/60" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                  className="p-1.5 hover:bg-sidebar-border transition-colors"
                  style={{ borderRadius: 'var(--radius)' }}
                  title="Delete chat"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <DuckIcon size={40} />
          </div>
          <div>
            <p>Duc Assistant</p>
            <label className="text-sidebar-foreground/60">Powered by LangChain</label>
          </div>
        </div>
      </div>
    </div>
  );
}