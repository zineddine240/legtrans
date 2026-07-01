"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { forgotPasswordSchema, ForgotPasswordValues } from "@/lib/auth/validation";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailSent, setEmailSent] = useState("");

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema as any),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setIsLoading(true);
    try {
      const { error } = await resetPassword(values.email);
      if (error) {
        toast.error("Erreur", {
          description: "Impossible d'envoyer l'e-mail de réinitialisation.",
        });
      } else {
        setEmailSent(values.email);
        setIsSubmitted(true);
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center text-center space-y-4">
           <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center text-success mb-2">
              <CheckCircle2 className="w-10 h-10" />
           </div>
           <h1 className="text-3xl font-serif font-bold text-primary-dark tracking-tight">
             E-mail envoyé !
           </h1>
           <p className="text-muted-foreground font-medium italic text-sm max-w-xs">
             Veuillez vérifier votre boîte de réception à l'adresse <strong>{emailSent}</strong> pour réinitialiser votre mot de passe.
           </p>
        </div>

        <div className="space-y-4 pt-6">
           <Button 
              variant="outline" 
              className="w-full h-12 border-[#e5e3dc] text-xs font-bold uppercase tracking-widest gap-2"
              onClick={() => setIsSubmitted(false)}
           >
              Renvoyer le lien
           </Button>
           <Link href="/auth/login">
              <Button variant="ghost" className="w-full text-xs font-bold uppercase tracking-widest gap-2 text-primary">
                 <ArrowLeft className="w-4 h-4" /> Retour à la connexion
              </Button>
           </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold text-primary-dark tracking-tight">
          Mot de passe oublié ?
        </h1>
        <p className="text-muted-foreground font-medium italic text-sm">
          Saisissez votre e-mail pour recevoir un lien de réinitialisation sécurisé.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Adresse e-mail professionnelle
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="votre@email.dz"
                      className="pl-10 h-11 border-[#e5e3dc] focus:border-primary transition-all"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[11px]" />
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
                Envoi...
              </>
            ) : (
              <>
                Envoyer le lien
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="pt-6 text-center">
        <Link
          href="/auth/login"
          className="text-sm font-bold text-primary hover:underline flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
