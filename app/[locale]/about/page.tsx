import React from "react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Scale, ShieldCheck, GraduationCap, Globe2, BookOpen } from "lucide-react";

export default function AboutPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = useTranslations("About");

  return (
    <div className="min-h-screen bg-[#f5f7fa] py-20">
      <div className="container mx-auto px-6 max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mb-6 shadow-sm">
            <Scale className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            {t("title")}
          </h1>
          <div className="w-24 h-1 bg-emerald-500 mx-auto rounded-full"></div>
        </div>

        {/* Content Blocks */}
        <div className="space-y-12">
          
          {/* Mission */}
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="mt-1 bg-blue-50 p-3 rounded-lg text-blue-600">
                <Globe2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">{t("missionTitle")}</h2>
                <p className="text-slate-600 leading-relaxed text-lg">{t("missionDesc")}</p>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="mt-1 bg-purple-50 p-3 rounded-lg text-purple-600">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">{t("historyTitle")}</h2>
                <p className="text-slate-600 leading-relaxed text-lg">{t("historyDesc")}</p>
              </div>
            </div>
          </div>

          {/* Sovereignty */}
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="mt-1 bg-emerald-50 p-3 rounded-lg text-emerald-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">{t("sovereigntyTitle")}</h2>
                <p className="text-slate-600 leading-relaxed text-lg">{t("sovereigntyDesc")}</p>
              </div>
            </div>
          </div>

          {/* Glossary */}
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="mt-1 bg-amber-50 p-3 rounded-lg text-amber-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">{t("glossaryTitle")}</h2>
                <p className="text-slate-600 leading-relaxed text-lg">{t("glossaryDesc")}</p>
              </div>
            </div>
          </div>

          {/* Legal */}
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="mt-1 bg-rose-50 p-3 rounded-lg text-rose-600">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">{t("legalTitle")}</h2>
                <p className="text-slate-600 leading-relaxed text-lg">{t("legalDesc")}</p>
              </div>
            </div>
          </div>

        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="bg-emerald-600 text-white rounded-2xl p-10 shadow-lg">
            <h3 className="text-2xl font-bold mb-6">{t("cta")}</h3>
            <a 
              href="/auth/register" 
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-600 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              Créer un compte gratuit
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
