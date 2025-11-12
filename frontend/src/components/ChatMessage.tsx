import { FileText, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { DuckIcon } from './DuckIcon';
import { CodeBlock } from './CodeBlock';
import { MermaidDiagram } from './MermaidDiagram';
import { useState, useEffect, memo, useMemo } from 'react';
import 'katex/dist/katex.min.css';

interface Citation {
  source: string;
  page?: number | null;
  snippet?: string;
}

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  timestamp: Date;
}

export const ChatMessage = memo(function ChatMessage({ role, content, citations, timestamp }: ChatMessageProps) {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    // Only set up ONE observer for dark mode changes
    const checkDarkMode = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };
    
    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  // Memoize markdown components to prevent recreation
  const markdownComponents = useMemo(() => ({
    code: ({node, inline, className, children, ...props}: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const value = String(children).replace(/\n$/, '');
      
      if (language === 'mermaid') {
        return <MermaidDiagram chart={value} />;
      }
      
      if (inline) {
        return (
          <code 
            className="bg-muted px-1.5 py-0.5 text-[0.875em] font-mono" 
            style={{ borderRadius: 'var(--radius)' }} 
            {...props}
          >
            {children}
          </code>
        );
      }
      
      return (
        <CodeBlock 
          language={language} 
          value={value} 
          theme={isDark ? 'dark' : 'light'}
        />
      );
    },
    p: ({node, children, ...props}: any) => (
      <p className="mb-3 last:mb-0 leading-7" {...props}>{children}</p>
    ),
    ul: ({node, children, ...props}: any) => (
      <ul className="my-3 space-y-2 [&_ul]:my-2 [&_ul]:space-y-1" style={{ listStyle: 'disc', listStylePosition: 'outside', paddingLeft: '1.5rem' }} {...props}>{children}</ul>
    ),
    ol: ({node, children, ...props}: any) => (
      <ol className="my-3 space-y-2 [&_ol]:my-2 [&_ol]:space-y-1" style={{ listStyle: 'decimal', listStylePosition: 'outside', paddingLeft: '1.5rem' }} {...props}>{children}</ol>
    ),
    li: ({node, children, ...props}: any) => (
      <li className="leading-7 [&>ul]:mt-2 [&>ul]:pl-4 [&>ol]:mt-2 [&>ol]:pl-4" style={{ display: 'list-item', paddingLeft: '0.25rem' }} {...props}>{children}</li>
    ),
    table: ({node, children, ...props}: any) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border-collapse border border-border" {...props}>{children}</table>
      </div>
    ),
    thead: ({node, children, ...props}: any) => (
      <thead className="bg-muted" {...props}>{children}</thead>
    ),
    tbody: ({node, children, ...props}: any) => (
      <tbody {...props}>{children}</tbody>
    ),
    tr: ({node, children, ...props}: any) => (
      <tr className="border-b border-border" {...props}>{children}</tr>
    ),
    td: ({node, children, ...props}: any) => (
      <td className="px-4 py-2 text-sm" {...props}>{children}</td>
    ),
    th: ({node, children, ...props}: any) => (
      <th className="px-4 py-2 text-left text-sm font-semibold" {...props}>{children}</th>
    ),
    h1: ({node, children, ...props}: any) => (
      <h1 className="mb-2 mt-3 first:mt-0" style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: '2rem' }} {...props}>{children}</h1>
    ),
    h2: ({node, children, ...props}: any) => (
      <h2 className="mb-2 mt-3 first:mt-0" style={{ fontSize: '1.25rem', fontWeight: 600, lineHeight: '2rem' }} {...props}>{children}</h2>
    ),
    h3: ({node, children, ...props}: any) => (
      <h3 className="mb-2 mt-2 first:mt-0" style={{ fontSize: '1.125rem', fontWeight: 600, lineHeight: '1.75rem' }} {...props}>{children}</h3>
    ),
    blockquote: ({node, children, ...props}: any) => (
      <blockquote className="border-l-4 border-primary pl-4 my-3 italic" {...props}>{children}</blockquote>
    ),
    a: ({node, children, ...props}: any) => (
      <a className="text-primary hover:underline" {...props}>{children}</a>
    ),
  }), [isDark]);

  // Clean up snippet text with excessive spaces (from PDF extraction)
  const cleanSnippet = (text: string) => {
    return text
      .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
      .replace(/([a-z])\s+([a-z])/gi, '$1$2')  // Remove spaces between letters
      .trim();
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0">
          <DuckIcon size={40} />
        </div>
      )}
      
      <div className={`max-w-[70%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="relative group w-full">
          {!isUser && (
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1.5 bg-card/80 hover:bg-muted border border-border opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ borderRadius: 'var(--radius)' }}
              title={copied ? 'Copied!' : 'Copy message'}
            >
              {copied ? (
                <Check className="w-4 h-4 text-accent" />
              ) : (
                <Copy className="w-4 h-4 text-foreground" />
              )}
            </button>
          )}
          <div 
            className={`px-4 py-3 ${
            isUser 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-card border border-border'
          }`}
          style={{ borderRadius: 'var(--radius-card)' }}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeRaw]}
                components={markdownComponents}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
          </div>
        </div>
        
        {citations && citations.length > 0 && (
          <div className="mt-2">
            <label className="text-sm font-medium text-foreground mb-2 block">Sources</label>
            <div className="flex flex-col gap-1.5">
              {(() => {
                // Group citations by document source
                const grouped = citations.reduce((acc, citation) => {
                  const source = citation.source || 'Unknown';
                  if (!acc[source]) {
                    acc[source] = [];
                  }
                  if (citation.page) {
                    acc[source].push(citation.page);
                  }
                  return acc;
                }, {} as Record<string, number[]>);

                // Render each document once with its pages
                return Object.entries(grouped).map(([source, pages]) => {
                  // Remove duplicates and sort pages
                  const uniquePages = [...new Set(pages)].sort((a, b) => a - b);
                  
                  return (
                    <div
                      key={source}
                      className="flex items-start gap-2 px-3 py-2 bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors"
                      style={{ borderRadius: 'var(--radius)' }}
                    >
                      <FileText className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate" title={source}>
                          {source}
                        </p>
                        {uniquePages.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {uniquePages.length === 1 
                              ? `Page ${uniquePages[0]}`
                              : `Pages ${uniquePages.join(', ')}`
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}
        
        <span className="text-xs text-muted-foreground mt-1.5">
          {timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="currentColor"/>
            <path d="M12 14C13.66 14 15 12.66 15 11C15 9.34 13.66 8 12 8C10.34 8 9 9.34 9 11C9 12.66 10.34 14 12 14Z" fill="white"/>
            <path d="M6 18.5C6.5 16.5 8.5 15 12 15C15.5 15 17.5 16.5 18 18.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      )}
    </div>  
  );
});
