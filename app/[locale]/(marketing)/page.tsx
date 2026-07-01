import React from "react";
import { MarketingHero } from "@/components/marketing/hero";
import { MarketingProblemSection } from "@/components/marketing/problem-section";
import { MarketingPricing } from "@/components/marketing/pricing";
import { MarketingFAQ } from "@/components/marketing/faq";
import { MarketingFinalCTA } from "@/components/marketing/final-cta";

export const metadata = {
  title: "LegTrans DZ",
  description: "Plateforme professionnelle d'extraction et de traduction assistée par IA",
  alternates: {
    canonical: "/",
    languages: {
      'fr-DZ': '/fr',
      'ar-DZ': '/ar',
    },
  },
};

export default function LandingPage() {
  return (
    <>
      <MarketingHero />
      <MarketingProblemSection />
      <MarketingPricing />
      <MarketingFAQ />
      <MarketingFinalCTA />
    </>
  );
}


