"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload, FileText, X, ScanText, Download, ArrowRight,
  Loader2, CheckCircle2, FileBadge2, Sparkles, ChevronRight,
  Shield, Zap, FileImage, ZoomIn, ZoomOut, Maximize2, Table2, History
} from "lucide-react";
import { checkTrialLimits, incrementTrialUsage, getTrialStats, TIER_LIMITS } from "@/lib/trial";
import { useAuth } from "@/contexts/AuthContext";
import { TrialLimitModal } from "@/components/trial-limit-modal";
import { UpgradeBanner } from "@/components/upgrade-banner";
// pdf-lib is imported dynamically below to avoid client-side ReferenceError

import dynamic from "next/dynamic";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

const Document = dynamic(() => import("react-pdf").then(mod => mod.Document), { ssr: false });
const Page = dynamic(() => import("react-pdf").then(mod => mod.Page), { ssr: false });

if (typeof window !== "undefined") {
  import("react-pdf").then(({ pdfjs }) => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  });
}

// Parse markdown tables from OCR text
function parseTables(md: string): { headers: string[]; rows: string[][] }[] {
  const tables: { headers: string[]; rows: string[][] }[] = [];
  const lines = md.split("\n");
  let i = 0;
  while (i < lines.length) {
    if (lines[i].trim().startsWith("|") && lines[i + 1]?.trim().match(/^\|[-| :]+\|$/)) {
      const headers = lines[i].trim().split("|").filter(Boolean).map(s => s.trim());
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(lines[i].trim().split("|").filter(Boolean).map(s => s.trim()));
        i++;
      }
      tables.push({ headers, rows });
    } else { i++; }
  }
  return tables;
}

// Convert markdown to HTML for preview
function markdownToHtml(md: string): string {
  if (!md) return "";
  let html = md;
  // Escapes
  html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  // Bold
  html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');
  
  // Tables
  const lines = html.split("\n");
  let inTable = false;
  let tableHtml = "";
  const newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("|")) {
      if (!inTable) {
        inTable = true;
        tableHtml = "<table>";
      }
      if (line.match(/^\|[-| :]+\|$/)) {
        continue;
      }
      const cells = line.split("|").slice(1, -1).map(c => c.trim());
      tableHtml += "<tr>" + cells.map(c => `<td>${c}</td>`).join("") + "</tr>";
    } else {
      if (inTable) {
        inTable = false;
        tableHtml += "</table>";
        newLines.push(tableHtml);
      }
      newLines.push(line ? `<p>${line}</p>` : "");
    }
  }
  if (inTable) {
    tableHtml += "</table>";
    newLines.push(tableHtml);
  }
  
  return newLines.join("\n");
}

// Sanitize HTML string to prevent XSS while allowing standard layout tags
function sanitizeHtml(htmlString: string): string {
  if (!htmlString) return "";
  
  if (typeof window !== "undefined") {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, "text/html");
      
      const scripts = doc.querySelectorAll("script");
      scripts.forEach(s => s.remove());
      
      const allElements = doc.querySelectorAll("*");
      allElements.forEach(el => {
        const attrs = Array.from(el.attributes);
        attrs.forEach(attr => {
          if (attr.name.startsWith("on")) {
            el.removeAttribute(attr.name);
          }
          if (attr.name === "href" && attr.value.toLowerCase().startsWith("javascript:")) {
            el.removeAttribute(attr.name);
          }
        });
      });
      
      return doc.body.innerHTML;
    } catch (e) {
      console.error("Sanitization error:", e);
    }
  }
  
  return htmlString
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { TopBar } from "@/components/layout/top-bar";
import { useTranslations, useLocale } from "next-intl";

type Stage = "mode_selection" | "empty" | "selected" | "processing" | "done";

const STEPS = [
  "Envoi du document",
  "Analyse de la structure",
  "Extraction du texte",
  "Vérification qualité",
  "Finalisation",
];

