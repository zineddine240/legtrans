"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Mail, 
  Loader2, 
  LogOut, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function VerifyPendingPage() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  // Redirect to dashboard if already confirmed
  useEffect(() => {
    if (profile && profile.email_confirmed === true) {
      toast.success("Compte activé avec succès ! Bienvenue.");
      router.push("/dashboard");
    }
  }, [profile, router]);

  // Handle resending verification email
  const handleResend = async () => {
    if (!user) return;
    setIsResending(true);
    try {
      const res = await fetch('/api/send-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'Cher Traducteur',
        }),
      });

      if (res.ok) {
        toast.success("E-mail de confirmation renvoyé !", {
          description: "Veuillez vérifier votre boîte de réception ainsi que vos spams.",
        });
        setCooldown(60); // 60-second cooldown
      } else {
        toast.error("Échec de l'envoi de l'e-mail.");
      }
    } catch (err) {
      toast.error("Une erreur s'est produite lors de l'envoi.");
    } finally {
      setIsResending(false);
    }
  };

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Handle checking verification status
  const handleCheckStatus = async () => {
    if (!user) return;
    setIsChecking(true);
    try {
      if (profile && profile.email_confirmed === true) {
        toast.success("Statut vérifié avec succès !");
        router.push("/dashboard");
      } else {
        toast.info("Votre compte n'est pas encore activé.", {
          description: "Veuillez cliquer sur le lien envoyé à votre adresse e-mail."
        });
      }
    } catch (err) {
      toast.error("Une erreur s'est produite lors de la vérification.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf8f3] px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#e5e3dc] p-8 shadow-xl shadow-[#0d6e4e]/5 text-center space-y-6 animate-in fade-in zoom-in duration-500">
        
        {/* Animated Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#0d6e4e]/10 border border-[#0d6e4e]/20 flex items-center justify-center mx-auto text-[#0d6e4e] relative">
          <Mail className="w-8 h-8 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-serif font-bold text-[#1a1a1a] tracking-tight">
            Activation requise
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-[#0d6e4e]">
            E-mail de confirmation envoyé
          </p>
        </div>

        <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 text-left text-xs text-amber-900 leading-relaxed space-y-2">
          <div className="flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Un e-mail contenant votre lien d'activation a été envoyé à : <strong className="text-[#1a1a1a]">{user?.email}</strong>.
            </p>
          </div>
          <p className="pl-6 italic font-medium">
            * Important : Veuillez également vérifier le dossier <strong>"Courriers indésirables" ou "Spams"</strong> de votre messagerie.
          </p>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Pour des raisons de sécurité, vous ne pourrez accéder à votre tableau de bord et à vos outils qu'après avoir cliqué sur le lien d'activation présent dans cet e-mail.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4 border-t border-[#e5e3dc]">
          <Button
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="w-full h-12 text-xs font-bold uppercase tracking-widest gap-2 bg-[#0d6e4e] hover:bg-[#074a35] text-white shadow-md shadow-[#0d6e4e]/25"
          >
            {isChecking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            J'ai activé mon compte (Vérifier)
          </Button>

          <Button
            onClick={handleResend}
            disabled={isResending || cooldown > 0}
            variant="outline"
            className="w-full h-12 text-xs font-bold uppercase tracking-widest text-primary-dark"
          >
            {isResending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : cooldown > 0 ? (
              `Renvoyer disponible dans ${cooldown}s`
            ) : (
              "Renvoyer l'e-mail de confirmation"
            )}
          </Button>
        </div>

        {/* Logout Link */}
        <button
          onClick={handleSignOut}
          className="text-xs font-bold text-muted-foreground hover:text-red-600 uppercase tracking-widest flex items-center gap-1.5 mx-auto transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Se déconnecter du compte
        </button>
      </div>
    </div>
  );
}
