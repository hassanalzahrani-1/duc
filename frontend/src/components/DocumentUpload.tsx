import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
}

interface DocumentUploadProps {
  onUploadComplete?: (files: UploadedFile[]) => void;
}

export function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    const newFiles: UploadedFile[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      status: 'uploading' as const,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Upload each file to the backend
    for (const file of files) {
      const uploadedFile = newFiles.find(f => f.name === file.name);
      if (!uploadedFile) continue;

      try {
        const formData = new FormData();
        formData.append('files', file);

        setUploadedFiles(prev =>
          prev.map(f => f.id === uploadedFile.id ? { ...f, status: 'uploading' } : f)
        );

        await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        setUploadedFiles(prev =>
          prev.map(f => f.id === uploadedFile.id ? { ...f, status: 'processing' } : f)
        );

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));

        setUploadedFiles(prev =>
          prev.map(f => f.id === uploadedFile.id ? { ...f, status: 'complete' } : f)
        );
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        setUploadedFiles(prev =>
          prev.map(f => f.id === uploadedFile.id ? { ...f, status: 'error' } : f)
        );
      }
    }

    // Call completion callback after all uploads
    if (onUploadComplete) {
      onUploadComplete(newFiles);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed transition-colors ${
          isDragging ? 'border-accent bg-accent/10' : 'border-border bg-card'
        }`}
        style={{ borderRadius: 'var(--radius-card)' }}
      >
        <label className="flex flex-col items-center justify-center py-12 px-6 cursor-pointer">
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.md"
            onChange={handleFileInput}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-3">
            <Upload className="w-6 h-6 text-accent-foreground" />
          </div>
          <p className="mb-1">
            Drop files here or click to browse
          </p>
          <label className="text-muted-foreground">
            Supports PDF, DOC, DOCX, TXT, MD
          </label>
        </label>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <label>Uploaded Documents ({uploadedFiles.length})</label>
          {uploadedFiles.map(file => (
            <div
              key={file.id}
              className="flex items-center gap-3 px-4 py-3 bg-card border border-border"
              style={{ borderRadius: 'var(--radius)' }}
            >
              <File className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="truncate">{file.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <label className="text-muted-foreground">
                    {formatFileSize(file.size)}
                  </label>
                  {file.status === 'uploading' && (
                    <label className="text-muted-foreground">• Uploading...</label>
                  )}
                  {file.status === 'processing' && (
                    <label className="text-muted-foreground">• Processing...</label>
                  )}
                  {file.status === 'complete' && (
                    <label className="text-accent-foreground">• Ready</label>
                  )}
                </div>
              </div>
              {file.status === 'complete' && (
                <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
              )}
              <button
                onClick={() => removeFile(file.id)}
                className="p-1.5 hover:bg-secondary transition-colors flex-shrink-0"
                style={{ borderRadius: 'var(--radius)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
