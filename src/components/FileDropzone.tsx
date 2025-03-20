
import React, { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { FileIcon, UploadIcon, XIcon } from 'lucide-react';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label: string;
  fileType: 'primary' | 'secondary';
  selectedFile: File | null;
  onClearFile: () => void;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelect,
  accept = '.csv,.xlsx,.xls',
  label,
  fileType,
  selectedFile,
  onClearFile
}) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);
  
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);
  
  const validateFile = (file: File) => {
    const acceptedTypes = accept.split(',');
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    
    if (!acceptedTypes.includes(fileExtension)) {
      toast.error(`Invalid file type. Please upload ${accept} files.`);
      return false;
    }
    
    return true;
  };
  
  const fileTypeColors = {
    primary: 'bg-file-blue/10 border-file-blue/30 text-file-blue',
    secondary: 'bg-file-purple/10 border-file-purple/30 text-file-purple'
  };
  
  return (
    <div className="w-full">
      <p className="mb-2 text-sm font-medium text-muted-foreground">{label}</p>
      
      {!selectedFile ? (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-xl p-8 transition-all",
            fileTypeColors[fileType],
            isDragging ? "bg-opacity-50 scale-[1.02]" : "",
            "animate-fade-in"
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onChange={handleFileChange}
            accept={accept}
          />
          <div className="flex flex-col items-center justify-center space-y-3 text-center">
            <div className={cn(
              "rounded-full p-3",
              fileType === 'primary' ? 'bg-file-blue/20' : 'bg-file-purple/20'
            )}>
              <UploadIcon className={cn(
                "h-6 w-6",
                fileType === 'primary' ? 'text-file-blue' : 'text-file-purple'
              )} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Drag and drop your file or click to browse</p>
              <p className="text-xs text-muted-foreground">
                Supports Excel and CSV formats
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className={cn(
          "flex items-center justify-between border rounded-xl p-4 animate-scale-in",
          fileType === 'primary' ? 'bg-file-blue/5 border-file-blue/20' : 'bg-file-purple/5 border-file-purple/20'
        )}>
          <div className="flex items-center space-x-3">
            <div className={cn(
              "rounded-lg p-2",
              fileType === 'primary' ? 'bg-file-blue/10' : 'bg-file-purple/10'
            )}>
              <FileIcon className={cn(
                "h-5 w-5",
                fileType === 'primary' ? 'text-file-blue' : 'text-file-purple'
              )} />
            </div>
            <div>
              <p className="text-sm font-medium truncate max-w-[200px]">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <button
            onClick={onClearFile}
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center hover:bg-background transition-colors",
              fileType === 'primary' ? 'text-file-blue' : 'text-file-purple'
            )}
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileDropzone;
