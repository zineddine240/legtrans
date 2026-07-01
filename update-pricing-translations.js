import fs from 'fs';
import path from 'path';

const translations = {
  fr: {
    Pricing: {
      loginRequired: "Connexion requise",
      loginRequiredDesc: "Veuillez créer un compte ou vous connecter pour souscrire à un abonnement.",
      redirecting: "Redirection...",
      redirectingDesc: "Vous allez être redirigé vers la passerelle de paiement sécurisée Chargily.",
      paymentError: "Erreur de paiement",
      title: "Choisissez votre forfait",
      subtitle: "Des tarifs étudiés et conçus spécialement pour les traducteurs assermentés en Algérie",
      plans: {
        free: {
          name: "Essai Gratuit — 14 jours",
          period: "DZD",
          features: [
            "5 images OCR par jour",
            "1 traduction de document AI par jour",
            "Traduction texte illimitée",
            "Export Word",
            "Export Excel"
          ],
          btn: "Commencer l'essai gratuit"
        },
        pro: {
          name: "Pro",
          period: "DZD / mois",
          badge: "Le plus populaire",
          features: [
            "20 images OCR par jour",
            "1 traduction de document AI par jour",
            "Traduction texte illimitée",
            "Export Word",
            "Export Excel",
            "Communauté WhatsApp"
          ],
          btn: "S'abonner maintenant"
        },
        plus: {
          name: "Plus",
          period: "DZD / mois",
          features: [
            "40 images OCR par jour",
            "5 traductions de documents AI par jour",
            "Traduction texte illimitée",
            "Export Word",
            "Export Excel",
            "Glossaire juridique algérien",
            "Modèles prêts à l’emploi",
            "Communauté WhatsApp"
          ],
          btn: "S'abonner maintenant"
        },
        annual: {
          name: "Offre annuelle",
          price: "Sur demande",
          features: [
            "Tarifs préférentiels annuels",
            "Volume sur mesure",
            "Support prioritaire dédié",
            "Contactez le service commercial."
          ],
          btn: "Nous contacter"
        }
      },
      processing: "Traitement...",
      acceptedPayments: "Moyens de paiement acceptés",
      transfer: "VIREMENT"
    }
  },
  ar: {
    Pricing: {
      loginRequired: "تسجيل الدخول مطلوب",
      loginRequiredDesc: "يرجى إنشاء حساب أو تسجيل الدخول للاشتراك.",
      redirecting: "جاري التوجيه...",
      redirectingDesc: "سيتم توجيهك إلى بوابة الدفع الآمنة Chargily.",
      paymentError: "خطأ في الدفع",
      title: "اختر باقتك",
      subtitle: "أسعار مدروسة ومصممة خصيصاً للمترجمين المحلفين في الجزائر",
      plans: {
        free: {
          name: "فترة تجريبية — 14 يوماً",
          period: "دج",
          features: [
            "5 صور OCR يومياً",
            "ترجمة مستند واحد بالذكاء الاصطناعي يومياً",
            "ترجمة نصوص غير محدودة",
            "تصدير Word",
            "تصدير Excel"
          ],
          btn: "ابدأ الفترة التجريبية المجانية"
        },
        pro: {
          name: "Pro",
          period: "دج / شهر",
          badge: "الأكثر شعبية",
          features: [
            "20 صورة OCR يومياً",
            "ترجمة مستند واحد بالذكاء الاصطناعي يومياً",
            "ترجمة نصوص غير محدودة",
            "تصدير Word",
            "تصدير Excel",
            "مجتمع WhatsApp"
          ],
          btn: "اشترك الآن"
        },
        plus: {
          name: "Plus",
          period: "دج / شهر",
          features: [
            "40 صورة OCR يومياً",
            "5 ترجمات مستندات بالذكاء الاصطناعي يومياً",
            "ترجمة نصوص غير محدودة",
            "تصدير Word",
            "تصدير Excel",
            "مسرد قانوني جزائري",
            "نماذج جاهزة للاستخدام",
            "مجتمع WhatsApp"
          ],
          btn: "اشترك الآن"
        },
        annual: {
          name: "العرض السنوي",
          price: "حسب الطلب",
          features: [
            "أسعار سنوية تفضيلية",
            "حجم مخصص",
            "دعم فني مخصص ذو أولوية",
            "تواصل مع قسم المبيعات."
          ],
          btn: "اتصل بنا"
        }
      },
      processing: "جاري المعالجة...",
      acceptedPayments: "وسائل الدفع المقبولة",
      transfer: "تحويل بنكي"
    }
  },
  en: {
    Pricing: {
      loginRequired: "Login required",
      loginRequiredDesc: "Please create an account or log in to subscribe.",
      redirecting: "Redirecting...",
      redirectingDesc: "You will be redirected to the secure Chargily payment gateway.",
      paymentError: "Payment error",
      title: "Choose your plan",
      subtitle: "Pricing designed specifically for sworn translators in Algeria",
      plans: {
        free: {
          name: "Free Trial — 14 days",
          period: "DZD",
          features: [
            "5 OCR images per day",
            "1 AI document translation per day",
            "Unlimited text translation",
            "Word Export",
            "Excel Export"
          ],
          btn: "Start free trial"
        },
        pro: {
          name: "Pro",
          period: "DZD / month",
          badge: "Most popular",
          features: [
            "20 OCR images per day",
            "1 AI document translation per day",
            "Unlimited text translation",
            "Word Export",
            "Excel Export",
            "WhatsApp Community"
          ],
          btn: "Subscribe now"
        },
        plus: {
          name: "Plus",
          period: "DZD / month",
          features: [
            "40 OCR images per day",
            "5 AI document translations per day",
            "Unlimited text translation",
            "Word Export",
            "Excel Export",
            "Algerian Legal Glossary",
            "Ready-to-use templates",
            "WhatsApp Community"
          ],
          btn: "Subscribe now"
        },
        annual: {
          name: "Annual offer",
          price: "On request",
          features: [
            "Preferential annual rates",
            "Custom volume",
            "Dedicated priority support",
            "Contact sales."
          ],
          btn: "Contact us"
        }
      },
      processing: "Processing...",
      acceptedPayments: "Accepted payment methods",
      transfer: "BANK TRANSFER"
    }
  },
  es: {
    Pricing: {
      loginRequired: "Inicio de sesión requerido",
      loginRequiredDesc: "Cree una cuenta o inicie sesión para suscribirse.",
      redirecting: "Redirigiendo...",
      redirectingDesc: "Será redirigido a la pasarela de pago segura de Chargily.",
      paymentError: "Error de pago",
      title: "Elige tu plan",
      subtitle: "Precios diseñados específicamente para traductores jurados en Argelia",
      plans: {
        free: {
          name: "Prueba gratuita — 14 días",
          period: "DZD",
          features: [
            "5 imágenes OCR por día",
            "1 traducción de documento IA por día",
            "Traducción de texto ilimitada",
            "Exportación a Word",
            "Exportación a Excel"
          ],
          btn: "Comenzar prueba gratuita"
        },
        pro: {
          name: "Pro",
          period: "DZD / mes",
          badge: "El más popular",
          features: [
            "20 imágenes OCR por día",
            "1 traducción de documento IA por día",
            "Traducción de texto ilimitada",
            "Exportación a Word",
            "Exportación a Excel",
            "Comunidad de WhatsApp"
          ],
          btn: "Suscribirse ahora"
        },
        plus: {
          name: "Plus",
          period: "DZD / mes",
          features: [
            "40 imágenes OCR por día",
            "5 traducciones de documentos IA por día",
            "Traducción de texto ilimitada",
            "Exportación a Word",
            "Exportación a Excel",
            "Glosario legal argelino",
            "Plantillas listas para usar",
            "Comunidad de WhatsApp"
          ],
          btn: "Suscribirse ahora"
        },
        annual: {
          name: "Oferta anual",
          price: "A pedido",
          features: [
            "Tarifas anuales preferenciales",
            "Volumen a medida",
            "Soporte prioritario dedicado",
            "Contacte a ventas."
          ],
          btn: "Contáctenos"
        }
      },
      processing: "Procesando...",
      acceptedPayments: "Métodos de pago aceptados",
      transfer: "TRANSFERENCIA"
    }
  },
  it: {
    Pricing: {
      loginRequired: "Accesso richiesto",
      loginRequiredDesc: "Crea un account o accedi per abbonarti.",
      redirecting: "Reindirizzamento...",
      redirectingDesc: "Verrai reindirizzato al gateway di pagamento sicuro Chargily.",
      paymentError: "Errore di pagamento",
      title: "Scegli il tuo piano",
      subtitle: "Prezzi progettati specificamente per traduttori giurati in Algeria",
      plans: {
        free: {
          name: "Prova gratuita — 14 giorni",
          period: "DZD",
          features: [
            "5 immagini OCR al giorno",
            "1 traduzione di documento IA al giorno",
            "Traduzione testo illimitata",
            "Esportazione Word",
            "Esportazione Excel"
          ],
          btn: "Inizia la prova gratuita"
        },
        pro: {
          name: "Pro",
          period: "DZD / mese",
          badge: "Il più popolare",
          features: [
            "20 immagini OCR al giorno",
            "1 traduzione di documento IA al giorno",
            "Traduzione testo illimitata",
            "Esportazione Word",
            "Esportazione Excel",
            "Comunità WhatsApp"
          ],
          btn: "Abbonati ora"
        },
        plus: {
          name: "Plus",
          period: "DZD / mese",
          features: [
            "40 immagini OCR al giorno",
            "5 traduzioni di documenti IA al giorno",
            "Traduzione testo illimitata",
            "Esportazione Word",
            "Esportazione Excel",
            "Glossario legale algerino",
            "Modelli pronti all'uso",
            "Comunità WhatsApp"
          ],
          btn: "Abbonati ora"
        },
        annual: {
          name: "Offerta annuale",
          price: "Su richiesta",
          features: [
            "Tariffe annuali preferenziali",
            "Volume su misura",
            "Supporto prioritario dedicato",
            "Contatta le vendite."
          ],
          btn: "Contattaci"
        }
      },
      processing: "Elaborazione...",
      acceptedPayments: "Metodi di pagamento accettati",
      transfer: "BONIFICO BANCARIO"
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
  
  const mergedData = { ...currentData, Pricing: data.Pricing };
  fs.writeFileSync(filePath, JSON.stringify(mergedData, null, 2));
  console.log(`Updated ${lang}.json`);
}
