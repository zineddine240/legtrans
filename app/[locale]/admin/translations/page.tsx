"use client";

import { useEffect, useState } from "react";
import { db } from "@/integrations/firebase/config";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { Search, Loader2, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { toast } from "sonner";

interface TranslationPair {
  id: string;
  inputText: string;
  outputText: string;
  sourceLanguage: string;
  targetLanguage: string;
  createdAt: any;
}

const ITEMS_PER_PAGE = 25;

export default function AdminTranslationsPage() {
  const [translations, setTranslations] = useState<TranslationPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTranslations = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "translation_pairs"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      
      const data: TranslationPair[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as TranslationPair);
      });
      
      setTranslations(data);
    } catch (err) {
      console.error("Error fetching translations:", err);
      toast.error("Erreur lors de la récupération des traductions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranslations();
  }, []);

  const filteredTranslations = translations.filter(t => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (t.inputText?.toLowerCase().includes(term) || t.outputText?.toLowerCase().includes(term));
  });

  const totalPages = Math.ceil(filteredTranslations.length / ITEMS_PER_PAGE);
  const currentData = filteredTranslations.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const downloadExcel = async () => {
    if (currentData.length === 0) {
      toast.error("Aucune donnée à exporter.");
      return;
    }

    try {
      const toastId = toast.loading("Génération du fichier Excel...");
      
      const res = await fetch("/api/admin/translations/export-excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ translations: currentData })
      });

      if (!res.ok) throw new Error("Erreur serveur");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `traductions_page_${currentPage}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Fichier Excel téléchargé avec succès.", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error("Échec de la génération du fichier Excel.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Rechercher un texte..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>

        <button
          onClick={downloadExcel}
          disabled={loading || currentData.length === 0}
          className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Télécharger Excel (Page actuelle)
        </button>

      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[10%]">Langues</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[45%]">Texte Source</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[45%]">Traduction</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500 mb-2" />
                    Chargement des données...
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center text-gray-500">
                    Aucune traduction trouvée.
                  </td>
                </tr>
              ) : (
                currentData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 align-top whitespace-nowrap">
                      <div className="flex flex-col gap-2">
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded text-[10px] font-bold bg-gray-100 text-gray-600 uppercase border border-gray-200 w-fit">
                          SRC: {item.sourceLanguage}
                        </span>
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded text-[10px] font-bold bg-blue-50 text-blue-700 uppercase border border-blue-200 w-fit">
                          TGT: {item.targetLanguage}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{item.inputText}</p>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{item.outputText}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && totalPages > 1 && (
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Affichage {((currentPage - 1) * ITEMS_PER_PAGE) + 1} à {Math.min(currentPage * ITEMS_PER_PAGE, filteredTranslations.length)} sur {filteredTranslations.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-md text-gray-500 hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium text-gray-700 px-2">
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded-md text-gray-500 hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
