"use client";

import React from "react";
import { Upload, Cpu, Edit3, Award } from "lucide-react";
import { useTranslations } from "next-intl";

export function MarketingHowItWorks() {
  const t = useTranslations("HowItWorks");
  const steps = t.raw("steps") as { title: string; text: string }[];
  const icons = [
    <Upload className="w-8 h-8" />,
    <Cpu className="w-8 h-8" />,
    <Edit3 className="w-8 h-8" />,
    <Award className="w-8 h-8" />,
  ];
  const nums = ["01", "02", "03", "04"];

  return (
    <section id="how-it-works" className="py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center space-y-4 mb-24">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary-dark">
            {t("title")}
          </h2>
          <p className="text-muted-foreground font-medium italic">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {steps.map((step, idx) => (
            <div key={idx} className="relative text-center group">
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-full h-[2px] bg-gradient-to-r from-primary/20 to-transparent z-0" />
              )}
              
              <div className="relative z-10 mb-8 mx-auto w-24 h-24 rounded-full bg-[#faf8f3] border border-[#e5e3dc] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-xl group-hover:shadow-primary/20">
                {icons[idx]}
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold border-4 border-white">
                   {nums[idx]}
                </div>
              </div>

              <h3 className="text-xl font-bold text-primary-dark mb-4">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed px-4">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