export default function OCRPage() {
  const router = useRouter();
  const t = useTranslations("OCRSelection");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stage, setStage] = useState<Stage>("mode_selection");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [text, setText] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [tables, setTables] = useState<{ headers: string[]; rows: string[][] }[]>([]);
  const [activeTab, setActiveTab] = useState<"text" | "tables">("text");
  const [trialStats, setTrialStats] = useState<any>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Custom OCR modes states
  const [ocrMode, setOcrMode] = useState<"handwriting" | "table" | null>(null);
  const [resultTab, setResultTab] = useState<"preview" | "markdown" | "html" | "json">("preview");
  const [html, setHtml] = useState("");
  const [jsonResult, setJsonResult] = useState<any>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);

  // Added editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");

  const authContext = useAuth();
  const profile = authContext?.profile;
  const isAdmin = profile?.is_admin === true;
  const user = authContext?.user;
  const loading = authContext?.loading;

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login?redirect=/ocr");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const stats = getTrialStats(isAdmin, profile);
    if (stats) setTrialStats(stats);
  }, [stage, isAdmin, profile]);

  const handleFile = useCallback((f: File) => {
    if (f.size > 4.5 * 1024 * 1024) {
      toast.error("Fichier trop volumineux", { 
        duration: 1000000,
        description: (
          <span>
            La taille maximale autorisée est de 4.5 Mo. Veuillez utiliser un fichier plus léger ou compresser votre document via{" "}
            <a href="https://www.ilovepdf.com/compress_pdf" target="_blank" rel="noreferrer" style={{ textDecoration: "underline", fontWeight: 600 }}>
              iLovePDF
            </a>.
          </span>
        )
      });
      return;
    }
    setFile(f); setStage("selected"); setText(""); setHtml(""); setJsonResult(null);
    const isImage = f.type.startsWith("image/");
    const isPdf = f.type === "application/pdf";
    setPreviewUrl(isImage || isPdf ? URL.createObjectURL(f) : null);

    if (isPdf) {
      f.arrayBuffer()
        .then(async buf => {
          const { PDFDocument } = await import("pdf-lib");
          return PDFDocument.load(buf, { updateMetadata: false, ignoreEncryption: true });
        })
        .then(pdfDoc => {
          const pages = pdfDoc.getPageCount();
          const userTier = profile?.subscription_tier || profile?.plan || (trialStats?.daysLeft > 0 ? 'trial' : 'free');
          const maxPages = isAdmin ? 9999 : (userTier === 'free' ? 1 : 5);
          if (pages > maxPages) {
            toast.error("Fichier trop long", {
              duration: 8000,
              description: userTier === 'free' ? "Le mode gratuit limité permet de traiter 1 page par jour. Passez à Pro pour traiter plus de documents." : "Ce fichier dépasse la limite autorisée : maximum 5 pages par fichier. Veuillez réduire le nombre de pages ou diviser le document."
            });
            handleRemove();
            return;
          }
          setPageCount(pages);
        })
        .catch(err => {
          console.error("Error reading PDF pages client-side:", err);
          setPageCount(1);
        });
    } else {
      setPageCount(1);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f3]">
        <Loader2 className="w-10 h-10 animate-spin text-[#0d6e4e]" />
      </div>
    );
  }

  const handleRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null); setPreviewUrl(null); setStage("empty"); setText(""); setHtml("");
    setTables([]); setZoom(1); setResultTab("preview"); setJsonResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleResetMode = () => {
    handleRemove();
    setStage("mode_selection");
  };

  const fmt = (b: number) => b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} Mo` : `${(b / 1024).toFixed(0)} Ko`;

  const runOCR = async () => {
    if (!file) return;

    // Clear all previous OCR state before starting fresh extraction
    setText("");
    setHtml("");
    setTables([]);
    setJsonResult(null);
    setDocumentId(null);
    setEditedText("");
    setIsEditing(false);

    setStage("processing"); setProgress(0); setCurrentStep(0);
    let step = 0;
    const targets = [15, 35, 60, 82, 96];
    const ticker = setInterval(() => {
      setProgress(p => {
        const t = targets[step] ?? 96;
        const next = Math.min(p + 0.5, t);
        if (next >= t && step < targets.length - 1) { step++; setCurrentStep(step); }
        return next;
      });
    }, 120);
    try {
      const fd = new FormData(); 
      fd.append("file", file);
      if (!ocrMode) throw new Error("Mode OCR non sélectionné");
      fd.append("mode", ocrMode);

      const headers: Record<string, string> = {};
      if (authContext?.user) {
        const token = await authContext.user.getIdToken();
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/ocr/custom", { method: "POST", headers, body: fd });
      clearInterval(ticker);
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || `Erreur ${res.status}`); }
      const data = await res.json();
      const extracted = data.markdown || "";
      const extractedHtml = data.html || "";
      const currentPages = data.pageCount || 1;

      setText(extracted);
      setHtml(extractedHtml);
      setWordCount(extracted.trim().split(/\s+/).filter(Boolean).length);
      setPageCount(currentPages);
      const detectedTables = parseTables(extracted);
      setTables(detectedTables);
      
      setJsonResult(data.json || data.results || null);
      if (data.document_id) setDocumentId(data.document_id);
      setResultTab("preview");

      setProgress(100); setCurrentStep(STEPS.length - 1);
      setTimeout(() => setStage("done"), 500);
      
      toast.success("Extraction réussie", { description: detectedTables.length > 0 ? `${detectedTables.length} tableau(x) détecté(s)` : `${currentPages} page(s) analysée(s)` });
    } catch (err) {
      clearInterval(ticker); setStage("selected"); setProgress(0);
      toast.error(err instanceof Error ? err.message : "Échec OCR");
    }
  };

  const downloadWord = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch("/api/export-docx", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, tables }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `ocr-${Date.now()}.docx` });
      a.click(); URL.revokeObjectURL(a.href);
      toast.success("Document téléchargé", { description: tables.length > 0 ? `${tables.length} tableau(x) inclus` : undefined });
    } catch { toast.error("Échec du téléchargement"); }
    finally { setIsDownloading(false); }
  };

  const downloadExcel = async () => {
    if (tables.length === 0) return;
    setIsDownloading(true);
    try {
      const res = await fetch("/api/export-xlsx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tables, title: "LegTrans DZ — Tableaux" }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `tables-${Date.now()}.xlsx` });
      a.click(); URL.revokeObjectURL(a.href);
      toast.success("Excel téléchargé");
    } catch { toast.error("Échec du téléchargement Excel"); }
    finally { setIsDownloading(false); }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    toast.success("Texte copié dans le presse-papiers");
  };

  const userTier = profile?.subscription_tier || profile?.plan || (trialStats?.daysLeft > 0 ? 'trial' : 'free');
  const todayStr = new Date().toISOString().split('T')[0];
  
  let hwUsed = 0;
  const hwObj = profile?.daily_usage?.handwriting_mode_usage;
  if (hwObj) {
    if (userTier === 'trial' || hwObj.date === todayStr) {
      hwUsed = hwObj.requests || 0;
    }
  }

  let tableUsed = 0;
  const tableObj = profile?.daily_usage?.table_mode_usage;
  if (tableObj) {
    if (userTier === 'trial' || tableObj.date === todayStr) {
      tableUsed = tableObj.requests || 0;
    }
  }

  return (
    <div className="min-h-screen lg:h-screen flex flex-col lg:overflow-hidden overflow-y-auto" style={{ background: "#faf8f3" }}>
      <Toaster position="top-right" richColors />
      {showLimitModal && <TrialLimitModal type="ocr" tier={userTier as "admin" | "pro" | "plus" | "trial" | "free"} onClose={() => setShowLimitModal(false)} />}
      <TopBar />
      {trialStats && <UpgradeBanner tier={trialStats.tier} />}

      {/* Breadcrumb strip — matches dashboard */}
      <div className="h-auto min-h-[56px] py-3 lg:py-0 shrink-0 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 border-b bg-white gap-3 sm:gap-0" style={{ borderColor: "#e5e3dc" }}>
        <div className="flex items-center gap-2 text-[16px]">
          <span className="cursor-pointer transition-colors hover:text-[#1a1a1a]" style={{ color: "#8a8a8a" }}
            onClick={() => router.push("/dashboard")}>Documents</span>
          <ChevronRight className="h-5 w-5" style={{ color: "#c0bdb5" }} />
          <span className="font-semibold" style={{ color: "#1a1a1a" }}>Extraction OCR</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[14px]" style={{ color: "#a8a8a8" }}>
          <button 
            onClick={() => router.push("/dashboard/historique")}
            className="flex items-center gap-1.5 font-bold px-3 py-1.5 text-[13px] rounded-full transition-colors"
            style={{ background: "#f5f3ed", color: "#595959", border: "1px solid #e5e3dc" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#e5e3dc")}
            onMouseLeave={e => (e.currentTarget.style.background = "#f5f3ed")}
          >
            <History className="h-4 w-4" />
            {isRTL ? "سجل الاستخراجات" : "Historique"}
          </button>
          
          <span className="hidden lg:flex items-center gap-2"><Shield className="h-5 w-5" style={{ color: "#0d6e4e" }} />Traitement sécurisé</span>
          <span className="hidden sm:flex items-center gap-2"><Zap className="h-5 w-5" />10–60 secondes</span>
          <span className="hidden sm:flex items-center gap-2"><FileImage className="h-5 w-5" />PDF · JPG · PNG</span>
          {trialStats && (
            <span className="flex items-center gap-1.5 font-bold px-4 py-1.5 text-[14px] rounded-full shadow-sm"
                  style={{
                    background:
                      isAdmin ? "#f3e8ff"
                      : userTier === 'pro'  ? "#dcfce7"
                      : userTier === 'plus' ? "#dbeafe"
                      : userTier === 'free' ? "#fff7ed"
                      : "#fffbeb",
                    color:
                      isAdmin ? "#7e22ce"
                      : userTier === 'pro'  ? "#15803d"
                      : userTier === 'plus' ? "#1e40af"
                      : userTier === 'free' ? "#c2410c"
                      : "#92400e",
                  }}>
              {isAdmin
                ? "👑 Admin : Illimité"
                : userTier === 'free'
                ? `Gratuit : ${hwUsed + tableUsed}/1`
                : ocrMode === "handwriting"
                ? (userTier === 'pro' ? `⭐ Pro (Manuscrits) : ${hwUsed}/7` : userTier === 'plus' ? `🚀 Plus (Manuscrits) : ${hwUsed}/12` : `Essai (Manuscrits) : ${hwUsed}/3`)
                : (userTier === 'pro' ? `⭐ Pro (Tableaux) : ${tableUsed}/3` : userTier === 'plus' ? `🚀 Plus (Tableaux) : ${tableUsed}/6` : `Essai (Tableaux) : ${tableUsed}/2`)
              }
            </span>
          )}
        </div>
      </div>

      {/* Workspace */}
      {stage === "mode_selection" ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0 bg-white">
          <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-3xl font-bold text-primary-dark">{t("title")}</h1>
              <p className="text-gray-500 mt-2">{t("subtitle")}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {/* Card 1 */}
              <div 
                onClick={() => setOcrMode("handwriting")}
                className={cn("p-6 rounded-2xl border-2 cursor-pointer transition-all", ocrMode === "handwriting" ? "border-[#0d6e4e] bg-[#0d6e4e]/5 shadow-sm" : "border-[#e5e3dc] bg-white hover:border-[#0d6e4e]/40 hover:shadow-md")}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-[#0d6e4e]" />
                  <h3 className="font-bold text-[#1a1a1a]">{t("mode_hw_title")}</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                  {t("mode_hw_desc")}
                </p>
                <div className="bg-[#f0ede8] rounded-lg p-3">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">{t("mode_hw_examples_label")}</p>
                  <p className="text-[12px] text-gray-700">{t("mode_hw_examples")}</p>
                </div>
              </div>

              {/* Card 2 */}
              <div 
                onClick={() => setOcrMode("table")}
                className={cn("p-6 rounded-2xl border-2 cursor-pointer transition-all", ocrMode === "table" ? "border-[#0d6e4e] bg-[#0d6e4e]/5 shadow-sm" : "border-[#e5e3dc] bg-white hover:border-[#0d6e4e]/40 hover:shadow-md")}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Table2 className="w-5 h-5 text-[#0d6e4e]" />
                  <h3 className="font-bold text-[#1a1a1a]">{t("mode_table_title")}</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                  {t("mode_table_desc")}
                </p>
                <div className="bg-[#f0ede8] rounded-lg p-3">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">{t("mode_table_examples_label")}</p>
                  <p className="text-[12px] text-gray-700">{t("mode_table_examples")}</p>
                </div>
              </div>
            </div>

            <button
              disabled={!ocrMode}
              onClick={() => setStage("empty")}
              className="px-10 py-3.5 rounded-xl font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto min-w-[200px]"
              style={{ background: "linear-gradient(135deg,#0d6e4e,#1a8f6a)", boxShadow: ocrMode ? "0 4px 16px rgba(13,110,78,0.25)" : "none" }}
            >
              {t("btn_continue")}
            </button>
          </div>
        </div>
      ) : (
      <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden p-4 gap-4 min-h-0">

        {/* ── LEFT PANEL ── */}
        <div className="w-full lg:w-[48%] min-h-[380px] lg:min-h-0 flex flex-col rounded-xl overflow-hidden bg-white shrink-0 lg:shrink"
          style={{ border: "1px solid #e5e3dc", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>

          {/* Header */}
          <div className="h-[44px] shrink-0 flex items-center justify-between px-5 border-b" style={{ borderColor: "#f0ede8" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full" style={{ background: "#0d6e4e" }} />
              <span className="text-[11px] font-bold tracking-[0.08em] uppercase" style={{ color: "#595959" }}>Document source</span>
              
              <button 
                onClick={handleResetMode}
                className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors bg-[#0d6e4e]/10 text-[#0d6e4e] hover:bg-[#0d6e4e]/20"
              >
                {t("btn_change_mode")}
              </button>
            </div>
            {file && stage !== "processing" && (
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                  style={{ background: "#f5f3ed", color: "#595959", border: "1px solid #e5e3dc" }}>
                  <FileBadge2 className="h-3 w-3" />
                  <span className="max-w-[160px] truncate">{file.name}</span>
                  <span style={{ color: "#a8a8a8" }}>· {fmt(file.size)}</span>
                  {pageCount > 0 && <span style={{ color: "#a8a8a8" }}>· {pageCount} page(s)</span>}
                </span>
                <button onClick={handleRemove}
                  className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                  style={{ color: "#c0c0c0" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f5f3ed")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-auto flex flex-col min-h-0">

            {/* EMPTY */}
            {stage === "empty" && (
              <div className="h-full flex items-center justify-center p-8"
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}>
                <div onClick={() => inputRef.current?.click()}
                  className="w-full max-w-[320px] flex flex-col items-center cursor-pointer rounded-2xl py-12 px-8 select-none transition-all duration-200"
                  style={{
                    border: isDragging ? "2px dashed #0d6e4e" : "2px dashed #dbd8d0",
                    background: isDragging ? "rgba(13,110,78,0.04)" : "#fafaf9",
                    transform: isDragging ? "scale(1.02)" : "scale(1)",
                    boxShadow: isDragging ? "0 12px 40px rgba(13,110,78,0.1)" : "none",
                  }}>

                  <div className="w-[68px] h-[68px] rounded-2xl flex items-center justify-center mb-6 transition-all"
                    style={{
                      background: isDragging ? "rgba(13,110,78,0.1)" : "#f0ede8",
                      boxShadow: isDragging ? "0 0 0 8px rgba(13,110,78,0.06)" : "none",
                    }}>
                    <Upload className="h-7 w-7" style={{ color: isDragging ? "#0d6e4e" : "#a8a8a8" }} />
                  </div>

                  <p className="text-[16px] font-bold text-center mb-1.5" style={{ color: "#1a1a1a", letterSpacing: "-0.02em" }}>
                    {isDragging ? "Relâchez ici" : "Déposez votre document"}
                  </p>
                  <p className="text-[13px] text-center mb-7" style={{ color: "#8a8a8a" }}>
                    ou cliquez pour parcourir
                  </p>

                  <button type="button"
                    className="w-full h-10 rounded-xl font-semibold text-[13px] text-white transition-all"
                    style={{ background: "linear-gradient(135deg,#0d6e4e,#1a8f6a)", boxShadow: "0 4px 12px rgba(13,110,78,0.25)" }}
                    onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-1px)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "none")}>
                    Parcourir les fichiers
                  </button>
                  <p className="text-[11px] mt-4 text-center" style={{ color: "#c0bdb5" }}>
                    Chaque fichier peut contenir jusqu'à 5 pages.
                  </p>

                  {(userTier === 'trial' || userTier === 'pro' || userTier === 'plus') && (
                    <div className="mt-6 bg-[#0d6e4e]/10 border border-[#0d6e4e]/20 rounded-xl p-4 w-full max-w-[320px] shadow-sm text-left">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[12px] font-bold text-[#0d6e4e]">
                          {isRTL ? "الطلبات المستهلكة" : "Requêtes consommées"}
                        </span>
                        <span className="text-[12px] font-bold bg-white px-2 py-0.5 rounded-md text-[#0d6e4e] shadow-sm">
                          {ocrMode === "handwriting" ? hwUsed : tableUsed} / {
                            ocrMode === "handwriting" 
                              ? (userTier === 'pro' ? 7 : userTier === 'plus' ? 12 : 3) 
                              : (userTier === 'pro' ? 3 : userTier === 'plus' ? 6 : 2)
                          }
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed" style={{ color: "#0d6e4e", direction: isRTL ? "rtl" : "ltr" }}>
                        <strong>{isRTL ? "💡 نصيحة هامة:" : "💡 Conseil important :"}</strong><br/>
                        {isRTL 
                          ? "كل طلب يستهلك محاولة واحدة، بغض النظر عن عدد الصور. قم بدمج حتى 5 صور في ملف PDF واحد للاستفادة القصوى من باقتك!" 
                          : "Chaque requête consomme 1 crédit, peu importe le nombre d'images. Combinez jusqu'à 5 images en un seul PDF pour un maximum d'efficacité !"}
                      </p>
                    </div>
                  )}
                </div>
                <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>
            )}

            {/* SELECTED / DONE */}
            {(stage === "selected" || stage === "done") && (
              <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-5 min-h-0 relative" style={{ background: "#f5f3ee" }}>
                {previewUrl ? (
                  <div className="flex flex-col items-center justify-center w-full h-full max-h-full">
                    {file?.type === "application/pdf" && pageCount > 1 && (
                      <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-[11px] font-bold text-gray-700 shadow-sm border border-gray-200">
                        Aperçu page 1 sur {pageCount}
                      </div>
                    )}
                    
                    <div className="relative max-w-full max-h-[85%] overflow-hidden rounded-xl bg-white flex items-center justify-center p-2 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-[#e5e3dc]">
                      {file?.type === "application/pdf" ? (
                        <div className="overflow-hidden flex items-center justify-center rounded-lg bg-[#fafaf9]" style={{ maxHeight: "100%", maxWidth: "100%" }}>
                          <Document
                            file={file}
                            loading={<div className="animate-pulse bg-[#f0ede8] w-[320px] h-[450px] rounded-lg" />}
                            className="flex items-center justify-center"
                          >
                            <Page 
                              pageNumber={1} 
                              renderTextLayer={false}
                              renderAnnotationLayer={false}
                              height={450}
                              className="object-contain"
                              loading={<div className="animate-pulse bg-[#f0ede8] w-[320px] h-[450px] rounded-lg" />}
                            />
                          </Document>
                        </div>
                      ) : (
                        <img src={previewUrl} alt="Aperçu" className="max-w-full max-h-full rounded-lg object-contain" />
                      )}
                    </div>
                    
                    <p className="mt-4 text-[11px] text-[#a8a8a8] font-medium text-center">
                      Aperçu uniquement — le document complet sera traité.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 py-20">
                    <div className="w-20 h-28 rounded-xl flex items-center justify-center bg-white"
                      style={{ border: "1px solid #e5e3dc", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                      <FileText className="h-8 w-8" style={{ color: "#d4d4d4" }} />
                    </div>
                    <p className="text-[13px] font-medium" style={{ color: "#595959" }}>{file?.name}</p>
                    <p className="text-[11px]" style={{ color: "#a8a8a8" }}>Aperçu non disponible</p>
                  </div>
                )}
              </div>
            )}

            {/* PROCESSING */}
            {stage === "processing" && (
              <div className="h-full flex flex-col items-center justify-center gap-8 p-10">
                {/* SVG Ring */}
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full" viewBox="0 0 96 96" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="48" cy="48" r="42" fill="none" stroke="#f0ede8" strokeWidth="3" />
                    <circle cx="48" cy="48" r="42" fill="none" stroke="url(#pg)" strokeWidth="3"
                      strokeLinecap="round" strokeDasharray={`${progress * 2.638} 263.8`}
                      style={{ transition: "stroke-dasharray 0.3s ease", filter: "drop-shadow(0 0 4px rgba(13,110,78,0.4))" }} />
                    <defs>
                      <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0d6e4e" />
                        <stop offset="100%" stopColor="#1a8f6a" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <ScanText className="h-7 w-7 mb-0.5" style={{ color: "#0d6e4e" }} />
                    <span className="text-[11px] font-bold" style={{ color: "#8a8a8a" }}>{Math.round(progress)}%</span>
                  </div>
                </div>

                {/* Steps */}
                <div className="flex flex-col gap-2.5 w-full max-w-[230px]">
                  {STEPS.map((s, i) => (
                    <div key={i} className="flex items-center gap-2.5 transition-all duration-300">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all"
                        style={{
                          background: i < currentStep ? "#0d6e4e" : i === currentStep ? "rgba(13,110,78,0.1)" : "#f0ede8",
                          border: i === currentStep ? "1.5px solid #0d6e4e" : "none",
                          boxShadow: i === currentStep ? "0 0 0 4px rgba(13,110,78,0.06)" : "none",
                        }}>
                        {i < currentStep
                          ? <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                          : i === currentStep
                            ? <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#0d6e4e" }} />
                            : null}
                      </div>
                      <span className="text-[12px] transition-all" style={{
                        color: i < currentStep ? "#0d6e4e" : i === currentStep ? "#1a1a1a" : "#c0bdb5",
                        fontWeight: i === currentStep ? 600 : 400,
                      }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* OCR Button and Mode Selector */}
          {stage === "selected" && (
            <div className="p-4 border-t space-y-3 bg-[#fafaf9]" style={{ borderColor: "#f0ede8" }}>
              <div className="flex justify-between items-center bg-white border border-[#e5e3dc] rounded-lg p-2.5">
                <div className="flex items-center gap-2 text-[12px] font-bold text-gray-700">
                  {ocrMode === "handwriting" ? <Sparkles className="w-4 h-4 text-[#0d6e4e]" /> : <Table2 className="w-4 h-4 text-[#0d6e4e]" />}
                  Mode : {ocrMode === "handwriting" ? t("mode_hw_title") : t("mode_table_title")}
                </div>
              </div>

              <button onClick={runOCR}
                className="w-full h-[46px] rounded-xl font-bold text-[14px] text-white flex items-center justify-center gap-2.5 transition-all"
                style={{ background: "linear-gradient(135deg,#0d6e4e,#1a8f6a)", boxShadow: "0 4px 16px rgba(13,110,78,0.25)", letterSpacing: "-0.01em" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(13,110,78,0.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(13,110,78,0.25)"; }}>
                <Sparkles className="h-4 w-4" />
                Lancer l'extraction OCR
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="w-full lg:flex-1 min-h-[380px] lg:min-h-0 flex flex-col rounded-xl overflow-hidden bg-white shrink-0 lg:shrink"
          style={{ border: "1px solid #e5e3dc", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>

          {/* Header */}
          <div className="h-[48px] shrink-0 flex items-center justify-between px-5 border-b" style={{ borderColor: "#f0ede8" }}>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full" style={{ background: "#b08d3c" }} />
                <span className="text-[11px] font-bold tracking-[0.08em] uppercase hidden sm:inline" style={{ color: "#595959" }}>Résultat</span>
              </div>
            </div>
            
            {stage === "done" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                style={{ background: "rgba(13,110,78,0.08)", color: "#0d6e4e", border: "1px solid rgba(13,110,78,0.12)" }}>
                <CheckCircle2 className="h-3 w-3" />
                {wordCount} mots · {pageCount} page(s)
              </span>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden flex flex-col">

            {(stage === "empty" || stage === "selected") && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 p-12">
                <div className="relative">
                  <div className="w-14 h-[72px] rounded-xl flex items-center justify-center"
                    style={{ border: "2px dashed #dbd8d0" }}>
                    <FileText className="h-6 w-6" style={{ color: "#dbd8d0" }} />
                  </div>
                  <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center bg-white"
                    style={{ border: "1.5px solid #e5e3dc", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                    <ScanText className="h-3.5 w-3.5" style={{ color: "#c0bdb5" }} />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[14px] font-semibold" style={{ color: "#595959" }}>
                    {stage === "empty" ? "Aucun texte extrait" : "En attente du traitement"}
                  </p>
                  <p className="text-[12px] mt-1.5 leading-relaxed max-w-[200px] mx-auto" style={{ color: "#a8a8a8" }}>
                    {stage === "empty" ? "Déposez un document et lancez l'OCR" : "Cliquez sur le bouton pour démarrer"}
                  </p>
                </div>
              </div>
            )}

            {stage === "processing" && (
              <div className="flex-1 p-6 flex flex-col gap-2.5">
                {[72, 88, 60, 80, 55, 90, 65, 78, 84, 58].map((w, i) => (
                  <div key={i} className="h-3 rounded-lg animate-pulse"
                    style={{ width: `${w}%`, background: "#f0ede8", animationDelay: `${i * 70}ms`, animationDuration: "1.6s" }} />
                ))}
              </div>
            )}

            {stage === "done" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Result Label and Warning Banner */}
                <div className="p-4 border-b bg-[#fafaf9] space-y-1 shrink-0" style={{ borderColor: "#f0ede8" }}>
                  {ocrMode === "handwriting" ? (
                    <>
                      <p className="text-[11.5px] font-bold text-[#b08d3c] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Extraction préliminaire — vérification humaine requise
                      </p>
                      <p className="text-[10px] text-gray-400 leading-normal">
                        Les résultats peuvent nécessiter une vérification humaine selon la qualité du document.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[11.5px] font-bold text-[#0d6e4e] flex items-center gap-1.5">
                        <Table2 className="w-3.5 h-3.5" />
                        Extraction de tableau — révision recommandée
                      </p>
                      <p className="text-[10px] text-gray-400 leading-normal">
                        Les résultats peuvent nécessiter une vérification humaine selon la qualité du document.
                      </p>
                    </>
                  )}
                </div>

                {resultTab === "preview" && (() => {
                  if (ocrMode === "handwriting" && isEditing) {
                    return (
                      <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="flex-1 w-full border-0 p-6 text-[14px] leading-relaxed resize-none focus:outline-none"
                        style={{ fontFamily: "monospace", color: "#1a1a1a", backgroundColor: "#fafaf9" }}
                        spellCheck={false}
                      />
                    );
                  }

                  const isArabic = /[\u0600-\u06FF]/.test(text);
                  const previewContent = sanitizeHtml(html || markdownToHtml(text));
                  return (
                    <iframe
                      sandbox="allow-same-origin"
                      srcDoc={`<!DOCTYPE html><html lang="${isArabic ? 'ar' : 'fr'}" dir="${isArabic ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>
                        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600&display=swap');
                        body { font-family: ${isArabic ? "'Noto Sans Arabic', 'Segoe UI', Arial" : 'system-ui, -apple-system, sans-serif'}; padding: 24px; color: #1a1a1a; line-height: ${isArabic ? '2' : '1.85'}; font-size: 13.5px; margin: 0; background-color: #ffffff; direction: ${isArabic ? 'rtl' : 'ltr'}; text-align: ${isArabic ? 'right' : 'left'}; }
                        table { border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 13px; direction: ${isArabic ? 'rtl' : 'ltr'}; }
                        th, td { border: 1px solid #dbd8d0; padding: 10px 12px; text-align: ${isArabic ? 'right' : 'left'}; }
                        th { background-color: #fafaf9; font-weight: 600; color: #1a1a1a; }
                        tr:nth-child(even) { background-color: #fafaf9; }
                        p { margin: 0 0 12px 0; }
                        h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 12px; font-weight: 600; color: #1a1a1a; }
                      </style></head><body>${previewContent}</body></html>`}
                      className="flex-1 w-full border-0 bg-white"
                    />
                  );
                })()}


              </div>
            )}
          </div>

          {/* Actions */}
          {stage === "done" && (
            <div className="flex flex-wrap gap-2 p-3 shrink-0 border-t bg-[#fafaf9]" style={{ borderColor: "#f0ede8" }}>
              {ocrMode === "handwriting" && (
                <>
                  {!isEditing ? (
                    <button onClick={() => { setEditedText(text); setIsEditing(true); }}
                      className="flex-1 min-w-[120px] h-10 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-2 transition-all"
                      style={{ border: "1.5px solid #e5e3dc", color: "#595959", background: "#f5f3ee", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#e5e3dc"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#f5f3ee"; }}>
                      Modifier / Corriger
                    </button>
                  ) : (
                    <button onClick={async () => { 
                        setText(editedText); 
                        setHtml(""); 
                        setIsEditing(false); 
                        toast.success("Corrections appliquées avec succès.");
                        
                        if (documentId) {
                          try {
                            const headers: Record<string, string> = { "Content-Type": "application/json" };
                            if (authContext?.user) {
                              const token = await authContext.user.getIdToken();
                              headers["Authorization"] = `Bearer ${token}`;
                            }
                            await fetch("/api/ocr/corrections", {
                              method: "POST",
                              headers,
                              body: JSON.stringify({ document_id: documentId, corrected_text: editedText }),
                            }).catch(console.error);
                          } catch (err) {
                            console.error(err);
                          }
                        }
                      }}
                      className="flex-1 min-w-[120px] h-10 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-2 transition-all text-white"
                      style={{ background: "linear-gradient(135deg,#0d6e4e,#1a8f6a)", boxShadow: "0 4px 12px rgba(13,110,78,0.2)" }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}>
                      <CheckCircle2 className="h-4 w-4" />
                      Appliquer les corrections
                    </button>
                  )}
                </>
              )}
              
              <button onClick={downloadWord} disabled={isDownloading}
                className="flex-1 min-w-[120px] h-10 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                style={{ border: "1.5px solid #e5e3dc", color: "#595959", background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f5f3ed"; e.currentTarget.style.borderColor = "#c8c5bd"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e5e3dc"; }}>
                {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Télécharger Word
              </button>

              {tables.length > 0 && (
                <button onClick={downloadExcel} disabled={isDownloading}
                  className="flex-1 min-w-[120px] h-10 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  style={{ border: "1.5px solid rgba(13,110,78,0.2)", color: "#0d6e4e", background: "rgba(13,110,78,0.05)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(13,110,78,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(13,110,78,0.05)"; }}>
                  <Table2 className="h-4 w-4" />
                  Télécharger Excel
                </button>
              )}

              <button onClick={copyToClipboard}
                className="flex-1 min-w-[120px] h-10 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-2 transition-all"
                style={{ border: "1.5px solid #e5e3dc", color: "#595959", background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f5f3ed"; e.currentTarget.style.borderColor = "#c8c5bd"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e5e3dc"; }}>
                Copier le texte
              </button>

              <button onClick={() => { sessionStorage.setItem("translationInput", text); router.push("/translate"); }}
                className="flex-1 min-w-[160px] h-10 rounded-xl font-semibold text-[13px] text-white flex items-center justify-center gap-2 transition-all"
                style={{ background: "linear-gradient(135deg,#0d6e4e,#1a8f6a)", boxShadow: "0 4px 12px rgba(13,110,78,0.2)" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(13,110,78,0.28)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(13,110,78,0.2)"; }}>
                <ArrowRight className="h-4 w-4" />
                Envoyer à la traduction
              </button>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
