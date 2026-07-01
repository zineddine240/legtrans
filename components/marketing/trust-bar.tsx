import React from "react";
import { useTranslations } from "next-intl";

export function MarketingTrustBar() {
  const t = useTranslations("TrustBar");

  return (
    <section className="bg-[#faf8f3] py-12 border-y border-[#e5e3dc]">
      <div className="container mx-auto px-6 max-w-7xl">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-10 opacity-60">
          {t("tag")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
           {/* Placeholder Logos with consistent styling */}

           <div className="flex items-center gap-2 font-serif font-bold text-xl text-primary-dark">
              <div className="w-8 h-8 rounded-full bg-primary-dark/10 border border-primary-dark/20" />
              {t("translators")}
           </div>

           <div className="flex items-center gap-2 font-serif font-bold text-xl text-primary-dark">
              <div className="w-8 h-8 rounded-full bg-primary-dark/10 border border-primary-dark/20" />
              {t("startup")}
           </div>
        </div>
      </div>
    </section>
  );
}

