"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Clock, 
  CheckCircle2, 
  Circle, 
  PlayCircle, 
  BookOpen, 
  Users, 
  ArrowLeft,
  Mail,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PendingPage() {
  const router = useRouter();
  const steps = [
    { title: "Compte créé", status: "completed", date: "16 Mai 2026" },
    { title: "Documents reçus", status: "completed", date: "16 Mai 2026" },
    { title: "Vérification administrative", status: "current", desc: "Délai : 24-48h ouvrables" },
    { title: "Activation du compte", status: "pending" },
    { title: "Email de bienvenue", status: "pending" }
  ];

  return (
    <div className="space-y-10 py-10 text-center flex flex-col items-center">
      {/* Animated Clock Illustration */}
      <div className="relative mb-4">
         <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center animate-pulse">
            <Clock className="w-12 h-12 text-primary" />
         </div>
         <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-success border-4 border-white flex items-center justify-center text-white">
            <CheckCircle2 className="w-4 h-4" />
         </div>
      </div>

      <div className="space-y-3 max-w-sm">
        <h1 className="text-3xl font-serif font-bold text-primary-dark tracking-tight">
          Vérification en cours
        </h1>
        <p className="text-muted-foreground font-medium italic text-sm">
          Nous vérifions votre statut de traducteur assermenté auprès du Ministère de la Justice.
        </p>
      </div>

      {/* Status Card */}
      <div className="w-full bg-[#faf8f3] border border-[#e5e3dc] rounded-2xl p-6 text-left space-y-6">
         <div className="flex items-center justify-between border-b border-[#e5e3dc] pb-4">
            <div className="flex items-center gap-2">
               <Mail className="w-4 h-4 text-primary" />
               <span className="text-xs font-bold text-primary-dark">votre@email.dz</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reçu le 16/05</span>
         </div>

         <div className="space-y-6">
            {steps.map((step, idx) => (
               <div key={idx} className="flex gap-4 relative">
                  {idx < steps.length - 1 && (
                     <div className={`absolute left-[11px] top-6 w-[2px] h-8 ${step.status === 'completed' ? 'bg-success' : 'bg-[#e5e3dc]'}`} />
                  )}
                  <div className="relative z-10 pt-1">
                     {step.status === 'completed' ? (
                        <CheckCircle2 className="w-6 h-6 text-success bg-white rounded-full" />
                     ) : step.status === 'current' ? (
                        <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center bg-white">
                           <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        </div>
                     ) : (
                        <Circle className="w-6 h-6 text-[#e5e3dc] bg-white rounded-full" />
                     )}
                  </div>
                  <div>
                     <p className={`text-xs font-bold ${step.status === 'pending' ? 'text-muted-foreground' : 'text-primary-dark'}`}>
                        {step.title}
                     </p>
                     {step.date && <p className="text-[9px] font-medium text-success uppercase tracking-widest mt-0.5">{step.date}</p>}
                     {step.desc && <p className="text-[10px] text-muted-foreground mt-0.5 italic">{step.desc}</p>}
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Helpful Actions */}
      <div className="w-full space-y-4 pt-4">
         <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">En attendant la validation :</p>
         <div className="grid grid-cols-1 gap-3">
            <Link href="#" className="flex items-center justify-between p-4 bg-white border border-[#e5e3dc] rounded-xl hover:border-primary transition-all group">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                     <PlayCircle className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                     <p className="text-[11px] font-bold text-primary-dark">Regarder la démo</p>
                     <p className="text-[10px] text-muted-foreground">Découvrez l'interface (5 min)</p>
                  </div>
               </div>
               <ExternalLink className="w-4 h-4 text-muted-foreground/30" />
            </Link>

            <Link href="#" className="flex items-center justify-between p-4 bg-white border border-[#e5e3dc] rounded-xl hover:border-primary transition-all group">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                     <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                     <p className="text-[11px] font-bold text-primary-dark">Guide d'utilisation</p>
                     <p className="text-[10px] text-muted-foreground">Apprenez à maîtriser l'IA Al-DZ</p>
                  </div>
               </div>
               <ExternalLink className="w-4 h-4 text-muted-foreground/30" />
            </Link>
         </div>
      </div>

      <div className="flex flex-col gap-4 pt-6">
         <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest gap-2 text-primary" onClick={() => router.push('/')}>
            <ArrowLeft className="w-3 h-3" /> Retour à l'accueil
         </Button>
         <p className="text-[10px] text-muted-foreground font-medium">
            Une question ? <Link href="#" className="text-primary hover:underline font-bold">Contacter le support</Link>
         </p>
      </div>
    </div>
  );
}
