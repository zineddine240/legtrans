import React from "react";
import Link from "next/link";
import { Scale, CheckCircle2, ShieldCheck, Globe } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[#faf8f3] font-sans selection:bg-primary/10">
      {/* Left Panel: Forms */}
      <div className="w-full lg:w-[60%] bg-white flex flex-col p-6 md:p-12">
        <div className="w-full max-w-[440px] mx-auto flex-1 flex flex-col justify-center">
          {/* Logo */}
          <div className="mb-10 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg group-hover:bg-primary-light transition-all">
                <Scale className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight text-primary-dark leading-none">LegTrans DZ</span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Plateforme Nationale</span>
              </div>
            </Link>
            
            <div className="flex items-center gap-2">
               <button className="text-[11px] font-bold text-primary hover:bg-primary/5 px-2 py-1 rounded">FR</button>
               <div className="w-px h-3 bg-border" />
               <button className="text-[11px] font-bold text-muted-foreground hover:bg-primary/5 px-2 py-1 rounded font-arabic">AR</button>
            </div>
          </div>

          {children}

          {/* Global Auth Footer */}
          <div className="mt-10 pt-6 border-t border-[#e5e3dc] text-center">
             <p className="text-[10px] text-muted-foreground leading-relaxed">
               En continuant, vous acceptez nos <Link href="/legal" target="_blank" className="text-primary hover:underline font-bold">Conditions d'utilisation</Link> et notre <Link href="/legal" target="_blank" className="text-primary hover:underline font-bold">Politique de confidentialité</Link>.
             </p>
          </div>
        </div>
      </div>

      {/* Right Panel: Marketing (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-[40%] bg-primary relative overflow-hidden flex-col justify-center p-16 text-white">
        {/* Decorative Pattern Overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="relative z-10 space-y-12">
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
               <ShieldCheck className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-3xl font-bold leading-tight text-white">
              Gagnez du temps sur chaque document officiel que vous traduisez.
            </h2>
            <p className="text-lg leading-relaxed text-white/80">
              Notre mission est d'équiper les traducteurs assermentés algériens avec les meilleurs outils technologiques pour gagner du temps, garantir une précision absolue et moderniser leur flux de travail.
            </p>
          </div>

          <div className="space-y-4 pt-12 border-t border-white/10">
            <div className="flex items-center gap-3 text-sm font-medium">
               <CheckCircle2 className="w-5 h-5 text-accent" />
               <span>Extraction de texte (OCR) ultra-précise</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium">
               <CheckCircle2 className="w-5 h-5 text-accent" />
               <span>Préservation de la mise en page d'origine</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium">
               <CheckCircle2 className="w-5 h-5 text-accent" />
               <span>Accélérez la traduction de vos documents</span>
            </div>
          </div>
        </div>

        {/* Bottom Badge */}
        <div className="absolute bottom-10 left-16 flex items-center gap-2 opacity-40">
           <Globe className="w-4 h-4" />
           <span className="text-[10px] font-bold uppercase tracking-widest">Conforme RGPD-DZ</span>
        </div>
      </div>
    </div>
  );
}
