"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, FileText, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";

export function MarketingHero() {
  const { user } = useAuth();
  const t = useTranslations("Hero");

  return (
    <section className="relative min-h-[88vh] flex items-center bg-[#faf8f3] overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-16 items-center">
          
          {/* Left Column: Content */}
          <div className="space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="space-y-4">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-accent-dark px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
                {t("badge")}
              </span>
              <h1 className="text-5xl lg:text-7xl font-serif font-bold text-primary-dark leading-[1.05] tracking-tight">
                {t("title1")} <br />
                <span className="text-primary italic">{t("title2")}</span> {t("title3")}
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-xl leading-relaxed font-medium">
                {t("desc")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {user ? (
                <Link href="/dashboard">
                  <Button className="btn-primary h-14 px-10 text-sm font-bold uppercase tracking-widest gap-3 w-full sm:w-auto shadow-2xl shadow-primary/20">
                    {t("btnDashboard")}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/register">
                  <Button className="btn-primary h-14 px-10 text-sm font-bold uppercase tracking-widest gap-3 w-full sm:w-auto shadow-2xl shadow-primary/20">
                    {t("btnStart")}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-t border-[#e5e3dc] pt-8 w-fit">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                {t("check1")}
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                {t("check2")}
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                {t("check3")}
              </div>
            </div>
          </div>

          {/* Right Column: Product Mockup */}
          <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
            {/* The Main Mockup */}
            <div className="relative z-10 bg-white p-2 rounded-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/40 transform lg:-rotate-[5deg] hover:rotate-0 transition-transform duration-700">
              <div className="bg-[#f8fafc] rounded-lg overflow-hidden border border-border/50 aspect-[4/3] flex flex-col">
                <div className="h-6 bg-white border-b border-border/30 flex items-center px-3 gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                   <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                   <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 p-4 flex gap-3">
                   <div className="flex-1 bg-white rounded-sm shadow-sm border border-border/20 p-4 space-y-3">
                      <div className="h-2 w-3/4 bg-muted/40 rounded-full" />
                      <div className="h-2 w-full bg-muted/20 rounded-full" />
                      <div className="h-2 w-5/6 bg-muted/20 rounded-full" />
                      <div className="mt-8 space-y-2">
                         <div className="h-10 w-full rounded bg-primary/5 border border-primary/10 flex items-center px-3 text-[8px] font-bold text-primary">SCAN_OFFICIEL_001.JPG</div>
                      </div>
                   </div>
                   <div className="flex-1 bg-white rounded-sm shadow-sm border border-primary/20 p-4 relative">
                      <div className="h-2 w-1/2 bg-primary/20 rounded-full mb-4" />
                      <div className="space-y-3 font-arabic text-right">
                         <div className="h-2 w-full bg-muted/10 rounded-full" />
                         <div className="h-2 w-3/4 bg-muted/10 rounded-full" />
                         <div className="h-2 w-5/6 bg-muted/10 rounded-full" />
                      </div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-primary shadow-xl animate-pulse">
                         <Sparkles className="w-5 h-5 text-accent mx-auto mb-2" />
                         <div className="text-[8px] font-bold text-primary text-center">{t("translationInProgress")}</div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Floating Accuracy Badge */}
              <div className="absolute -top-6 -right-6 bg-success text-white px-5 py-3 rounded-2xl shadow-2xl flex-col items-center hidden sm:flex">
                 <span className="text-[10px] font-bold tracking-widest uppercase">{t("accuracy")}</span>
                 <span className="text-2xl font-bold">98%</span>
              </div>
            </div>

            {/* Floating Info Cards */}
            <div className="absolute -bottom-8 -left-8 z-20 bg-white p-4 rounded-xl shadow-2xl border border-border animate-float max-w-[200px] hidden sm:block">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-success">
                     <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-primary-dark">{t("feature1_title")}</span>
               </div>
               <p className="text-[9px] text-muted-foreground leading-relaxed">
                 {t("feature1_desc")}
               </p>
            </div>

            <div className="absolute top-10 -right-12 z-0 bg-primary/90 p-5 rounded-xl shadow-2xl text-white max-w-[160px] animate-float hidden lg:block" style={{ animationDelay: '1s' }}>
               <FileText className="w-6 h-6 mb-3 text-accent" />
               <div className="text-xl font-bold">{t("feature2_val")}</div>
               <div className="text-[9px] font-medium opacity-70 uppercase tracking-widest mt-1">{t("feature2_desc")}</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
