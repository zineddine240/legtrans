"use client";

import { useEffect } from "react";
import { Crown, Zap, X, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "@/src/i18n/routing";
import { useTranslations } from "next-intl";
import { TIER_LIMITS } from "@/lib/trial";

interface TrialLimitModalProps {
  type: "ocr" | "doc";
  tier?: "admin" | "pro" | "plus" | "trial" | "free";
  onClose: () => void;
}

export function TrialLimitModal({ type, tier = "trial", onClose }: TrialLimitModalProps) {
  const t = useTranslations("Pricing");
  const d = useTranslations("Dashboard");

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const isOcr = type === "ocr";
  
  // Load Pro plan features dynamically from translations
  const proFeatures: string[] = t.raw("plans.pro.features") || [
    "Manuscrits : 7 requêtes / jour",
    "Tableaux : 3 requêtes / jour",
    "Jusqu'à 5 pages par document",
    "1 document IA / jour",
    "Export Word & Excel"
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header gradient */}
          <div className="relative bg-gradient-to-br from-[#0d6e4e] to-[#0a5a40] px-8 pt-8 pb-10 text-white">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
                <Crown className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/60">Limite atteinte</p>
                <h2 className="text-xl font-bold text-white">
                  {isOcr 
                    ? tier === "free" ? "1 document / jour atteint" : `${TIER_LIMITS.trial.ocrPerDay} images / jour atteintes` 
                    : `${TIER_LIMITS.trial.docPerDay} documents / jour atteints`
                  }
                </h2>
              </div>
            </div>

            <p className="text-white/80 text-sm leading-relaxed font-medium">
              {isOcr
                ? tier === "free" 
                  ? "Vous avez utilisé votre OCR gratuit du jour. Passez à l'offre Pro pour continuer et traiter plus de documents."
                  : `Vous avez utilisé toutes vos ${TIER_LIMITS.trial.ocrPerDay} extractions OCR gratuites d'aujourd'hui. Passez à l'offre Pro pour augmenter vos capacités.`
                : `Vous avez utilisé toutes vos ${TIER_LIMITS.trial.docPerDay} traductions de documents gratuites d'aujourd'hui. Passez à l'offre Pro pour débloquer plus de documents.`
              }
            </p>

            {/* Decorative circles */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/5" />
            <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-white/5" />
          </div>

          {/* Body */}
          <div className="px-8 py-6 space-y-5">
            {/* Features list */}
            <div className="space-y-3">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Inclus avec le forfait Pro :</p>
              {proFeatures.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#0d6e4e]/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0d6e4e]" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* Pricing hint */}
            <div className="bg-[#faf8f3] rounded-xl p-4 border border-[#e5e3dc]">
              <p className="text-xs text-gray-500 font-medium mb-1">Forfait Pro à partir de</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-[#0d6e4e]">4 000</span>
                <span className="text-sm font-bold text-gray-500 pb-1">DZD / mois</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Sans engagement de durée</p>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3 pt-1">
              <Link
                href="/#pricing"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full bg-[#0d6e4e] hover:bg-[#0a5a40] text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-[#0d6e4e]/25 hover:shadow-[#0d6e4e]/40 hover:scale-[1.01] active:scale-[0.99]"
              >
                <Zap className="w-4 h-4" />
                Passer en Pro maintenant
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={onClose}
                className="w-full text-sm text-gray-400 hover:text-gray-600 font-medium py-2 transition-colors"
              >
                Revenir demain (quota gratuit renouvelé à 00:00)
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
