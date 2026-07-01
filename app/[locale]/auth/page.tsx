"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Scale, Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().email("Veuillez entrer une adresse email valide");
const passwordSchema = z.string().min(6, "Le mot de passe doit faire au moins 6 caractères");
const nameSchema = z.string().min(2, "Le nom doit faire au moins 2 caractères");

import { Suspense } from "react";

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const searchParams = useSearchParams();
  const resetCode = searchParams.get("oobCode");

  const { user, loading: authLoading, signIn, signUp, resetPassword } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!resetCode) {
      try {
        emailSchema.parse(email);
      } catch (e) {
        if (e instanceof z.ZodError) {
          newErrors.email = "بريد إلكتروني غير صالح";
        }
      }
    }
    if (!isForgotPassword || resetCode) {
      try {
        passwordSchema.parse(password);
      } catch (e) {
        if (e instanceof z.ZodError) {
          newErrors.password = "يجب أن تكون كلمة المرور 6 أحرف على الأقل";
        }
      }
      if (!isLogin && !resetCode) {
        try {
          nameSchema.parse(displayName);
        } catch (e) {
          if (e instanceof z.ZodError) {
            newErrors.displayName = "الاسم يجب أن يكون حرفين على الأقل";
          }
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetCode) {
      if (!password || password.length < 6) {
        setErrors({ password: "يجب أن تكون كلمة المرور 6 أحرف على الأقل" });
        return;
      }
      setLoading(true);
      try {
        const { auth } = await import("@/integrations/firebase/config");
        const { confirmPasswordReset } = await import("firebase/auth");
        if (auth) {
          await confirmPasswordReset(auth, resetCode, password);
          toast({
            title: "Succès !",
            description: "Votre mot de passe a été réinitialisé. Vous pouvez vous connecter.",
          });
          setIsForgotPassword(false);
          setIsLogin(true);
          setPassword("");
          router.push("/auth");
        }
      } catch (error: any) {
        toast({
          title: "Erreur",
          description: "Le lien a expiré.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!email) {
      setErrors({ email: "الرجاء إدخال البريد الإلكتروني" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await resetPassword(email);
      if (error) {
        toast({ title: "خطأ", description: "حدث خطأ", variant: "destructive" });
      } else {
        toast({ title: "تم إرسال الرابط", description: "تفقد بريدك الإلكتروني" });
        setIsForgotPassword(false);
        setIsLogin(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isForgotPassword || resetCode) {
      return handleForgotPassword(e);
    }
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({ title: "فشل الدخول", description: error.message, variant: "destructive" });
        }
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          toast({ title: "خطأ في التسجيل", description: error.message, variant: "destructive" });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
        <div className="min-h-screen algerian-pattern flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
    );
  }

  return (
    <div className="min-h-screen algerian-pattern flex items-center justify-center px-4 py-8">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-2xl crescent-glow">
                <Scale className="w-10 h-10 text-foreground" />
              </div>
              <Star className="absolute -top-2 -right-2 w-6 h-6 text-secondary fill-secondary animate-pulse-soft" />
            </div>
          </div>
          <h1 className="text-4xl font-bold font-display gradient-text mb-2">LegTrans DZ</h1>
          <p className="text-muted-foreground">منصة الترجمة القانونية الجزائرية</p>
        </div>

        <div className="glass-card rounded-3xl p-8 animate-slide-up">
          {!isForgotPassword && (
            <div className="flex bg-muted/50 rounded-xl p-1 mb-8">
              <button onClick={() => setIsLogin(true)} className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 ${isLogin ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"}`}>تسجيل الدخول</button>
              <button onClick={() => setIsLogin(false)} className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 ${!isLogin ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"}`}>حساب جديد</button>
            </div>
          )}

          {isForgotPassword && (
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">
                {resetCode ? "Nouveau MDP" : "نسيت كلمة المرور؟"}
              </h2>
              <p className="text-muted-foreground text-sm">
                {resetCode ? "Entrez votre nouveau mot de passe" : "أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين"}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && !isForgotPassword && !resetCode && (
              <div className="space-y-2 animate-scale-in">
                <label className="text-sm font-medium text-foreground">الاسم الكامل</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                  <input 
                    type="text" 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)} 
                    placeholder="أدخل اسمك" 
                    autoComplete="name"
                    className="w-full glass-input rounded-xl py-4 pl-12 pr-4 text-foreground focus:outline-none" 
                    dir="rtl" 
                  />
                </div>
                {errors.displayName && <p className="text-xs text-destructive">{errors.displayName}</p>}
              </div>
            )}
            
            {!resetCode && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="example@email.com" 
                    autoComplete="email"
                    spellCheck={false}
                    className="w-full glass-input rounded-xl py-4 pl-12 pr-4 text-foreground focus:outline-none" 
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
            )}

            {(!isForgotPassword || resetCode) && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-foreground">
                    {resetCode ? "Mot de passe" : "كلمة المرور"}
                  </label>
                  {isLogin && <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs text-primary hover:underline">نسيت كلمة المرور؟</button>}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    className="w-full glass-input rounded-xl py-4 pl-12 pr-12 text-foreground focus:outline-none" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}>{showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}</button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-3 disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>{resetCode ? "Changer le MDP" : isForgotPassword ? "إرسال رابط الإعادة" : isLogin ? "دخول" : "إنشاء حساب"}</span>}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
          {(isForgotPassword || resetCode) && <button type="button" onClick={() => { setIsForgotPassword(false); }} className="w-full mt-4 text-sm text-center text-muted-foreground">العودة لتسجيل الدخول</button>}
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen algerian-pattern flex items-center justify-center px-4 py-8">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}
