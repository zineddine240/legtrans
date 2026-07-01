import * as z from "zod";

// Password validation: simple but secure
const phoneRegex = /^\+213[5-7][0-9]{8}$/;

export const loginSchema = z.object({
  email: z.string().email("Adresse e-mail invalide").min(1, "L'e-mail est requis"),
  password: z.string().min(1, "Le mot de passe est requis"),
  rememberMe: z.boolean().default(false),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Adresse e-mail invalide").min(1, "L'e-mail est requis"),
});

export const registerSchema = z.object({
  lastName: z.string().min(2, "Le nom est requis"),
  firstName: z.string().min(2, "Le prénom est requis"),
  email: z.string().email("E-mail invalide").min(1, "L'e-mail est requis"),
  phone: z.string().min(10, "Format de téléphone invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;

export const verificationSchema = z.object({
  courtAttachment: z.string().min(1, "Cour de rattachement requise"),
  experienceYears: z.number().min(0, "L'expérience doit être positive"),
  declareAuthentic: z.boolean().refine((val) => val === true, {
    message: "Vous devez certifier l'authenticité",
  }),
  languages: z.array(z.object({
    lang: z.string(),
    level: z.string(),
  })).min(1, "Au moins une langue est requise"),
  specializations: z.array(z.string()).min(1, "Au moins une spécialité est requise"),
});

export type VerificationValues = z.infer<typeof verificationSchema>;
