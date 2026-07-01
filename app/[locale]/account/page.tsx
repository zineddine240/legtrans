"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { useAuth } from "@/contexts/AuthContext";
import { getTrialStats } from "@/lib/trial";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  User, Mail, Phone, Briefcase, MapPin,
  CreditCard, Calendar, ArrowUpRight, Clock,
  ScanText, FileText, Type,
  Lock, ShieldCheck, LogOut,
  HeadphonesIcon, Users, MessageCircle,
  ChevronRight, CheckCircle2, AlertCircle, RefreshCw, Loader2
} from "lucide-react";

/* ── Helpers ─────────────────────────────────────────── */
function getTierLabel(tier: string | undefined, t: any) {
  if (!tier || tier === "free_trial") return { label: t("subscription.freeTrial"), color: "#b08d3c", bg: "rgba(176,141,60,0.1)" };
  if (tier === "pro") return { label: t("subscription.pro"), color: "#0d6e4e", bg: "rgba(13,110,78,0.1)" };
  if (tier === "plus") return { label: t("subscription.plus"), color: "#1e40af", bg: "rgba(30,64,175,0.1)" };
  return { label: tier, color: "#8a8a8a", bg: "rgba(0,0,0,0.05)" };
}

function UsageBar({ used, max, color }: { used: number; max: number | string; color: string }) {
  const pct = typeof max === "number" ? Math.min((used / max) * 100, 100) : 0;
  const isUnlimited = max === "∞" || typeof max === "string";
  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] font-semibold" style={{ color }}>
          {used} / {max}
        </span>
        {!isUnlimited && (
          <span className="text-[10px] text-gray-400">{Math.round(pct)}%</span>
        )}
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        {isUnlimited ? (
          <div className="h-full rounded-full bg-gradient-to-r from-[#0d6e4e] to-[#25d366]" style={{ width: "100%" }} />
        ) : (
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: pct > 80 ? "#ef4444" : pct > 50 ? "#f59e0b" : color,
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ── Section wrapper ─────────────────────────────────── */
function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white overflow-hidden" style={{ border: "1px solid #e5e3dc", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: "#f0ede8" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(13,110,78,0.08)" }}>
          <Icon className="w-4 h-4" style={{ color: "#0d6e4e" }} />
        </div>
        <h2 className="text-[14px] font-bold" style={{ color: "#1a1a1a" }}>{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

/* ── Field row ───────────────────────────────────────── */
function Field({ icon: Icon, label, value, t }: { icon: React.ElementType; label: string; value?: string | null; t: any }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0" style={{ borderColor: "#f5f3ed" }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#f5f3ed" }}>
        <Icon className="w-3.5 h-3.5 text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="text-[13px] font-medium mt-0.5 truncate" style={{ color: value ? "#1a1a1a" : "#ccc" }}>
          {value || t("profile.notProvided")}
        </p>
      </div>
    </div>
  );
}

/* ── Action button ───────────────────────────────────── */
function ActionBtn({
  icon: Icon, label, desc, color, bg, onClick
}: {
  icon: React.ElementType; label: string; desc?: string; color: string; bg: string; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3.5 rounded-xl transition-all hover:scale-[1.005] active:scale-[0.998] text-start"
      style={{ background: bg, border: `1px solid ${color}22` }}
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: color + "18" }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="flex-1">
        <p className="text-[13px] font-semibold" style={{ color }}>{label}</p>
        {desc && <p className="text-[11px] text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 rtl:rotate-180 transition-transform" />
    </button>
  );
}

/* ── Main page ───────────────────────────────────────── */
export default function MonComptePage() {
  const t = useTranslations("Account");
  const router = useRouter();
  const { user, profile, signOut } = useAuth();

  const [trialStats, setTrialStats] = useState<ReturnType<typeof getTrialStats>>(null);
  const [isResending, setIsResending] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setTrialStats(getTrialStats(profile.is_admin));
    }
  }, [profile]);

  const handleSubscribe = async (planKey: "pro" | "plus") => {
    if (!user) {
      toast.error(t("subscription.subscribeError"));
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
          userId: user.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("subscription.sessionError"));
      }

      if (data.url) {
        toast.success(t("subscription.redirecting"));
        window.location.href = data.url;
      } else {
        throw new Error("L'URL de paiement est manquante.");
      }
    } catch (error: any) {
      console.error("Error creating checkout:", error);
      toast.error(t("subscription.paymentError"), {
        description: error.message || t("subscription.sessionError"),
      });
      setLoadingPlan(null);
    }
  };

  const subscriptionTier = profile?.subscription_tier || profile?.plan || "free_trial";
  const tier = getTierLabel(subscriptionTier as string | undefined, t);
  const isPaid = profile?.is_admin || subscriptionTier === "pro" || subscriptionTier === "plus";

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  const handleResetPassword = () => {
    router.push("/auth/forgot-password");
  };

  const handleResendVerification = async () => {
    if (profile?.email_confirmed === true) {
      toast.success(t("security.alreadyVerified"));
      return;
    }
    if (!user) return;
    setIsResending(true);
    try {
      const res = await fetch("/api/send-welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          displayName: profile?.display_name || user.email?.split("@")[0] || t("profile.defaultDisplayName"),
        }),
      });

      if (res.ok) {
        toast.success(t("security.resendSuccess"), {
          description: t("security.resendSuccessDesc"),
        });
      } else {
        toast.error(t("security.resendFailed"));
      }
    } catch {
      toast.error(t("security.resendError"));
    } finally {
      setIsResending(false);
    }
  };

  const handleJoinCommunity = () => {
    if (isPaid) {
      window.open("https://chat.whatsapp.com/Efpu4E3Zobn8lrW8D1coFN", "_blank");
    } else {
      toast.error(t("assistance.communityError"), {
        description: t("assistance.communityErrorDesc"),
        duration: 4000,
      });
    }
  };

  const handleSupport = () => {
    if (isPaid) {
      const msg = encodeURIComponent(t("assistance.supportMessage"));
      window.open(`https://wa.me/213542395468?text=${msg}`, "_blank");
    } else {
      toast.error(t("assistance.supportError"), {
        description: t("assistance.supportErrorDesc"),
        duration: 4000,
      });
    }
  };

  const handleContactSupport = () => {
    window.open("mailto:contact@legtransdz.com?subject=Support LegTrans DZ", "_blank");
  };

  /* Utilisation data */
  const usageData = (() => {
    if (profile?.is_admin) {
      return {
        ocrUsed: 0, ocrMax: "∞" as const,
        docUsed: 0, docMax: "∞" as const,
        textUnlimited: true,
      };
    }
    if (subscriptionTier === "pro") {
      return {
        ocrUsed: trialStats?.countOcr ?? 0, ocrMax: 30,
        docUsed: trialStats?.countDoc ?? 0, docMax: 1,
        textUnlimited: true,
      };
    }
    if (subscriptionTier === "plus") {
      return {
        ocrUsed: trialStats?.countOcr ?? 0, ocrMax: 60,
        docUsed: trialStats?.countDoc ?? 0, docMax: 5,
        textUnlimited: true,
      };
    }
    // free trial
    return {
      ocrUsed: trialStats?.countOcr ?? 0, ocrMax: 5,
      docUsed: trialStats?.countDoc ?? 0, docMax: 1,
      textUnlimited: false,
    };
  })();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#faf8f3" }}>
      <TopBar />

      {/* Page header */}
      <div className="bg-white border-b px-4 sm:px-8 py-5" style={{ borderColor: "#e5e3dc" }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium mb-1" style={{ color: "#8a8a8a" }}>{t("header.settings")}</p>
            <h1 className="text-[22px] font-bold" style={{ color: "#1a1a1a", letterSpacing: "-0.03em" }}>{t("header.title")}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] px-3 py-1.5 rounded-full font-semibold" style={{ background: tier.bg, color: tier.color }}>
              {tier.label}
            </span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 py-8 flex flex-col gap-5">

        {/* ── 1. Profil ─────────────────────────────── */}
        <Section title={t("profile.title")} icon={User}>
          <Field icon={User} label={t("profile.fullName")} value={profile?.display_name} t={t} />
          <Field icon={Mail} label={t("profile.email")} value={user?.email} t={t} />
          <Field icon={Phone} label={t("profile.phone")} value={profile?.phone} t={t} />
          <Field icon={Briefcase} label={t("profile.profession")} value={profile?.professional_title || profile?.profession} t={t} />
          <Field icon={MapPin} label={t("profile.license")} value={profile?.license_number} t={t} />
          <button
            onClick={() => toast.info(t("profile.modifyInfoTitle"), { description: t("profile.modifyInfoDesc") })}
            className={`mt-4 h-9 px-5 rounded-xl text-[13px] font-semibold flex items-center gap-2 transition-all hover:opacity-90 w-fit`}
            style={{ background: "rgba(13,110,78,0.08)", color: "#0d6e4e" }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {t("profile.editBtn")}
          </button>
        </Section>

        {/* ── 2. Abonnement ─────────────────────────── */}
        <Section title={t("subscription.title")} icon={CreditCard}>
          <div className="flex items-center justify-between p-4 rounded-xl mb-4" style={{ background: tier.bg, border: `1px solid ${tier.color}22` }}>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: tier.color }}>{t("subscription.currentPlan")}</p>
              <p className="text-[20px] font-black" style={{ color: tier.color, letterSpacing: "-0.03em" }}>{tier.label}</p>
            </div>
            {isPaid ? (
              <CheckCircle2 className="w-8 h-8" style={{ color: tier.color }} />
            ) : (
              <AlertCircle className="w-8 h-8" style={{ color: tier.color }} />
            )}
          </div>

          {profile?.subscription_expires_at && (
            <div className="flex items-center gap-3 py-3 border-b" style={{ borderColor: "#f5f3ed" }}>
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{t("subscription.expirationDate")}</p>
                <p className="text-[13px] font-medium mt-0.5 text-gray-800">
                  {new Date(profile.subscription_expires_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          )}

          {subscriptionTier === "free_trial" && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleSubscribe("pro")}
                disabled={loadingPlan !== null}
                className="h-10 w-full rounded-xl font-bold text-[13px] text-white flex items-center justify-center gap-2 transition-all bg-[#0d6e4e] hover:bg-[#0a5a40] disabled:opacity-50"
              >
                {loadingPlan === "pro" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>{t("subscription.subscribePro")}</>
                )}
              </button>
              <button
                onClick={() => handleSubscribe("plus")}
                disabled={loadingPlan !== null}
                className="h-10 w-full rounded-xl font-bold text-[13px] text-white flex items-center justify-center gap-2 transition-all bg-[#1e40af] hover:bg-[#1a368f] disabled:opacity-50"
              >
                {loadingPlan === "plus" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
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
              className="mt-4 h-10 w-full rounded-xl font-bold text-[13px] text-white flex items-center justify-center gap-2 transition-all bg-[#1e40af] hover:bg-[#1a368f] disabled:opacity-50"
            >
              {loadingPlan === "plus" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {t("subscription.upgradePlus")}
                  <ArrowUpRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}

          <div className="mt-4 p-4 rounded-xl" style={{ background: "#f5f3ed", border: "1px solid #e5e3dc" }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">{t("subscription.paymentHistory")}</p>
            <p className="text-[12px] text-gray-400 italic">{t("subscription.noPayment")}</p>
          </div>
        </Section>

        {/* ── 3. Utilisation ────────────────────────── */}
        <Section title={t("usage.title")} icon={ScanText}>
          <div className="space-y-4">
            <div className="p-4 rounded-xl" style={{ background: "#f5f3ed", border: "1px solid #e5e3dc" }}>
              <div className="flex items-center gap-2 mb-1">
                <ScanText className="w-4 h-4" style={{ color: "#0d6e4e" }} />
                <p className="text-[13px] font-semibold text-gray-800">{t("usage.ocrTitle")}</p>
              </div>
              <p className="text-[11px] text-gray-400 mb-1">{t("usage.ocrDesc")}</p>
              <UsageBar
                used={usageData.ocrUsed}
                max={usageData.ocrMax}
                color="#0d6e4e"
              />
            </div>

            <div className="p-4 rounded-xl" style={{ background: "#f5f3ed", border: "1px solid #e5e3dc" }}>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4" style={{ color: "#1e40af" }} />
                <p className="text-[13px] font-semibold text-gray-800">{t("usage.docTitle")}</p>
              </div>
              <p className="text-[11px] text-gray-400 mb-1">{t("usage.docDesc")}</p>
              <UsageBar
                used={usageData.docUsed}
                max={usageData.docMax}
                color="#1e40af"
              />
            </div>

            <div className="p-4 rounded-xl" style={{ background: "#f5f3ed", border: "1px solid #e5e3dc" }}>
              <div className="flex items-center gap-2 mb-2">
                <Type className="w-4 h-4" style={{ color: "#b08d3c" }} />
                <p className="text-[13px] font-semibold text-gray-800">{t("usage.textTitle")}</p>
              </div>
              <span
                className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                style={usageData.textUnlimited
                  ? { background: "rgba(13,110,78,0.1)", color: "#0d6e4e" }
                  : { background: "rgba(176,141,60,0.1)", color: "#b08d3c" }}
              >
                {usageData.textUnlimited ? t("usage.textUnlimited") : t("usage.textReasonable")}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{t("usage.resetNote")}</span>
            </div>
          </div>
        </Section>

        {/* ── 4. Sécurité ───────────────────────────── */}
        <Section title={t("security.title")} icon={Lock}>
          <div className="flex flex-col gap-2.5">
            <ActionBtn
              icon={Lock}
              label={t("security.changePassword")}
              desc={t("security.changePasswordDesc")}
              color="#1e40af"
              bg="rgba(30,64,175,0.04)"
              onClick={handleResetPassword}
            />
            <ActionBtn
              icon={ShieldCheck}
              label={t("security.emailVerification")}
              desc={profile?.email_confirmed === true ? t("security.emailVerified") : (isResending ? t("security.emailResending") : t("security.emailNotVerified"))}
              color={profile?.email_confirmed === true ? "#0d6e4e" : "#b08d3c"}
              bg={profile?.email_confirmed === true ? "rgba(13,110,78,0.04)" : "rgba(176,141,60,0.04)"}
              onClick={handleResendVerification}
            />
            <ActionBtn
              icon={LogOut}
              label={t("security.logout")}
              desc={t("security.logoutDesc")}
              color="#ef4444"
              bg="rgba(239,68,68,0.04)"
              onClick={handleSignOut}
            />
          </div>
        </Section>

        {/* ── 5. Assistance ─────────────────────────── */}
        <Section title={t("assistance.title")} icon={HeadphonesIcon}>
          <div className="flex flex-col gap-2.5">
            <ActionBtn
              icon={HeadphonesIcon}
              label={t("assistance.bookSupport")}
              desc={isPaid ? t("assistance.bookSupportDescPaid") : t("assistance.bookSupportDescFree")}
              color="#1e40af"
              bg="rgba(30,64,175,0.04)"
              onClick={handleSupport}
            />
            <ActionBtn
              icon={Users}
              label={t("assistance.joinCommunity")}
              desc={isPaid ? t("assistance.joinCommunityDescPaid") : t("assistance.joinCommunityDescFree")}
              color="#25d366"
              bg="rgba(37,211,102,0.04)"
              onClick={handleJoinCommunity}
            />
            <ActionBtn
              icon={MessageCircle}
              label={t("assistance.contactSupport")}
              desc={t("assistance.contactSupportDesc")}
              color="#0d6e4e"
              bg="rgba(13,110,78,0.04)"
              onClick={handleContactSupport}
            />
          </div>
        </Section>

      </main>
    </div>
  );
}
