"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { useRouter } from "next/navigation";
import {
  Languages, Upload, FileText, X, Download, ArrowRight,
  Loader2, CheckCircle2, ChevronRight, Shield, Zap, FileImage, Sparkles, ArrowRightLeft, Clock, FileBadge2, Lock
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { checkTrialLimits, incrementTrialUsage, getTrialStats } from "@/lib/trial";
import { useAuth } from "@/contexts/AuthContext";
import { TrialLimitModal } from "@/components/trial-limit-modal";
import { useLocale } from "next-intl";
import { UpgradeBanner } from "@/components/upgrade-banner";

type Stage = "empty" | "selected" | "processing" | "streaming" | "done";

// Parse markdown tables from generated text
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

interface TablePart {
  type: 'table';
  headers: string[];
  rows: string[][];
  superHeaders?: string[];
  superColspans?: number[];
}

interface TextPart {
  type: 'text';
  text: string;
}

type DocPart = TablePart | TextPart;

function MarkdownPreview({ content, dir, isLandscape }: { content: string; dir: 'rtl' | 'ltr'; isLandscape: boolean }) {
  const parts: DocPart[] = [];
  const lines = content.split("\n");
  let i = 0;

  const isTableHeader = (l: string) => l.trim().startsWith("|");
  const isSeparator   = (l: string) => /^\|[-| :]+\|$/.test(l.trim());
  const isSuperHeader = (l: string) => l.trim().includes("|") && !l.trim().startsWith("|");

  while (i < lines.length) {
    const cur  = lines[i]?.trim() ?? "";
    const nxt  = lines[i + 1]?.trim() ?? "";
    const nxt2 = lines[i + 2]?.trim() ?? "";

    // Super-header + table: "A | B\n| col1 | col2 |\n|---|---|\n..."
    if (isSuperHeader(cur) && isTableHeader(nxt) && isSeparator(nxt2)) {
      const superHeaders = cur.split("|").map(s => s.trim()).filter(Boolean);
      const headers = nxt.split("|").filter((_, j, a) => j > 0 && j < a.length - 1).map(s => s.trim());
      const rows: string[][] = [];
      i += 3;
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(lines[i].split("|").filter((_, j, a) => j > 0 && j < a.length - 1).map(s => s.trim()));
        i++;
      }
      const numCols = headers.length;
      let superColspans: number[] = [];
      let splitPoint = -1;
      for (const row of rows) {
        const firstNonEmpty = row.findIndex(c => c !== "");
        if (firstNonEmpty > 0 && firstNonEmpty < numCols) { splitPoint = firstNonEmpty; break; }
      }
      if (splitPoint > 0 && superHeaders.length === 2) {
        superColspans = [splitPoint, numCols - splitPoint];
      } else {
        const each = Math.floor(numCols / superHeaders.length);
        superColspans = superHeaders.map((_, k) => k === superHeaders.length - 1 ? numCols - each * (superHeaders.length - 1) : each);
      }
      parts.push({ type: 'table', headers, rows, superHeaders, superColspans });

    // Regular table
    } else if (isTableHeader(cur) && isSeparator(nxt)) {
      const headers = cur.split("|").filter((_, j, a) => j > 0 && j < a.length - 1).map(s => s.trim());
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(lines[i].split("|").filter((_, j, a) => j > 0 && j < a.length - 1).map(s => s.trim()));
        i++;
      }
      parts.push({ type: 'table', headers, rows });

    } else {
      const textLines: string[] = [];
      while (i < lines.length) {
        const c  = lines[i]?.trim() ?? "";
        const n  = lines[i + 1]?.trim() ?? "";
        const n2 = lines[i + 2]?.trim() ?? "";
        if ((isTableHeader(c) && isSeparator(n)) || (isSuperHeader(c) && isTableHeader(n) && isSeparator(n2))) break;
        textLines.push(lines[i]);
        i++;
      }
      const txt = textLines.join("\n").trim();
      if (txt) parts.push({ type: 'text', text: txt });
    }
  }

  return (
    <div dir={dir} style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }} className="space-y-6 w-full">
      {parts.map((part, index) => {
        if (part.type === "table") {
          const numCols = part.headers.length;

          return (
            <div key={index} className="overflow-x-auto my-6 rounded-xl border border-[#1a1a1a] shadow-sm bg-white">
              <table
                className="min-w-full text-sm"
                style={{
                  borderCollapse: 'collapse',
                  minWidth: isLandscape ? '1100px' : '750px',
                }}
              >
                <thead>
                  {part.superHeaders && part.superColspans && (
                    <tr>
                      {part.superHeaders.map((sh, shIdx) => (
                        <th
                          key={shIdx}
                          colSpan={part.superColspans![shIdx]}
                          style={{ background: '#ffffff', color: '#000000', border: '1px solid #1a1a1a' }}
                          className="px-4 py-2.5 text-[12px] font-bold text-center"
                        >
                          {sh}
                        </th>
                      ))}
                    </tr>
                  )}
                  <tr style={{ background: '#ffffff' }}>
                    {part.headers.map((header, hIdx) => (
                      <th
                        key={hIdx}
                        style={{ border: '1px solid #1a1a1a', color: '#000000' }}
                        className={`px-3 py-3 text-[12px] font-bold ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {part.rows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => {
                        return (
                          <td
                            key={cIdx}
                            style={{ border: '1px solid #1a1a1a', verticalAlign: 'middle', background: '#ffffff' }}
                            className={`px-3 py-2.5 text-[12px] text-[#000000] whitespace-normal break-words ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                          >
                            {cell}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return (
          <div key={index} className="space-y-4">
            {part.text.split("\n\n").map((pText, pIdx) => {
              const trimmed = pText.trim();
              if (!trimmed) return null;
              if (trimmed.startsWith("#")) {
                const level = (trimmed.match(/^#+/) || ["#"])[0].length;
                const cleanText = trimmed.replace(/^#+\s*/, "");
                if (level === 1) return <h1 key={pIdx} className="font-bold text-[#000000] tracking-tight text-xl border-b pb-2 mb-4">{cleanText}</h1>;
                if (level === 2) return <h2 key={pIdx} className="font-bold text-[#000000] tracking-tight text-lg mt-4 mb-2">{cleanText}</h2>;
                if (level === 3) return <h3 key={pIdx} className="font-bold text-[#000000] tracking-tight text-md">{cleanText}</h3>;
                return <h4 key={pIdx} className="font-bold text-[#000000] tracking-tight text-md">{cleanText}</h4>;
              }
              if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                const listItems = trimmed.split("\n").map(li => li.replace(/^[-*]\s*/, "").trim());
                return (
                  <ul key={pIdx} className="list-disc list-inside space-y-2 text-[14px] leading-relaxed text-[#3a3a3a] pl-4">
                    {listItems.map((item, itemIdx) => <li key={itemIdx}>{item}</li>)}
                  </ul>
                );
              }
              const boldRegex = /\*\*(.*?)\*\*/g;
              if (boldRegex.test(trimmed)) {
                const subParts = trimmed.split(/\*\*(.*?)\*\*/g);
                return (
                  <p key={pIdx} className="text-[14px] leading-relaxed text-[#2b2b2b] font-serif whitespace-pre-wrap">
                    {subParts.map((subText, subIdx) =>
                      subIdx % 2 === 1 ? <strong key={subIdx} className="font-bold text-[#1a1a1a]">{subText}</strong> : subText
                    )}
                  </p>
                );
              }
              return <p key={pIdx} className="text-[14px] leading-relaxed text-[#2b2b2b] font-serif whitespace-pre-wrap">{trimmed}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function DocumentTranslationPage() {
  const router = useRouter();
  const locale = useLocale();
  const isRTL = locale === "ar";
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stage, setStage] = useState<Stage>("empty");
  const [progress, setProgress] = useState(0);

  const [sourceLang, setSourceLang] = useState<string>("auto");
  const [targetLang, setTargetLang] = useState<string>("ar");
  const [isDownloading, setIsDownloading] = useState(false);

  const [translatedText, setTranslatedText] = useState("");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");

  const authContext = useAuth();
  const profile = authContext?.profile;
  const isAdmin = profile?.is_admin === true;
  const user = authContext?.user;
  const loading = authContext?.loading;

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login?redirect=/document-translation");
    }
  }, [user, loading, router]);

  const [trialStats, setTrialStats] = useState<any>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  useEffect(() => {
    const stats = getTrialStats(isAdmin, profile);
    if (stats) setTrialStats(stats);
  }, [isAdmin, profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f3]">
        <Loader2 className="w-10 h-10 animate-spin text-[#0d6e4e]" />
      </div>
    );
  }

  const handleFile = useCallback((f: File) => {
    if (f.size > 4 * 1024 * 1024) {
      toast.error("Fichier trop volumineux", {
        description: "La taille maximale autorisée est de 4 Mo pour éviter les déconnexions du serveur Vercel."
      });
      return;
    }
    setFile(f); setStage("selected");
    if (f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
      const img = new Image();
      img.src = url;
      img.onload = () => {
        if (img.width > img.height) {
          setOrientation("landscape");
          toast.info("Paysage détecté automatiquement !", { description: "Le document est plus large que haut." });
        } else {
          setOrientation("portrait");
        }
      };
    } else {
      setPreviewUrl(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleRemove = () => {
    setFile(null); setPreviewUrl(null); setStage("empty");
    setTranslatedText("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const fmt = (b: number) => b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} Mo` : `${(b / 1024).toFixed(0)} Ko`;

  const runDocumentTranslation = async () => {
    if (!file) return;

    const trial = checkTrialLimits('doc', isAdmin, profile);
    if (!trial.allowed) {
      if (trial.error === "expired" || trial.error === "doc_disabled_free") {
        toast.error("Fonctionnalité Premium", { description: "La traduction de documents par IA est réservée aux abonnés Pro et Plus. Veuillez passer à un forfait supérieur." });
      } else {
        setShowLimitModal(true);
      }
      return;
    }

    setStage("processing"); setProgress(0);
    const ticker = setInterval(() => {
      setProgress(p => Math.min(p + 1, 95));
    }, 200);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("sourceLanguage", sourceLang);
      fd.append("targetLanguage", targetLang);

      const headers: Record<string, string> = {};
      if (authContext?.user) {
        const token = await authContext.user.getIdToken();
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/document-translate", { method: "POST", headers, body: fd });
      clearInterval(ticker);

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(errText || `Erreur du serveur (Code: ${res.status}). Vérifiez la console.`);
      }

      if (!res.body) throw new Error("Stream non supporté par le navigateur");
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let outputText = "";
      
      setProgress(100);
      setStage("streaming");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        outputText += chunk;
        setTranslatedText(outputText.trimStart());

        // Dynamic auto-detect landscape while streaming
        const currentTrimmed = outputText.trimStart();
        if (currentTrimmed.includes("|")) {
          const tables = parseTables(currentTrimmed);
          const hasManyColumns = tables.some(t => t.headers.length > 6);
          if (hasManyColumns && orientation !== "landscape") {
            setOrientation("landscape");
          }
        }
      }
      setTranslatedText(outputText.trimStart());
      setStage("done");

      incrementTrialUsage('doc', isAdmin);
      const newStats = getTrialStats(isAdmin, profile);
      if (newStats) setTrialStats(newStats);
      
      toast.success("Traduction réussie !");
    } catch (err) {
      clearInterval(ticker); setStage("selected"); setProgress(0);
      toast.error(err instanceof Error ? err.message : "Échec de la traduction");
    }
  };

  const downloadWord = async () => {
    if (!translatedText) return;
    setIsDownloading(true);
    try {
      const tables = parseTables(translatedText);
      const res = await fetch("/api/export-docx", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: translatedText, tables, orientation }),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(errText || `Erreur serveur (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `traduction-${targetLang}-${Date.now()}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Document téléchargé avec succès !");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec du téléchargement du document Word");
    } finally {
      setIsDownloading(false);
    }
  };

  const sourceLanguages = [
    { code: "auto", label: "Détecter la langue" },
    { code: "fr", label: "Français" },
    { code: "en", label: "Anglais" },
    { code: "ar", label: "Arabe" },
    { code: "es", label: "Espagnol" },
    { code: "it", label: "Italien" },
  ];

  const targetLanguages = [
    { code: "ar", label: "Arabe" },
    { code: "fr", label: "Français" },
    { code: "en", label: "Anglais" },
    { code: "es", label: "Espagnol" },
    { code: "it", label: "Italien" },
  ];

  return (
    <div className="min-h-screen lg:h-screen flex flex-col lg:overflow-hidden overflow-y-auto" style={{ background: "#faf8f3" }}>
      <Toaster position="top-right" richColors />
      {showLimitModal && <TrialLimitModal type="doc" onClose={() => setShowLimitModal(false)} />}
      <TopBar />
      {trialStats && <UpgradeBanner tier={trialStats.tier} />}

      <div className="h-auto min-h-[42px] py-2 lg:py-0 shrink-0 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 border-b bg-white gap-2 sm:gap-0" style={{ borderColor: "#e5e3dc" }}>
        <div className="flex items-center gap-2 text-[12px]">
          <span className="cursor-pointer transition-colors hover:text-[#1a1a1a]" style={{ color: "#8a8a8a" }} onClick={() => router.push("/dashboard")}>Documents</span>
          <ChevronRight className="h-3 w-3" style={{ color: "#c0bdb5" }} />
          <span className="font-semibold" style={{ color: "#1a1a1a" }}>Document AI Translation</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-[11px]" style={{ color: "#a8a8a8" }}>
          <span className="hidden sm:flex items-center gap-1.5"><Shield className="h-3 w-3" style={{ color: "#0d6e4e" }} />Traduction Automatisée</span>
          {trialStats && (
            <span className="flex items-center gap-1.5 font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background:
                      trialStats.isAdmin ? "#f3e8ff"
                      : trialStats.tier === 'pro'  ? "#dcfce7"
                      : trialStats.tier === 'plus' ? "#dbeafe"
                      : trialStats.tier === 'free' ? "#fff7ed"
                      : (trialStats.todayLeftDoc === 0 ? "#ffebee" : "#fffbeb"),
                    color:
                      trialStats.isAdmin ? "#7e22ce"
                      : trialStats.tier === 'pro'  ? "#15803d"
                      : trialStats.tier === 'plus' ? "#1e40af"
                      : trialStats.tier === 'free' ? "#c2410c"
                      : (trialStats.todayLeftDoc === 0 ? "#c62828" : "#92400e"),
                  }}>
              {trialStats.isAdmin
                ? "👑 Admin : Illimité"
                : trialStats.tier === 'pro'
                ? `⭐ Pro : ${trialStats.countDoc}/1 document`
                : trialStats.tier === 'plus'
                ? `🚀 Plus : ${trialStats.countDoc}/5 documents`
                : trialStats.tier === 'free'
                ? (isRTL ? "ترجمة المستندات: معطّلة" : "Document AI : Désactivé")
                : `Essai : ${trialStats.daysLeft}j · ${trialStats.countDoc}/2 documents`
              }
            </span>
          )}
        </div>
      </div>

      {trialStats?.tier === 'free' ? (
        <div className="flex-1 flex items-center justify-center p-4 md:p-6 max-w-4xl mx-auto w-full min-h-0">
          <div className="w-full rounded-2xl bg-white p-8 md:p-12 text-center shadow-lg border border-[#e5e3dc] flex flex-col items-center gap-6"
               dir={isRTL ? "rtl" : "ltr"}>
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center border border-amber-200 animate-pulse shrink-0">
              <Lock className="w-7 h-7 text-amber-600" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {isRTL ? "ترجمة المستندات بالذكاء الاصطناعي (ميزة مميزة)" : "Traduction de documents par IA (Premium)"}
              </h2>
              <p className="text-gray-500 text-sm max-w-lg mx-auto leading-relaxed">
                {isRTL 
                  ? "ترجمة ملفات PDF وWord والصور مع الحفاظ على التنسيق الأصلي هي ميزة حصرية لمشتركي Pro و Plus." 
                  : "La traduction de documents PDF, Word et images en conservant la mise en page originale est réservée aux abonnés Pro et Plus."}
              </p>
            </div>

            <div className="w-full max-w-md bg-slate-50 border border-slate-100 rounded-xl p-5 my-2 space-y-3 text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                {isRTL ? "ما الذي تحصل عليه مع النسخة المميزة:" : "Ce que vous obtenez avec la version Premium :"}
              </h4>
              <div className="flex items-start gap-2.5 text-[13px] text-slate-700">
                <span className="text-[#0d6e4e] shrink-0 font-bold">✓</span>
                <span>{isRTL ? "الحفاظ التام على التنسيق الأصلي والجداول والصور" : "Conserve la mise en page originale, les tableaux et les images"}</span>
              </div>
              <div className="flex items-start gap-2.5 text-[13px] text-slate-700">
                <span className="text-[#0d6e4e] shrink-0 font-bold">✓</span>
                <span>{isRTL ? "ترجمة فائقة السرعة بواسطة ذكاء اصطناعي متقدم" : "Traduction ultra-rapide par IA avancée"}</span>
              </div>
              <div className="flex items-start gap-2.5 text-[13px] text-slate-700">
                <span className="text-[#0d6e4e] shrink-0 font-bold">✓</span>
                <span>{isRTL ? "تحميل المستند بصيغة Word (.docx) جاهز للاستخدام" : "Téléchargement au format Word (.docx) prêt à l'emploi"}</span>
              </div>
              <div className="flex items-start gap-2.5 text-[13px] text-slate-700">
                <span className="text-[#0d6e4e] shrink-0 font-bold">✓</span>
                <span>{isRTL ? "دعم كامل للمستندات والملفات الكبيرة" : "Support complet pour les documents et fichiers volumineux"}</span>
              </div>
            </div>

            <button
              onClick={() => router.push("/billing")}
              className="flex items-center justify-center gap-2 px-8 h-12 rounded-xl font-bold text-[14px] bg-[#0d6e4e] text-white hover:bg-[#0a5a40] transition-all hover:scale-105 shadow-md shadow-[#0d6e4e]/10"
            >
              <Sparkles className="w-4 h-4 fill-white" />
              {isRTL ? "الترقية إلى النسخة المميزة" : "Passer à la version Premium"}
              <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden p-4 md:p-6 gap-4 max-w-[1600px] mx-auto w-full min-h-0">

        {/* LEFT PANEL: Source */}
        <div className="w-full lg:w-[48%] min-h-[380px] lg:min-h-0 flex flex-col rounded-xl overflow-hidden bg-white shrink-0 lg:shrink" style={{ border: "1px solid #e5e3dc", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          {/* Language Tabs - DeepL Style */}
          <div className="h-[52px] shrink-0 flex items-center border-b overflow-x-auto no-scrollbar" style={{ borderColor: "#f0ede8", background: "#fff" }}>
            <div className="flex items-center px-2">
              {sourceLanguages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setSourceLang(lang.code)}
                  className={`px-4 h-[52px] text-[13px] font-semibold transition-all relative whitespace-nowrap
                    ${sourceLang === lang.code ? "text-[#1e40af]" : "text-[#595959] hover:text-[#1a1a1a]"}`}
                >
                  {lang.label}
                  {sourceLang === lang.code && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1e40af] rounded-t-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto flex flex-col p-6">
            {/* Upload Area */}
            {stage === "empty" && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 rounded-2xl transition-all duration-200 cursor-pointer"
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                style={{
                  border: isDragging ? "2px dashed #1e40af" : "2px dashed #e5e3dc",
                  background: isDragging ? "rgba(30,64,175,0.04)" : "#fafaf9",
                }}>
                <Upload className="h-10 w-10 mb-4" style={{ color: isDragging ? "#1e40af" : "#a8a8a8" }} />
                <p className="text-[16px] font-bold text-[#1a1a1a] mb-2">Déposez votre document à traduire</p>
                <p className="text-[13px] text-[#8a8a8a] text-center max-w-[300px] leading-relaxed">PDF, JPG, PNG. L'IA traduira le contenu en conservant parfaitement la mise en page.</p>
                <button className="mt-6 px-6 h-10 rounded-lg text-sm font-bold text-white bg-[#1e40af] hover:bg-[#1e3a8a] transition-colors">
                  Parcourir les fichiers
                </button>
                <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>
            )}

            {/* Selected File Details */}
            {(stage === "selected" || stage === "processing" || stage === "streaming" || stage === "done") && file && (
              <div className="flex-1 flex flex-col">
                <div className="p-4 rounded-xl border flex items-center justify-between mb-auto" style={{ borderColor: "#e5e3dc", background: "#f5f3ee" }}>
                  <div className="flex items-center gap-4">
                    <FileBadge2 className="h-10 w-10 text-[#1e40af]" />
                    <div>
                      <p className="text-sm font-bold text-[#1a1a1a] mb-0.5">{file.name}</p>
                      <p className="text-xs text-[#8a8a8a]">{fmt(file.size)}</p>
                    </div>
                  </div>
                  {(stage !== "processing" && stage !== "streaming") && (
                    <button onClick={handleRemove} className="w-8 h-8 rounded-full bg-white border border-[#e5e3dc] flex items-center justify-center text-[#a8a8a8] hover:text-red-500 hover:border-red-200 transition-colors shadow-sm">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {(stage === "selected" || stage === "processing" || stage === "streaming" || stage === "done") && (
                  <div className="mt-8 flex flex-col items-center justify-center gap-4">
                    {previewUrl ? (
                      <div className="w-full max-h-[400px] overflow-hidden rounded-xl border border-[#e5e3dc] bg-white flex items-center justify-center p-2 shadow-inner">
                        <img src={previewUrl} alt="Preview" className="max-w-full max-h-[380px] object-contain rounded-lg" />
                      </div>
                    ) : (
                      <FileImage className="w-32 h-32 text-[#f0ede8]" />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Button */}
          {stage === "selected" && (
            <div className="p-4 border-t flex justify-between items-center" style={{ borderColor: "#f0ede8", background: "#fafaf9" }}>
              <div>
                {trialStats && !trialStats.isAdmin && (
                <div className={`flex items-center gap-3 text-xs font-medium px-3 py-1.5 rounded-full border ${
                  trialStats.tier === 'pro'  ? 'bg-green-50 text-green-900 border-green-200'
                  : trialStats.tier === 'plus' ? 'bg-blue-50 text-blue-900 border-blue-200'
                  : trialStats.tier === 'free' ? 'bg-red-50 text-red-900 border-red-200'
                  : 'bg-amber-50 text-amber-900 border-amber-200'
                }`}>
                  {trialStats.tier === 'pro' ? (
                    <><span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> ⭐ Pro</span><div className="w-px h-3 bg-green-300" /><span>{trialStats.countDoc}/1 document utilisé</span></>
                  ) : trialStats.tier === 'plus' ? (
                    <><span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> 🚀 Plus</span><div className="w-px h-3 bg-blue-300" /><span>{trialStats.countDoc}/5 documents utilisés</span></>
                  ) : trialStats.tier === 'free' ? (
                    <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Document AI désactivé</span>
                  ) : (
                    <><span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-600" /> {trialStats.daysLeft}j</span><div className="w-px h-3 bg-amber-300" /><span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-amber-600" /> {trialStats.todayLeftDoc} doc / jour</span></>
                  )}
                </div>
              )}
              </div>
              <button onClick={runDocumentTranslation}
                className="px-8 h-12 rounded-xl font-bold text-[14px] text-white flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-[#1e40af]/20 bg-[#1e40af] hover:bg-[#1e3a8a] hover:-translate-y-0.5">
                <Sparkles className="h-4 w-4" />
                Traduire le document
              </button>
            </div>
          )}
        </div>

        {/* Divider / Swap Icon */}
        <div className="flex flex-row lg:flex-col items-center justify-center shrink-0 h-12 lg:h-auto w-full lg:w-12 z-10 my-1 lg:my-0 lg:-mx-6">
          <button
            onClick={() => {
              if (sourceLang !== 'auto') {
                const temp = sourceLang;
                setSourceLang(targetLang);
                setTargetLang(temp);
              }
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white hover:bg-[#f5f3ed] transition-colors"
            style={{ border: "1px solid #e5e3dc", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <ArrowRightLeft className="h-4 w-4 text-[#595959] rotate-90 lg:rotate-0" />
          </button>
        </div>

        {/* RIGHT PANEL: Target */}
        <div className="w-full lg:flex-1 min-h-[380px] lg:min-h-0 flex flex-col rounded-xl overflow-hidden bg-white shrink-0 lg:shrink" style={{ border: "1px solid #e5e3dc", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          {/* Language Tabs - DeepL Style */}
          <div className="h-[52px] shrink-0 flex items-center border-b overflow-x-auto no-scrollbar" style={{ borderColor: "#f0ede8", background: "#fff" }}>
            <div className="flex items-center px-2">
              {targetLanguages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setTargetLang(lang.code)}
                  className={`px-4 h-[52px] text-[13px] font-semibold transition-all relative whitespace-nowrap
                    ${targetLang === lang.code ? "text-[#0d6e4e]" : "text-[#595959] hover:text-[#1a1a1a]"}`}
                >
                  {lang.label}
                  {targetLang === lang.code && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0d6e4e] rounded-t-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 p-6 overflow-auto bg-[#fafaf9]">
            {(stage === "streaming" || stage === "done") && translatedText.trim() !== "" ? (
              <div
                dir={targetLang === 'ar' ? 'rtl' : 'ltr'}
                className="w-full h-full p-6 bg-white border rounded-xl shadow-sm overflow-auto animate-fade-in"
                style={{
                  borderColor: "#e5e3dc",
                  direction: targetLang === 'ar' ? 'rtl' : 'ltr',
                }}
              >
                {stage === "streaming" ? (
                  <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-[#0d6e4e]/5 border border-[#0d6e4e]/10">
                    <div className="relative w-6 h-6 shrink-0">
                      <div className="absolute inset-0 rounded-full border border-[#f0ede8]" />
                      <div className="absolute inset-0 rounded-full border border-[#0d6e4e] border-t-transparent animate-spin" />
                      <Languages className="absolute inset-0 m-auto h-2.5 w-2.5" style={{ color: "#0d6e4e" }} />
                    </div>
                    <p className="text-[13px] text-[#0d6e4e] font-bold">
                      Génération et formatage du document traduit...
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-[#0d6e4e]/5 border border-[#0d6e4e]/10">
                    <CheckCircle2 className="w-5 h-5 text-[#0d6e4e]" />
                    <p className="text-[13px] text-[#0d6e4e] font-bold">
                      Traduction générée et formatée avec succès !
                    </p>
                  </div>
                )}
                <MarkdownPreview content={translatedText} dir={targetLang === 'ar' ? 'rtl' : 'ltr'} isLandscape={orientation === "landscape"} />
              </div>
            ) : (stage === "processing" || stage === "streaming") ? (
              <div className="h-full flex flex-col items-center justify-center gap-6">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-[#e5e3dc]" />
                  <div className="absolute inset-0 rounded-full border-4 border-[#0d6e4e] border-t-transparent animate-spin" />
                  <Languages className="absolute inset-0 m-auto h-7 w-7" style={{ color: "#0d6e4e" }} />
                </div>
                <div className="text-center">
                  <p className="text-[16px] font-bold text-[#1a1a1a]">Analyse et traduction en cours...</p>
                  <p className="text-[13px] text-[#8a8a8a] mt-1 max-w-[320px] leading-relaxed">
                    L'IA analyse la structure de votre document pour le traduire en conservant parfaitement la mise en page.
                  </p>
                </div>
                <div className="w-full max-w-[250px] h-2 bg-[#f0ede8] rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-[#0d6e4e] transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center bg-white shadow-sm border border-[#e5e3dc]">
                  <Languages className="h-10 w-10 text-[#d4d4d4]" />
                </div>
                <p className="text-[16px] font-bold text-[#595959]">Prêt pour la traduction</p>
                <p className="text-[13px] text-[#a8a8a8] max-w-[320px] text-center leading-relaxed">
                  Le document traduit apparaîtra ici avec la même structure (tableaux, paragraphes) que l'original.
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          {stage === "done" && (
            <div className="p-4 border-t flex justify-between items-center gap-3" style={{ borderColor: "#f0ede8", background: "#fff" }}>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#7a7a7a]">Orientation document :</span>
                <div className="inline-flex rounded-lg border border-[#e5e3dc] p-0.5 bg-[#faf8f3]">
                  <button
                    onClick={() => setOrientation("portrait")}
                    className={`px-3 h-7 text-[11px] font-bold rounded-md transition-all flex items-center gap-1 ${orientation === 'portrait' ? 'bg-[#0d6e4e] text-white shadow-sm' : 'text-[#595959] hover:text-[#1a1a1a]'}`}
                  >
                    📄 Vertical
                  </button>
                  <button
                    onClick={() => setOrientation("landscape")}
                    className={`px-3 h-7 text-[11px] font-bold rounded-md transition-all flex items-center gap-1 ${orientation === 'landscape' ? 'bg-[#0d6e4e] text-white shadow-sm' : 'text-[#595959] hover:text-[#1a1a1a]'}`}
                  >
                    📑 Horizontal
                  </button>
                </div>
              </div>
              <button onClick={downloadWord} disabled={isDownloading}
                className="px-8 h-12 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2.5 transition-all bg-[#0d6e4e] text-white hover:bg-[#0a5a40] shadow-lg shadow-[#0d6e4e]/20">
                {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Télécharger le document Word (.docx)
              </button>
            </div>
          )}
        </div>

      </div>
      )}
    </div>
  );
}
