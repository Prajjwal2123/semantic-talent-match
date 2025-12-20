import { useCallback, useState } from "react";
import { Upload, FileText, X, CheckCircle2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
}

interface FileUploadZoneProps {
  title: string;
  description: string;
  acceptedFormats: string[];
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  uploadedFiles?: UploadedFile[];
  onRemoveFile?: (id: string) => void;
}

export function FileUploadZone({
  title,
  description,
  acceptedFormats,
  multiple = true,
  onFilesSelected,
  uploadedFiles = [],
  onRemoveFile,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    onFilesSelected(files);
  }, [onFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Card variant="glass" className="overflow-hidden">
      <div className="p-6">
        <h3 className="font-display font-semibold text-lg text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer group",
            isDragging 
              ? "border-primary bg-primary/5 scale-[1.02]" 
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <input
            type="file"
            accept={acceptedFormats.join(',')}
            multiple={multiple}
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="flex flex-col items-center text-center">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300",
              isDragging 
                ? "gradient-primary shadow-glow" 
                : "bg-primary/10 group-hover:bg-primary/20"
            )}>
              <Upload className={cn(
                "w-6 h-6 transition-colors",
                isDragging ? "text-primary-foreground" : "text-primary"
              )} />
            </div>
            
            <p className="font-medium text-foreground mb-1">
              {isDragging ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              or click to browse
            </p>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {acceptedFormats.map((format) => (
                <Badge key={format} variant="muted" className="text-xs">
                  {format.replace('.', '').toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        {uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 animate-fade-in"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  {file.status === 'uploading' && (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  )}
                  {file.status === 'processing' && (
                    <Badge variant="warning" className="text-xs">Processing</Badge>
                  )}
                  {file.status === 'completed' && (
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                  )}
                  {file.status === 'error' && (
                    <Badge variant="destructive" className="text-xs">Error</Badge>
                  )}
                  
                  {onRemoveFile && (
                    <button
                      onClick={() => onRemoveFile(file.id)}
                      className="p-1 rounded-md hover:bg-destructive/10 transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
