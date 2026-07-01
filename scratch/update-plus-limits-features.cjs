const fs = require('fs');
const path = require('path');

const locales = ['fr', 'ar', 'en', 'es', 'it'];

const replacements = {
  fr: {
    pagePerRequest: "Jusqu’à 5 pages par requête",
    pagePerDay: "Jusqu’à 100 pages OCR / jour"
  },
  ar: {
    pagePerRequest: "حتى 5 صفحات لكل طلب",
    pagePerDay: "حتى 100 صفحة OCR / يوم"
  },
  en: {
    pagePerRequest: "Up to 5 pages per request",
    pagePerDay: "Up to 100 OCR pages / day"
  },
  es: {
    pagePerRequest: "Hasta 5 páginas por solicitud",
    pagePerDay: "Hasta 100 páginas OCR / día"
  },
  it: {
    pagePerRequest: "Fino a 5 pagine per richiesta",
    pagePerDay: "Fino a 100 pagine OCR / giorno"
  }
};

locales.forEach(locale => {
  const filePath = path.join(__dirname, '..', 'messages', `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  let data;
  try {
    data = JSON.parse(fileContent);
  } catch (err) {
    console.error(`Error parsing ${filePath}:`, err);
    return;
  }

  if (data.Pricing && data.Pricing.plans && data.Pricing.plans.plus && data.Pricing.plans.plus.features) {
    const features = data.Pricing.plans.plus.features;
    // Replace index 1 (max pages per request) and index 2 (max pages per day)
    features[1] = replacements[locale].pagePerRequest;
    features[2] = replacements[locale].pagePerDay;
    
    // Write back
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`Successfully updated Plus plan features for locale: ${locale}`);
  } else {
    console.error(`Failed to find Plus plan features structure in: ${locale}.json`);
  }
});
