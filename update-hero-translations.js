import fs from 'fs';
import path from 'path';

const translations = {
  fr: {
    Hero: {
      badge: "Plateforme Officielle • Traducteurs Assermentés",
      title1: "La traduction juridique",
      title2: "réinventée",
      title3: "pour les traducteurs algériens.",
      desc: "De 6 heures à 10 minutes par document. Notre IA spécialisée en terminologie juridique algérienne vous fait gagner 90% de votre temps, tout en garantissant la souveraineté de vos données.",
      btnDashboard: "Accéder à mon tableau de bord",
      btnStart: "Commencer l'essai gratuit",
      check1: "Sans carte bancaire",
      check2: "52 traducteurs actifs",
      check3: "Conforme RGPD-DZ",
      translationInProgress: "TRADUCTION IA EN COURS...",
      accuracy: "Précision",
      feature1_title: "Mise en page conservée",
      feature1_desc: "Notre modèle reproduit fidèlement la structure de vos documents originaux.",
      feature2_val: "120+",
      feature2_desc: "Heures économisées par mois"
    }
  },
  ar: {
    Hero: {
      badge: "المنصة الرسمية • للمترجمين المحلفين",
      title1: "الترجمة القانونية",
      title2: "بمفهوم جديد",
      title3: "للمترجمين الجزائريين.",
      desc: "من 6 ساعات إلى 10 دقائق لكل مستند. ذكاؤنا الاصطناعي المتخصص في المصطلحات القانونية الجزائرية يوفر لك 90% من وقتك، مع ضمان السيادة الكاملة لبياناتك.",
      btnDashboard: "الدخول إلى لوحة التحكم",
      btnStart: "ابدأ الفترة التجريبية المجانية",
      check1: "بدون بطاقة ائتمانية",
      check2: "52 مترجماً نشطاً",
      check3: "متوافق مع قوانين حماية البيانات (RGPD-DZ)",
      translationInProgress: "جاري الترجمة بالذكاء الاصطناعي...",
      accuracy: "الدقة",
      feature1_title: "الحفاظ على تخطيط الصفحة",
      feature1_desc: "نموذجنا يعيد إنتاج هيكل مستنداتك الأصلية بدقة متناهية.",
      feature2_val: "+120",
      feature2_desc: "ساعة يتم توفيرها شهرياً"
    }
  },
  en: {
    Hero: {
      badge: "Official Platform • Sworn Translators",
      title1: "Legal translation",
      title2: "reinvented",
      title3: "for Algerian translators.",
      desc: "From 6 hours to 10 minutes per document. Our AI specialized in Algerian legal terminology saves you 90% of your time, while ensuring the sovereignty of your data.",
      btnDashboard: "Go to my dashboard",
      btnStart: "Start free trial",
      check1: "No credit card required",
      check2: "52 active translators",
      check3: "RGPD-DZ compliant",
      translationInProgress: "AI TRANSLATION IN PROGRESS...",
      accuracy: "Accuracy",
      feature1_title: "Layout preserved",
      feature1_desc: "Our model faithfully reproduces the structure of your original documents.",
      feature2_val: "120+",
      feature2_desc: "Hours saved per month"
    }
  },
  es: {
    Hero: {
      badge: "Plataforma Oficial • Traductores Jurados",
      title1: "La traducción legal",
      title2: "reinventada",
      title3: "para traductores argelinos.",
      desc: "De 6 horas a 10 minutos por documento. Nuestra IA especializada en terminología legal argelina le ahorra el 90% de su tiempo, al tiempo que garantiza la soberanía de sus datos.",
      btnDashboard: "Ir a mi panel",
      btnStart: "Comenzar prueba gratuita",
      check1: "Sin tarjeta de crédito",
      check2: "52 traductores activos",
      check3: "Cumple con RGPD-DZ",
      translationInProgress: "TRADUCCIÓN IA EN CURSO...",
      accuracy: "Precisión",
      feature1_title: "Diseño conservado",
      feature1_desc: "Nuestro modelo reproduce fielmente la estructura de sus documentos originales.",
      feature2_val: "120+",
      feature2_desc: "Horas ahorradas al mes"
    }
  },
  it: {
    Hero: {
      badge: "Piattaforma Ufficiale • Traduttori Giurati",
      title1: "La traduzione legale",
      title2: "reinventata",
      title3: "per traduttori algerini.",
      desc: "Da 6 ore a 10 minuti per documento. La nostra IA specializzata in terminologia legale algerina ti fa risparmiare il 90% del tempo, garantendo la sovranità dei tuoi dati.",
      btnDashboard: "Vai alla mia dashboard",
      btnStart: "Inizia la prova gratuita",
      check1: "Nessuna carta di credito richiesta",
      check2: "52 traduttori attivi",
      check3: "Conforme RGPD-DZ",
      translationInProgress: "TRADUZIONE IA IN CORSO...",
      accuracy: "Precisione",
      feature1_title: "Layout conservato",
      feature1_desc: "Il nostro modello riproduce fedelmente la struttura dei tuoi documenti originali.",
      feature2_val: "120+",
      feature2_desc: "Ore risparmiate al mese"
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
  
  const mergedData = { ...currentData, Hero: data.Hero };
  fs.writeFileSync(filePath, JSON.stringify(mergedData, null, 2));
  console.log(`Updated ${lang}.json`);
}
