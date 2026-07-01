const fs = require('fs');
const path = require('path');

const locales = ['fr', 'ar', 'en', 'es', 'it'];

const translations = {
  fr: {
    pricing_viewDetailsLink: "Voir le comparatif détaillé des offres, limites et modes OCR",
    dashboard_viewPricingDetails: "Voir le détail des formules & limites",
    footer_pricingDetails: "Tarifs détaillés & OCR"
  },
  ar: {
    pricing_viewDetailsLink: "مشاهدة المقارنة التفصيلية للباقات والحدود وأنماط OCR",
    dashboard_viewPricingDetails: "عرض تفاصيل الباقات والحدود",
    footer_pricingDetails: "الأسعار التفصيلية و OCR"
  },
  en: {
    pricing_viewDetailsLink: "View detailed comparison of plans, limits, and OCR modes",
    dashboard_viewPricingDetails: "View plan details & limits",
    footer_pricingDetails: "Detailed Pricing & OCR"
  },
  es: {
    pricing_viewDetailsLink: "Ver comparación detallada de planes, límites y modos de OCR",
    dashboard_viewPricingDetails: "Ver detalles de planes y límites",
    footer_pricingDetails: "Precios detallados y OCR"
  },
  it: {
    pricing_viewDetailsLink: "Visualizza il confronto dettagliato di piani, limiti e modalità OCR",
    dashboard_viewPricingDetails: "Visualizza i dettagli del piano e i limiti",
    footer_pricingDetails: "Prezzi dettagliati e OCR"
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

  // Ensure Pricing section exists
  if (!data.Pricing) data.Pricing = {};
  data.Pricing.viewDetailsLink = translations[locale].pricing_viewDetailsLink;

  // Ensure Dashboard.subscription section exists
  if (!data.Dashboard) data.Dashboard = {};
  if (!data.Dashboard.subscription) data.Dashboard.subscription = {};
  data.Dashboard.subscription.viewPricingDetails = translations[locale].dashboard_viewPricingDetails;

  // Ensure Footer.col_product section exists
  if (!data.Footer) data.Footer = {};
  if (!data.Footer.col_product) data.Footer.col_product = {};
  data.Footer.col_product.pricingDetails = translations[locale].footer_pricingDetails;

  // Write back
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Successfully updated translations for locale: ${locale}`);
});
