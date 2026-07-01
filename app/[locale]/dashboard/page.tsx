"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { ScanText, ArrowRight, Zap, Plus, Upload, FileCheck, Download, Languages, CreditCard, Calendar, Star, Sparkles, Rocket, Crown, Loader2, ArrowUpRight, BookOpen, History } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { getTrialStats, TIER_LIMITS } from "@/lib/trial";
import { useTranslations, useLocale } from "next-intl";
import { db } from "@/integrations/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { UpgradeBanner } from "@/components/upgrade-banner";
import { Link } from "@/src/i18n/routing";

/* ── Animated counter hook ─────────────────────────── */
function useCounter(target: number, duration = 1800) {
  const [value, setValue] = useState(0);
  const ref = useRef(false);
  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

/* ── Usage Bar inside dashboard card ────────────────── */
function DashboardUsageBar({ used, max, color }: { used: number; max: number | string; color: string }) {
  const pct = typeof max === "number" ? Math.min((used / max) * 100, 100) : 0;
  const isUnlimited = max === "∞" || typeof max === "string";
  return (
    <div>
      <div className="flex justify-between items-center mb-1 text-[11px]">
        <span className="font-semibold text-gray-700">{used} / {max}</span>
        {!isUnlimited && <span className="text-gray-400">{Math.round(pct)}%</span>}
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        {isUnlimited ? (
          <div className="h-full rounded-full bg-gradient-to-r from-[#0d6e4e] to-[#25d366]" style={{ width: "100%" }} />
        ) : (
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const typesList = t.raw("types.list") as string[];
  const HOW = [
    { step: "01", icon: Upload,    title: t("how.s1_title"),    desc: t("how.s1_desc") },
    { step: "02", icon: ScanText,  title: t("how.s2_title"),      desc: t("how.s2_desc") },
    { step: "03", icon: Languages, title: t("how.s3_title"),        desc: t("how.s3_desc") },
    { step: "04", icon: Download,  title: t("how.s4_title"),  desc: t("how.s4_desc") },
  ];

  const slides = [
    {
      badge: t("hero.badge"),
      title: t("hero.title"),
      desc: t("hero.desc"),
      action: t("hero.action"),
      route: "/ocr",
      icon: ScanText,
    },
    {
      badge: t("hero_translate.badge"),
      title: t("hero_translate.title"),
      desc: t("hero_translate.desc"),
      action: t("hero_translate.action"),
      route: "/translate",
      icon: Languages,
    },
    {
      badge: t("hero_doc.badge"),
      title: t("hero_doc.title"),
      desc: t("hero_doc.desc"),
      action: t("hero_doc.action"),
      route: "/document-translation",
      icon: Upload,
    },
    {
      badge: t("hero_glossary.badge"),
      title: t("hero_glossary.title"),
      desc: t("hero_glossary.desc"),
      action: t("hero_glossary.action"),
      route: "/glossary",
      icon: BookOpen,
    },
  ];

  const router = useRouter();
  const docs   = useCounter(4700);
  const acc    = useCounter(98);
  const time   = useCounter(38);

  const authContext = useAuth();
  const profile = authContext?.profile;
  const isPaidOrAdmin = profile?.is_admin === true || profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'plus';
  const user = authContext?.user;
  const loading = authContext?.loading;

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login?redirect=/dashboard");
    }
  }, [user, loading, router]);


  const [trialStats, setTrialStats] = useState<ReturnType<typeof getTrialStats>>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  // Hero carousel state
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [fade, setFade] = useState(true);

  // Feedback form state
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackQuote, setFeedbackQuote] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    if (profile) {
      setTrialStats(getTrialStats(profile.is_admin, profile));
    }
  }, [profile]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
        setFade(true);
      }, 500);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f3]">
        <Loader2 className="w-10 h-10 animate-spin text-[#0d6e4e]" />
      </div>
    );
  }

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackQuote.trim() || !profile?.user_id) return;
    setIsSubmittingFeedback(true);
    try {
      if (db) {
          await addDoc(collection(db, "feedbacks"), {
            userId: profile.user_id,
            name: feedbackName.trim() || profile.name || profile.full_name || profile.email?.split("@")[0] || "Utilisateur",
            rating: feedbackRating,
            quote: feedbackQuote.trim(),
            createdAt: serverTimestamp(),
            approved: false, // Default to false for moderation
          });
        setFeedbackSubmitted(true);
        toast.success("Avis envoyé avec succès !");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'envoi de l'avis.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleJoinCommunity = () => {
    if (isPaidOrAdmin) {
      window.open("https://chat.whatsapp.com/Efpu4E3Zobn8lrW8D1coFN", "_blank");
    } else {
      toast.error("Accès réservé", {
        description: "Cet espace WhatsApp est réservé exclusivement aux abonnés Pro & Plus ayant un abonnement actif.",
        duration: 5000,
      });
    }
  };

  const handleRequestSupport = () => {
    if (isPaidOrAdmin) {
      const message = "Bonjour, je souhaite réserver une assistance concernant LegTrans DZ.\nMon nom :\nMon e-mail :\nSujet :";
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/213542395468?text=${encodedMessage}`, "_blank");
    } else {
      toast.error("Accès réservé", {
        description: "L'assistance prioritaire est réservée exclusivement aux abonnés Pro & Plus ayant un abonnement actif.",
        duration: 5000,
      });
    }
  };

  const handleSubscribe = async (planKey: "pro" | "plus") => {
    if (!profile?.user_id) {
      toast.error("Veuillez vous connecter pour vous abonner.");
      return;
    }
    setLoadingPlan(planKey);
    try {
      const response = await fetch("/api/chargily/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: planKey,
          userId: profile.user_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impossible d'initialiser le paiement.");
      }

      if (data.url) {
        toast.success("Redirection...", {
          description: "Vous allez être redirigé vers la passerelle de paiement sécurisée Chargily.",
        });
        window.location.href = data.url;
      } else {
        throw new Error("L'URL de paiement est manquante.");
      }
    } catch (error: any) {
      console.error("Error creating checkout:", error);
      toast.error("Erreur de paiement", {
        description: error.message || "Une erreur est survenue lors de la création de la session.",
      });
      setLoadingPlan(null);
    }
  };

  const subscriptionTier = trialStats?.tier || "free";

  const getTierMeta = () => {
    if (profile?.is_admin) return { label: t("subscription.admin"), color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", icon: Crown };
    if (subscriptionTier === "pro") return { label: "Pro", color: "#0d6e4e", bg: "rgba(13,110,78,0.1)", icon: Star };
    if (subscriptionTier === "plus") return { label: "Plus", color: "#1e40af", bg: "rgba(30,64,175,0.1)", icon: Rocket };
    if (subscriptionTier === "free") return { label: "Accès Gratuit", color: "#6b7280", bg: "rgba(107,114,128,0.1)", icon: Zap };
    return { label: t("subscription.freeTrial"), color: "#b08d3c", bg: "rgba(176,141,60,0.1)", icon: Sparkles };
  };

  const tierMeta = getTierMeta();
  const TierIcon = tierMeta.icon;

  const usageData = (() => {
    if (profile?.is_admin) {
      return {
        handwritingUsed: 0, handwritingMax: "∞" as const,
        tableUsed: 0, tableMax: "∞" as const,
        docUsed: 0, docMax: "∞" as const,
      };
    }
    const today = new Date().toISOString().split('T')[0];
    const limits = TIER_LIMITS[subscriptionTier] || TIER_LIMITS.free;

    let hwUsed = 0;
    const hwObj = profile?.daily_usage?.handwriting_mode_usage;
    if (hwObj) {
      if (subscriptionTier === 'trial' || hwObj.date === today) {
        hwUsed = hwObj.requests || 0;
      }
    }

    let tableUsed = 0;
    const tableObj = profile?.daily_usage?.table_mode_usage;
    if (tableObj) {
      if (subscriptionTier === 'trial' || tableObj.date === today) {
        tableUsed = tableObj.requests || 0;
      }
    }

    // Handwriting limits
    let hwMax: string | number = 0;
    if (subscriptionTier === 'trial') hwMax = 3;
    else if (subscriptionTier === 'pro') hwMax = 7;
    else if (subscriptionTier === 'plus') hwMax = 12;
    else if (subscriptionTier === 'free') hwMax = 1;

    // Table limits
    let tableMax: string | number = 0;
    if (subscriptionTier === 'trial') tableMax = 2;
    else if (subscriptionTier === 'pro') tableMax = 3;
    else if (subscriptionTier === 'plus') tableMax = 6;
    else if (subscriptionTier === 'free') tableMax = 1;

    // For Free tier, it's combined 1 request total
    if (subscriptionTier === 'free') {
      const combinedUsed = hwUsed + tableUsed;
      hwUsed = combinedUsed;
      tableUsed = combinedUsed;
    }

    return {
      handwritingUsed: hwUsed, handwritingMax: hwMax,
      tableUsed: tableUsed, tableMax: tableMax,
      docUsed: profile?.daily_usage?.docCount || 0, docMax: limits.docPerDay,
    };
  })();

  const getExpiryText = () => {
    if (profile?.is_admin) return t("subscription.permanent");
    const rawExp = profile?.subscriptionExpiresAt || profile?.subscription_expires_at || profile?.trial_expires_at;
    if (!rawExp) {
      return t("subscription.trialDays");
    }
    try {
      let date: Date;
      if (rawExp && typeof (rawExp as any).toDate === "function") {
        date = (rawExp as any).toDate();
      } else {
        date = new Date(rawExp as any);
      }
      return `${t("subscription.dueDate")} ${date.toLocaleDateString()}`;
    } catch {
      return t("subscription.active");
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#faf8f3" }}>
      <TopBar />
      {trialStats && <UpgradeBanner tier={trialStats.tier} />}

      {/* Page header */}
      <div className="bg-white border-b px-4 md:px-8 py-5" style={{ borderColor: "#e5e3dc" }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[12px] font-medium mb-1" style={{ color: "#8a8a8a" }}>{t("header.welcome")}</p>
            <h1 className="text-[22px] font-bold" style={{ color: "#1a1a1a", letterSpacing: "-0.03em" }}>{t("header.title")}</h1>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button onClick={() => router.push("/ocr")}
              className="h-10 px-5 rounded-xl font-semibold text-[13px] text-[#0d6e4e] bg-white border border-[#0d6e4e]/20 flex items-center justify-center gap-2 transition-all hover:bg-[#0d6e4e]/5 w-full sm:w-auto">
              <ScanText className="h-4 w-4" /> {t("buttons.ocr")}
            </button>
            <button onClick={() => router.push("/document-translation")}
              className="h-10 px-5 rounded-xl font-semibold text-[13px] text-white flex items-center justify-center gap-2 transition-all w-full sm:w-auto"
              style={{ background: "linear-gradient(135deg,#0d6e4e,#1a8f6a)", boxShadow: "0 4px 14px rgba(13,110,78,0.25)" }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "none")}>
              <Plus className="h-4 w-4" /> {t("buttons.translate")}
            </button>
            <button onClick={() => router.push("/dashboard/historique")}
              className="h-10 px-5 rounded-xl font-semibold text-[13px] text-gray-700 bg-white border border-gray-200 flex items-center justify-center gap-2 transition-all hover:bg-gray-50 w-full sm:w-auto">
              <History className="h-4 w-4" /> {isRTL ? "سجل الاستخدام" : "Historique"}
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 py-6 md:py-8 flex flex-col gap-6">

        {/* Hero & Subscription Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hero Card */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl p-6 md:p-8 relative overflow-hidden h-full flex flex-col justify-between"
              style={{ background: "linear-gradient(135deg,#0d6e4e 0%,#074a35 60%,#052e20 100%)", boxShadow: "0 8px 32px rgba(13,110,78,0.2)" }}>
              <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
              <div className={`relative z-10 flex flex-col justify-between h-full transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold mb-4"
                    style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}>
                    <Zap className="h-3 w-3" /> {slides[currentSlideIndex].badge}
                  </div>
                  <h2 className="text-[20px] md:text-[26px] font-bold text-white mb-2 leading-tight min-h-[64px]" style={{ letterSpacing: "-0.03em" }}>
                    {slides[currentSlideIndex].title}
                  </h2>
                  <p className="text-[13px] md:text-[14px] mb-6 leading-relaxed min-h-[60px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                    {slides[currentSlideIndex].desc}
                  </p>
                </div>
                <button onClick={() => router.push(slides[currentSlideIndex].route)}
                  className="h-11 px-7 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2.5 transition-all w-full sm:w-auto self-start mt-4 hover:-translate-y-0.5"
                  style={{ background: "white", color: "#0d6e4e", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", letterSpacing: "-0.01em" }}
                >
                  {(() => {
                    const Icon = slides[currentSlideIndex].icon;
                    return <Icon className="h-4 w-4" />;
                  })()} 
                  {slides[currentSlideIndex].action} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Subscription Card */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl p-6 bg-white border border-[#e5e3dc] shadow-sm flex flex-col justify-between h-full min-h-[320px]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">{t("subscription.title")}</span>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1" style={{ background: tierMeta.bg, color: tierMeta.color }}>
                    <TierIcon className="w-3.5 h-3.5" />
                    {tierMeta.label}
                  </span>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t("subscription.dueDate")}</p>
                  <p className="text-[13px] font-semibold text-gray-700 mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {getExpiryText()}
                  </p>
                </div>

                {/* Daily usage limits */}
                <div className="space-y-3 pt-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t("subscription.limits")}</p>
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-gray-600">
                      {isRTL ? "مستندات قديمة / مخطوطات" : "Documents anciens / manuscrits"}
                    </span>
                    <DashboardUsageBar used={usageData.handwritingUsed} max={usageData.handwritingMax} color="#b08d3c" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-gray-600">
                      {isRTL ? "جداول" : "Tableaux"}
                    </span>
                    <DashboardUsageBar used={usageData.tableUsed} max={usageData.tableMax} color="#0d6e4e" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-gray-600">{t("subscription.translations")}</span>
                    <DashboardUsageBar used={usageData.docUsed} max={usageData.docMax} color="#1e40af" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-[#f5f3ed] space-y-2">
                {(subscriptionTier === "free" || subscriptionTier === "trial") && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSubscribe("pro")}
                      disabled={loadingPlan !== null}
                      className="h-9 rounded-xl font-bold text-[11px] text-white flex items-center justify-center gap-1 bg-[#0d6e4e] hover:bg-[#0a5a40] disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {loadingPlan === "pro" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <>{t("subscription.subscribePro")}</>
                      )}
                    </button>
                    <button
                      onClick={() => handleSubscribe("plus")}
                      disabled={loadingPlan !== null}
                      className="h-9 rounded-xl font-bold text-[11px] text-white flex items-center justify-center gap-1 bg-[#1e40af] hover:bg-[#1a368f] disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {loadingPlan === "plus" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <>{t("subscription.subscribePlus")}</>
                      )}
                    </button>
                  </div>
                )}

                {subscriptionTier === "pro" && (
                  <button
                    onClick={() => handleSubscribe("plus")}
                    disabled={loadingPlan !== null}
                    className="w-full h-9 rounded-xl font-bold text-[12px] text-white flex items-center justify-center gap-1.5 bg-[#1e40af] hover:bg-[#1a368f] disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {loadingPlan === "plus" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        {t("subscription.upgradePlus")}
                        <ArrowUpRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                )}

                {subscriptionTier === "plus" && (
                  <div className="text-center py-2 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-xl select-none">
                    {t("subscription.maxActive")}
                  </div>
                )}

                {profile?.is_admin && (
                  <div className="text-center py-2 bg-purple-50 text-purple-700 text-[11px] font-bold rounded-xl select-none">
                    {t("subscription.adminActive")}
                  </div>
                )}
              </div>
              <div className="mt-3 text-center border-t border-[#f5f3ed]/60 pt-2 shrink-0">
                <Link href="/pricing-details" className="inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-[#0d6e4e] hover:text-[#0a5a40] transition-colors cursor-pointer group">
                  <span>{t("subscription.viewPricingDetails")}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Animated stats ───────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { value: docs,  suffix: "+", label: t("stats.docs"),       sub: t("stats.docsSub") },
            { value: acc,   suffix: "%", label: t("stats.accuracy"),   sub: t("stats.accuracySub") },
            { value: time,  suffix: "s", label: t("stats.time"),      sub: t("stats.timeSub") },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-5 bg-white text-center"
              style={{ border: "1px solid #e5e3dc", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <p className="text-[32px] font-black" dir="ltr" style={{ color: "#0d6e4e", letterSpacing: "-0.04em", lineHeight: 1 }}>
                {s.value.toLocaleString("fr-FR")}{s.suffix}
              </p>
              <p className="text-[12px] font-semibold mt-2" style={{ color: "#1a1a1a" }}>{s.label}</p>
              <p className="text-[11px] mt-0.5" style={{ color: "#a8a8a8" }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ── WhatsApp Support, Community & Glossary Grid ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Card 1: Support */}
          <div className="rounded-2xl p-6 bg-white flex flex-col justify-between gap-5"
            style={{ border: "1px solid #e5e3dc", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#1e40af]/10 flex items-center justify-center text-[#1e40af] shrink-0">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.739-1.453L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436.002 9.852-4.411 9.855-9.85.002-2.634-1.02-5.11-2.881-6.973-1.86-1.863-4.337-2.886-6.976-2.887-5.441 0-9.86 4.413-9.863 9.852-.001 1.716.463 3.39 1.341 4.884l-.994 3.634 3.738-.981zM17.15 14.54c-.294-.147-1.74-.858-2.01-.957-.27-.099-.467-.147-.662.148-.195.295-.758.957-.93 1.154-.171.196-.343.22-.637.073-.294-.147-1.243-.458-2.37-1.464-.877-.783-1.47-1.75-1.642-2.046-.172-.295-.018-.455.129-.601.132-.132.294-.343.441-.515.147-.172.196-.294.294-.49.098-.196.049-.368-.025-.515-.073-.147-.662-1.597-.907-2.185-.238-.573-.48-.495-.662-.505-.171-.007-.368-.008-.564-.008-.196 0-.515.073-.784.368-.27.294-1.03 1.006-1.03 2.451 0 1.446 1.054 2.846 1.202 3.042.147.196 2.074 3.168 5.026 4.444.702.304 1.25.486 1.677.621.705.224 1.346.193 1.854.117.564-.085 1.74-.711 1.985-1.397.246-.686.246-1.275.172-1.397-.073-.123-.27-.196-.564-.343z"/>
                </svg>
              </div>
              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#1e40af] px-2.5 py-0.5 bg-[#1e40af]/10 rounded-full mb-1">
                  {t("support.title")}
                </span>
                <h3 className="text-[14px] font-bold text-gray-900 leading-tight">{t("support.heading")}</h3>
                <p className="text-[12px] text-gray-500 mt-1">{t("support.desc")}</p>
              </div>
            </div>
            <button
              onClick={handleRequestSupport}
              className="h-10 w-full rounded-xl font-bold text-[13px] bg-[#1e40af] hover:bg-[#1e3a8a] text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{ boxShadow: "0 4px 14px rgba(30,64,175,0.25)" }}
            >
              {t("support.action")}
            </button>
          </div>

          {/* Card 2: Community */}
          <div className="rounded-2xl p-6 bg-white flex flex-col justify-between gap-5"
            style={{ border: "1px solid #e5e3dc", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#25d366]/10 flex items-center justify-center text-[#25d366] shrink-0">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.739-1.453L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436.002 9.852-4.411 9.855-9.85.002-2.634-1.02-5.11-2.881-6.973-1.86-1.863-4.337-2.886-6.976-2.887-5.441 0-9.86 4.413-9.863 9.852-.001 1.716.463 3.39 1.341 4.884l-.994 3.634 3.738-.981zM17.15 14.54c-.294-.147-1.74-.858-2.01-.957-.27-.099-.467-.147-.662.148-.195.295-.758.957-.93 1.154-.171.196-.343.22-.637.073-.294-.147-1.243-.458-2.37-1.464-.877-.783-1.47-1.75-1.642-2.046-.172-.295-.018-.455.129-.601.132-.132.294-.343.441-.515.147-.172.196-.294.294-.49.098-.196.049-.368-.025-.515-.073-.147-.662-1.597-.907-2.185-.238-.573-.48-.495-.662-.505-.171-.007-.368-.008-.564-.008-.196 0-.515.073-.784.368-.27.294-1.03 1.006-1.03 2.451 0 1.446 1.054 2.846 1.202 3.042.147.196 2.074 3.168 5.026 4.444.702.304 1.25.486 1.677.621.705.224 1.346.193 1.854.117.564-.085 1.74-.711 1.985-1.397.246-.686.246-1.275.172-1.397-.073-.123-.27-.196-.564-.343z"/>
                </svg>
              </div>
              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#0d6e4e] px-2.5 py-0.5 bg-[#0d6e4e]/10 rounded-full mb-1">
                  {t("community.title")}
                </span>
                <h3 className="text-[14px] font-bold text-gray-900 leading-tight">{t("community.heading")}</h3>
                <p className="text-[12px] text-gray-500 mt-1">{t("community.desc")}</p>
              </div>
            </div>
            <button
              onClick={handleJoinCommunity}
              className="h-10 w-full rounded-xl font-bold text-[13px] bg-[#25d366] hover:bg-[#1ebd58] text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{ boxShadow: "0 4px 14px rgba(37,211,102,0.25)" }}
            >
              {t("community.action")}
            </button>
          </div>

          {/* Card 3: Glossary */}
          <div className="rounded-2xl p-6 bg-white flex flex-col justify-between gap-5"
            style={{ border: "1px solid #e5e3dc", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#b08d3c]/10 flex items-center justify-center text-[#b08d3c] shrink-0">
                <BookOpen className="w-[22px] h-[22px]" />
              </div>
              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#b08d3c] px-2.5 py-0.5 bg-[#b08d3c]/10 rounded-full mb-1">
                  {t("glossary.tag")}
                </span>
                <h3 className="text-[14px] font-bold text-gray-900 leading-tight">{t("glossary.title")}</h3>
                <p className="text-[12px] text-gray-500 mt-1">{t("glossary.desc")}</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/glossary")}
              className="h-10 w-full rounded-xl font-bold text-[13px] bg-[#b08d3c] hover:bg-[#977630] text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{ boxShadow: "0 4px 14px rgba(176,141,60,0.25)" }}
            >
              {t("glossary.action")}
            </button>
          </div>

        </div>

        {/* ── Feedback Section ─────────────────────────── */}
        <div className="rounded-2xl p-6 md:p-8 bg-white border border-[#e5e3dc] shadow-sm relative overflow-hidden">
          <div className="absolute -right-10 -top-10 opacity-[0.03] pointer-events-none">
            <Star className="w-64 h-64" />
          </div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#0d6e4e] px-2.5 py-0.5 bg-[#0d6e4e]/10 rounded-full mb-3">
                Votre Avis
              </span>
              <h3 className="text-[20px] font-bold text-gray-900 leading-tight mb-2">
                Aidez-nous à nous améliorer !
              </h3>
              <p className="text-[13px] text-gray-500 leading-relaxed max-w-sm">
                Partagez votre expérience avec LegTrans DZ. Vos retours nous permettent d'améliorer continuellement notre plateforme et nos services.
              </p>
            </div>
            
            <div className="bg-[#faf8f3] p-5 rounded-xl border border-[#e5e3dc]">
              {feedbackSubmitted ? (
                <div className="text-center py-6 animate-in fade-in zoom-in-95 duration-500">
                  <div className="w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-[15px] font-bold text-gray-900">Merci pour votre retour !</h4>
                  <p className="text-[12px] text-gray-500 mt-1">Votre avis a été soumis avec succès.</p>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Votre Nom</label>
                    <input
                      type="text"
                      required
                      placeholder="Votre nom complet"
                      value={feedbackName}
                      onChange={(e) => setFeedbackName(e.target.value)}
                      className="w-full p-3 rounded-lg border border-[#e5e3dc] focus:border-[#0d6e4e] focus:outline-none text-[13px] bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Votre Note</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="transition-transform hover:scale-125 focus:outline-none"
                        >
                          <Star 
                            className={`w-5 h-5 ${
                              star <= (hoveredRating || feedbackRating) 
                                ? "fill-[#b08d3c] text-[#b08d3c]" 
                                : "text-gray-300"
                            } transition-colors duration-200`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Votre Commentaire</label>
                    <textarea 
                      required
                      placeholder="Comment s'est passée votre expérience avec nos traductions ?"
                      value={feedbackQuote}
                      onChange={(e) => setFeedbackQuote(e.target.value)}
                      rows={3}
                      className="w-full p-3 rounded-lg border border-[#e5e3dc] focus:border-[#0d6e4e] focus:outline-none text-[13px] bg-white resize-none"
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={!feedbackQuote.trim() || isSubmittingFeedback}
                    className="w-full h-10 rounded-lg font-bold text-[13px] bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isSubmittingFeedback ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Star className="w-4 h-4" />
                    )}
                    Envoyer mon avis
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ── 3 Feature cards ──────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              color: "#0d6e4e", bg: "rgba(13,110,78,0.08)", tag: t("features.f1_tag"),
              title: t("features.f1_title"),
              desc: t("features.f1_desc"),
              icon: <><rect width="18" height="10" x="3" y="11" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" x2="8" y1="16" y2="16" /><line x1="16" x2="16" y1="16" y2="16" /></>,
            },
            {
              color: "#1e40af", bg: "rgba(30,64,175,0.08)", tag: t("features.f2_tag"),
              title: t("features.f2_title"),
              desc: t("features.f2_desc"),
              icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></>,
            },
            {
              color: "#b08d3c", bg: "rgba(176,141,60,0.08)", tag: t("features.f3_tag"),
              title: t("features.f3_title"),
              desc: t("features.f3_desc"),
              icon: <><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></>,
            },
          ].map((f, i) => (
            <div key={i} className="rounded-xl p-5 bg-white flex flex-col gap-3"
              style={{ border: "1px solid #e5e3dc", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: f.bg }}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke={f.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{f.icon}</svg>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: f.bg, color: f.color }}>{f.tag}</span>
              </div>
              <div>
                <p className="text-[13px] font-bold mb-1.5" style={{ color: "#1a1a1a", letterSpacing: "-0.01em" }}>{f.title}</p>
                <p className="text-[11.5px] leading-relaxed" style={{ color: "#8a8a8a" }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── How it works ─────────────────────────────────── */}
        <div className="rounded-2xl bg-white overflow-hidden" style={{ border: "1px solid #e5e3dc", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: "#f0ede8" }}>
            <p className="text-[11px] font-bold tracking-[0.08em] uppercase" style={{ color: "#8a8a8a" }}>{t("how.tag")}</p>
            <h3 className="text-[15px] font-bold mt-0.5" style={{ color: "#1a1a1a", letterSpacing: "-0.02em" }}>{t("how.title")}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x rtl:sm:divide-x-reverse" style={{ borderColor: "#f0ede8" }}>
            {HOW.map((h, i) => {
              const Icon = h.icon;
              return (
                <div key={i} className="p-6 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-black" style={{ color: "#e5e3dc", letterSpacing: "-0.02em", fontSize: 28, lineHeight: 1 }}>{h.step}</span>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(13,110,78,0.08)" }}>
                      <Icon className="h-4 w-4" style={{ color: "#0d6e4e" }} />
                    </div>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold mb-1" style={{ color: "#1a1a1a" }}>{h.title}</p>
                    <p className="text-[12px] leading-relaxed" style={{ color: "#8a8a8a" }}>{h.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Supported document types ─────────────────────── */}
        <div className="rounded-2xl bg-white p-6" style={{ border: "1px solid #e5e3dc", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-[11px] font-bold tracking-[0.08em] uppercase mb-0.5" style={{ color: "#8a8a8a" }}>{t("types.tag")}</p>
              <p className="text-[12px]" style={{ color: "#a8a8a8" }}>{t("types.desc")}</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold w-fit"
              style={{ background: "rgba(13,110,78,0.08)", color: "#0d6e4e" }}>
              <FileCheck className="h-3.5 w-3.5" /> {t("types.badge")}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {typesList.map((typeString, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors cursor-default"
                style={{ background: "#f5f3ed", color: "#595959", border: "1px solid #e5e3dc" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(13,110,78,0.08)"; e.currentTarget.style.color = "#0d6e4e"; e.currentTarget.style.borderColor = "rgba(13,110,78,0.2)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#f5f3ed"; e.currentTarget.style.color = "#595959"; e.currentTarget.style.borderColor = "#e5e3dc"; }}>
                {typeString}
              </span>
            ))}
          </div>
        </div>

        {/* Floating AI Chatbot - REMOVED */}
      </main>
    </div>
  );
}
