"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, ShieldCheck, Sparkles, Zap, Calendar, Heart } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { useAuth } from "@/contexts/AuthContext";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentTier = profile?.subscription_tier || profile?.plan || "pro";
  const tierName = currentTier === "plus" ? "Plus" : "Pro";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#faf8f3" }}>
      <TopBar />

      <main className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div
          className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden transition-all duration-700 ease-out translate-y-0 opacity-100 scale-100"
          style={{
            border: "1px solid #e5e3dc",
            boxShadow: "0 10px 40px rgba(13,110,78,0.06)",
          }}
        >
          {/* Decorative Top Gradient Line */}
          <div
            className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0d6e4e] via-[#1a8f6a] to-[#25d366]"
          />

          {/* Success Animated Check Icon */}
          <div className="flex justify-center mb-6 mt-2 relative">
            <div className="relative">
              {/* Outer Pulsing Glow */}
              <div className="absolute inset-0 rounded-full bg-[#0d6e4e]/10 scale-125 animate-ping duration-1000" />
              {/* Inner Circle */}
              <div className="w-20 h-20 rounded-full bg-[#0d6e4e]/10 flex items-center justify-center text-[#0d6e4e] relative z-10">
                <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
              </div>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase mb-3 bg-[#0d6e4e]/10 text-[#0d6e4e]">
            <Sparkles className="w-3.5 h-3.5" /> Paiement Réussi
          </span>

          <h1
            className="text-[28px] font-black text-gray-900 leading-tight mb-3"
            style={{ letterSpacing: "-0.03em" }}
          >
            Merci pour votre confiance !
          </h1>

          <p className="text-[14px] text-gray-500 leading-relaxed mb-6">
            Votre abonnement au forfait <strong className="text-gray-900">LegTrans {tierName}</strong> est désormais activé. Vos limites quotidiennes ont été mises à jour.
          </p>

          {/* Features Granted Summary */}
          <div
            className="rounded-2xl p-5 mb-8 text-start space-y-3"
            style={{ background: "#f5f3ed", border: "1px solid #e5e3dc" }}
          >
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Avantages de votre formule
            </p>

            <div className="flex items-start gap-3">
              <Zap className="w-4 h-4 text-[#0d6e4e] mt-0.5 shrink-0" />
              <div>
                <p className="text-[13px] font-semibold text-gray-900">
                  {currentTier === "plus" ? "60 Extractions OCR / jour" : "30 Extractions OCR / jour"}
                </p>
                <p className="text-[11px] text-gray-400">Haute précision sur documents manuscrits</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-[#0d6e4e] mt-0.5 shrink-0" />
              <div>
                <p className="text-[13px] font-semibold text-gray-900">
                  {currentTier === "plus" ? "5 Traductions de Documents / jour" : "1 Traduction de Document / jour"}
                </p>
                <p className="text-[11px] text-gray-400">Traductions juridiques automatiques par IA</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Heart className="w-4 h-4 text-[#0d6e4e] mt-0.5 shrink-0" />
              <div>
                <p className="text-[13px] font-semibold text-gray-900">Assistance prioritaire</p>
                <p className="text-[11px] text-gray-400">Support dédié et accès communauté WhatsApp</p>
              </div>
            </div>
          </div>

          {/* Redirect Actions */}
          <div className="space-y-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="h-12 w-full rounded-xl font-bold text-[14px] text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: "linear-gradient(135deg, #0d6e4e, #1a8f6a)",
                boxShadow: "0 4px 16px rgba(13,110,78,0.25)",
              }}
            >
              Accéder au Tableau de Bord
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => router.push("/account")}
              className="h-11 w-full rounded-xl font-bold text-[13px] text-gray-600 bg-transparent hover:bg-gray-50 border border-gray-200 flex items-center justify-center transition-all"
            >
              Voir les détails de mon compte
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
