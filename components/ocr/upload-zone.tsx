"use client";

import { useState, useRef, DragEvent } from "react";
import { Upload, FileText, X, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  onOCRStart: () => void;
  isProcessing: boolean;
  progress?: number;
}

export function UploadZone({ 
  onFileSelected, 
  onOCRStart, 
  isProcessing,
  progress = 0,
}: UploadZoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile: File) => {
    setFile(selectedFile);
    onFileSelected(selectedFile);
    
    if (selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const handleRemove = () => {
    setFile(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const formatSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  };

  // STATE 1: Empty
  if (!file) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "w-full max-w-md aspect-[4/5] rounded-lg cursor-pointer transition-all",
            "border-2 border-dashed",
            "flex flex-col items-center justify-center gap-4 p-8",
            isDragging
              ? "border-[#0d6e4e] bg-[#0d6e4e]/5"
              : "border-[#d4d4d4] hover:border-[#0d6e4e] hover:bg-[#f5f3ed]"
          )}
        >
          <div className="w-12 h-12 rounded-full bg-[#f5f3ed] flex items-center justify-center">
            <Upload className="w-6 h-6 text-[#0d6e4e]" />
          </div>
          
          <div className="text-center">
            <p className="text-[15px] font-medium text-[#1a1a1a]">
              Glissez votre document ici
            </p>
            <p className="text-[13px] text-[#595959] mt-1">
              ou cliquez pour parcourir
            </p>
          </div>
          
          <button
            type="button"
            className="mt-2 h-9 px-4 bg-white border border-[#0d6e4e] text-[#0d6e4e] text-[13px] font-medium rounded-md hover:bg-[#0d6e4e]/5 transition-colors"
          >
            Parcourir les fichiers
          </button>
          
          <p className="text-[12px] text-[#8a8a8a] mt-2">
            PDF, JPG, PNG • Max 200 MB
          </p>
        </div>
        
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif"
          className="hidden"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0];
            if (selectedFile) handleFile(selectedFile);
          }}
        />
      </div>
    );
  }

  // STATE 2 & 3: File selected
  return (
    <div className="h-full flex flex-col">
      {/* File header */}
      <div className="px-4 py-3 border-b border-[#e5e3dc] flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-[#595959] shrink-0" />
          <span className="text-[13px] font-medium text-[#1a1a1a] truncate">
            {file.name}
          </span>
          <span className="text-[12px] text-[#8a8a8a] shrink-0">
            • {formatSize(file.size)}
          </span>
        </div>
        {!isProcessing && (
          <button
            onClick={handleRemove}
            className="w-7 h-7 rounded hover:bg-[#f5f3ed] flex items-center justify-center transition-colors"
            aria-label="Supprimer le fichier"
          >
            <X className="w-4 h-4 text-[#595959]" />
          </button>
        )}
      </div>

      {/* Preview or progress */}
      <div className="flex-1 overflow-auto bg-[#faf8f3] p-4">
        {isProcessing ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 text-[#0d6e4e] animate-spin" />
            <p className="text-[14px] font-medium text-[#1a1a1a]">
              Extraction en cours...
            </p>
            {progress > 0 && (
              <>
                <div className="w-64 h-1.5 bg-[#e5e3dc] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#0d6e4e] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[12px] text-[#595959]">
                  {progress}%
                </p>
              </>
            )}
          </div>
        ) : previewUrl ? (
          <div className="flex items-start justify-center">
            <img 
              src={previewUrl} 
              alt={file.name}
              className="max-w-full rounded border border-[#e5e3dc]"
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-[#8a8a8a]">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-[13px]">Aperçu non disponible pour ce type</p>
            </div>
          </div>
        )}
      </div>

      {/* Action button */}
      {!isProcessing && (
        <div className="p-3 border-t border-[#e5e3dc]">
          <button
            onClick={onOCRStart}
            className="w-full h-10 bg-[#0d6e4e] hover:bg-[#074a35] text-white text-[14px] font-medium rounded-md flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Search className="w-4 h-4" />
            Lancer l'OCR
          </button>
        </div>
      )}
    </div>
  );
}
