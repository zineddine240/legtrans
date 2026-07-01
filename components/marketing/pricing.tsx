"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Wallet, Banknote, Sparkles, Star, Building2, Rocket, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/routing";

export function MarketingPricing() {
  const router = useRouter();
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const t = useTranslations("Pricing");

  const handlePlanAction = async (planKey: string) => {
    if (planKey === "free") {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/auth/register");
      }
      return;
    }

    if (planKey === "annual") {
      return; // Handled by standard link
    }

    // Pro or Plus
    if (!user) {
      toast.info(t("loginRequired"), {
        description: t("loginRequiredDesc"),
      });
      router.push(`/auth/login?redirect=/#pricing`);
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
        throw new Error(data.error || "Impossible d'initialiser le paiement.");
      }

      if (data.url) {
        toast.success(t("redirecting"), {
          description: t("redirectingDesc"),
        });
        window.location.href = data.url;
      } else {
        throw new Error("L'URL de paiement est manquante.");
      }
    } catch (error: any) {
      console.error("Error creating checkout:", error);
      toast.error(t("paymentError"), {
        description: error.message || "Une erreur est survenue lors de la création de la session.",
      });
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      key: "free",
      name: t("plans.free.name"),
      icon: <Sparkles className="w-6 h-6 text-primary" />,
      price: t("plans.free.period"),
      period: "",
      features: t.raw("plans.free.features") as string[],
      buttonText: t("plans.free.btn"),
      highlighted: false,
    },
    {
      key: "pro",
      name: t("plans.pro.name"),
      icon: <Star className="w-6 h-6 text-[#b08d3c] fill-[#b08d3c]" />,
      price: "4 000 DZD",
      period: t("plans.pro.period"),
      badge: t("plans.pro.badge"),
      features: t.raw("plans.pro.features") as string[],
      buttonText: t("plans.pro.btn"),
      highlighted: true,
    },
    {
      key: "plus",
      name: t("plans.plus.name"),
      icon: <Rocket className="w-6 h-6 text-primary" />,
      price: "6 000 DZD",
      period: t("plans.plus.period"),
      features: t.raw("plans.plus.features") as string[],
      buttonText: t("plans.plus.btn"),
      highlighted: false,
    },
    {
      key: "annual",
      name: t("plans.annual.name"),
      icon: <Building2 className="w-6 h-6 text-[#1e40af]" />,
      price: t("plans.annual.price"),
      period: "",
      features: t.raw("plans.annual.features") as string[],
      buttonText: t("plans.annual.btn"),
      highlighted: false,
      isAnnual: true,
    },
  ];

  return (
    <section id="pricing" className="py-32 bg-[#faf8f3]">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary-dark">
            {t("title")}
          </h2>
          <p className="text-muted-foreground font-medium text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, idx) => (
            <div key={idx} className={`relative bg-white border-2 rounded-3xl p-6 shadow-2xl flex flex-col ${plan.highlighted ? "border-[#0d6e4e] shadow-[#0d6e4e]/10 lg:scale-105 z-10" : "border-[#e5e3dc] shadow-black/5 hover:border-[#0d6e4e]/50"} transition-all duration-500`}>
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0d6e4e] text-white text-[11px] font-bold px-6 py-1.5 rounded-full uppercase tracking-wider shadow-lg whitespace-nowrap">
                  {plan.badge}
                </div>
              )}
              
              <div className="text-center mb-8">
                <div className="flex justify-center items-center mb-4">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${plan.highlighted ? 'bg-[#b08d3c]/10' : 'bg-primary/5'}`}>
                      {plan.icon}
                   </div>
                </div>
                <h3 className="text-[18px] font-bold text-primary-dark mb-4">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span 
                    dir={plan.isAnnual ? undefined : "ltr"} 
                    className={`font-bold text-primary-dark tracking-tighter ${plan.isAnnual ? 'text-3xl' : 'text-4xl'}`}
                  >
                    {plan.price}
                  </span>
                  {plan.period && <span className="text-muted-foreground font-bold text-xs">{plan.period}</span>}
                </div>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-success/10 flex items-center justify-center text-success shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-[14px] font-medium text-primary-dark/80 text-start">{f}</span>
                  </li>
                ))}
              </ul>

              {plan.isAnnual ? (
                <a href="mailto:contact@legtransdz.com?subject=Demande%20de%20tarif%20-%20Offre%20Annuelle" className="w-full">
                  <Button className="w-full h-12 text-[14px] font-bold tracking-wide shadow-xl bg-white text-primary border-2 border-[#e5e3dc] hover:border-primary hover:bg-primary/5 rounded-xl transition-all">
                    {plan.buttonText}
                  </Button>
                </a>
              ) : (
                <Button
                  onClick={() => handlePlanAction(plan.key)}
                  disabled={loadingPlan !== null}
                  className={`w-full h-12 text-[14px] font-bold tracking-wide shadow-xl ${plan.highlighted ? "bg-[#0d6e4e] text-white hover:bg-[#0a5a40]" : "bg-white text-primary border-2 border-[#e5e3dc] hover:border-primary hover:bg-primary/5"} rounded-xl transition-all flex items-center justify-center gap-2`}
                >
                  {loadingPlan === plan.key ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("processing")}
                    </>
                  ) : (
                    plan.buttonText
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12 mb-2">
          <Link href="/pricing-details" className="inline-flex items-center gap-2 text-sm font-bold text-[#0d6e4e] hover:text-[#0a5a40] transition-colors cursor-pointer group">
            <span>{t("viewDetailsLink")}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="mt-8 max-w-3xl mx-auto text-center">
          <p className="text-[12px] font-medium text-muted-foreground/80 italic">
            {t("launchNote")}
          </p>
        </div>

        <div className="mt-24 border-t border-[#e5e3dc] pt-12 max-w-3xl mx-auto">
          <p className="text-center text-[12px] font-bold text-muted-foreground uppercase tracking-widest mb-8">
            {t("acceptedPayments")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-muted-foreground opacity-80">
            <div className="flex flex-col items-center gap-2">
              <CreditCard className="w-8 h-8 text-[#0d6e4e]" />
              <span className="text-[11px] font-bold">CIB / DAHABIA</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Wallet className="w-8 h-8 text-[#0d6e4e]" />
              <span className="text-[11px] font-bold">BARIDIMOB</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Banknote className="w-8 h-8 text-[#0d6e4e]" />
              <span className="text-[11px] font-bold">{t("transfer")}</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
