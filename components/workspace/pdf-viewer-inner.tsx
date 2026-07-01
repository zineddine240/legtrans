"use client";

import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set worker path
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerInnerProps {
  fileUrl: string;
  pageNumber: number;
  onLoadSuccess: (numPages: number) => void;
}

export default function PDFViewerInner({ fileUrl, pageNumber, onLoadSuccess }: PDFViewerInnerProps) {
  const [error, setError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    onLoadSuccess(numPages);
    setError(null);
  }

  function onDocumentLoadError(err: Error) {
    setError(err.message);
  }

  return (
    <div className="bg-white shadow-md border border-[var(--color-border)]">
      {error ? (
        <div className="p-8 text-center text-red-500 max-w-md">
          <p className="font-semibold mb-2">Erreur de chargement du PDF</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<div className="animate-pulse bg-[var(--color-border)] w-[600px] h-[800px]" />}
        >
          <Page 
            pageNumber={pageNumber} 
            renderTextLayer={false}
            renderAnnotationLayer={false}
            loading={<div className="animate-pulse bg-[var(--color-border)] w-[600px] h-[800px]" />}
          />
        </Document>
      )}
    </div>
  );
}
