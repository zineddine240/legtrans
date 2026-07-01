import fs from 'fs';
import path from 'path';

const translations = {
  fr: {
    Login: {
      title: "Bon retour parmi nous",
      subtitle: "Connectez-vous pour accéder à votre espace de traduction sécurisé.",
      emailConfirmedTitle: "Adresse e-mail confirmée",
      emailConfirmedDesc: "Votre adresse e-mail a été confirmée. Saisissez vos identifiants ci-dessous pour activer définitivement votre espace.",
      emailLabel: "Adresse e-mail professionnelle",
      emailPlaceholder: "votre@email.dz",
      passwordLabel: "Mot de passe",
      forgotPassword: "Mot de passe oublié ?",
      rememberMe: "Se souvenir de moi",
      loginBtn: "Se connecter",
      loginLoading: "Connexion...",
      or: "Ou",
      continueGoogle: "Continuer avec Google",
      noAccount: "Vous n'avez pas encore de compte ?",
      createAccount: "Créer un compte",
      loginFailedTitle: "Échec de la connexion",
      loginFailedDesc: "Email ou mot de passe incorrect.",
      loginSuccessTitle: "Bienvenue !",
      loginSuccessDesc: "Redirection vers votre espace de travail..."
    }
  },
  ar: {
    Login: {
      title: "مرحباً بعودتك",
      subtitle: "قم بتسجيل الدخول للوصول إلى مساحة الترجمة الآمنة الخاصة بك.",
      emailConfirmedTitle: "تم تأكيد عنوان البريد الإلكتروني",
      emailConfirmedDesc: "تم تأكيد بريدك الإلكتروني بنجاح. أدخل بيانات الاعتماد الخاصة بك أدناه لتفعيل مساحتك نهائياً.",
      emailLabel: "البريد الإلكتروني المهني",
      emailPlaceholder: "your@email.dz",
      passwordLabel: "كلمة المرور",
      forgotPassword: "هل نسيت كلمة المرور؟",
      rememberMe: "تذكرني",
      loginBtn: "تسجيل الدخول",
      loginLoading: "جاري تسجيل الدخول...",
      or: "أو",
      continueGoogle: "المتابعة باستخدام Google",
      noAccount: "ليس لديك حساب بعد؟",
      createAccount: "إنشاء حساب",
      loginFailedTitle: "فشل تسجيل الدخول",
      loginFailedDesc: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
      loginSuccessTitle: "مرحباً بك!",
      loginSuccessDesc: "جاري التوجيه إلى مساحة العمل الخاصة بك..."
    }
  },
  en: {
    Login: {
      title: "Welcome back",
      subtitle: "Log in to access your secure translation workspace.",
      emailConfirmedTitle: "Email address confirmed",
      emailConfirmedDesc: "Your email address has been successfully confirmed. Enter your credentials below to permanently activate your workspace.",
      emailLabel: "Professional Email Address",
      emailPlaceholder: "your@email.dz",
      passwordLabel: "Password",
      forgotPassword: "Forgot password?",
      rememberMe: "Remember me",
      loginBtn: "Sign in",
      loginLoading: "Signing in...",
      or: "Or",
      continueGoogle: "Continue with Google",
      noAccount: "Don't have an account yet?",
      createAccount: "Create an account",
      loginFailedTitle: "Login Failed",
      loginFailedDesc: "Incorrect email or password.",
      loginSuccessTitle: "Welcome!",
      loginSuccessDesc: "Redirecting to your workspace..."
    }
  },
  es: {
    Login: {
      title: "Bienvenido de nuevo",
      subtitle: "Inicie sesión para acceder a su espacio de traducción seguro.",
      emailConfirmedTitle: "Dirección de correo electrónico confirmada",
      emailConfirmedDesc: "Su dirección de correo electrónico ha sido confirmada. Ingrese sus credenciales a continuación para activar permanentemente su espacio.",
      emailLabel: "Correo electrónico profesional",
      emailPlaceholder: "tu@email.dz",
      passwordLabel: "Contraseña",
      forgotPassword: "¿Olvidaste tu contraseña?",
      rememberMe: "Recuérdame",
      loginBtn: "Iniciar sesión",
      loginLoading: "Iniciando sesión...",
      or: "O",
      continueGoogle: "Continuar con Google",
      noAccount: "¿Aún no tienes una cuenta?",
      createAccount: "Crear una cuenta",
      loginFailedTitle: "Error al iniciar sesión",
      loginFailedDesc: "Correo electrónico o contraseña incorrectos.",
      loginSuccessTitle: "¡Bienvenido!",
      loginSuccessDesc: "Redirigiendo a tu espacio de trabajo..."
    }
  },
  it: {
    Login: {
      title: "Bentornato",
      subtitle: "Accedi per entrare nel tuo spazio di traduzione sicuro.",
      emailConfirmedTitle: "Indirizzo e-mail confermato",
      emailConfirmedDesc: "Il tuo indirizzo e-mail è stato confermato. Inserisci le tue credenziali qui sotto per attivare definitivamente il tuo spazio.",
      emailLabel: "Indirizzo E-mail Professionale",
      emailPlaceholder: "tuo@email.dz",
      passwordLabel: "Password",
      forgotPassword: "Hai dimenticato la password?",
      rememberMe: "Ricordami",
      loginBtn: "Accedi",
      loginLoading: "Accesso in corso...",
      or: "O",
      continueGoogle: "Continua con Google",
      noAccount: "Non hai ancora un account?",
      createAccount: "Crea un account",
      loginFailedTitle: "Accesso non riuscito",
      loginFailedDesc: "E-mail o password non corretti.",
      loginSuccessTitle: "Benvenuto!",
      loginSuccessDesc: "Reindirizzamento al tuo spazio di lavoro..."
    }
  }
};

const messagesDir = path.join(process.cwd(), 'messages');

for (const [lang, data] of Object.entries(translations)) {
  const filePath = path.join(messagesDir, `${lang}.json`);
  let currentData = {};
  if (fs.existsSync(filePath)) {
    try {
      currentData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {}
  }
  
  const mergedData = { ...currentData, Login: data.Login };
  fs.writeFileSync(filePath, JSON.stringify(mergedData, null, 2));
  console.log(`Updated ${lang}.json`);
}
