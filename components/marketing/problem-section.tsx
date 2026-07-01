"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  TrendingUp, 
  FileCheck, 
  ScanLine, 
  Zap, 
  ShieldCheck, 
  Scale, 
  Clock, 
  FileText,
  Lock,
  ArrowRight,
  Database,
  RefreshCw,
  Search
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

export function MarketingProblemSection() {
  const t = useTranslations("Problem");
  const locale = useLocale();
  const isRtl = locale === "ar";

  // Interactive Terminology Switcher State (Card 1)
  const [termIndex, setTermIndex] = useState(0);
  const termsList = [
    { fr: "Acte de naissance", ar: "مستخرج عقد الولادة", type: "État Civil" },
    { fr: "Jugement de divorce", ar: "حكم طلاق", type: "Statut Personnel" },
    { fr: "Tribunal de commerce", ar: "المحكمة التجارية", type: "Droit Commercial" },
    { fr: "Procès-verbal (PV)", ar: "محضر رسمي", type: "Judiciaire" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTermIndex((prev) => (prev + 1) % termsList.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // Live OCR scanning effect (Card 4)
  const [ocrActive, setOcrActive] = useState(true);

  return (
    <section id="why-us" className="relative py-32 bg-white overflow-hidden border-b border-[#e5e3dc]">
      {/* Dynamic Keyframes & Custom Styles */}
      <style jsx global>{`
        @keyframes laser-sweep {
          0%, 100% {
            top: 10%;
            opacity: 0.2;
          }
          50% {
            top: 90%;
            opacity: 1;
          }
        }
        @keyframes subtle-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        @keyframes radar-pulse {
          0% {
            transform: scale(0.9);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
        @keyframes progress-run {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-laser-sweep {
          animation: laser-sweep 3s ease-in-out infinite;
        }
        .animate-subtle-float {
          animation: subtle-float 4s ease-in-out infinite;
        }
        .animate-radar-pulse {
          animation: radar-pulse 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-progress-run {
          animation: progress-run 3s linear infinite;
        }
      `}</style>

      {/* Decorative Grid Overlays (Linear Style) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none opacity-80" />
      
      {/* Background Radial Gradients */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        {/* 🚀 Section Header */}
        <div className="text-center space-y-4 mb-24 max-w-3xl mx-auto">
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.35em] text-accent-dark px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full">
            {t("tag")}
          </span>
          <h2 className="text-4xl md:text-6.5xl font-serif font-bold text-primary-dark tracking-tight leading-tight">
            {t("title")}
          </h2>
          <p className="text-muted-foreground leading-relaxed text-sm md:text-md font-medium max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* 📊 Metrics Board (Linear/Stripe Style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 md:mb-28">
          
          {/* Metric 1 */}
          <div className="group relative p-6 sm:p-10 bg-[#faf8f3] border border-[#e5e3dc] rounded-[2rem] overflow-hidden hover:border-primary/40 hover:shadow-2xl transition-all duration-500 z-10 cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="absolute top-8 right-8 text-primary/10 group-hover:text-primary/20 transition-colors">
              <Clock className="w-12 h-12" />
            </div>
            <div className="text-5xl md:text-6xl font-serif font-bold text-primary-dark tracking-tight mb-4 group-hover:text-primary transition-colors flex items-baseline gap-1" dir="ltr">
              {t("metric1_val")}
            </div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-accent-dark mb-2">
              {t("metric1_lbl")}
            </h4>
            <p className="text-muted-foreground text-xs leading-relaxed font-medium">
              {t("metric1_desc")}
            </p>
          </div>

          {/* Metric 2 */}
          <div className="group relative p-6 sm:p-10 bg-[#faf8f3] border border-[#e5e3dc] rounded-[2rem] overflow-hidden hover:border-primary/40 hover:shadow-2xl transition-all duration-500 z-10 cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="absolute top-8 right-8 text-primary/10 group-hover:text-primary/20 transition-colors">
              <Scale className="w-12 h-12" />
            </div>
            <div className="text-5xl md:text-6xl font-serif font-bold text-primary-dark tracking-tight mb-4 group-hover:text-primary transition-colors flex items-baseline gap-1" dir="ltr">
              {t("metric2_val")}
            </div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-accent-dark mb-2">
              {t("metric2_lbl")}
            </h4>
            <p className="text-muted-foreground text-xs leading-relaxed font-medium">
              {t("metric2_desc")}
            </p>
          </div>

          {/* Metric 3 */}
          <div className="group relative p-6 sm:p-10 bg-[#faf8f3] border border-[#e5e3dc] rounded-[2rem] overflow-hidden hover:border-primary/40 hover:shadow-2xl transition-all duration-500 z-10 cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="absolute top-8 right-8 text-primary/10 group-hover:text-primary/20 transition-colors">
              <Zap className="w-12 h-12" />
            </div>
            <div className="text-5xl md:text-6xl font-serif font-bold text-primary-dark tracking-tight mb-4 group-hover:text-primary transition-colors flex items-baseline gap-1" dir="ltr">
              {t("metric3_val")}
            </div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-accent-dark mb-2">
              {t("metric3_lbl")}
            </h4>
            <p className="text-muted-foreground text-xs leading-relaxed font-medium">
              {t("metric3_desc")}
            </p>
          </div>

        </div>

        {/* 💎 Premium Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Card 1: IA Juridique Spécialisée */}
          <div className="group relative p-6 sm:p-8 bg-white/70 backdrop-blur-md border border-[#e5e3dc] rounded-[2rem] shadow-sm hover:shadow-2xl hover:border-primary/30 hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between overflow-hidden cursor-default">
            <div>
              <div className="mb-8 p-4 bg-[#faf8f3] rounded-2xl border border-[#e5e3dc] group-hover:border-primary/20 w-fit transition-all duration-300">
                <Sparkles className="w-6 h-6 text-primary group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <h3 className="text-xl font-bold text-primary-dark mb-3 group-hover:text-primary transition-colors">
                {t("f1_title")}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-xs font-medium mb-6">
                {t("f1_desc")}
              </p>
            </div>
            
            {/* Interactive Visual Element: Bilingual Dictionary Stream */}
            <div className="mt-4 border border-[#e5e3dc]/70 bg-[#faf8f3] rounded-2xl p-4 relative overflow-hidden h-28 flex flex-col justify-center">
              <div className="absolute top-2 left-2 text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                Dictionnaire IA LegTrans
              </div>
              <div className="space-y-2 text-start mt-2">
                <div className="text-[11px] font-bold text-primary-dark transition-all duration-500">
                  {termsList[termIndex].fr}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-accent font-bold" dir={isRtl ? "rtl" : "ltr"}>
                  <RefreshCw className="w-3 h-3 animate-spin text-accent" />
                  <span className="font-arabic">{termsList[termIndex].ar}</span>
                </div>
              </div>
              <div className="absolute right-3 bottom-3 text-[9px] font-bold text-primary/30 uppercase tracking-widest">
                {termsList[termIndex].type}
              </div>
            </div>
          </div>

          {/* Card 2: Gain de Temps Massif */}
          <div className="group relative p-6 sm:p-8 bg-white/70 backdrop-blur-md border border-[#e5e3dc] rounded-[2rem] shadow-sm hover:shadow-2xl hover:border-primary/30 hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between overflow-hidden cursor-default">
            <div>
              <div className="mb-8 p-4 bg-[#faf8f3] rounded-2xl border border-[#e5e3dc] group-hover:border-primary/20 w-fit transition-all duration-300">
                <TrendingUp className="w-6 h-6 text-primary group-hover:-translate-y-1 transition-transform duration-300" />
              </div>
              <h3 className="text-xl font-bold text-primary-dark mb-3 group-hover:text-primary transition-colors">
                {t("f2_title")}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-xs font-medium mb-6">
                {t("f2_desc")}
              </p>
            </div>
            
            {/* Interactive Visual Element: Productivity Optimizer Speed dial */}
            <div className="mt-4 border border-[#e5e3dc]/70 bg-[#faf8f3] rounded-2xl p-4 relative overflow-hidden h-28 flex flex-col justify-center">
              <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground/80 mb-2">
                <span>Traduction Manuelle</span>
                <span>6 heures</span>
              </div>
              <div className="w-full bg-border rounded-full h-1.5 mb-4">
                <div className="bg-red-400 h-1.5 rounded-full w-full" />
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold text-primary mb-2">
                <span>Moteur LegTrans DZ IA</span>
                <span className="text-success">10 min</span>
              </div>
              <div className="w-full bg-border rounded-full h-1.5">
                <div className="bg-success h-1.5 rounded-full animate-progress-run" />
              </div>
            </div>
          </div>

          {/* Card 3: Export DOCX Professionnel */}
          <div className="group relative p-6 sm:p-8 bg-white/70 backdrop-blur-md border border-[#e5e3dc] rounded-[2rem] shadow-sm hover:shadow-2xl hover:border-primary/30 hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between overflow-hidden cursor-default">
            <div>
              <div className="mb-8 p-4 bg-[#faf8f3] rounded-2xl border border-[#e5e3dc] group-hover:border-primary/20 w-fit transition-all duration-300">
                <FileCheck className="w-6 h-6 text-primary group-hover:scale-105 transition-transform duration-300" />
              </div>
              <h3 className="text-xl font-bold text-primary-dark mb-3 group-hover:text-primary transition-colors">
                {t("f3_title")}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-xs font-medium mb-6">
                {t("f3_desc")}
              </p>
            </div>
            
            {/* Interactive Visual Element: Word Layout Visualizer */}
            <div className="mt-4 border border-[#e5e3dc]/70 bg-[#faf8f3] rounded-2xl p-4 relative overflow-hidden h-28 flex items-center justify-between">
              <div className="space-y-1.5 flex-1 pr-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-[10px] font-bold text-primary-dark">Structure Tableaux OK</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-[10px] font-bold text-primary-dark">Polices & Styles OK</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-[10px] font-bold text-primary-dark">Sceau & Signatures OK</span>
                </div>
              </div>
              <div className="w-14 h-18 bg-white border border-[#e5e3dc] rounded-lg shadow-md flex flex-col items-center justify-center p-2 shrink-0 animate-subtle-float">
                <FileText className="w-7 h-7 text-primary mb-1" />
                <span className="text-[7px] font-extrabold text-primary bg-primary/10 px-1 py-0.5 rounded">.DOCX</span>
              </div>
            </div>
          </div>

          {/* Card 4: OCR Documents Officiels */}
          <div className="group relative p-6 sm:p-8 bg-white/70 backdrop-blur-md border border-[#e5e3dc] rounded-[2rem] shadow-sm hover:shadow-2xl hover:border-primary/30 hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between overflow-hidden cursor-default">
            <div>
              <div className="mb-8 p-4 bg-[#faf8f3] rounded-2xl border border-[#e5e3dc] group-hover:border-primary/20 w-fit transition-all duration-300">
                <ScanLine className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-primary-dark mb-3 group-hover:text-primary transition-colors">
                {t("f4_title")}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-xs font-medium mb-6">
                {t("f4_desc")}
              </p>
            </div>
            
            {/* Interactive Visual Element: Scanning OCR laser */}
            <div className="mt-4 border border-[#e5e3dc]/70 bg-[#faf8f3] rounded-2xl p-4 relative overflow-hidden h-28 flex items-center justify-center bg-white cursor-pointer" onClick={() => setOcrActive(!ocrActive)}>
              <div className="relative border border-primary/20 rounded-md w-full h-full bg-[#faf8f3] flex flex-col justify-center px-4 font-mono text-[8px] text-muted-foreground overflow-hidden">
                <div className="text-[9px] font-bold text-primary-dark mb-1 uppercase tracking-widest flex justify-between items-center">
                  <span>Numérisation Actes</span>
                  <span className="text-[7px] text-success font-bold uppercase tracking-normal">Précision 98.4%</span>
                </div>
                <div className="border-b border-[#e5e3dc] pb-1 mb-1">RÉPUBLIQUE ALGÉRIENNE</div>
                <div>NOM: BENMOSTAFA</div>
                <div>PRÉNOM: Kamel</div>
                {ocrActive && (
                  <div className="absolute left-0 right-0 h-[2px] bg-accent shadow-md shadow-accent animate-laser-sweep" />
                )}
              </div>
            </div>
          </div>

          {/* Card 5: Workflow Ultra-Rapide */}
          <div className="group relative p-6 sm:p-8 bg-white/70 backdrop-blur-md border border-[#e5e3dc] rounded-[2rem] shadow-sm hover:shadow-2xl hover:border-primary/30 hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between overflow-hidden cursor-default">
            <div>
              <div className="mb-8 p-4 bg-[#faf8f3] rounded-2xl border border-[#e5e3dc] group-hover:border-primary/20 w-fit transition-all duration-300">
                <Zap className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-xl font-bold text-primary-dark mb-3 group-hover:text-primary transition-colors">
                {t("f5_title")}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-xs font-medium mb-6">
                {t("f5_desc")}
              </p>
            </div>
            
            {/* Interactive Visual Element: Sleek Timeline Nodes */}
            <div className="mt-4 border border-[#e5e3dc]/70 bg-[#faf8f3] rounded-2xl p-4 relative overflow-hidden h-28 flex items-center justify-between">
              <div className="flex items-center w-full justify-around relative">
                {/* Connector Bar */}
                <div className="absolute top-1/2 left-4 right-4 h-[2px] bg-border z-0 -translate-y-1/2" />
                <div className="absolute top-1/2 left-4 w-1/2 h-[2px] bg-primary z-0 -translate-y-1/2 animate-pulse" />
                
                {/* Node 1 */}
                <div className="w-8 h-8 rounded-full border border-[#e5e3dc] bg-white flex items-center justify-center shadow z-10">
                  <Database className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                {/* Node 2 */}
                <div className="w-8 h-8 rounded-full border-2 border-primary bg-white flex items-center justify-center shadow-lg z-10 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
                {/* Node 3 */}
                <div className="w-8 h-8 rounded-full border border-[#e5e3dc] bg-white flex items-center justify-center shadow z-10">
                  <FileCheck className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 6: Souveraineté des Données */}
          <div className="group relative p-6 sm:p-8 bg-white/70 backdrop-blur-md border border-[#e5e3dc] rounded-[2rem] shadow-sm hover:shadow-2xl hover:border-primary/30 hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between overflow-hidden cursor-default">
            <div>
              <div className="mb-8 p-4 bg-[#faf8f3] rounded-2xl border border-[#e5e3dc] group-hover:border-primary/20 w-fit transition-all duration-300">
                <ShieldCheck className="w-6 h-6 text-primary group-hover:scale-105 transition-transform duration-300" />
              </div>
              <h3 className="text-xl font-bold text-primary-dark mb-3 group-hover:text-primary transition-colors">
                {t("f6_title")}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-xs font-medium mb-6">
                {t("f6_desc")}
              </p>
            </div>
            
            {/* Interactive Visual Element: Sovereign Security pulsing waves */}
            <div className="mt-4 border border-[#e5e3dc]/70 bg-[#faf8f3] rounded-2xl p-4 relative overflow-hidden h-28 flex items-center justify-center">
              <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                <div className="absolute inset-0 rounded-full border border-primary/40 animate-radar-pulse" />
                <div className="absolute inset-0 rounded-full border border-primary/20 animate-radar-pulse" style={{ animationDelay: '0.6s' }} />
                <Lock className="w-5 h-5 text-primary relative z-10" />
              </div>
              <div className="ms-4 text-start flex-1">
                <div className="text-[10px] font-bold text-primary-dark">Protection Chiffrée</div>
                <div className="text-[8px] text-muted-foreground font-medium">Infrastructure Conforme RGPD-DZ</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
