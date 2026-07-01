"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Calendar, 
  AlertCircle, 
  ArrowRight, 
  Loader2, 
  ShieldCheck 
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registerSchema, RegisterValues } from "@/lib/auth/validation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const t = useTranslations("Register");
  const router = useRouter();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema as any),
    defaultValues: {
      lastName: "",
      firstName: "",
      email: "",
      phone: "+213",
      password: "",
    },
  });

  const [acceptedLegal, setAcceptedLegal] = useState(false);

  const onInvalid = (errors: any) => {
    console.error("Validation Errors:", errors);
    toast.error(t("formIncomplete"), {
      description: t("formIncompleteDesc"),
    });
  };

  const onSubmit = async (values: RegisterValues) => {
    if (!acceptedLegal) {
      toast.error(t("legalRequired"), { description: t("legalRequiredDesc") });
      return;
    }
    console.log("Form submitted with values:", values);
    setIsLoading(true);
    const toastId = toast.loading(t("creating"));
    try {
      const { error } = await signUp(
        values.email, 
        values.password, 
        `${values.firstName} ${values.lastName}`,
        {
          phone: values.phone
        }
      );
      if (error) {
        console.error("SignUp error returned:", error);
        
        let message = "Une erreur est survenue lors de l'inscription.";
        let description = error.message;

        if (error.message.includes("auth/email-already-in-use")) {
          message = t("emailInUse");
          description = t("emailInUseDesc");
        } else if (error.message.includes("auth/weak-password")) {
          message = t("weakPassword");
          description = t("weakPasswordDesc");
        }

        toast.error(message, {
          id: toastId,
          description: description,
          action: error.message.includes("auth/email-already-in-use") ? {
            label: t("signInAction"),
            onClick: () => router.push("/auth/login")
          } : undefined
        });
      } else {
        console.log("SignUp successful, redirecting...");
        toast.success(t("successTitle"), { id: toastId });
        router.push("/auth/verify-pending");
      }
    } catch (error: any) {
      console.error("Unexpected onSubmit error:", error);
      toast.error("Une erreur est survenue", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 py-8">
      <div className="flex items-center gap-4 mb-8 opacity-0">
         <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-primary" />
         </div>
      </div>

      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-serif font-bold text-primary-dark tracking-tight">
          {t("title")}
        </h1>
        <p className="text-muted-foreground font-medium italic text-sm">
          {t("subtitle")}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
          
          <div className="grid grid-cols-2 gap-4">
             <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("lastNameLabel")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("lastNamePlaceholder")} className="h-11" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
             />
             <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("firstNameLabel")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("firstNamePlaceholder")} className="h-11" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
             />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("emailLabel")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder={t("emailPlaceholder")} className="pl-10 h-11" {...field} value={field.value ?? ""} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("phoneLabel")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="+213..." className="pl-10 h-11" {...field} value={field.value ?? ""} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("passwordLabel")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="password" placeholder="••••••••" className="pl-10 h-11" {...field} value={field.value ?? ""} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-start gap-2.5 mt-2">
             <Checkbox 
               id="legal-accept" 
               checked={acceptedLegal} 
               onCheckedChange={(c) => setAcceptedLegal(c as boolean)} 
               className="mt-0.5"
             />
             <label htmlFor="legal-accept" className="text-[11px] font-medium text-[#1a1a1a] cursor-pointer leading-tight">
               {t("legalText")} <Link href="/legal" target="_blank" className="text-primary font-bold hover:underline">{t("legalLink")}</Link> {t("legalSuffix")}
             </label>
          </div>

          <Button
            type="submit"
            className="w-full btn-primary h-14 text-xs font-bold uppercase tracking-[0.2em] gap-2 shadow-xl shadow-primary/20"
            disabled={isLoading || !acceptedLegal}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {t("submitBtn")}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm font-medium text-muted-foreground">
        {t("alreadyRegistered")}{" "}
        <Link
          href="/auth/login"
          className="text-primary hover:underline font-bold"
        >
          {t("signIn")}
        </Link>
      </p>
    </div>
  );
}
