"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, ArrowRight, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ResultPanelProps {
  extractedText: string;
  onTextChange: (text: string) => void;
  isProcessing: boolean;
}

export function ResultPanel({ 
  extractedText, 
  onTextChange,
  isProcessing,
}: ResultPanelProps) {
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const words = extractedText.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [extractedText]);

  const handleDownloadWord = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch("/api/export-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractedText }),
      });

      if (!response.ok) throw new Error("Échec de l'export");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ocr-${new Date().toISOString().split("T")[0]}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Document téléchargé");
    } catch {
      toast.error("Échec du téléchargement");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendToTranslation = () => {
    sessionStorage.setItem("translationInput", extractedText);
    toast.success("Texte envoyé à la traduction");
    router.push("/translate");
  };

  const hasText = extractedText.trim().length > 0;

  return (
    <div className="h-full flex flex-col">
      {/* Content area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {isProcessing ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-[#595959]">
              <Loader2 className="w-6 h-6 animate-spin text-[#0d6e4e]" />
              <p className="text-[14px]">Extraction en cours...</p>
            </div>
          </div>
        ) : !hasText ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-xs">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#f5f3ed] flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#8a8a8a]" />
              </div>
              <p className="text-[14px] text-[#595959]">
                Le texte extrait apparaîtra ici
              </p>
              <p className="text-[12px] text-[#8a8a8a] mt-1">
                Téléversez un document et lancez l'OCR
              </p>
            </div>
          </div>
        ) : (
          <textarea
            value={extractedText}
            onChange={(e) => onTextChange(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full px-5 py-4 text-[14px] leading-[1.65] text-[#1a1a1a] resize-none focus:outline-none bg-white"
            placeholder="Le texte extrait apparaîtra ici..."
          />
        )}
      </div>

      {/* Action buttons */}
      <div className="p-3 border-t border-[#e5e3dc] flex gap-2">
        <button
          onClick={handleDownloadWord}
          disabled={!hasText || isDownloading}
          className="flex-1 h-10 bg-white border border-[#0d6e4e] text-[#0d6e4e] text-[14px] font-medium rounded-md flex items-center justify-center gap-2 hover:bg-[#0d6e4e]/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isDownloading ? "Téléchargement..." : "Télécharger Word"}
        </button>

        <button
          onClick={handleSendToTranslation}
          disabled={!hasText}
          className="flex-1 h-10 bg-[#0d6e4e] hover:bg-[#074a35] text-white text-[14px] font-medium rounded-md flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowRight className="w-4 h-4" />
          Envoyer à la traduction
        </button>
      </div>
    </div>
  );
}
