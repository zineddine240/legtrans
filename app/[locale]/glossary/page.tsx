"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/routing";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/integrations/firebase/config";
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from "firebase/firestore";
import { 
  BookOpen, 
  ChevronRight, 
  Shield, 
  Award, 
  Send, 
  CheckCircle2, 
  Clock, 
  GraduationCap, 
  User, 
  ArrowRight, 
  Star,
  BookMarked,
  Loader2,
  Trophy,
  Medal
} from "lucide-react";
import { toast, Toaster } from "sonner";

interface UserStat {
  userName: string;
  count: number;
}

export default function GlossaryContributionPage() {
  const t = useTranslations("Glossary");
  const locale = useLocale();
  const router = useRouter();
  const authContext = useAuth();
  const profile = authContext?.profile;

  // Form states
  const [originalTerm, setOriginalTerm] = useState("");
  const [suggestedTranslation, setSuggestedTranslation] = useState("");
  const [sourceLang, setSourceLang] = useState(locale === "ar" ? "ar" : "fr");
  const [targetLang, setTargetLang] = useState(locale === "ar" ? "fr" : "ar");
  const [category, setCategory] = useState("");
  const [context, setContext] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<UserStat[]>([]);
  const [myPoints, setMyPoints] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  const [submittedData, setSubmittedData] = useState<{
    original: string;
    translation: string;
    categoryLabel: string;
    date: string;
  } | null>(null);

  const isRTL = locale === "ar";

  // Fetch leaderboard + my points
  useEffect(() => {
    const fetchStats = async () => {
      if (!db) { setLoadingStats(false); return; }
      try {
        const snapshot = await getDocs(query(collection(db, "glossary_submissions"), orderBy("createdAt", "desc")));
        const statsMap: Record<string, number> = {};
        let mine = 0;
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const key = data.userId || data.userName || "Anonyme";
          statsMap[key] = (statsMap[key] || 0) + 1;
          if (profile?.user_id && data.userId === profile.user_id) mine++;
        });
        const sorted = Object.entries(statsMap)
          .map(([userId, count]) => {
            // find the display name
            const doc = snapshot.docs.find(d => (d.data().userId || d.data().userName) === userId);
            return { userName: doc?.data().userName || userId, count };
          })
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        setLeaderboard(sorted);
        setMyPoints(mine);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [profile?.user_id]);

  const languagesList = [
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "ar", label: "Arabe", flag: "🇩🇿" },
    { code: "en", label: "Anglais", flag: "🇬🇧" },
    { code: "es", label: "Espagnol", flag: "🇪🇸" },
    { code: "it", label: "Italien", flag: "🇮🇹" },
  ];

  const categories = [
    { key: "civil", label: t("categories.civil") },
    { key: "penal", label: t("categories.penal") },
    { key: "commercial", label: t("categories.commercial") },
    { key: "administrative", label: t("categories.administrative") },
    { key: "vital", label: t("categories.vital") },
    { key: "official", label: t("categories.official") },
    { key: "contracts", label: t("categories.contracts") },
    { key: "other", label: t("categories.other") },
  ];

  const getBadge = (count: number) => {
    if (count >= 50) return { label: t("ranking.badge_master"), color: "border-[#b08d3c]/30 bg-[#b08d3c]/5 text-[#977630]" };
    if (count >= 20) return { label: t("ranking.badge_expert"), color: "border-blue-200 bg-blue-50/50 text-blue-800" };
    if (count >= 5)  return { label: t("ranking.badge_pioneer"), color: "border-emerald-200 bg-emerald-50/50 text-emerald-800" };
    return { label: isRTL ? "مبتدئ" : "Débutant", color: "border-gray-200 bg-gray-50 text-gray-600" };
  };

  const getRankIcon = (idx: number) => {
    if (idx === 0) return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (idx === 1) return <Medal className="w-4 h-4 text-gray-400" />;
    if (idx === 2) return <Medal className="w-4 h-4 text-amber-600" />;
    return <span className="text-xs font-bold text-gray-400">{idx + 1}</span>;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalTerm.trim() || !suggestedTranslation.trim() || !category) {
      toast.error(isRTL ? "يرجى ملء جميع الحقول الإلزامية" : "Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (db) {
        await addDoc(collection(db, "glossary_submissions"), {
          userId: profile?.user_id || null,
          userName: profile?.name || profile?.full_name || profile?.email?.split("@")[0] || "Anonyme",
          originalTerm: originalTerm.trim(),
          suggestedTranslation: suggestedTranslation.trim(),
          sourceLang,
          targetLang,
          category,
          context: context.trim(),
          createdAt: serverTimestamp(),
        });
      }

      const selectedCategoryObj = categories.find(c => c.key === category);
      setSubmittedData({
        original: originalTerm,
        translation: suggestedTranslation,
        categoryLabel: selectedCategoryObj ? selectedCategoryObj.label : category,
        date: new Date().toLocaleDateString(locale === "ar" ? "ar-DZ" : "fr-DZ", {
          year: 'numeric', month: 'long', day: 'numeric',
          hour: '2-digit', minute: '2-digit'
        })
      });

      setMyPoints(p => p + 1);
      setIsSubmitted(true);
      toast.success(isRTL ? "تم إرسال مصطلحك بنجاح!" : "Terme soumis avec succès !");
    } catch (err) {
      console.error(err);
      toast.error(isRTL ? "حدث خطأ أثناء الإرسال" : "Erreur lors de l'envoi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setOriginalTerm("");
    setSuggestedTranslation("");
    setCategory("");
    setContext("");
    setIsSubmitted(false);
    setSubmittedData(null);
  };

  const myBadge = getBadge(myPoints);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#faf8f3" }} dir={isRTL ? "rtl" : "ltr"}>
      <Toaster position="top-right" richColors />
      <TopBar />

      {/* Breadcrumb */}
      <div className="h-auto min-h-[42px] py-2 lg:py-0 shrink-0 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 border-b bg-white gap-2 sm:gap-0" style={{ borderColor: "#e5e3dc" }}>
        <div className="flex items-center gap-2 text-[12px]">
          <span className="cursor-pointer hover:text-[#1a1a1a] transition-colors" style={{ color: "#8a8a8a" }} onClick={() => router.push("/dashboard")}>
            {isRTL ? "لوحة القيادة" : "Dashboard"}
          </span>
          <ChevronRight className={`h-3 w-3 ${isRTL ? "rotate-180" : ""}`} style={{ color: "#c0bdb5" }} />
          <span className="font-semibold" style={{ color: "#1a1a1a" }}>
            {t("hero.tag")}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: "#b08d3c" }}>
          <Shield className="h-3.5 w-3.5" />
          <span>{isRTL ? "منصة آمنة" : "Plateforme sécurisée"}</span>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-8 flex flex-col gap-8">
        
        {/* Hero Banner */}
        <div className="rounded-2xl p-6 md:p-10 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6"
          style={{ background: "linear-gradient(135deg,#0d6e4e 0%,#074a35 60%,#052e20 100%)", boxShadow: "0 8px 32px rgba(13,110,78,0.15)" }}>
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="relative z-10 max-w-2xl text-center md:text-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4"
              style={{ background: "rgba(255,255,255,0.08)", color: "#b08d3c", border: "1px solid rgba(176,141,60,0.25)" }}>
              <GraduationCap className="h-3.5 w-3.5" />
              {t("hero.tag")}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight leading-tight">
              {t("hero.title")}
            </h1>
            <p className="text-[13px] md:text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
              {t("hero.desc")}
            </p>
          </div>
          <div className="shrink-0 flex items-center justify-center w-24 h-24 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <BookMarked className="w-12 h-12 text-[#b08d3c]" />
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Form */}
          <div className="lg:col-span-2">
            {!isSubmitted ? (
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#e5e3dc] shadow-sm">
                <div className="flex items-center gap-3 pb-6 border-b border-[#f5f3ed] mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#0d6e4e]/10 flex items-center justify-center text-[#0d6e4e]">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-[16px] font-bold text-gray-900 leading-tight">
                      {t("form.title")}
                    </h2>
                    <p className="text-[11.5px] text-gray-400 mt-0.5">
                      {isRTL ? "ساهم في إثراء القاموس القانوني الجزائري" : "Contribuez à l'enrichissement du glossaire juridique algérien"}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Language Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#faf8f3] border border-[#e5e3dc]/60">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {t("form.source_lang")}
                      </label>
                      <div className="relative">
                        <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)}
                          className="w-full h-10 px-3 text-[13px] bg-white border border-[#e5e3dc] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0d6e4e] focus:border-[#0d6e4e] appearance-none">
                          {languagesList.map((lang) => (
                            <option key={lang.code} value={lang.code}>{lang.flag} {lang.label}</option>
                          ))}
                        </select>
                        <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 ${isRTL ? "left-3" : "right-3"}`}>▼</div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {t("form.target_lang")}
                      </label>
                      <div className="relative">
                        <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}
                          className="w-full h-10 px-3 text-[13px] bg-white border border-[#e5e3dc] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0d6e4e] focus:border-[#0d6e4e] appearance-none">
                          {languagesList.map((lang) => (
                            <option key={lang.code} value={lang.code}>{lang.flag} {lang.label}</option>
                          ))}
                        </select>
                        <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 ${isRTL ? "left-3" : "right-3"}`}>▼</div>
                      </div>
                    </div>
                  </div>

                  {/* Original Term */}
                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 mb-2">
                      {t("form.original_term")} <span className="text-red-500">*</span>
                    </label>
                    <input type="text" required value={originalTerm} onChange={(e) => setOriginalTerm(e.target.value)}
                      placeholder={t("form.original_placeholder")}
                      className="w-full h-11 px-4 text-[13.5px] bg-white border border-[#e5e3dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d6e4e]/20 focus:border-[#0d6e4e] transition-all" />
                  </div>

                  {/* Suggested Translation */}
                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 mb-2">
                      {t("form.suggested_translation")} <span className="text-red-500">*</span>
                    </label>
                    <input type="text" required value={suggestedTranslation} onChange={(e) => setSuggestedTranslation(e.target.value)}
                      placeholder={t("form.suggested_placeholder")}
                      className="w-full h-11 px-4 text-[13.5px] bg-white border border-[#e5e3dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d6e4e]/20 focus:border-[#0d6e4e] transition-all" />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 mb-2">
                      {t("form.category")} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select required value={category} onChange={(e) => setCategory(e.target.value)}
                        className="w-full h-11 px-4 text-[13.5px] bg-white border border-[#e5e3dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d6e4e]/20 focus:border-[#0d6e4e] transition-all appearance-none">
                        <option value="" disabled>{t("form.category_placeholder")}</option>
                        {categories.map((cat) => (
                          <option key={cat.key} value={cat.key}>{cat.label}</option>
                        ))}
                      </select>
                      <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 ${isRTL ? "left-4" : "right-4"}`}>▼</div>
                    </div>
                  </div>

                  {/* Context */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[12px] font-bold text-gray-700">{t("form.context")}</label>
                      <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{t("form.optional")}</span>
                    </div>
                    <textarea rows={3} value={context} onChange={(e) => setContext(e.target.value)}
                      placeholder={t("form.context_placeholder")}
                      className="w-full p-4 text-[13px] bg-white border border-[#e5e3dc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d6e4e]/20 focus:border-[#0d6e4e] transition-all resize-none" />
                  </div>

                  {/* Submit */}
                  <button type="submit" disabled={isSubmitting}
                    className="w-full h-12 rounded-xl font-bold text-[14px] text-white flex items-center justify-center gap-2.5 transition-all disabled:opacity-75"
                    style={{ background: "linear-gradient(135deg,#0d6e4e,#1a8f6a)", boxShadow: "0 4px 14px rgba(13,110,78,0.25)" }}>
                    {isSubmitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> {t("form.submitting")}</>
                    ) : (
                      <><Send className="w-4 h-4" /> {t("form.submit")}</>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#e5e3dc] shadow-sm text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5 border border-emerald-100">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-[20px] font-bold text-gray-900 leading-tight mb-2">
                  {isRTL ? "تم إرسال مصطلحك بنجاح! 🎉" : "Terme soumis avec succès ! 🎉"}
                </h2>
                <p className="text-[13px] text-gray-500 max-w-md mx-auto leading-relaxed mb-8">
                  {isRTL
                    ? "شكراً على مساهمتك في إثراء القاموس القانوني الجزائري."
                    : "Merci pour votre contribution à l'enrichissement du glossaire juridique algérien."}
                </p>

                {submittedData && (
                  <div className="max-w-md mx-auto p-5 rounded-xl border border-[#e5e3dc] bg-[#faf8f3] text-start mb-8 space-y-3">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-[#e5e3dc]/50 flex justify-between items-center">
                      <span>{isRTL ? "تفاصيل المصطلح" : "Récapitulatif"}</span>
                      <span>{submittedData.date}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-[13px]">
                      <div>
                        <span className="text-gray-400 block text-[11px]">{t("form.original_term")}</span>
                        <strong className="text-gray-800 block mt-0.5">{submittedData.original}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">{t("form.suggested_translation")}</span>
                        <strong className="text-[#0d6e4e] block mt-0.5">{submittedData.translation}</strong>
                      </div>
                    </div>
                    <div className="pt-2">
                      <span className="text-gray-400 block text-[11px]">{t("form.category")}</span>
                      <span className="inline-block mt-1 px-2.5 py-0.5 text-[11.5px] font-semibold text-[#0d6e4e] bg-[#0d6e4e]/10 rounded-full">
                        {submittedData.categoryLabel}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <button onClick={handleReset}
                    className="h-10 px-6 rounded-xl font-bold text-[13px] text-white flex items-center justify-center gap-2 transition-all"
                    style={{ background: "#0d6e4e" }}>
                    <BookOpen className="w-4 h-4" />
                    {t("feedback.another")}
                  </button>
                  <button onClick={() => router.push("/dashboard")}
                    className="h-10 px-6 rounded-xl font-bold text-[13px] text-gray-700 bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-2 transition-all">
                    {isRTL ? "العودة للرئيسية" : "Retour au tableau de bord"}
                    <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR — real data */}
          <div className="space-y-6">

            {/* My Points Card */}
            <div className="bg-white rounded-2xl p-5 border border-[#e5e3dc] shadow-sm">
              <div className="flex items-center gap-2 pb-3 border-b border-[#f5f3ed] mb-4">
                <User className="w-4 h-4 text-[#0d6e4e]" />
                <h3 className="text-[13px] font-bold text-gray-900">
                  {isRTL ? "حالتك الأكاديمية" : "Votre statut"}
                </h3>
              </div>

              {loadingStats ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#faf8f3] border border-[#e5e3dc]">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-[13px] font-bold text-gray-800">
                        {isRTL ? "نقاطي" : "Mes points"}
                      </span>
                    </div>
                    <span className="text-[22px] font-black text-[#0d6e4e]">{myPoints}</span>
                  </div>
                  <div className={`p-3 rounded-xl border flex items-center gap-2 ${myBadge.color}`}>
                    <GraduationCap className="w-4 h-4 shrink-0" />
                    <span className="text-[12px] font-bold">{myBadge.label}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Badges explanation */}
            <div className="bg-white rounded-2xl p-5 border border-[#e5e3dc] shadow-sm">
              <div className="flex items-center gap-2 pb-3 border-b border-[#f5f3ed] mb-4">
                <Award className="w-4 h-4 text-[#b08d3c]" />
                <h3 className="text-[13px] font-bold text-gray-900">{t("ranking.title")}</h3>
              </div>
              <div className="space-y-2.5">
                {[
                  { name: t("ranking.badge_pioneer"), desc: isRTL ? "5 مصطلحات" : "5 termes", color: "border-emerald-200 bg-emerald-50/50 text-emerald-800" },
                  { name: t("ranking.badge_expert"),  desc: isRTL ? "20 مصطلحاً" : "20 termes", color: "border-blue-200 bg-blue-50/50 text-blue-800" },
                  { name: t("ranking.badge_master"),  desc: isRTL ? "+50 مصطلحاً" : "50+ termes", color: "border-[#b08d3c]/30 bg-[#b08d3c]/5 text-[#977630]" },
                ].map((b, idx) => (
                  <div key={idx} className={`p-2.5 rounded-xl border flex items-center justify-between ${b.color}`}>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[12px] font-bold">{b.name}</span>
                    </div>
                    <span className="text-[10px] font-semibold opacity-80">{b.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Real Leaderboard */}
            <div className="bg-white rounded-2xl p-5 border border-[#e5e3dc] shadow-sm">
              <h3 className="text-[13px] font-bold text-gray-900 pb-3 border-b border-[#f5f3ed] mb-4">
                {isRTL ? "أفضل المساهمين" : "Principaux Contributeurs"}
              </h3>

              {loadingStats ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                </div>
              ) : leaderboard.length === 0 ? (
                <p className="text-[12px] text-gray-400 text-center py-4">
                  {isRTL ? "لا توجد مساهمات بعد" : "Aucune contribution pour l'instant"}
                </p>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((user, i) => (
                    <div key={i} className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-5">{getRankIcon(i)}</div>
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {user.userName?.[0]?.toUpperCase() || "?"}
                        </div>
                        <span className="text-[12px] font-semibold text-gray-800 truncate max-w-[100px]">{user.userName}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-[12px] font-bold text-[#0d6e4e]">{user.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reward Panel */}
            <div className="rounded-2xl p-5 bg-gradient-to-br from-[#faf8f3] to-[#f0ece8] border border-[#e5e3dc] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#b08d3c]/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#b08d3c]/10 text-[#b08d3c] flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-[12px] font-bold text-gray-900">{t("ranking.reward_title")}</h3>
                  <p className="text-[11px] text-gray-500 leading-relaxed mt-1">{t("ranking.reward_desc")}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
