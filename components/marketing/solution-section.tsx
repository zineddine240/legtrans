import React from "react";
import { Check, Cpu, Globe2, ShieldCheck, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

export function MarketingSolutionSection() {
  const t = useTranslations("Solution");

  return (
    <section className="py-24 bg-[#faf8f3] overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center space-y-4 mb-24">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent-dark">
            {t("tag")}
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary-dark">
            {t("title")}
          </h2>
        </div>

        {/* Pillar 1: OCR */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
          <div className="relative animate-in fade-in slide-in-from-left-8 duration-1000">
             <div className="aspect-square bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#e5e3dc] flex items-center justify-center p-12">
                <div className="relative w-full h-full border border-dashed border-primary/20 rounded-lg flex items-center justify-center">
                   <div className="absolute top-10 left-10 w-32 h-44 bg-muted/20 border border-border rounded shadow-sm flex items-center justify-center italic text-[8px] opacity-40 p-4">
                      {t("pillar1.doc_preview")}
                   </div>
                   <div className="bg-primary/90 p-8 rounded-full shadow-2xl text-white">
                      <Zap className="w-12 h-12 text-accent" />
                   </div>
                   <div className="absolute bottom-10 right-10 bg-success text-white px-4 py-2 rounded-lg text-xs font-bold animate-bounce">
                      {t("pillar1.accuracy")}
                   </div>
                </div>
             </div>
          </div>
          <div className="space-y-8">
            <div className="space-y-4">
               <span className="text-[10px] font-bold text-accent-dark uppercase tracking-widest bg-accent/10 px-3 py-1 rounded">
                 {t("pillar1.tag")}
               </span>
               <h3 className="text-3xl font-serif font-bold text-primary-dark leading-tight">
                 {t("pillar1.title")}
               </h3>
               <p className="text-muted-foreground leading-relaxed">
                 {t("pillar1.desc")}
               </p>
            </div>
            <ul className="space-y-4">
              {(t.raw("pillar1.features") as string[]).map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm font-bold text-primary-dark">
                   <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center text-white">
                      <Check className="w-3 h-3" />
                   </div>
                   {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pillar 2: IA Al-DZ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
          <div className="space-y-8 lg:order-1 order-2">
            <div className="space-y-4">
               <span className="text-[10px] font-bold text-accent-dark uppercase tracking-widest bg-accent/10 px-3 py-1 rounded">
                 {t("pillar2.tag")}
               </span>
               <h3 className="text-3xl font-serif font-bold text-primary-dark leading-tight">
                 {t("pillar2.title")}
               </h3>
               <p className="text-muted-foreground leading-relaxed">
                 {t("pillar2.desc")}
               </p>
            </div>
            <ul className="space-y-4">
              {(t.raw("pillar2.features") as string[]).map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm font-bold text-primary-dark">
                   <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center text-white">
                      <Check className="w-3 h-3" />
                   </div>
                   {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative lg:order-2 order-1">
             <div className="aspect-square bg-primary-dark rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center p-12">
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                   <Cpu className="w-32 h-32 text-accent animate-pulse" />
                   <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                      <div className="bg-white/10 p-3 rounded text-[9px] text-white/60">{t("pillar2.preview.acte_civil")}</div>
                      <div className="bg-white/10 p-3 rounded text-[9px] text-white/60">{t("pillar2.preview.cour_supreme")}</div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Pillar 3: Souveraineté */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
             <div className="aspect-square bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#e5e3dc] flex items-center justify-center p-12">
                <div className="text-center">
                   <Globe2 className="w-24 h-24 text-primary mx-auto mb-6" />
                   <div className="text-2xl font-serif font-bold text-primary-dark">{t("pillar3.preview.title")}</div>
                   <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-success uppercase">
                      <ShieldCheck className="w-4 h-4" />
                      {t("pillar3.preview.subtitle")}
                   </div>
                </div>
             </div>
          </div>
          <div className="space-y-8">
            <div className="space-y-4">
               <span className="text-[10px] font-bold text-accent-dark uppercase tracking-widest bg-accent/10 px-3 py-1 rounded">
                 {t("pillar3.tag")}
               </span>
               <h3 className="text-3xl font-serif font-bold text-primary-dark leading-tight">
                 {t("pillar3.title")}
               </h3>
               <p className="text-muted-foreground leading-relaxed">
                 {t("pillar3.desc")}
               </p>
            </div>
            <ul className="space-y-4">
              {(t.raw("pillar3.features") as string[]).map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm font-bold text-primary-dark">
                   <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center text-white">
                      <Check className="w-3 h-3" />
                   </div>
                   {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </section>
  );
}
