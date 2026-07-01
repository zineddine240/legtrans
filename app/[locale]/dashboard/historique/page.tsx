"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations, useLocale } from "next-intl";
import { Loader2, FileText, Download, Clock, CheckCircle2, History, ScanText, TableProperties, ArrowLeft, Eye, Copy, X, Code } from "lucide-react";
import { Link } from "@/src/i18n/routing";
import { toast } from "sonner";

interface HistoryItem {
  document_id: string;
  mode: string;
  original_file_name: string;
  original_mime_type: string;
  page_count: number;
  created_at: string;
  status: string;
  original_text: string;
  corrected_text: string | null;
  html_output: string | null;
  table_detected: boolean;
  was_edited: boolean;
  corrected_at: string | null;
}

export default function HistoriquePage() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const router = useRouter();
  
  const authContext = useAuth();
  const user = authContext?.user;
  const loading = authContext?.loading;
  const profile = authContext?.profile;

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login?redirect=/dashboard/historique");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/history", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur de chargement");
        
        setHistory(data.history || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setFetching(false);
      }
    }

    if (user && !loading) {
      fetchHistory();
    }
  }, [user, loading]);

  const handleDownloadMarkdown = (item: HistoryItem) => {
    const content = item.corrected_text || item.original_text;
    if (!content) return;
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = item.original_file_name.replace(/\.[^/.]+$/, "");
    a.download = `${safeName}_resultat.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadHtml = (item: HistoryItem) => {
    if (!item.html_output) return;
    const blob = new Blob([item.html_output], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = item.original_file_name.replace(/\.[^/.]+$/, "");
    a.download = `${safeName}_resultat.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyText = async (item: HistoryItem) => {
    const content = item.corrected_text || item.original_text;
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      toast.success(isRTL ? "تم نسخ النص بنجاح" : "Texte copié avec succès");
    } catch (err) {
      toast.error(isRTL ? "فشل النسخ" : "Échec de la copie");
    }
  };

  // Restrict to Pro/Plus/Admin
  const isPaidOrAdmin = profile?.is_admin === true || profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'plus';

  if (loading || (!profile && fetching)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f3]">
        <Loader2 className="w-10 h-10 animate-spin text-[#0d6e4e]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#faf8f3" }}>
      <TopBar />

      {/* Header */}
      <div className="bg-white border-b px-4 md:px-8 py-5" style={{ borderColor: "#e5e3dc" }}>
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <ArrowLeft className={`w-4 h-4 text-gray-600 ${isRTL ? 'rotate-180' : ''}`} />
          </Link>
          <div>
            <p className="text-[12px] font-medium mb-0.5" style={{ color: "#8a8a8a" }}>
              {isRTL ? "لوحة التحكم" : "Tableau de bord"}
            </p>
            <h1 className="text-[22px] font-bold flex items-center gap-2" style={{ color: "#1a1a1a", letterSpacing: "-0.03em" }}>
              <History className="w-5 h-5 text-[#0d6e4e]" />
              {isRTL ? "سجل الاستخراجات" : "Historique des extractions"}
            </h1>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 py-6 md:py-8">
        <div className="bg-white rounded-2xl border border-[#e5e3dc] shadow-sm overflow-hidden">
            
          <div className="px-6 py-5 border-b border-[#e5e3dc] flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-gray-900">
              {isRTL ? "المستندات المستخرجة مؤخراً" : "Documents extraits récemment"}
            </h2>
          </div>

          <div className="p-0">
            {fetching ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#0d6e4e]" />
                <p className="text-[13px] font-medium">{isRTL ? "جاري تحميل السجل..." : "Chargement de l'historique..."}</p>
              </div>
            ) : error ? (
              <div className="py-12 px-6 text-center text-red-500 text-[13px] font-medium bg-red-50">
                {error}
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400 text-center px-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                  <FileText className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-[15px] font-bold text-gray-900 mb-1">
                  {isRTL ? "لا توجد عمليات استخراج محفوظة بعد." : "Vous n'avez pas encore d'extractions enregistrées."}
                </h3>
                <Link href="/ocr" className="mt-6 h-10 px-6 rounded-xl font-bold text-[13px] text-white bg-[#0d6e4e] hover:bg-[#0a5a40] flex items-center justify-center transition-all">
                  {isRTL ? "استخراج جديد" : "Nouvelle extraction"}
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                      <tr className="bg-[#faf8f3] border-b border-[#e5e3dc]">
                        <th className={`py-3 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                          {isRTL ? "اسم الملف" : "Nom du fichier"}
                        </th>
                        <th className={`py-3 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                          {isRTL ? "النوع" : "Type"}
                        </th>
                        <th className={`py-3 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                          {isRTL ? "الصفحات" : "Pages"}
                        </th>
                        <th className={`py-3 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                          {isRTL ? "التاريخ" : "Date"}
                        </th>
                        <th className={`py-3 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                          {isRTL ? "الحالة" : "Statut"}
                        </th>
                        <th className={`py-3 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider ${isRTL ? 'text-left' : 'text-right'}`}>
                          {isRTL ? "إجراءات" : "Actions"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e3dc]">
                      {history.map((item) => {
                        const isTable = item.mode === "table";
                        const date = new Date(item.created_at);
                        const hasContent = !!(item.original_text || item.corrected_text);
                        
                        return (
                          <tr key={item.document_id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isTable ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                  {isTable ? <TableProperties className="w-4 h-4" /> : <ScanText className="w-4 h-4" />}
                                </div>
                                <div className="min-w-0 max-w-[200px] md:max-w-[250px]">
                                  <p className="text-[13px] font-bold text-gray-900 truncate" title={item.original_file_name}>
                                    {item.original_file_name}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-[12px] font-medium text-gray-600">
                                {isTable 
                                  ? (isRTL ? "جداول" : "Tableaux")
                                  : (isRTL ? "مستندات قديمة / مخطوطات" : "Documents anciens / manuscrits")
                                }
                              </span>
                            </td>
                            <td className="py-4 px-6 text-[13px] font-semibold text-gray-700">
                              {item.page_count}
                            </td>
                            <td className="py-4 px-6 text-[12px] text-gray-500">
                              {date.toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'fr-FR', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </td>
                            <td className="py-4 px-6">
                              {item.was_edited ? (
                                <span className="flex items-center gap-1 w-fit text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="w-3 h-3" />
                                  {isRTL ? "مُصحّح" : "Corrigé"}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 w-fit text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                                  <FileText className="w-3 h-3" />
                                  {isRTL ? "أصلي" : "Original"}
                                </span>
                              )}
                            </td>
                            <td className={`py-4 px-6 ${isRTL ? 'text-left' : 'text-right'}`}>
                              <div className={`flex items-center gap-2 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                                <button
                                  onClick={() => setSelectedItem(item)}
                                  disabled={!hasContent}
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50"
                                  title={isRTL ? "عرض" : "Voir"}
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleCopyText(item)}
                                  disabled={!hasContent}
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50"
                                  title={isRTL ? "نسخ النص" : "Copier le texte"}
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDownloadMarkdown(item)}
                                  disabled={!hasContent}
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50"
                                  title={isRTL ? "تحميل (Markdown)" : "Télécharger Markdown"}
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                {item.html_output && (
                                  <button
                                    onClick={() => handleDownloadHtml(item)}
                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
                                    title={isRTL ? "تحميل (HTML)" : "Télécharger HTML"}
                                  >
                                    <Code className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
      </main>

      {/* View Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedItem(null)}>
          <div 
            className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-[16px] font-bold text-gray-900">{selectedItem.original_file_name}</h3>
                <p className="text-[12px] text-gray-500 mt-0.5">
                  {selectedItem.was_edited 
                    ? (isRTL ? "النسخة المصححة" : "Version corrigée") 
                    : (isRTL ? "النسخة الأصلية" : "Version originale")}
                </p>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-white">
              {selectedItem.html_output && selectedItem.mode === 'table' ? (
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedItem.html_output }}
                />
              ) : (
                <pre className="whitespace-pre-wrap text-[13px] text-gray-800 font-mono bg-gray-50 p-6 rounded-xl border border-gray-100">
                  {selectedItem.corrected_text || selectedItem.original_text}
                </pre>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
              <button
                onClick={() => handleCopyText(selectedItem)}
                className="h-9 px-4 rounded-lg font-semibold text-[13px] text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <Copy className="w-4 h-4" />
                {isRTL ? "نسخ النص" : "Copier"}
              </button>
              <button
                onClick={() => handleDownloadMarkdown(selectedItem)}
                className="h-9 px-4 rounded-lg font-semibold text-[13px] text-white bg-[#0d6e4e] hover:bg-[#0a5a40] flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                {isRTL ? "تحميل Markdown" : "Télécharger MD"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
