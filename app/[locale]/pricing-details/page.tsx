"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Link, useRouter } from "@/src/i18n/routing";
import { TopBar } from "@/components/layout/top-bar";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Check, 
  HelpCircle, 
  ChevronRight, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Star, 
  Rocket, 
  Building2, 
  Shield, 
  Lock, 
  FileText, 
  Mail, 
  ArrowUpRight,
  Maximize2,
  Table2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PricingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "fr";
  const isRtl = locale === "ar";
  const { user } = useAuth();

  const [activeSection, setActiveSection] = useState("why");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const sections = [
    { id: "why", label: "Pourquoi plusieurs formules ?", icon: <HelpCircle className="w-4 h-4" /> },
    { id: "trial", label: "Essai gratuit — 7 jours", icon: <Sparkles className="w-4 h-4 text-emerald-600" /> },
    { id: "free", label: "Gratuit limité — Après l'essai", icon: <Zap className="w-4 h-4 text-amber-500" /> },
    { id: "pro", label: "Pro — Workflows quotidiens", icon: <Star className="w-4 h-4 text-yellow-600" /> },
    { id: "plus", label: "Plus — Documents complexes", icon: <Rocket className="w-4 h-4 text-blue-600" /> },
    { id: "ocr-modes", label: "Comparatif des modes OCR", icon: <Maximize2 className="w-4 h-4 text-indigo-600" /> },
    { id: "ai-translation", label: "Traduction documentaire IA", icon: <FileText className="w-4 h-4 text-purple-600" /> },
    { id: "confidentiality", label: "Confidentialité & Sécurité", icon: <Shield className="w-4 h-4 text-emerald-700" /> },
    { id: "api-enterprise", label: "API & Offre Entreprise", icon: <Building2 className="w-4 h-4 text-teal-600" /> },
    { id: "faq", label: "Questions fréquentes", icon: <HelpCircle className="w-4 h-4 text-[#8a8a8a]" /> }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const top = rect.top + window.scrollY;
          const height = rect.height;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveSection(id);
    }
  };

  const faqItems = [
    {
      q: "Comment puis-je annuler ou modifier mon abonnement ?",
      a: "Toutes nos offres sont sans engagement de durée. Vous pouvez annuler, mettre à niveau ou rétrograder votre forfait à tout moment directement depuis votre panneau de facturation dans l'application."
    },
    {
      q: "Quelles sont les limites après expiration de l'essai gratuit ?",
      a: "Votre compte bascule automatiquement vers le forfait Gratuit Limité. Vous conservez votre historique et la traduction de texte simple en illimité. L'accès à l'OCR premium est limité à 1 requête (1 page maximum) par jour, et la traduction de documents IA est désactivée."
    },
    {
      q: "Comment fonctionnent les deux modes OCR premium ?",
      a: "Le mode 'Documents anciens / manuscrits' utilise des modèles d'IA spécialisés dans l'écriture cursive et les actes anciens complexes. Le mode 'Tableaux' extrait fidèlement la mise en page, les structures de formulaires et les tableaux de données."
    },
    {
      q: "Puis-je exporter mes documents traduits dans leur format d'origine ?",
      a: "Oui. Notre outil conserve intelligemment la mise en page structurelle générale (tableaux, paragraphes alignés, en-têtes) pour générer des fichiers Word (.docx) ou Excel (.xlsx) entièrement modifiables."
    },
    {
      q: "Où sont hébergées et traitées mes données ?",
      a: "Toutes les données sont cryptées en transit (SSL/TLS) et au repos (AES-256). Nous respectons des processus stricts limitant le stockage permanent des documents après traitement afin de préserver le secret professionnel."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f3]" dir={isRtl ? "rtl" : "ltr"}>
      <TopBar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-32 bg-white border-b border-[#e5e3dc] shadow-sm">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "radial-gradient(#0d6e4e 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Tarification transparente
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-primary-dark tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Des solutions adaptées à vos workflows documentaires
          </h1>
          
          <p className="text-muted-foreground font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            OCR, traduction multilingue et traitement documentaire assisté par IA pour les professionnels et institutions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 max-w-md mx-auto sm:max-w-none">
            <Link href={user ? "/dashboard" : "/auth/register"} className="w-full sm:w-auto">
              <button className="w-full sm:w-auto h-12 px-8 rounded-xl font-bold text-sm text-white bg-[#0d6e4e] hover:bg-[#0a5a40] shadow-xl shadow-emerald-800/10 hover:shadow-emerald-800/20 transition-all flex items-center justify-center gap-2">
                Commencer l’essai gratuit
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <button 
              onClick={() => scrollTo("trial")} 
              className="w-full sm:w-auto h-12 px-8 rounded-xl font-semibold text-sm text-[#595959] bg-white border border-[#e5e3dc] hover:bg-[#faf8f3] hover:border-[#c8c5bd] shadow-sm transition-all"
            >
              Voir les offres
            </button>
            <a 
              href="mailto:contact@legtransdz.com?subject=Demande%20d'offre%20personnalisée%20-%20LegTrans%20DZ" 
              className="w-full sm:w-auto"
            >
              <button className="w-full sm:w-auto h-12 px-8 rounded-xl font-semibold text-sm text-primary hover:text-primary-dark bg-primary/5 hover:bg-primary/10 transition-all flex items-center justify-center gap-2">
                Contacter le service commercial
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 flex flex-col lg:flex-row gap-10 min-h-0">
        
        {/* Navigation Sidebar (Sticky) */}
        <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-24 h-fit hidden lg:block">
          <div className="bg-white/80 backdrop-blur border border-[#e5e3dc] rounded-2xl p-4 shadow-sm space-y-1.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-3">Navigation rapide</p>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollTo(section.id)}
                className={cn(
                  "w-full text-start px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all",
                  activeSection === section.id 
                    ? "bg-[#0d6e4e]/10 text-[#0d6e4e] shadow-sm font-bold" 
                    : "text-gray-600 hover:bg-[#f5f3ed]/50 hover:text-primary"
                )}
              >
                {section.icon}
                <span className="truncate">{section.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Detailed Sections Content */}
        <main className="flex-1 min-w-0 space-y-16">
          
          {/* Glassmorphic Explanation Container */}
          <div className="bg-white/70 border border-[#e5e3dc] backdrop-blur-md rounded-3xl p-6 md:p-12 shadow-xl space-y-16">
            
            {/* Section 1: Pourquoi plusieurs formules ? */}
            <section id="why" className="space-y-4">
              <div className="flex items-center gap-3 text-emerald-800 bg-emerald-50 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                <HelpCircle className="w-3.5 h-3.5" />
                Introduction
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary-dark tracking-tight">
                Pourquoi plusieurs formules ?
              </h2>
              <p className="text-[#595959] font-medium leading-relaxed text-sm md:text-base">
                LegTrans DZ propose plusieurs formules afin de s’adapter aux différents besoins de traitement documentaire, de traduction et d’OCR. Que vous soyez traducteur, professionnel juridique, cabinet ou institution, vous pouvez choisir la formule correspondant à votre volume de travail et au niveau de précision souhaité.
              </p>
            </section>

            <div className="h-px bg-gradient-to-r from-[#e5e3dc] via-transparent to-[#e5e3dc]" />

            {/* Section 2: Essai gratuit — 7 jours */}
            <section id="trial" className="space-y-5">
              <div className="flex items-center gap-3 text-emerald-800 bg-emerald-50 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                <Sparkles className="w-3.5 h-3.5" />
                Formule de découverte
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary-dark tracking-tight">
                Essai gratuit — 7 jours
              </h2>
              <div className="text-[#595959] space-y-4 leading-relaxed text-sm md:text-base">
                <p className="font-bold text-lg text-primary-dark">0 DZD</p>
                <p>
                  Pendant 7 jours, vous pouvez tester les principales fonctionnalités de LegTrans DZ avec des limites adaptées à l’essai :
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-0 list-none mt-2 font-medium">
                  {[
                    "Manuscrits : 2 requêtes / jour",
                    "Tableaux : 1 requête / jour",
                    "Maximum : 15 pages / jour pendant l’essai",
                    "Traduction doc IA : 1 document / jour",
                    "Jusqu’à 5 pages par fichier",
                    "Traduction texte illimitée",
                    "Export Word & Excel",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="font-semibold italic text-emerald-800 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50 mt-4">
                  Après l’essai : Gratuit limité
                </p>
              </div>
            </section>

            <div className="h-px bg-gradient-to-r from-[#e5e3dc] via-transparent to-[#e5e3dc]" />

            {/* Section 3: Gratuit limité — Après l’essai */}
            <section id="free" className="space-y-5">
              <div className="flex items-center gap-3 text-amber-800 bg-amber-50 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-100">
                <Zap className="w-3.5 h-3.5" />
                Formule gratuite après essai
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary-dark tracking-tight">
                Gratuit limité — Après l’essai
              </h2>
              <div className="text-[#595959] space-y-4 leading-relaxed text-sm md:text-base">
                <p>
                  Après la période d’essai, votre compte bascule automatiquement vers la formule gratuite limitée. Vous gardez :
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-0 list-none mt-2 font-medium">
                  {[
                    "L’accès au tableau de bord et à l’historique",
                    "La traduction texte simple en illimité",
                    "OCR : 1 requête par jour au total, Manuscrits ou Tableaux",
                    "Maximum : 1 page par requête",
                    "Traduction documentaire IA : désactivée"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="font-semibold italic text-amber-800 bg-amber-50/50 p-4 rounded-xl border border-amber-100/50 mt-4">
                  Pour traiter plus de pages ou utiliser la traduction documentaire IA, vous devez passer à un forfait payant.
                </p>
              </div>
            </section>

            <div className="h-px bg-gradient-to-r from-[#e5e3dc] via-transparent to-[#e5e3dc]" />

            {/* Section 4: Pro — Pour les workflows quotidiens */}
            <section id="pro" className="space-y-5">
              <div className="flex items-center gap-3 text-yellow-800 bg-yellow-50 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-yellow-100">
                <Star className="w-3.5 h-3.5" />
                Formule Pro
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary-dark tracking-tight">
                Pro — Pour les workflows quotidiens
              </h2>
              <div className="text-[#595959] space-y-4 leading-relaxed text-sm md:text-base">
                <p>
                  La formule Pro est conçue pour les professionnels ayant un usage régulier de l'OCR et de la traduction. Elle comprend :
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#faf8f3] p-5 rounded-2xl border border-[#e5e3dc] mb-4">
                  <div>
                    <p className="font-bold text-primary-dark mb-2">Cibles :</p>
                    <ul className="list-disc pl-5 space-y-1 font-medium text-xs md:text-sm">
                      <li>les traducteurs et juristes</li>
                      <li>les professionnels juridiques indépendants</li>
                      <li>cabinets à volume de traitement standard</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold text-primary-dark mb-2">Limites de traitement :</p>
                    <ul className="list-disc pl-5 space-y-1 font-medium text-xs md:text-sm">
                      <li>Manuscrits : 7 requêtes / jour</li>
                      <li>Jusqu’à 35 pages / jour</li>
                      <li>Tableaux : 3 requêtes / jour</li>
                      <li>Jusqu’à 15 pages / jour</li>
                      <li>Jusqu’à 5 pages par fichier</li>
                      <li>Traduction doc IA : 2 documents / jour</li>
                    </ul>
                  </div>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-0 list-none mt-2 font-medium">
                  {[
                    "Accès au mode Documents anciens / manuscrits",
                    "Accès au mode Tableaux",
                    "Export Word & Excel",
                    "Assistance standard par e-mail",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <div className="h-px bg-gradient-to-r from-[#e5e3dc] via-transparent to-[#e5e3dc]" />

            {/* Section 5: Plus — Pour les documents complexes */}
            <section id="plus" className="space-y-5">
              <div className="flex items-center gap-3 text-blue-800 bg-blue-50 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                <Rocket className="w-3.5 h-3.5" />
                Formule Plus
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary-dark tracking-tight">
                Plus — Pour les documents complexes
              </h2>
              <div className="text-[#595959] space-y-4 leading-relaxed text-sm md:text-base">
                <p>
                  La formule Plus est destinée aux cabinets et utilisateurs exigeants ayant besoin de traiter d'importants volumes de documents complexes. Elle comprend :
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#faf8f3] p-5 rounded-2xl border border-[#e5e3dc] mb-4">
                  <div>
                    <p className="font-bold text-primary-dark mb-2">Cibles :</p>
                    <ul className="list-disc pl-5 space-y-1 font-medium text-xs md:text-sm">
                      <li>les cabinets de traduction et d'avocats</li>
                      <li>les études notariales</li>
                      <li>les professionnels gérant de grands volumes</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold text-primary-dark mb-2">Limites de traitement :</p>
                    <ul className="list-disc pl-5 space-y-1 font-medium text-xs md:text-sm">
                      <li>Manuscrits : 12 requêtes / jour</li>
                      <li>Jusqu’à 60 pages / jour</li>
                      <li>Tableaux : 6 requêtes / jour</li>
                      <li>Jusqu’à 30 pages / jour</li>
                      <li>Jusqu’à 5 pages par fichier</li>
                      <li>Traduction doc IA : 10 documents / jour</li>
                    </ul>
                  </div>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-0 list-none mt-2 font-medium">
                  {[
                    "Accès complet aux deux modes OCR premium",
                    "Glossaire juridique algérien exclusif",
                    "Modèles prêts à l'emploi et WhatsApp",
                    "Export Word & Excel avancé",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <div className="h-px bg-gradient-to-r from-[#e5e3dc] via-transparent to-[#e5e3dc]" />

            {/* Section 6: OCR Modes Comparison Cards */}
            <section id="ocr-modes" className="space-y-6">
              <div className="flex items-center gap-3 text-indigo-800 bg-indigo-50 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                <Maximize2 className="w-3.5 h-3.5" />
                Comparatif technique
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary-dark tracking-tight">
                Comparatif des modes OCR
              </h2>
              <p className="text-[#595959] text-sm md:text-base">
                LegTrans DZ propose deux modes d'extraction de documents de qualité premium via des pipelines IA dédiés.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Handwriting Mode Card */}
                <div className="bg-[#faf8f3] border border-[#e5e3dc] rounded-2xl p-6 space-y-4 hover:border-emerald-600/30 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-2.5 text-[#b08d3c] font-bold">
                    <Sparkles className="w-5 h-5" />
                    <span>Mode Documents anciens / manuscrits</span>
                  </div>
                  <p className="text-xs text-[#595959]">
                    Optimisé pour déchiffrer l'écriture manuscrite cursive, les actes anciens scannés, les tampons officiels et les documents historiques peu contrastés.
                  </p>
                  <ul className="text-xs font-semibold text-gray-700 space-y-2">
                    <li className="flex items-center gap-2">✓ Archives, manuscrits & actes d'état civil</li>
                    <li className="flex items-center gap-2">✓ Écriture cursive lisible et tampons</li>
                    <li className="flex items-center gap-2">✓ Correction optique intelligente</li>
                    <li className="flex items-center gap-2">✓ Quota : Pro (7/j), Plus (12/j), Trial (3 au total)</li>
                  </ul>
                  <div className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest">Disponible pour : Trial, Pro, Plus, Admin</div>
                </div>

                {/* Style Preservation Mode Card */}
                <div className="bg-[#faf8f3] border border-[#e5e3dc] rounded-2xl p-6 space-y-4 hover:border-blue-600/30 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-2.5 text-[#0d6e4e] font-bold">
                    <Table2 className="w-5 h-5" />
                    <span>Mode Tableaux</span>
                  </div>
                  <p className="text-xs text-[#595959]">
                    Spécialement conçu pour identifier, extraire et recréer les tableaux, formulaires, relevés et mises en page structurées dans les fichiers finaux.
                  </p>
                  <ul className="text-xs font-semibold text-gray-700 space-y-2">
                    <li className="flex items-center gap-2">✓ Tableaux financiers, relevés, en-têtes</li>
                    <li className="flex items-center gap-2">✓ Conservation exacte du style structurel</li>
                    <li className="flex items-center gap-2">✓ Exportation propre vers Excel (.xlsx) et Word</li>
                    <li className="flex items-center gap-2">✓ Quota : Pro (3/j), Plus (6/j), Trial (2 au total)</li>
                  </ul>
                  <div className="text-[10px] font-bold text-[#0d6e4e] uppercase tracking-widest">Disponible pour : Trial, Pro, Plus, Admin</div>
                </div>
              </div>
            </section>

            <div className="h-px bg-gradient-to-r from-[#e5e3dc] via-transparent to-[#e5e3dc]" />

            {/* Section 7: Traduction documentaire IA */}
            <section id="ai-translation" className="space-y-5">
              <div className="flex items-center gap-3 text-purple-800 bg-purple-50 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-purple-100">
                <FileText className="w-3.5 h-3.5" />
                Moteur de traduction
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary-dark tracking-tight">
                Traduction documentaire IA
              </h2>
              <div className="text-[#595959] space-y-4 leading-relaxed text-sm md:text-base">
                <p>
                  Les traductions de documents IA permettent :
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-0 list-none mt-2 font-medium">
                  {["la traduction multilingue de documents complets", "la conservation partielle de la mise en page", "le traitement de documents administratifs et juridiques", "l’intégration avec les workflows OCR"].map((item, index) => (
                    <li key={index} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-4 border-t border-[#e5e3dc]">
                  <p className="font-bold text-primary-dark mb-3 text-xs md:text-sm">Langues actuellement supportées :</p>
                  <div className="flex flex-wrap gap-2">
                    {["Arabe", "Français", "Anglais", "Espagnol", "Italien"].map((lang, index) => (
                      <span key={index} className="px-3 py-1 rounded-full bg-white border border-[#e5e3dc] text-xs font-semibold text-gray-700 shadow-sm">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <div className="h-px bg-gradient-to-r from-[#e5e3dc] via-transparent to-[#e5e3dc]" />

            {/* Section 8: Confidentialité des documents */}
            <section id="confidentiality" className="space-y-5">
              <div className="flex items-center gap-3 text-emerald-850 bg-emerald-50 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                <Lock className="w-3.5 h-3.5" />
                Sécurité & RGPD
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary-dark tracking-tight">
                Confidentialité des documents
              </h2>
              <div className="text-[#595959] space-y-4 leading-relaxed text-sm md:text-base">
                <p>
                  Les documents importés sont considérés comme confidentiels. LegTrans DZ privilégie des flux de traitement limitant la conservation permanente des fichiers après traitement.
                </p>
                <p className="font-semibold text-emerald-800">
                  Les documents ne sont pas utilisés à des fins publicitaires.
                </p>
                <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl flex gap-3 text-xs leading-relaxed text-emerald-950 font-medium">
                  <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
                  <p>
                    Nous appliquons un chiffrement renforcé (HTTPS et AES-256) pour sécuriser l'ensemble de vos transferts. Vos documents originaux et traduits sont hébergés sur des serveurs sécurisés et supprimés automatiquement dès le traitement terminé afin de préserver le secret professionnel.
                  </p>
                </div>
              </div>
            </section>

            <div className="h-px bg-gradient-to-r from-[#e5e3dc] via-transparent to-[#e5e3dc]" />

            {/* Section 9: API & besoins avancés */}
            <section id="api-enterprise" className="space-y-5">
              <div className="flex items-center gap-3 text-teal-800 bg-teal-50 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-teal-100">
                <Building2 className="w-3.5 h-3.5" />
                Offre Entreprise & API
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary-dark tracking-tight">
                API & besoins avancés
              </h2>
              <div className="text-[#595959] space-y-4 leading-relaxed text-sm md:text-base">
                <p>
                  Des accès API et des volumes personnalisés peuvent être proposés sur demande pour :
                </p>
                <div className="flex flex-wrap gap-2.5 font-semibold">
                  {["institutions", "cabinets", "entreprises", "intégrations internes", "automatisation documentaire"].map((item, index) => (
                    <span key={index} className="px-3 py-1.5 rounded-lg bg-[#faf8f3] border border-[#e5e3dc] text-xs text-gray-700 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                      {item}
                    </span>
                  ))}
                </div>
                <div className="bg-[#faf8f3] border border-[#e5e3dc] rounded-2xl p-6 mt-6 space-y-4">
                  <p className="font-bold text-primary-dark text-sm md:text-base">Pour toute demande spécifique :</p>
                  <a href="mailto:contact@legtransdz.com?subject=Demande%20d'offre%20personnalisée%20-%20LegTrans%20DZ" className="inline-block">
                    <button className="h-10 px-6 rounded-xl font-bold text-xs text-white bg-[#0d6e4e] hover:bg-[#0a5a40] shadow-md transition-all flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Contactez le service commercial
                    </button>
                  </a>
                </div>
              </div>
            </section>

            <div className="h-px bg-gradient-to-r from-[#e5e3dc] via-transparent to-[#e5e3dc]" />

            {/* Section 10: FAQ */}
            <section id="faq" className="space-y-6">
              <div className="flex items-center gap-3 text-gray-800 bg-gray-100 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-gray-200">
                <HelpCircle className="w-3.5 h-3.5" />
                FAQ
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary-dark tracking-tight">
                Questions fréquentes
              </h2>
              <div className="space-y-3">
                {faqItems.map((faq, index) => (
                  <div key={index} className="border border-[#e5e3dc] rounded-xl overflow-hidden bg-[#faf8f3]">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full flex items-center justify-between p-4 font-bold text-xs md:text-sm text-primary-dark text-start transition-all hover:bg-[#faf8f3]/80"
                    >
                      <span>{faq.q}</span>
                      <ChevronRight className={cn("w-4 h-4 text-gray-500 transition-transform", openFaq === index ? "rotate-90" : "")} />
                    </button>
                    <div 
                      className={cn(
                        "transition-all duration-300 ease-in-out overflow-hidden border-t border-[#e5e3dc]/50 bg-white",
                        openFaq === index ? "max-h-[300px] p-4" : "max-h-0"
                      )}
                    >
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-medium">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Bottom CTA Block */}
          <div className="bg-gradient-to-br from-[#0d6e4e] to-[#074a35] text-white rounded-3xl p-8 md:p-12 shadow-2xl text-center space-y-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">
              Prêt à transformer vos documents ?
            </h2>
            <p className="text-white/80 font-medium text-xs md:text-sm max-w-lg mx-auto">
              Rejoignez les traducteurs et cabinets assermentés qui font confiance à LegTrans DZ pour accélérer leurs workflows.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link href={user ? "/dashboard" : "/auth/register"}>
                <button className="w-full sm:w-auto h-11 px-8 rounded-xl font-bold text-xs text-primary-dark bg-white hover:bg-[#faf8f3] shadow-lg transition-all">
                  Commencer l'essai de 7 jours
                </button>
              </Link>
              <a href="mailto:contact@legtransdz.com?subject=Demande%20d'offre%20personnalisée%20-%20LegTrans%20DZ">
                <button className="w-full sm:w-auto h-11 px-8 rounded-xl font-bold text-xs text-white border-2 border-white/20 hover:border-white/50 hover:bg-white/5 transition-all">
                  Demander un devis
                </button>
              </a>
            </div>
          </div>

        </main>
      </div>

      {/* Sticky Bottom Header Navigation Trigger for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e5e3dc] p-3 flex gap-2 md:hidden shadow-2xl">
        <Link href={user ? "/dashboard" : "/auth/register"} className="flex-1">
          <button className="w-full h-11 rounded-xl bg-[#0d6e4e] hover:bg-[#0a5a40] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md">
            <Sparkles className="w-4 h-4" />
            Essai gratuit 7j
          </button>
        </Link>
        <a href="mailto:contact@legtransdz.com?subject=Demande%20d'offre%20personnalisée" className="flex-1">
          <button className="w-full h-11 rounded-xl border border-[#e5e3dc] bg-[#faf8f3] text-gray-700 font-bold text-xs flex items-center justify-center gap-1.5">
            <Mail className="w-4 h-4" />
            Nous contacter
          </button>
        </a>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e5e3dc] py-10 mt-16 pb-20 md:pb-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" className="w-6 h-6 object-contain" alt="LegTrans Logo" />
            <span className="font-bold text-xs uppercase tracking-wider text-primary-dark">LegTrans DZ</span>
          </div>
          <p className="text-xs font-semibold text-muted-foreground text-center md:text-start">
            © {new Date().getFullYear()} LegTrans DZ. Tous droits réservés.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0d6e4e]/70 bg-[#0d6e4e]/10 px-3.5 py-1.5 rounded-full border border-[#0d6e4e]/20">
              Traitement confidentiel certifié
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
