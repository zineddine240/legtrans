"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  Award, 
  Zap, 
  ShieldCheck, 
  Cloud, 
  ArrowRight,
  UserCheck,
  LayoutDashboard,
  FileText,
  BookOpen,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WelcomePage() {
  const router = useRouter();

  const inclusions = [
    { icon: <Zap className="w-5 h-5 text-accent" />, title: "OCR Illimité", desc: "Toutes pages, tous formats" },
    { icon: <ShieldCheck className="w-5 h-5 text-accent" />, title: "IA Al-DZ", desc: "Traductions juridiques" },
    { icon: <Cloud className="w-5 h-5 text-accent" />, title: "50 GB Stockage", desc: "Cloud sécurisé" },
    { icon: <Award className="w-5 h-5 text-accent" />, title: "Format Légal", desc: "Mise en page conforme" }
  ];

  const nextSteps = [
    { icon: <FileText className="w-4 h-4" />, text: "Compléter votre profil professionnel" },
    { icon: <Zap className="w-4 h-4" />, text: "Tester l'OCR avec un premier document" },
    { icon: <BookOpen className="w-4 h-4" />, text: "Explorer le glossaire juridique algérien" },
    { icon: <Settings className="w-4 h-4" />, text: "Configurer vos préférences de traduction" }
  ];

  return (
    <div className="w-full animate-in fade-in zoom-in duration-1000 mt-8">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/20 rounded-full text-success text-[10px] font-bold uppercase tracking-[0.2em] animate-bounce">
            Compte Vérifié & Activé
        </div>
        
        <h1 className="text-3xl font-serif font-bold text-primary-dark tracking-tight leading-tight">
          Bienvenue,<br/>Maître ! 🎉
        </h1>
        
        <p className="text-muted-foreground font-medium italic text-sm">
          Votre compte est maintenant actif. Utilisez toute la puissance de LegTrans DZ.
        </p>

        {/* License Badge */}
        <div className="bg-[#faf8f3] border-2 border-success/20 rounded-2xl p-4 flex items-center justify-center gap-4 shadow-sm w-full">
            <div className="w-12 h-12 rounded-xl bg-white border border-[#e5e3dc] flex items-center justify-center text-success shadow-inner shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Numéro d'agrément</p>
              <p className="text-lg font-bold text-primary-dark">DZ-1542-26</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span className="text-[9px] font-bold text-success uppercase tracking-widest">Compte Actif</span>
              </div>
            </div>
        </div>

        {/* Feature Grid - 2 columns for narrow layout */}
        <div className="grid grid-cols-2 gap-3 py-6">
            {inclusions.map((item, idx) => (
              <div key={idx} className="p-3 bg-[#faf8f3] border border-[#e5e3dc] rounded-xl text-center space-y-2 hover:border-primary/20 transition-all">
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center mx-auto text-primary">
                    {item.icon}
                </div>
                <p className="text-[10px] font-bold text-primary-dark uppercase tracking-tighter leading-none">{item.title}</p>
                <p className="text-[9px] text-muted-foreground leading-tight">{item.desc}</p>
              </div>
            ))}
        </div>

        <div className="space-y-3 text-left py-4 border-t border-[#e5e3dc]">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground text-center mb-4">Prochaines étapes :</p>
            {nextSteps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3 group">
                  <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center text-success shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <p className="text-[11px] font-medium text-primary-dark leading-tight">{step.text}</p>
              </div>
            ))}
        </div>

        <div className="pt-6">
            <Button 
              className="w-full btn-primary h-14 text-xs font-bold uppercase tracking-[0.1em] gap-2 shadow-xl shadow-primary/20"
              onClick={() => router.push('/dashboard')}
            >
              Accéder au tableau de bord
              <ArrowRight className="w-4 h-4" />
            </Button>
        </div>
      </div>
    </div>
  );
}
