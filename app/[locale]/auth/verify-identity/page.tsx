"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  FileCheck, 
  Upload, 
  Info, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  Plus, 
  Trash2,
  Award
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
import { verificationSchema, VerificationValues } from "@/lib/auth/validation";
import { toast } from "sonner";

const COURTS = ["Alger", "Oran", "Constantine", "Annaba", "Sétif", "Blida", "Tlemcen", "Béjaïa"];
const SPECIALIZATIONS = [
  "Droit civil", "Droit pénal", "Droit commercial", "Droit administratif", 
  "Droit de la famille", "Droit du travail", "Actes notariés", "Documents médicaux"
];
const LANGUAGES = ["Français", "Arabe", "Anglais", "Espagnol", "Italien", "Allemand"];

export default function VerifyIdentityPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<VerificationValues>({
    resolver: zodResolver(verificationSchema as any),
    defaultValues: {
      courtAttachment: "",
      experienceYears: 5,
      declareAuthentic: true,
      languages: [
        { lang: "Français", level: "Native" },
        { lang: "Arabe", level: "Native" }
      ],
      specializations: []
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "languages"
  });

  const onSubmit = async (values: VerificationValues) => {
    setIsLoading(true);
    try {
      // In a real app, we would upload files to Supabase Storage here
      console.log("Submitting verification data:", values);
      
      toast.success("Documents reçus !", {
        description: "Votre dossier est maintenant en cours d'examen.",
      });
      
      router.push("/auth/pending");
    } catch (error) {
      toast.error("Échec de l'envoi des documents");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 py-8">
      {/* Progress Indicator */}
      <div className="flex items-center gap-4 mb-8">
         <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-success" />
            <div className="w-12 h-1 bg-success rounded-full" />
            <div className="w-3 h-3 rounded-full bg-primary" />
            <div className="w-12 h-1 bg-border rounded-full" />
            <div className="w-3 h-3 rounded-full bg-border" />
         </div>
         <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Étape 2/3 : Vérification</span>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold text-primary-dark tracking-tight">
          Vérifiez votre statut
        </h1>
        <p className="text-muted-foreground font-medium italic text-sm">
          Téléversez les documents officiels pour activer votre compte.
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
         <Info className="w-5 h-5 text-blue-600 shrink-0" />
         <p className="text-[11px] font-medium text-blue-700 leading-relaxed">
           Vos documents sont chiffrés (AES-256) et utilisés uniquement pour la vérification. Ils seront supprimés après validation.
         </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          
          {/* Section 1: Documents Officiels */}
          <div className="space-y-6">
             <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 border-b border-[#e5e3dc] pb-2">1. Agrément & Identité</div>
             
             <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="courtAttachment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cour de rattachement</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COURTS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div />
                </div>
             </div>

             {/* Drop Zone Placeholder */}
             <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Attestation d'agrément (PDF/Scan)</label>
                <div className="border-2 border-dashed border-[#e5e3dc] rounded-2xl p-8 text-center hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group">
                   <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground group-hover:text-primary" />
                   <p className="text-xs font-bold text-primary-dark">Cliquez pour téléverser ou glissez le fichier</p>
                   <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">PDF, JPG ou PNG (Max 10MB)</p>
                </div>
             </div>
          </div>

          {/* Section 2: Compétences */}
          <div className="space-y-6">
             <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 border-b border-[#e5e3dc] pb-2">2. Langues & Spécialités</div>
             
             <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Langues de travail</label>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-3">
                     <div className="flex-1">
                        <Select 
                           onValueChange={(val) => form.setValue(`languages.${index}.lang`, val)} 
                           defaultValue={field.lang}
                        >
                           <SelectTrigger className="h-11">
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                              {LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="flex-1">
                        <Select 
                           onValueChange={(val) => form.setValue(`languages.${index}.level`, val as any)} 
                           defaultValue={field.level}
                        >
                           <SelectTrigger className="h-11">
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="Native">Native</SelectItem>
                              <SelectItem value="Bilingue">Bilingue</SelectItem>
                              <SelectItem value="Avancé">Avancé</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                     {index > 1 && (
                        <Button 
                           variant="ghost" 
                           size="icon" 
                           className="h-11 w-11 text-red-500"
                           onClick={() => remove(index)}
                        >
                           <Trash2 className="w-4 h-4" />
                        </Button>
                     )}
                  </div>
                ))}
                <Button 
                   type="button" 
                   variant="outline" 
                   size="sm" 
                   className="text-[10px] font-bold uppercase tracking-widest gap-2"
                   onClick={() => append({ lang: "Anglais", level: "Avancé" })}
                >
                   <Plus className="w-3 h-3" /> Ajouter une langue
                </Button>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Spécialisations (Multi-sélection)</label>
                <div className="grid grid-cols-2 gap-3">
                   {SPECIALIZATIONS.map(spec => (
                      <div key={spec} className="flex items-center gap-3 p-3 border border-[#e5e3dc] rounded-lg hover:border-primary/20 transition-all cursor-pointer">
                         <Checkbox 
                            id={spec}
                            checked={form.watch("specializations").includes(spec)}
                            onCheckedChange={(checked) => {
                               const current = form.getValues("specializations");
                               if (checked) {
                                  form.setValue("specializations", [...current, spec]);
                               } else {
                                  form.setValue("specializations", current.filter(s => s !== spec));
                               }
                            }}
                         />
                         <label htmlFor={spec} className="text-[11px] font-medium cursor-pointer">{spec}</label>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Final Declaration */}
          <div className="space-y-4 pt-6 border-t border-[#e5e3dc]">
             <FormField
                control={form.control}
                name="declareAuthentic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 bg-red-50/50 p-4 rounded-xl border border-red-100">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="text-[10px] font-bold leading-relaxed text-red-800 cursor-pointer uppercase tracking-tighter">
                      Je déclare sur l'honneur que les documents fournis sont authentiques. Toute fausse déclaration entraînera la suspension immédiate du compte et des poursuites légales.
                    </FormLabel>
                  </FormItem>
                )}
              />
          </div>

          <div className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full btn-primary h-14 text-xs font-bold uppercase tracking-[0.2em] gap-2 shadow-xl shadow-primary/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  Soumettre pour vérification
                  <FileCheck className="h-4 w-4" />
                </>
              )}
            </Button>
            <Button variant="ghost" className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
               Sauvegarder et continuer plus tard
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
