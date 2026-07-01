"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus, RotateCw, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import dynamic from "next/dynamic";

export interface SourceViewerProps {
  fileUrl: string;
  fileType: "image" | "pdf";
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

const PDFViewerInner = dynamic(() => import("./pdf-viewer-inner"), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-[var(--color-border)] w-[600px] h-[800px] shadow-md border border-[var(--color-border)]" />
});

export function SourceViewer({ fileUrl, fileType, zoom, onZoomChange }: SourceViewerProps) {
  const [rotation, setRotation] = useState(0);
  const [numPages, setNumPages] = useState<number>(1);
  const [pageNumber, setPageNumber] = useState<number>(1);

  const handleZoomOut = () => onZoomChange(Math.max(50, zoom - 10));
  const handleZoomIn = () => onZoomChange(Math.min(300, zoom + 10));
  const handleZoomReset = () => onZoomChange(100);

  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleReOcr = () => {
    toast.info("Lancement de l'OCR...");
    setTimeout(() => {
      toast.success("OCR terminé");
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--color-background)] overflow-hidden">
      {/* TOOLBAR */}
      <div className="h-[36px] shrink-0 bg-white border-b border-[var(--color-border)] flex items-center justify-between px-4 z-10">
        
        {/* Left: Page Navigation */}
        <div className="flex items-center gap-2 min-w-[120px]">
          {fileType === "pdf" ? (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-foreground)]"
                onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                disabled={pageNumber <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-[14px] font-mono text-[var(--color-foreground)]">
                Page {pageNumber} / {numPages || 1}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-foreground)]"
                onClick={() => setPageNumber(Math.min(numPages || 1, pageNumber + 1))}
                disabled={pageNumber >= (numPages || 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <span className="text-[14px] font-mono text-[var(--color-muted-foreground)]">Image 1 / 1</span>
          )}
        </div>

        {/* Center: Zoom Controls */}
        <div className="flex items-center h-7 bg-[var(--color-background)] rounded border border-[var(--color-border)] overflow-hidden">
          <button 
            onClick={handleZoomOut}
            className="h-full w-8 flex items-center justify-center text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-secondary)] transition-colors"
          >
            <Minus className="h-3 w-3" />
          </button>
          <button 
            onClick={handleZoomReset}
            className="h-full px-3 text-xs font-medium text-[var(--color-foreground)] hover:bg-[var(--color-secondary)] min-w-[3.5rem] text-center transition-colors"
          >
            {zoom}%
          </button>
          <button 
            onClick={handleZoomIn}
            className="h-full w-8 flex items-center justify-center text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-secondary)] transition-colors"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRotate}
            className="h-7 w-7 text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-foreground)]"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          
          <div className="h-4 w-px bg-[var(--color-border)] mx-1" />
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleReOcr}
            className="h-7 text-[var(--color-foreground)] font-medium hover:bg-[var(--color-secondary)] gap-1.5 px-2"
          >
            <ScanLine className="h-4 w-4 text-[var(--color-primary)]" />
            Re-OCR
          </Button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-auto p-6 flex items-center justify-center relative bg-[var(--color-background)]">
        <div 
          className="transition-transform duration-200 ease-out origin-center flex items-center justify-center"
          style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)` }}
        >
          {fileType === "image" ? (
            <img 
              src={fileUrl} 
              alt="Source document" 
              className="max-w-full h-auto object-contain bg-white shadow-md border border-[var(--color-border)]"
              style={{ maxHeight: "80vh" }}
            />
          ) : (
            <PDFViewerInner 
              fileUrl={fileUrl} 
              pageNumber={pageNumber} 
              onLoadSuccess={(num) => setNumPages(num)} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
