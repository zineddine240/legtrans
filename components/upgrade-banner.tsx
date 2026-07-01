"use client";

import { useState } from "react";
import { Zap, X, ArrowRight, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import type { AccessTier } from "@/lib/trial";

interface UpgradeBannerProps {
  tier: AccessTier;
  onUpgrade?: () => void;
}

const MESSAGES = {
  fr: {
    free: {
      title: "Mode gratuit limité : 1 OCR par jour, 1 page maximum.",
      desc: "",
      cta: "Passer à Pro",
    },
    trial_ending: {
      title: "Votre essai se termine bientôt",
      desc: "Profitez pleinement de toutes les fonctionnalités avant la fin de votre période d'essai.",
      cta: "S'abonner",
    },
  },
  ar: {
    free: {
      title: "الوضع المجاني المحدود: 1 طلب OCR يومياً، بحد أقصى صفحة واحدة.",
      desc: "",
      cta: "الترقية إلى Pro",
    },
    trial_ending: {
      title: "فترتك التجريبية تنتهي قريباً",
      desc: "استمتع بجميع الميزات قبل انتهاء فترة التجربة المجانية.",
      cta: "اشترك الآن",
    },
  },
};

export function UpgradeBanner({ tier }: UpgradeBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const isRTL = locale === "ar";

  if (dismissed || (tier !== "free")) return null;

  const lang = isRTL ? "ar" : "fr";
  const msg = MESSAGES[lang].free;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
      style={{
        background: "linear-gradient(90deg, #0d6e4e 0%, #1a8f6a 50%, #0d6e4e 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center shrink-0">
          <Zap className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="min-w-0">
          <span className="font-bold text-white text-[13px]">{msg.title} — </span>
          <span className="text-white/70 text-[12px] hidden sm:inline">{msg.desc}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => router.push("/billing")}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-bold transition-all hover:scale-105"
          style={{ background: "white", color: "#0d6e4e" }}
        >
          <Star className="w-3 h-3 fill-[#0d6e4e]" />
          {msg.cta}
          <ArrowRight className={`w-3 h-3 ${isRTL ? "rotate-180" : ""}`} />
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-white/50 hover:text-white transition-colors p-1 rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
