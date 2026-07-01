"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslations } from "next-intl";

export function MarketingFAQ() {
  const t = useTranslations("FAQ");
  const faqs = t.raw("items") as { q: string; a: string }[];

  return (
    <section className="py-32 bg-white border-t border-[#e5e3dc]">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary-dark">
            {t("title")}
          </h2>
          <p className="text-muted-foreground font-medium italic">
            {t("subtitle")}
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`} className="bg-[#faf8f3] border border-[#e5e3dc] rounded-xl px-6">
              <AccordionTrigger className="text-start font-bold text-primary-dark hover:text-primary transition-colors py-6">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
