const fs = require('fs');
const path = require('path');

const locales = {
  fr: {
    free: [
      "5 requêtes OCR / jour",
      "Jusqu’à 5 pages par requête",
      "Jusqu’à 25 pages OCR / jour",
      "2 documents IA / jour",
      "Traduction texte illimitée",
      "Export Word & Excel",
      "Après l’essai : Gratuit limité"
    ],
    pro: [
      "10 requêtes OCR / jour",
      "Jusqu’à 5 pages par requête",
      "Jusqu’à 50 pages OCR / jour",
      "Mode OCR rapide",
      "1 document IA / jour",
      "Export Word & Excel"
    ],
    plus: [
      "20 requêtes OCR / jour",
      "Jusqu’à 10 pages par requête",
      "Jusqu’à 200 pages OCR / jour",
      "Mode OCR haute précision",
      "5 documents IA / jour",
      "Export Word & Excel",
      "Glossaire juridique",
      "Modèles prêts à l’emploi"
    ],
    annual: [
      "Volume personnalisé",
      "Accès API",
      "Support prioritaire"
    ]
  },
  ar: {
    free: [
      "5 طلبات OCR / يوم",
      "حتى 5 صفحات لكل طلب",
      "حتى 25 صفحة OCR / يوم",
      "2 مستندات IA / يوم",
      "ترجمة نصوص غير محدودة",
      "تصدير Word و Excel",
      "بعد التجربة: مجاني محدود"
    ],
    pro: [
      "10 طلبات OCR / يوم",
      "حتى 5 صفحات لكل طلب",
      "حتى 50 صفحة OCR / يوم",
      "وضع OCR سريع",
      "1 مستند IA / يوم",
      "تصدير Word و Excel"
    ],
    plus: [
      "20 طلب OCR / يوم",
      "حتى 10 صفحات لكل طلب",
      "حتى 200 صفحة OCR / يوم",
      "وضع OCR عالي الدقة",
      "5 مستندات IA / يوم",
      "تصدير Word و Excel",
      "قاموس قانوني",
      "نماذج جاهزة للاستخدام"
    ],
    annual: [
      "حجم مخصص",
      "وصول إلى API",
      "دعم فني ذو أولوية"
    ]
  },
  en: {
    free: [
      "5 OCR requests / day",
      "Up to 5 pages per request",
      "Up to 25 OCR pages / day",
      "2 AI documents / day",
      "Unlimited text translation",
      "Word & Excel Export",
      "After trial: Limited Free"
    ],
    pro: [
      "10 OCR requests / day",
      "Up to 5 pages per request",
      "Up to 50 OCR pages / day",
      "Fast OCR Mode",
      "1 AI document / day",
      "Word & Excel Export"
    ],
    plus: [
      "20 OCR requests / day",
      "Up to 10 pages per request",
      "Up to 200 OCR pages / day",
      "High Precision OCR Mode",
      "5 AI documents / day",
      "Word & Excel Export",
      "Legal Glossary",
      "Ready-to-use templates"
    ],
    annual: [
      "Custom volume",
      "API Access",
      "Priority support"
    ]
  },
  es: {
    free: [
      "5 solicitudes OCR / día",
      "Hasta 5 páginas por solicitud",
      "Hasta 25 páginas OCR / día",
      "2 documentos IA / día",
      "Traducción de texto ilimitada",
      "Exportación a Word y Excel",
      "Tras el período de prueba: Gratis limitado"
    ],
    pro: [
      "10 solicitudes OCR / día",
      "Hasta 5 páginas por solicitud",
      "Hasta 50 páginas OCR / día",
      "Modo OCR rápido",
      "1 documento IA / día",
      "Exportación a Word y Excel"
    ],
    plus: [
      "20 solicitudes OCR / día",
      "Hasta 10 páginas por solicitud",
      "Hasta 200 páginas OCR / día",
      "Modo OCR de alta précision",
      "5 documentos IA / día",
      "Exportación a Word y Excel",
      "Glosario jurídico",
      "Plantillas listas para usar"
    ],
    annual: [
      "Volumen personalizado",
      "Acceso a la API",
      "Soporte prioritario"
    ]
  },
  it: {
    free: [
      "5 richieste OCR / giorno",
      "Fino a 5 pagine per richiesta",
      "Fino a 25 pagine OCR / giorno",
      "2 documenti IA / giorno",
      "Traduzione del testo illimitata",
      "Esportazione in Word ed Excel",
      "Dopo la prova: Gratuito limitato"
    ],
    pro: [
      "10 richieste OCR / giorno",
      "Fino a 5 pagine per richiesta",
      "Fino a 50 pagine OCR / giorno",
      "Modalità OCR veloce",
      "1 documento IA / giorno",
      "Esportazione in Word ed Excel"
    ],
    plus: [
      "20 richieste OCR / giorno",
      "Fino a 10 pagine per richiesta",
      "Fino a 200 pagine OCR / giorno",
      "Modalità OCR ad alta precisione",
      "5 documenti IA / giorno",
      "Esportazione in Word ed Excel",
      "Glossario giuridico",
      "Modelli pronti all'uso"
    ],
    annual: [
      "Volume personalizzato",
      "Accesso API",
      "Supporto prioritario"
    ]
  }
};

const messagesDir = path.join(__dirname, '..', 'messages');

Object.entries(locales).forEach(([lang, data]) => {
  const filePath = path.join(messagesDir, `${lang}.json`);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (content.Pricing && content.Pricing.plans) {
    if (content.Pricing.plans.free) {
      content.Pricing.plans.free.features = data.free;
    }
    if (content.Pricing.plans.pro) {
      content.Pricing.plans.pro.features = data.pro;
    }
    if (content.Pricing.plans.plus) {
      content.Pricing.plans.plus.features = data.plus;
    }
    if (content.Pricing.plans.annual) {
      content.Pricing.plans.annual.features = data.annual;
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
  console.log(`Updated pricing features for locale: ${lang}`);
});
