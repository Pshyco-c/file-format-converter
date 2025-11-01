import { useCallback, useState, useRef } from "react";
import { Upload, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  onFileClear?: () => void;
  accept?: string;
}

export const FileUploader = ({ onFileSelect, onFileClear, accept }: FileUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    onFileClear?.();
  }, [onFileClear]);

  const handleChooseFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300
          ${dragActive 
            ? "border-primary bg-primary/5 shadow-[var(--shadow-glow)]" 
            : "border-border hover:border-primary/50 bg-card"
          }
        `}
      >
        <input
          type="file"
          id="file-upload"
          ref={fileInputRef}
          className="hidden"
          onChange={handleChange}
          accept={accept}
        />
        
        {!selectedFile ? (
          <div className="flex flex-col items-center gap-4 cursor-pointer" onClick={handleChooseFileClick}>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center animate-float shadow-[var(--shadow-premium)]">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Drop your file here</h3>
              <p className="text-muted-foreground">or click to browse</p>
            </div>
            <Button variant="hero" size="lg" type="button" onClick={(e) => {
              e.stopPropagation();
              handleChooseFileClick();
            }}>
              Choose File
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-3 px-6 py-3 bg-secondary rounded-lg">
              <File className="w-5 h-5 text-primary" />
              <span className="font-medium">{selectedFile.name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFile}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
