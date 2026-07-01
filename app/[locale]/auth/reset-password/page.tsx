"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/integrations/firebase/config";
import { Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!oobCode) {
      setError("Lien invalide ou expiré.");
      setIsVerifying(false);
      return;
    }
    // Verify the oobCode and get the email
    verifyPasswordResetCode(auth, oobCode)
      .then((email) => {
        setEmail(email);
        setIsVerifying(false);
      })
      .catch(() => {
        setError("Ce lien de réinitialisation est invalide ou a expiré. Veuillez en demander un nouveau.");
        setIsVerifying(false);
      });
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode) return;

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setIsSuccess(true);
      toast.success("Mot de passe réinitialisé avec succès !");
      setTimeout(() => router.push("/auth/login"), 3000);
    } catch (err: any) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm font-medium">Vérification du lien...</p>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-2">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-primary-dark tracking-tight">
            Mot de passe modifié !
          </h1>
          <p className="text-muted-foreground font-medium text-sm max-w-xs">
            Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion...
          </p>
        </div>
        <Link href="/auth/login">
          <Button className="w-full btn-primary h-12 text-xs font-bold uppercase tracking-[0.2em]">
            Se connecter maintenant
          </Button>
        </Link>
      </div>
    );
  }

  // Error state (invalid link)
  if (error && !email) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-2">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-primary-dark tracking-tight">
            Lien expiré
          </h1>
          <p className="text-muted-foreground font-medium text-sm max-w-xs">{error}</p>
        </div>
        <Link href="/auth/forgot-password">
          <Button className="w-full btn-primary h-12 text-xs font-bold uppercase tracking-[0.2em]">
            Demander un nouveau lien
          </Button>
        </Link>
      </div>
    );
  }

  // Main form
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold text-primary-dark tracking-tight">
          Nouveau mot de passe
        </h1>
        <p className="text-muted-foreground font-medium italic text-sm">
          Choisissez un nouveau mot de passe sécurisé pour{" "}
          <strong className="text-primary">{email}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* New Password */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 8 caractères"
              className="pl-10 pr-10 h-11 border-[#e5e3dc] focus:border-primary transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type={showConfirm ? "text" : "password"}
              placeholder="Répétez le mot de passe"
              className="pl-10 pr-10 h-11 border-[#e5e3dc] focus:border-primary transition-all"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 text-red-500 text-xs font-medium bg-red-50 border border-red-100 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Password strength indicator */}
        {password && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    password.length >= i * 3
                      ? password.length >= 12
                        ? "bg-green-500"
                        : password.length >= 8
                        ? "bg-yellow-500"
                        : "bg-red-400"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {password.length < 8 ? "Trop court" : password.length < 12 ? "Acceptable" : "Excellent !"}
            </p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full btn-primary h-12 text-xs font-bold uppercase tracking-[0.2em] gap-2 shadow-xl shadow-primary/20 mt-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Enregistrer le nouveau mot de passe
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="pt-2 text-center">
        <Link
          href="/auth/login"
          className="text-sm font-bold text-primary hover:underline"
        >
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
