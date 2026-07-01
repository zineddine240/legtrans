"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { loginSchema, LoginValues } from "@/lib/auth/validation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const t = useTranslations("Login");
  const router = useRouter();
  const { signIn, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerifiedAlert, setShowVerifiedAlert] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema as any),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const isVerified = params.get("verified") === "true";
      const uid = params.get("uid");

      if (isVerified) {
        setShowVerifiedAlert(true);
        
        // If the user is already logged in as this uid, perform the authenticated Firestore write and redirect immediately!
        if (user && uid && user.uid === uid) {
          const performActivation = async () => {
            try {
              const { doc, updateDoc } = await import("firebase/firestore");
              const { db } = await import("@/integrations/firebase/config");
              await updateDoc(doc(db, "profiles", uid), {
                email_confirmed: true
              });
              toast.success(t("loginSuccessTitle"));
              router.push("/dashboard");
            } catch (err) {
              console.error("Firestore Client-side Activation Error:", err);
            }
          };
          performActivation();
        } else {
          toast.success(t("emailConfirmedTitle"), {
            description: t("emailConfirmedDesc"),
          });
        }
      }
    }
  }, [user, router]);

  const onSubmit = async (values: LoginValues) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(values.email, values.password);
      if (error) {
        toast.error(t("loginFailedTitle"), {
          description: t("loginFailedDesc"),
        });
      } else {
        // Authenticated successfully! Check if we need to write email_confirmed client-side (bypassing unauthenticated server Firestore rule locks)
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const isVerified = params.get("verified") === "true";
          const uid = params.get("uid");

          if (isVerified && uid) {
            try {
              const { doc, updateDoc } = await import("firebase/firestore");
              const { db } = await import("@/integrations/firebase/config");
              await updateDoc(doc(db, "profiles", uid), {
                email_confirmed: true
              });
            } catch (updateErr) {
              console.error("Firestore Activation on SignIn Error:", updateErr);
            }
          }
        }

        toast.success(t("loginSuccessTitle"), {
          description: t("loginSuccessDesc"),
        });
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold text-primary-dark tracking-tight">
          {t("title")}
        </h1>
        <p className="text-muted-foreground font-medium italic text-sm">
          {t("subtitle")}
        </p>
      </div>

      {showVerifiedAlert && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex gap-3 text-emerald-900 animate-in fade-in slide-in-from-top-4 duration-500">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              {t("emailConfirmedTitle")}
            </p>
            <p className="text-xs text-emerald-700 leading-relaxed">
              {t("emailConfirmedDesc")}
            </p>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {t("emailLabel")}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("emailPlaceholder")}
                      className="pl-10 h-11 border-[#e5e3dc] focus:border-primary transition-all"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {t("passwordLabel")}
                  </FormLabel>
                  <Link
                    href="/auth/forgot-password"
                    className="text-[11px] font-bold text-primary hover:underline"
                  >
                    {t("forgotPassword")}
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11 border-[#e5e3dc] focus:border-primary transition-all"
                      {...field}
                      value={field.value ?? ""}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-xs font-bold text-muted-foreground cursor-pointer">
                    {t("rememberMe")}
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full btn-primary h-12 text-xs font-bold uppercase tracking-[0.2em] gap-2 shadow-xl shadow-primary/20"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("loginLoading")}
              </>
            ) : (
              <>
                {t("loginBtn")}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[#e5e3dc]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
          <span className="bg-white px-4 text-muted-foreground/40">{t("or")}</span>
        </div>
      </div>

      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full h-12 border-[#e5e3dc] text-xs font-bold uppercase tracking-widest gap-3 hover:bg-[#faf8f3]"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26c.87-2.6 3.3-4.53 6.16-4.53 1.48 0 2.82.5 3.88 1.48l3.25-3.25C15.46 2.48 13 1.5 12 1.5c-4.3 0-8.01 2.47-9.82 6.13l3.66 2.46z"
              fill="#EA4335"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#FBBC05"
            />
          </svg>
          {t("continueGoogle")}
        </Button>

        <p className="text-center text-sm font-medium text-muted-foreground">
          {t("noAccount")}{" "}
          <Link
            href="/auth/register"
            className="text-primary hover:underline font-bold"
          >
            {t("createAccount")}
          </Link>
        </p>
      </div>
    </div>
  );
}
