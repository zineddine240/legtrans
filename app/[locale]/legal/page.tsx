import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#1a1a1a] font-sans selection:bg-primary/10">
      {/* Header */}
      <header className="bg-white border-b border-[#e5e3dc] sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-md">
               <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-bold tracking-tight text-primary-dark">LegTrans DZ</span>
          </div>
          <Link href="/auth/register" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors bg-white px-3 py-1.5 rounded-full border border-border shadow-sm hover:shadow">
            <ArrowLeft className="w-4 h-4" />
            Retour à l'inscription
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        
        {/* Politique de confidentialité */}
        <section className="space-y-8">
          <div className="border-b border-[#e5e3dc] pb-6">
            <h1 className="text-3xl font-serif font-bold text-primary-dark tracking-tight">Politique de confidentialité</h1>
            <p className="text-sm text-muted-foreground mt-2 font-medium">Dernière mise à jour : 23/05/2026</p>
          </div>
          
          <div className="prose prose-sm md:prose-base prose-emerald max-w-none text-[#595959] space-y-8 leading-relaxed">
            
            {/* 1. Introduction */}
            <div>
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-3">1. Introduction</h3>
              <p>LegTrans DZ attache une importance particulière à la protection des données personnelles et à la confidentialité des documents traités via la plateforme.</p>
              <p className="mt-2">La présente politique explique quelles données peuvent être collectées, comment elles sont utilisées et quelles mesures sont mises en œuvre afin de protéger les utilisateurs et leurs documents.</p>
            </div>

            <div className="h-px bg-[#e5e3dc]/50" />

            {/* 2. Données collectées */}
            <div>
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-3">2. Données collectées</h3>
              <p>LegTrans DZ peut collecter certaines informations nécessaires au fonctionnement du service, notamment :</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>nom et prénom</li>
                <li>adresse e-mail</li>
                <li>informations liées au compte utilisateur</li>
                <li>informations de facturation et d’abonnement</li>
                <li>données techniques liées à l’utilisation, à la sécurité et au fonctionnement normal de la plateforme</li>
              </ul>
            </div>

            <div className="h-px bg-[#e5e3dc]/50" />

            {/* 3. Documents importés */}
            <div>
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-3">3. Documents importés</h3>
              <p>Les documents importés par les utilisateurs sont considérés comme confidentiels.</p>
              <p className="mt-2">Les fichiers transmis via la plateforme sont utilisés uniquement afin de fournir les services demandés, notamment :</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>OCR</li>
                <li>reconnaissance d’écriture manuscrite</li>
                <li>extraction de tableaux</li>
                <li>traduction de documents</li>
                <li>export Word et Excel</li>
              </ul>
              <p className="mt-4">LegTrans DZ ne revend pas les données des utilisateurs et n’utilise pas les documents importés à des fins publicitaires.</p>
            </div>

            <div className="h-px bg-[#e5e3dc]/50" />

            {/* 4. Conservation des données */}
            <div>
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-3">4. Conservation des données</h3>
              <p>LegTrans DZ s’efforce de limiter la conservation des documents et données au strict nécessaire au fonctionnement du service.</p>
              <p className="mt-2">Les documents importés ne sont pas conservés de manière permanente. Ils sont traités uniquement pendant la durée nécessaire à l’exécution du service demandé, sauf nécessité technique temporaire, obligation légale ou demande explicite de l’utilisateur.</p>
              <p className="mt-4">Certaines données techniques ou historiques peuvent être conservées temporairement afin d’assurer :</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>la sécurité du service</li>
                <li>le support technique</li>
                <li>la gestion des abonnements</li>
                <li>l’amélioration des performances</li>
              </ul>
            </div>

            <div className="h-px bg-[#e5e3dc]/50" />

            {/* 5. Prestataires techniques tiers */}
            <div>
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-3">5. Prestataires techniques tiers</h3>
              <p>Certaines fonctionnalités de la plateforme peuvent s’appuyer sur des prestataires techniques tiers spécialisés notamment dans :</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>l’intelligence artificielle</li>
                <li>l’OCR</li>
                <li>l’hébergement cloud</li>
                <li>l’authentification</li>
                <li>les paiements</li>
                <li>les services de messagerie</li>
              </ul>
              <p className="mt-4">Ces prestataires peuvent traiter temporairement certaines données strictement nécessaires à l’exécution des services proposés par LegTrans DZ.</p>
              <p className="mt-4">Pour certaines fonctionnalités d’OCR et de traitement documentaire, les résultats peuvent être automatiquement supprimés par les prestataires techniques après une durée limitée suivant la fin du traitement.</p>
              <p className="mt-2">LegTrans DZ privilégie des flux techniques limitant la conservation permanente des documents et réduisant l’exposition des données au strict nécessaire.</p>
            </div>

            <div className="h-px bg-[#e5e3dc]/50" />

            {/* 6. Sécurité */}
            <div>
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-3">6. Sécurité</h3>
              <p>LegTrans DZ met en œuvre des mesures techniques et organisationnelles raisonnables afin de protéger les données et les comptes utilisateurs, notamment :</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>connexions sécurisées (HTTPS)</li>
                <li>contrôle d’accès</li>
                <li>authentification sécurisée</li>
                <li>limitation des accès internes</li>
                <li>mesures raisonnables de protection des infrastructures</li>
              </ul>
              <p className="mt-4">Cependant, aucun système informatique ne peut garantir une sécurité absolue.</p>
            </div>

            <div className="h-px bg-[#e5e3dc]/50" />

            {/* 7. Responsabilité de l’utilisateur */}
            <div>
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-3">7. Responsabilité de l’utilisateur</h3>
              <p>L’utilisateur reste responsable :</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>du contenu des documents importés</li>
                <li>de la vérification des traductions et résultats OCR</li>
                <li>de l’utilisation finale des documents générés</li>
                <li>des droits et autorisations nécessaires concernant les documents transmis via la plateforme</li>
              </ul>
              <p className="mt-4">L’utilisateur garantit ne pas utiliser la plateforme pour importer, traiter ou diffuser des contenus illégaux, frauduleux ou portant atteinte aux droits de tiers.</p>
              <p className="mt-2">LegTrans DZ agit comme fournisseur d’outils numériques de traitement documentaire et ne contrôle pas le contenu importé par les utilisateurs.</p>
              <p className="mt-2">LegTrans DZ constitue un outil d’assistance et ne remplace pas le travail d’un professionnel qualifié ou d’un traducteur assermenté.</p>
            </div>

            <div className="h-px bg-[#e5e3dc]/50" />

            {/* 8. Cookies et données techniques */}
            <div>
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-3">8. Cookies et données techniques</h3>
              <p>La plateforme peut utiliser des cookies ou technologies similaires afin :</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>d’améliorer l’expérience utilisateur</li>
                <li>de maintenir les sessions actives</li>
                <li>d’assurer certaines fonctionnalités techniques</li>
                <li>d’analyser les performances générales du service</li>
              </ul>
            </div>

            <div className="h-px bg-[#e5e3dc]/50" />

            {/* 9. Modification de la politique */}
            <div>
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-3">9. Modification de la politique</h3>
              <p>La présente politique peut être modifiée à tout moment afin :</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>d’améliorer le service</li>
                <li>de respecter les obligations légales</li>
                <li>d’adapter les pratiques techniques et de sécurité</li>
              </ul>
              <p className="mt-4">Toute mise à jour importante pourra être signalée aux utilisateurs via la plateforme.</p>
            </div>

            <div className="h-px bg-[#e5e3dc]/50" />

            {/* 10. Contact */}
            <div>
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-3">10. Contact</h3>
              <p>Pour toute question relative à la confidentialité ou à la protection des données :</p>
              <p className="mt-2">
                <a href="mailto:contact@legtransdz.com" className="text-primary font-bold hover:underline">
                  contact@legtransdz.com
                </a>
              </p>
            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e5e3dc] py-8 mt-12">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-muted-foreground">
            © {new Date().getFullYear()} LegTrans DZ. Tous droits réservés.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
              Conforme RGPD-DZ
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
