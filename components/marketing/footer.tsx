import React from "react";
import { Link } from "@/src/i18n/routing";
import { Scale, Globe, X, Mail } from "lucide-react";
import { useTranslations } from "next-intl";

export function MarketingFooter() {
  const t = useTranslations("Footer");

  return (
    <footer className="bg-[#1a1a1a] text-[#c4c4c4] pt-20 pb-10">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* COL 1: Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg">
                <Scale className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white leading-none">LegTrans DZ</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              {t("desc")}
            </p>
            <div className="flex items-center gap-4 text-white/50">
              <Link href="#" className="hover:text-white transition-colors"><Globe className="w-5 h-5" /></Link>
              <Link href="#" className="hover:text-white transition-colors"><X className="w-5 h-5" /></Link>
              <Link href="#" className="hover:text-white transition-colors"><Mail className="w-5 h-5" /></Link>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/30">
              {t("made_in")} <span className="text-[14px]">🇩🇿</span>
            </div>
          </div>

          {/* COL 2: Produit */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">{t("col_product.title")}</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="#features" className="hover:text-white transition-colors">{t("col_product.features")}</Link></li>
              <li><Link href="#pricing" className="hover:text-white transition-colors">{t("col_product.pricing")}</Link></li>
              <li>
                <Link href="/pricing-details" className="text-emerald-450 hover:text-emerald-300 font-semibold transition-colors">
                  {t("col_product.pricingDetails")}
                </Link>
              </li>
              <li><Link href="#security" className="hover:text-white transition-colors">{t("col_product.security")}</Link></li>
              <li><Link href="#roadmap" className="hover:text-white transition-colors">{t("col_product.roadmap")}</Link></li>
            </ul>
          </div>

          {/* COL 3: Entreprise */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">{t("col_company.title")}</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">{t("col_company.about")}</Link></li>
              <li><Link href="#blog" className="hover:text-white transition-colors">{t("col_company.blog")}</Link></li>
              <li><Link href="#careers" className="hover:text-white transition-colors">{t("col_company.careers")}</Link></li>
              <li><Link href="#press" className="hover:text-white transition-colors">{t("col_company.press")}</Link></li>
            </ul>
          </div>

          {/* COL 4: Légal */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">{t("col_legal.title")}</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/legal" className="hover:text-white transition-colors">{t("col_legal.terms")}</Link></li>
              <li><Link href="/legal" className="hover:text-white transition-colors">{t("col_legal.privacy")}</Link></li>
              <li><Link href="/legal" className="hover:text-white transition-colors">{t("col_legal.mentions")}</Link></li>
              <li><Link href="/legal" className="hover:text-white transition-colors">{t("col_legal.compliance")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] font-medium tracking-wide">
          <p>{t("rights")}</p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            <p>{t("supported_by")}</p>
            <div className="bg-white/5 border border-white/10 px-3 py-1 rounded text-[9px] uppercase font-bold text-white/50">
              {t("startup_label")}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
