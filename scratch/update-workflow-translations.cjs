const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, '../messages');

const translations = {
  fr: {
    tag: "FLUX DE TRAVAIL INTELLIGENT",
    title: "Comment fonctionne LegTrans DZ ?",
    step1_title: "1. Import du document",
    step1_desc: "Glissez-déposez vos documents (PDF, JPG, PNG) en toute sécurité sur notre plateforme souveraine.",
    step2_title: "2. OCR Juridique",
    step2_desc: "Notre moteur extrait le texte en respectant parfaitement la mise en page, les tableaux et les en-têtes.",
    step3_title: "3. Traduction IA",
    step3_desc: "Une traduction ultra-précise par notre IA entraînée sur la législation algérienne et la terminologie officielle.",
    step4_title: "4. Export Prêt à Signer",
    step4_desc: "Récupérez votre document au format Word (DOCX) parfaitement structuré, prêt pour votre sceau.",
    stat1_val: "90%",
    stat1_lbl: "De temps gagné",
    stat2_val: "100%",
    stat2_lbl: "Mise en page conservée",
    stat3_val: "Instant",
    stat3_lbl: "Export instantané",
    stat4_val: "Spécialisé",
    stat4_lbl: "OCR documents officiels",
    before_title: "Original (Français)",
    after_title: "Traduit (Arabe)",
    compare_title: "Fidélité visuelle absolue",
    compare_desc: "Visualisez comment notre IA conserve l'alignement, les sceaux et la structure originale du document."
  },
  ar: {
    tag: "خطوات العمل الذكية",
    title: "كيف يعمل LegTrans DZ ؟",
    step1_title: "1. رفع المستند",
    step1_desc: "قم بسحب وإفلات مستنداتك (PDF، JPG، PNG) بأمان تام على منصتنا السيادية.",
    step2_title: "2. قارئ النصوص القانوني (OCR)",
    step2_desc: "يقوم محركنا باستخراج النصوص بدقة متناهية مع الحفاظ التام على التنسيق والجداول والترويسات.",
    step3_title: "3. ترجمة بالذكاء الاصطناعي",
    step3_desc: "ترجمة فائقة الدقة بواسطة ذكائنا الاصطناعي المدرب على التشريع الجزائري والمصطلحات الرسمية.",
    step4_title: "4. تصدير جاهز للتوقيع",
    step4_desc: "استلم مستندك المترجم بتنسيق Word (DOCX) منسقًا بالكامل وجاهزًا للطباعة والختم.",
    stat1_val: "90%",
    stat1_lbl: "توفير في الوقت",
    stat2_val: "100%",
    stat2_lbl: "الحفاظ على التنسيق",
    stat3_val: "فوري",
    stat3_lbl: "تصدير فوري للمستند",
    stat4_val: "متخصص",
    stat4_lbl: "قارئ النصوص للوثائق الرسمية",
    before_title: "الأصلي (الفرنسية)",
    after_title: "المترجم (العربية)",
    compare_title: "تطابق بصري تام",
    compare_desc: "شاهد كيف يحافظ ذكاؤنا الاصطناعي على المحاذاة والأختام والهيكل الأصلي للمستند."
  },
  en: {
    tag: "INTELLIGENT WORKFLOW",
    title: "How does LegTrans DZ work?",
    step1_title: "1. Upload Document",
    step1_desc: "Drag and drop your documents (PDF, JPG, PNG) securely onto our sovereign platform.",
    step2_title: "2. Legal OCR",
    step2_desc: "Our engine extracts text while perfectly respecting the layout, tables, and headers.",
    step3_title: "3. Specialized AI Translation",
    step3_desc: "An ultra-precise translation by our AI trained on Algerian legislation and official terminology.",
    step4_title: "4. Ready-to-Sign Export",
    step4_desc: "Retrieve your translated document in Word (DOCX) format, perfectly structured and ready for your seal.",
    stat1_val: "90%",
    stat1_lbl: "Time Saved",
    stat2_val: "100%",
    stat2_lbl: "Layout Preserved",
    stat3_val: "Instant",
    stat3_lbl: "Instant Export",
    stat4_val: "Specialized",
    stat4_lbl: "OCR for Official Documents",
    before_title: "Original (French)",
    after_title: "Translated (Arabic)",
    compare_title: "Absolute Visual Fidelity",
    compare_desc: "See how our AI preserves the alignment, seals, and original structure of your document."
  },
  es: {
    tag: "FLUJO DE TRABAJO INTELIGENTE",
    title: "¿Cómo funciona LegTrans DZ?",
    step1_title: "1. Subir Documento",
    step1_desc: "Arrastre y suelte sus documentos (PDF, JPG, PNG) de forma segura en nuestra plataforma soberana.",
    step2_title: "2. OCR Jurídico",
    step2_desc: "Nuestro motor extrae el texto respetando perfectamente el diseño, las tablas y los encabezados.",
    step3_title: "3. Traducción de IA Especializada",
    step3_desc: "Una traducción ultraprecisa de nuestra IA entrenada en la legislación argelina y la terminología oficial.",
    step4_title: "4. Exportación Lista para Firmar",
    step4_desc: "Recupere su documento traducido en formato Word (DOCX), perfectamente estructurado y listo para su sello.",
    stat1_val: "90%",
    stat1_lbl: "De tiempo ahorrado",
    stat2_val: "100%",
    stat2_lbl: "Diseño conservado",
    stat3_val: "Instantáneo",
    stat3_lbl: "Exportación instantánea",
    stat4_val: "Especializado",
    stat4_lbl: "OCR para documentos oficiales",
    before_title: "Original (Francés)",
    after_title: "Traducido (Árabe)",
    compare_title: "Fidelidad visual absoluta",
    compare_desc: "Vea cómo nuestra IA conserva la alineación, los sellos y la estructura original de su documento."
  },
  it: {
    tag: "FLUSSO DI LAVORO INTELLIGENTE",
    title: "Come funziona LegTrans DZ?",
    step1_title: "1. Carica Documento",
    step1_desc: "Trascina e rilascia i tuoi documenti (PDF, JPG, PNG) in modo sicuro sulla nostra piattaforma sovrana.",
    step2_title: "2. OCR Giuridico",
    step2_desc: "Il nostro motore estrae il testo rispettando perfettamente il layout, le tabelle e le intestazioni.",
    step3_title: "3. Traduzione IA Specializzata",
    step3_desc: "Una traduzione ultra-precisa della nostra IA addestrata sulla legislazione algerina e sulla terminologia ufficiale.",
    step4_title: "4. Esportazione Pronta per la Firma",
    step4_desc: "Recupera il tuo documento tradotto in formato Word (DOCX), perfettamente strutturato e pronto per il tuo sigillo.",
    stat1_val: "90%",
    stat1_lbl: "Di tempo risparmiato",
    stat2_val: "100%",
    stat2_lbl: "Layout conservato",
    stat3_val: "Istantaneo",
    stat3_lbl: "Esportazione istantanea",
    stat4_val: "Specializzato",
    stat4_lbl: "OCR per documenti ufficiali",
    before_title: "Originale (Francese)",
    after_title: "Tradotto (Arabo)",
    compare_title: "Fedeltà visiva assoluta",
    compare_desc: "Visualizza come la nostra IA conserva l'allineamento, i sigilli e la struttura originale del tuo documento."
  }
};

for (const [lang, data] of Object.entries(translations)) {
  const filePath = path.join(messagesDir, `${lang}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    continue;
  }
  
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  content.Problem = data;
  
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
  console.log(`Successfully updated ${lang}.json`);
}
