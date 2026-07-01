const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, 'messages');

const updates = {
  fr: {
    free: [
      "5 requêtes OCR par jour",
      "Jusqu’à 5 images/pages par requête",
      "2 traductions de documents AI par jour",
      "Traduction texte illimitée",
      "Export Word",
      "Export Excel"
    ],
    pro: [
      "20 requêtes OCR par jour",
      "Jusqu’à 5 images/pages par requête",
      "1 traduction de document AI par jour",
      "Traduction texte illimitée",
      "Export Word",
      "Export Excel",
      "Communauté WhatsApp"
    ],
    plus: [
      "40 requêtes OCR par jour",
      "Jusqu’à 5 images/pages par requête",
      "5 traductions de documents AI par jour",
      "Traduction texte illimitée",
      "Export Word",
      "Export Excel",
      "Glossaire juridique algérien",
      "Modèles prêts à l’emploi",
      "Communauté WhatsApp"
    ]
  },
  ar: {
    free: [
      "5 طلبات OCR يومياً",
      "حتى 5 صور/صفحات لكل طلب",
      "2 ترجمة مستندات بالذكاء الاصطناعي يومياً",
      "ترجمة نصوص غير محدودة",
      "تصدير إلى Word",
      "تصدير إلى Excel"
    ],
    pro: [
      "20 طلب OCR يومياً",
      "حتى 5 صور/صفحات لكل طلب",
      "1 ترجمة مستند بالذكاء الاصطناعي يومياً",
      "ترجمة نصوص غير محدودة",
      "تصدير إلى Word",
      "تصدير إلى Excel",
      "مجتمع WhatsApp"
    ],
    plus: [
      "40 طلب OCR يومياً",
      "حتى 5 صور/صفحات لكل طلب",
      "5 ترجمات مستندات بالذكاء الاصطناعي يومياً",
      "ترجمة نصوص غير محدودة",
      "تصدير إلى Word",
      "تصدير إلى Excel",
      "قاموس قانوني جزائري",
      "نماذج جاهزة للاستخدام",
      "مجتمع WhatsApp"
    ]
  },
  en: {
    free: [
      "5 OCR requests per day",
      "Up to 5 images/pages per request",
      "2 AI document translations per day",
      "Unlimited text translation",
      "Word Export",
      "Excel Export"
    ],
    pro: [
      "20 OCR requests per day",
      "Up to 5 images/pages per request",
      "1 AI document translation per day",
      "Unlimited text translation",
      "Word Export",
      "Excel Export",
      "WhatsApp Community"
    ],
    plus: [
      "40 OCR requests per day",
      "Up to 5 images/pages per request",
      "5 AI document translations per day",
      "Unlimited text translation",
      "Word Export",
      "Excel Export",
      "Algerian Legal Glossary",
      "Ready-to-use Templates",
      "WhatsApp Community"
    ]
  },
  es: {
    free: [
      "5 solicitudes de OCR por día",
      "Hasta 5 imágenes/páginas por solicitud",
      "2 traducciones de documentos con IA por día",
      "Traducción de texto ilimitada",
      "Exportación a Word",
      "Exportación a Excel"
    ],
    pro: [
      "20 solicitudes de OCR por día",
      "Hasta 5 imágenes/páginas por solicitud",
      "1 traducción de documento con IA por día",
      "Traducción de texto ilimitada",
      "Exportación a Word",
      "Exportación a Excel",
      "Comunidad de WhatsApp"
    ],
    plus: [
      "40 solicitudes de OCR por día",
      "Hasta 5 imágenes/páginas por solicitud",
      "5 traducciones de documentos con IA por día",
      "Traducción de texto ilimitada",
      "Exportación a Word",
      "Exportación a Excel",
      "Glosario legal argelino",
      "Plantillas listas para usar",
      "Comunidad de WhatsApp"
    ]
  },
  it: {
    free: [
      "5 richieste OCR al giorno",
      "Fino a 5 immagini/pagine per richiesta",
      "2 traduzioni di documenti con IA al giorno",
      "Traduzione testo illimitata",
      "Esportazione in Word",
      "Esportazione in Excel"
    ],
    pro: [
      "20 richieste OCR al giorno",
      "Fino a 5 immagini/pagine per richiesta",
      "1 traduzione di documento con IA al giorno",
      "Traduzione testo illimitata",
      "Esportazione in Word",
      "Esportazione in Excel",
      "Comunità WhatsApp"
    ],
    plus: [
      "40 richieste OCR al giorno",
      "Fino a 5 immagini/pagine per richiesta",
      "5 traduzioni di documenti con IA al giorno",
      "Traduzione testo illimitata",
      "Esportazione in Word",
      "Esportazione in Excel",
      "Glossario legale algerino",
      "Modelli pronti all'uso",
      "Comunità WhatsApp"
    ]
  }
};

Object.keys(updates).forEach(locale => {
  const filePath = path.join(messagesDir, `${locale}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (data.Pricing && data.Pricing.plans) {
      data.Pricing.plans.free.features = updates[locale].free;
      data.Pricing.plans.pro.features = updates[locale].pro;
      data.Pricing.plans.plus.features = updates[locale].plus;
      
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`Updated features for ${locale}.json`);
    }
  }
});
