"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import { useTranslations } from "next-intl";

export function MarketingFinalCTA() {
  const t = useTranslations("FinalCTA");

  return (
    <section className="py-24 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="bg-primary-dark rounded-[2.5rem] p-8 sm:p-12 lg:p-24 text-center relative overflow-hidden shadow-2xl shadow-primary/30">
          {/* Background Decorative Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          
          <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-6xl font-serif font-bold text-white leading-tight">
              {t("title")}
            </h2>
            <p className="text-white/70 text-lg lg:text-xl font-medium italic">
              {t("subtitle")}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4 w-full">
              <Link href="/auth/register" className="w-full sm:w-auto">
                <Button className="bg-white text-primary-dark hover:bg-[#faf8f3] h-16 px-12 text-sm font-bold uppercase tracking-widest gap-3 shadow-2xl transition-all hover:-translate-y-1 w-full sm:w-auto">
                  {t("btn")}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="pt-12 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-white/50 text-xs font-bold uppercase tracking-widest">
               <div className="flex items-center gap-2">
                 <span>{t("email")}</span>
                 <span dir="ltr" className="text-white">contact@legtransdz.com</span>
               </div>
               <div className="flex items-center gap-2">
                 <span>{t("phone")}</span>
                 <span dir="ltr" className="text-white">+213 542 39 54 68</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
