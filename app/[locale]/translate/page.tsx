"use client";

import { useState, useEffect, useRef } from "react";
import { TopBar } from "@/components/layout/top-bar";
import {
  Languages, Copy, Trash2, Check, Loader2,
  ChevronRight, ArrowRightLeft, Download, Shield
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getTrialStats } from "@/lib/trial";
import { UpgradeBanner } from "@/components/upgrade-banner";

export default function TranslatePage() {
  const router = useRouter();
  const authContext = useAuth();
  const profile = authContext?.profile;
  const isAdmin = profile?.is_admin === true;

  const [trialStats, setTrialStats] = useState<any>(null);

  useEffect(() => {
    const stats = getTrialStats(isAdmin, profile);
    if (stats) setTrialStats(stats);
  }, [isAdmin, profile]);

  const MAX_WORDS = 500;
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  const [sourceLanguage, setSourceLanguage] = useState("fr");
  const [targetLanguage, setTargetLanguage] = useState("ar");

  const languages = [
    { code: "fr", label: "Français", flag: "🇫🇷", nameAr: "الفرنسية" },
    { code: "ar", label: "Arabe", flag: "🇩🇿", nameAr: "العربية" },
    { code: "en", label: "Anglais", flag: "🇬🇧", nameAr: "الإنجليزية" },
    { code: "it", label: "Italien", flag: "🇮🇹", nameAr: "الإيطالية" },
    { code: "es", label: "Espagnol", flag: "🇪🇸", nameAr: "الإسبانية" },
  ];

  const swapLanguages = () => {
    const prevSourceText = sourceText;
    const prevTranslatedText = translatedText;
    
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    
    if (prevTranslatedText) {
      setSourceText(prevTranslatedText);
      setTranslatedText(prevSourceText);
      lastTranslated.current = `${targetLanguage}->${sourceLanguage}:${prevTranslatedText}`;
    } else if (sourceText.trim()) {
      setIsTranslating(true);
    }
  };

  const countWords = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;
  const wordCount = sourceText.trim() ? countWords(sourceText) : 0;
  const isAtLimit = wordCount >= MAX_WORDS;

  const handleSourceChange = (val: string) => {
    const words = val.trim().split(/\s+/).filter(Boolean);
    if (words.length > MAX_WORDS) {
      setSourceText(words.slice(0, MAX_WORDS).join(" "));
      toast.error("Limite de 500 mots atteinte");
    } else {
      setSourceText(val);
    }

    if (val.trim()) {
      setIsTranslating(true);
    } else {
      setIsTranslating(false);
      setTranslatedText("");
    }
  };
  const [isDownloading, setIsDownloading] = useState(false);
  const lastTranslated = useRef("");

  // Load text from sessionStorage (sent from OCR page)
  useEffect(() => {
    const stored = sessionStorage.getItem("translationInput");
    if (stored) {
      setSourceText(stored);
      setIsTranslating(true);
      sessionStorage.removeItem("translationInput");
      toast.success("Texte chargé depuis l'OCR");
    }
  }, []);

  // Auto-translate on text change (debounced 1.5s)
  useEffect(() => {
    const timer = setTimeout(async () => {
      const text = sourceText.trim();
      if (!text) {
        setTranslatedText("");
        lastTranslated.current = "";
        setIsTranslating(false);
        return;
      }
      const cacheKey = `${sourceLanguage}->${targetLanguage}:${text}`;
      if (cacheKey === lastTranslated.current) {
        setIsTranslating(false);
        return;
      }
      setIsTranslating(true);
      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, sourceLanguage, targetLanguage }),
        });

        if (!response.ok) {
          throw new Error("Échec de la traduction");
        }

        const data = await response.json();
        if (data.success && data.translation) {
          setTranslatedText(data.translation);
          lastTranslated.current = cacheKey;
        } else {
          throw new Error(data.error || "Erreur de traduction");
        }
      } catch (err: any) {
        toast.error("Service temporairement indisponible", { description: err.message || "Veuillez réessayer dans quelques instants." });
      } finally {
        setIsTranslating(false);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [sourceText, sourceLanguage, targetLanguage]);

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copié dans le presse-papier");
  };

  const downloadWord = async () => {
    if (!translatedText) return;
    setIsDownloading(true);
    try {
      const res = await fetch("/api/export-docx", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: translatedText }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `traduction-${Date.now()}.docx` });
      a.click(); URL.revokeObjectURL(a.href);
      toast.success("Document téléchargé");
    } catch { toast.error("Échec du téléchargement"); }
    finally { setIsDownloading(false); }
  };

  const activeSourceLang = languages.find(l => l.code === sourceLanguage);
  const activeTargetLang = languages.find(l => l.code === targetLanguage);
  const isTargetRTL = targetLanguage === "ar";
  const isSourceRTL = sourceLanguage === "ar";

  return (
    <div className="min-h-screen lg:h-screen flex flex-col lg:overflow-hidden overflow-y-auto" style={{ background: "#f5f3ee" }}>
      <Toaster position="top-right" richColors />
      <TopBar />
      {trialStats && <UpgradeBanner tier={trialStats.tier} />}

      {/* Breadcrumb strip — matches OCR & dashboard */}
      <div className="h-auto min-h-[42px] py-2 lg:py-0 shrink-0 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 border-b bg-white gap-2 sm:gap-0" style={{ borderColor: "#e5e3dc" }}>
        <div className="flex items-center gap-2 text-[12px]">
          <span className="cursor-pointer hover:text-[#1a1a1a] transition-colors" style={{ color: "#8a8a8a" }}
            onClick={() => router.push("/dashboard")}>Documents</span>
          <ChevronRight className="h-3 w-3" style={{ color: "#c0bdb5" }} />
          <span className="cursor-pointer hover:text-[#1a1a1a] transition-colors" style={{ color: "#8a8a8a" }}
            onClick={() => router.push("/ocr")}>Extraction OCR</span>
          <ChevronRight className="h-3 w-3" style={{ color: "#c0bdb5" }} />
          <span className="font-semibold" style={{ color: "#1a1a1a" }}>Traduction</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-[11px]" style={{ color: "#a8a8a8" }}>
          <span className="hidden sm:flex items-center gap-1.5"><Shield className="h-3 w-3" style={{ color: "#0d6e4e" }} />Traduction juridique</span>
          <span className="flex items-center gap-1.5 font-medium">
            <Languages className="h-3.5 w-3.5 text-[#0d6e4e]" />
            {activeSourceLang?.label} {activeSourceLang?.flag} → {activeTargetLang?.label} {activeTargetLang?.flag}
          </span>
          {trialStats && (
            <span className="flex items-center gap-1.5 font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background:
                      trialStats.isAdmin ? "#f3e8ff"
                      : trialStats.tier === 'pro'  ? "#dcfce7"
                      : trialStats.tier === 'plus' ? "#dbeafe"
                      : trialStats.tier === 'free' ? "#f0fdf4"
                      : "#fffbeb",
                    color:
                      trialStats.isAdmin ? "#7e22ce"
                      : trialStats.tier === 'pro'  ? "#15803d"
                      : trialStats.tier === 'plus' ? "#1e40af"
                      : trialStats.tier === 'free' ? "#16a34a"
                      : "#92400e",
                  }}>
              {trialStats.isAdmin
                ? "👑 Admin : Illimité"
                : trialStats.tier === 'pro'
                ? "⭐ Pro : Traduction illimitée"
                : trialStats.tier === 'plus'
                ? "🚀 Plus : Traduction illimitée"
                : trialStats.tier === 'free'
                ? "✓ Gratuit : Traduction illimitée"
                : `Essai : ${trialStats.daysLeft}j restants`
              }
            </span>
          )}
        </div>
      </div>

      {/* Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden p-4 md:p-8 gap-4 lg:gap-6 max-w-[1600px] w-full mx-auto min-h-0">

        {/* ── LEFT: Source ── */}
        <div className="w-full lg:flex-1 min-h-[380px] lg:min-h-0 flex flex-col rounded-xl overflow-hidden bg-white shrink-0 lg:shrink" style={{ border: "1px solid #e5e3dc", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>

          <div className="h-[44px] shrink-0 flex items-center justify-between px-4 border-b bg-[#fafaf9]" style={{ borderColor: "#f0ede8" }}>
            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    if (lang.code === targetLanguage) {
                      swapLanguages();
                    } else {
                      setSourceLanguage(lang.code);
                      if (sourceText.trim()) setIsTranslating(true);
                    }
                  }}
                  className={`h-7 px-3 text-[11px] font-bold rounded-md transition-all whitespace-nowrap ${
                    sourceLanguage === lang.code
                      ? "bg-[#0d6e4e] text-white shadow-sm"
                      : "bg-transparent text-[#595959] hover:bg-[#eae7e0] hover:text-[#1a1a1a]"
                  }`}
                >
                  <span className="mr-1">{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setSourceText("")}
              className="w-6 h-6 rounded flex items-center justify-center transition-colors text-gray-400 hover:text-red-600 hover:bg-red-50 ml-2 shrink-0">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <textarea
            value={sourceText}
            onChange={e => handleSourceChange(e.target.value)}
            placeholder={
              sourceLanguage === "ar"
                ? "اكتب أو الصق النص القانوني هنا..."
                : sourceLanguage === "en"
                ? "Type or paste your legal text here..."
                : sourceLanguage === "it"
                ? "Scrivi o incolla il tuo testo legale qui..."
                : sourceLanguage === "es"
                ? "Escriba o pegue su texto legal aquí..."
                : "Saisissez ou collez votre texte juridique ici... (max 500 mots)"
            }
            dir={isSourceRTL ? "rtl" : "ltr"}
            className={`flex-1 w-full resize-none focus:outline-none transition-all ${
              isSourceRTL ? "font-arabic" : "font-sans"
            }`}
            style={{
              padding: "24px 28px",
              fontSize: isSourceRTL ? "16px" : "15px",
              lineHeight: isSourceRTL ? "2" : "1.7",
              color: "#1a1a1a",
              background: "white",
              letterSpacing: "0.01em",
            }}
          />

          <div className="px-5 py-2.5 border-t flex items-center justify-between" style={{ borderColor: "#f0ede8", background: "#fafaf9" }}>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold tabular-nums" style={{ color: isAtLimit ? "#dc2626" : wordCount > 400 ? "#b08d3c" : "#1a1a1a" }}>
                {wordCount} / {MAX_WORDS} mots
              </span>
              {/* Progress bar */}
              <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "#f0ede8" }}>
                <div className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min((wordCount / MAX_WORDS) * 100, 100)}%`,
                    background: isAtLimit ? "#dc2626" : wordCount > 400 ? "#b08d3c" : "#0d6e4e",
                  }} />
              </div>
            </div>
            <span className="text-[11px] font-medium flex items-center gap-1.5" style={{ color: isAtLimit ? "#dc2626" : "#0d6e4e" }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: isAtLimit ? "#dc2626" : "#0d6e4e" }} />
              {isAtLimit ? "Limite atteinte" : "Prêt"}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="flex flex-row lg:flex-col items-center justify-center shrink-0 gap-2 py-1 lg:py-0">
          <button 
            onClick={swapLanguages}
            title="Inverser les langues"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-[#e5e3dc] shadow-md hover:bg-[#fafaf9] hover:border-[#0d6e4e] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ArrowRightLeft className="h-4 w-4 text-[#0d6e4e] rotate-90 lg:rotate-0" />
          </button>
        </div>

        {/* ── RIGHT: Translation ── */}
        <div className="w-full lg:flex-1 min-h-[380px] lg:min-h-0 flex flex-col rounded-xl overflow-hidden bg-white shrink-0 lg:shrink" style={{ border: "1px solid #e5e3dc", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>

          <div className="h-[44px] shrink-0 flex items-center justify-between px-4 border-b bg-[#fafaf9]" style={{ borderColor: "#f0ede8" }}>
            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    if (lang.code === sourceLanguage) {
                      swapLanguages();
                    } else {
                      setTargetLanguage(lang.code);
                      if (sourceText.trim()) setIsTranslating(true);
                    }
                  }}
                  className={`h-7 px-3 text-[11px] font-bold rounded-md transition-all whitespace-nowrap ${
                    targetLanguage === lang.code
                      ? "bg-[#0d6e4e] text-white shadow-sm"
                      : "bg-transparent text-[#595959] hover:bg-[#eae7e0] hover:text-[#1a1a1a]"
                  }`}
                >
                  <span className="mr-1">{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <button onClick={handleCopy} disabled={!translatedText}
                className="w-7 h-7 rounded flex items-center justify-center transition-colors disabled:opacity-30 text-[#8a8a8a] hover:bg-[#eae7e0] hover:text-[#1a1a1a]">
                {copied ? <Check className="h-3.5 w-3.5" style={{ color: "#0d6e4e" }} /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <button onClick={downloadWord} disabled={!translatedText || isDownloading}
                className="w-7 h-7 rounded flex items-center justify-center transition-colors disabled:opacity-30 text-[#8a8a8a] hover:bg-[#eae7e0] hover:text-[#1a1a1a]">
                {isDownloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto" style={{ padding: "24px" }}>
            {isTranslating ? (
              <div className="h-full flex flex-col items-center justify-center gap-4">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-2 border-[#f0ede8]" />
                  <div className="absolute inset-0 rounded-full border-2 border-[#0d6e4e] border-t-transparent animate-spin" />
                  <Languages className="absolute inset-0 m-auto h-5 w-5" style={{ color: "#0d6e4e" }} />
                </div>
                <div className="text-center">
                  <p className="text-[14px] font-medium" style={{ color: "#595959" }}>Traduction en cours...</p>
                  <p className="text-[12px] mt-1 font-arabic" style={{ color: "#a8a8a8" }}>جاري الترجمة...</p>
                </div>
                <div className="flex flex-col gap-2.5 w-full max-w-[280px] mt-2">
                  {[70, 85, 60, 75].map((w, i) => (
                    <div key={i} className="h-3 rounded-lg animate-pulse"
                      style={{ width: `${w}%`, background: "#f0ede8", animationDelay: `${i * 80}ms` }} />
                  ))}
                </div>
              </div>
            ) : translatedText ? (
              <div dir={isTargetRTL ? "rtl" : "ltr"} className={`w-full h-full whitespace-pre-wrap ${isTargetRTL ? "font-arabic" : "font-sans"}`}
                style={{
                  fontSize: isTargetRTL ? "16px" : "15px",
                  lineHeight: isTargetRTL ? "2" : "1.7",
                  color: "#1a1a1a"
                }}>
                {translatedText}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#f5f3ed" }}>
                  <Languages className="h-6 w-6" style={{ color: "#d4d4d4" }} />
                </div>
                <div className="text-center">
                  <p className="text-[14px] font-medium" style={{ color: "#595959" }}>Prêt pour la traduction</p>
                  <p className="text-[12px] mt-1 max-w-[200px] leading-relaxed" style={{ color: "#a8a8a8" }}>
                    La traduction apparaîtra ici automatiquement
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="px-5 py-2.5 border-t flex items-center justify-between" style={{ borderColor: "#f0ede8", background: "#fafaf9" }}>
            <span className="text-[11px] text-[#a8a8a8]">
              {translatedText.length} {isTargetRTL ? "حرف" : "caractères"}
            </span>
            <span className="text-[11px] font-medium" style={{ color: "#595959" }}>Moteur LegTrans DZ v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
