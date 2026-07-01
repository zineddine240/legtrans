"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, LifeBuoy, CreditCard, RefreshCw } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";

export default function PaymentFailedPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#faf8f3" }}>
      <TopBar />

      <main className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div
          className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden transition-all duration-700"
          style={{
            border: "1px solid #e5e3dc",
            boxShadow: "0 10px 40px rgba(239,68,68,0.06)",
          }}
        >
          {/* Decorative Top Gradient Line (Red/Orange Theme) */}
          <div
            className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#ef4444] via-[#f59e0b] to-[#ef4444]"
          />

          {/* Failed Animated Check Icon */}
          <div className="flex justify-center mb-6 mt-2 relative">
            <div className="relative">
              {/* Outer Pulsing Glow */}
              <div className="absolute inset-0 rounded-full bg-[#ef4444]/10 scale-125 animate-ping duration-1500" />
              {/* Inner Circle */}
              <div className="w-20 h-20 rounded-full bg-[#ef4444]/10 flex items-center justify-center text-[#ef4444] relative z-10">
                <AlertTriangle className="w-10 h-10 stroke-[2]" />
              </div>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase mb-3 bg-[#ef4444]/10 text-[#ef4444]">
            Transaction Annulée
          </span>

          <h1
            className="text-[26px] font-black text-gray-900 leading-tight mb-3"
            style={{ letterSpacing: "-0.03em" }}
          >
            Le paiement a échoué
          </h1>

          <p className="text-[14px] text-gray-500 leading-relaxed mb-6">
            Nous n'avons pas pu valider votre transaction. Cela peut être dû à un solde insuffisant, une annulation manuelle, ou un problème technique temporaire avec votre carte CIB ou Dahabia.
          </p>

          {/* Troubleshooting Tips */}
          <div
            className="rounded-2xl p-5 mb-8 text-start space-y-3"
            style={{ background: "#f5f3ed", border: "1px solid #e5e3dc" }}
          >
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Que pouvez-vous faire ?
            </p>

            <div className="flex items-start gap-3">
              <CreditCard className="w-4 h-4 text-[#ef4444] mt-0.5 shrink-0" />
              <div>
                <p className="text-[13px] font-semibold text-gray-900">Vérifier vos informations de carte</p>
                <p className="text-[11px] text-gray-400">Assurez-vous que votre carte est active pour les paiements en ligne.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <RefreshCw className="w-4 h-4 text-[#ef4444] mt-0.5 shrink-0" />
              <div>
                <p className="text-[13px] font-semibold text-gray-900">Réessayer l'opération</p>
                <p className="text-[11px] text-gray-400">Tentez à nouveau en retournant sur la sélection des offres.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <LifeBuoy className="w-4 h-4 text-[#ef4444] mt-0.5 shrink-0" />
              <div>
                <p className="text-[13px] font-semibold text-gray-900">Contacter notre support</p>
                <p className="text-[11px] text-gray-400">Notre équipe est là pour vous aider en cas de problème persistant.</p>
              </div>
            </div>
          </div>

          {/* Redirect Actions */}
          <div className="space-y-3">
            <button
              onClick={() => router.push("/account")}
              className="h-12 w-full rounded-xl font-bold text-[14px] text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                boxShadow: "0 4px 14px rgba(239,68,68,0.25)",
              }}
            >
              Retourner aux Offres
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => window.open("mailto:support@legtransdz.com?subject=Echec paiement Chargily", "_blank")}
              className="h-11 w-full rounded-xl font-bold text-[13px] text-gray-600 bg-transparent hover:bg-gray-50 border border-gray-200 flex items-center justify-center transition-all"
            >
              Contacter l'Assistance
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
