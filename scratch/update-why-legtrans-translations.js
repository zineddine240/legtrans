import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MESSAGES_DIR = path.join(__dirname, '..', 'messages');

const translations = {
  fr: {
    tag: "SOUVERAINETÉ & EXCELLENCE IA",
    title: "L'intelligence artificielle dédiée aux traducteurs assermentés",
    subtitle: "Découvrez comment notre technologie transforme la traduction juridique en Algérie avec une vitesse, une précision et une sécurité sans compromis.",
    metric1_val: "-90%",
    metric1_lbl: "Saisie manuelle évitée",
    metric1_desc: "Réduction drastique du temps passé à recopier manuellement les actes officiels.",
    metric2_val: "98.4%",
    metric2_lbl: "Précision terminologique",
    metric2_desc: "Modèle entraîné spécifiquement sur le lexique administratif et judiciaire algérien.",
    metric3_val: "10 min",
    metric3_lbl: "Par dossier complexe",
    metric3_desc: "Au lieu de 6 heures de saisie et de mise en page manuelle laborieuse.",
    f1_title: "IA Juridique Spécialisée",
    f1_desc: "Entraînée sur la législation algérienne, du Code civil aux jugements de la Cour Suprême.",
    f2_title: "Gain de Temps Massif",
    f2_desc: "Éliminez la saisie répétitive. Concentrez-vous uniquement sur la certification et l'authentification.",
    f3_title: "Export DOCX Professionnel",
    f3_desc: "Téléchargez des fichiers Word (.docx) parfaitement structurés avec tableaux et polices d'origine.",
    f4_title: "OCR Haute Fidélité",
    f4_desc: "Extraction ultra-précise des scans de basse résolution, des tampons officiels et de l'écriture manuscrite.",
    f5_title: "Workflow Ultra-Rapide",
    f5_desc: "Une interface fluide conçue pour les professionnels : importez, comparez côte à côte et finalisez.",
    f6_title: "Souveraineté & Confidentialité",
    f6_desc: "Sécurisation absolue de vos données et stricte conformité aux exigences réglementaires nationales."
  },
  ar: {
    tag: "السيادة والتميز بالذكاء الاصطناعي",
    title: "ذكاء اصطناعي مخصص للمترجمين الرسميين المحلفين",
    subtitle: "اكتشف كيف تغير تكنولوجيتنا الترجمة القانونية في الجزائر بسرعة ودقة وأمان دون مساومة.",
    metric1_val: "-90%",
    metric1_lbl: "تقليص الكتابة اليدوية",
    metric1_desc: "خفض هائل في الوقت المستغرق في نسخ الوثائق الرسمية يدوياً.",
    metric2_val: "98.4%",
    metric2_lbl: "دقة المصطلحات",
    metric2_desc: "نموذج مدرب خصيصاً على المعجم الإداري والقضائي الجزائري.",
    metric3_val: "10 دقائق",
    metric3_lbl: "لكل ملف معقد",
    metric3_desc: "بدلاً من 6 ساعات من الكتابة اليدوية وتنسيق الصفحات المتعب.",
    f1_title: "ذكاء قانوني متخصص",
    f1_desc: "مدرب على التشريع الجزائري، من القانون المدني إلى قرارات المحكمة العليا.",
    f2_title: "توفير هائل للوقت",
    f2_desc: "تخلص من مهام الكتابة المتكررة. ركز خبرتك فقط على المراجعة والتصديق الرسمي.",
    f3_title: "تصدير Word احترافي",
    f3_desc: "قم بتنزيل ملفات Word (.docx) منسقة بدقة متناهية مع الحفاظ على الجداول والخطوط الأصلية.",
    f4_title: "استخراج ذكي عالي الدقة",
    f4_desc: "استخراج فائق الدقة للوثائق الممسوحة ضوئياً منخفضة الجودة، الأختام الرسمية والكتابة اليدوية.",
    f5_title: "بيئة عمل فائقة السرعة",
    f5_desc: "واجهة مرنة مصممة للمحترفين: ارفع المستند، قارن جنباً إلى جنب وأكمل العمل فوراً.",
    f6_title: "السيادة وسرية البيانات",
    f6_desc: "أمان مطلق لبياناتك الحساسة والتزام صارم بمتطلبات حماية البيانات الوطنية."
  },
  en: {
    tag: "SOVEREIGNTY & AI EXCELLENCE",
    title: "Artificial Intelligence Crafted for Sworn Translators",
    subtitle: "Discover how our specialized technology transforms legal translation in Algeria with uncompromised speed, accuracy, and security.",
    metric1_val: "-90%",
    metric1_lbl: "Manual Typing Eliminated",
    metric1_desc: "Drastic reduction in the time spent manually copying official legal documents.",
    metric2_val: "98.4%",
    metric2_lbl: "Terminology Accuracy",
    metric2_desc: "Specially trained on the Algerian administrative, legal, and judicial vocabulary.",
    metric3_val: "10 min",
    metric3_lbl: "Per Complex File",
    metric3_desc: "Instead of 6 hours of tedious manual typing and page formatting.",
    f1_title: "Specialized Legal AI",
    f1_desc: "Trained on Algerian legislation, from the Civil Code to Supreme Court judgements.",
    f2_title: "Massive Time Savings",
    f2_desc: "Eliminate repetitive manual typing. Focus your expertise entirely on certification and review.",
    f3_title: "Professional DOCX Export",
    f3_desc: "Download fully structured Word documents (.docx) preserving original tables and fonts.",
    f4_title: "High-Fidelity OCR",
    f4_desc: "Ultra-precise text extraction from low-resolution scans, official stamps, and handwriting.",
    f5_title: "Ultra-Fast Workflow",
    f5_desc: "A fluid interface made for experts: drag and drop, review side-by-side, and finalize instantly.",
    f6_title: "Sovereignty & Security",
    f6_desc: "Absolute security for sensitive legal files and strict compliance with national privacy frameworks."
  },
  es: {
    tag: "SOBERANÍA Y EXCELENCIA IA",
    title: "Inteligencia Artificial diseñada para traductores jurados",
    subtitle: "Descubra cómo nuestra tecnología especializada transforma la traducción jurídica en Argelia con rapidez, precisión y seguridad sin compromisos.",
    metric1_val: "-90%",
    metric1_lbl: "Escritura manual evitada",
    metric1_desc: "Reducción drástica del tiempo dedicado a copiar manualmente actas oficiales.",
    metric2_val: "98.4%",
    metric2_lbl: "Precisión terminológica",
    metric2_desc: "Modelo entrenado específicamente en el léxico administrativo y judicial argelino.",
    metric3_val: "10 min",
    metric3_lbl: "Por expediente complejo",
    metric3_desc: "En lugar de 6 horas de laborioso tecleo manual y formateo de páginas.",
    f1_title: "IA Jurídica Especializada",
    f1_desc: "Entrenada en la legislación argelina, desde el Código Civil hasta los fallos de la Corte Suprema.",
    f2_title: "Ahorro Masivo de Tiempo",
    f2_desc: "Elimine la copia repetitiva. Concentre su experiencia únicamente en la revisión y certificación oficial.",
    f3_title: "Exportación DOCX Profesional",
    f3_desc: "Descargue archivos Word (.docx) estructurados que respetan las tablas y fuentes de origen.",
    f4_title: "OCR de Alta Fidelidad",
    f4_desc: "Extracción ultraprecisa de escaneos de baja resolución, sellos oficiales y escritura manuscrita.",
    f5_title: "Flujo de Trabajo Ultra Rápido",
    f5_desc: "Interfaz fluida diseñada para profesionales: importe, compare lado a lado y finalice.",
    f6_title: "Soberanía y Confidencialidad",
    f6_desc: "Seguridad absoluta para expedientes judiciales sensibles y estricta conformidad con las normas nacionales."
  },
  it: {
    tag: "SOVRANITÀ E ECCELLENZA IA",
    title: "Intelligenza Artificiale dedicata ai traduttori giurati",
    subtitle: "Scopri come la nostra tecnologia specializzata trasforma la traduzione giuridica in Algeria con velocità, precisione e sicurezza senza compromessi.",
    metric1_val: "-90%",
    metric1_lbl: "Digitazione manuale evitata",
    metric1_desc: "Riduzione drastica del tempo speso a ricopiare manualmente atti legali e documenti ufficiali.",
    metric2_val: "98.4%",
    metric2_lbl: "Precisione terminologica",
    metric2_desc: "Modello addestrato specificamente sul lessico amministrativo e giudiziario algerino.",
    metric3_val: "10 min",
    metric3_lbl: "Per pratica complessa",
    metric3_desc: "Invece di 6 ore di faticosa digitazione manuale e formattazione della struttura originaria.",
    f1_title: "IA Giuridica Spécialisée",
    f1_desc: "Addestrata sulla legislazione algerina, dal Codice Civile alle sentenze della Corte Suprema.",
    f2_title: "Risparmio di Tempo Massivo",
    f2_desc: "Elimina la digitazione ripetitiva. Dedica la tua competenza solo alla revisione finale e all'autenticazione.",
    f3_title: "Esportazione DOCX Professionale",
    f3_desc: "Scarica documenti Word (.docx) perfettamente strutturati con tabelle e caratteri originali conservati.",
    f4_title: "OCR ad Alta Fedeltà",
    f4_desc: "Estrazione ultra-precisa da scansioni a bassa risoluzione, timbri ufficiali e scrittura a mano.",
    f5_title: "Flusso di Lavoro Ultra-Rapido",
    f5_desc: "Un'interfaccia intuitiva progettata per professionisti: importa, confronta affiancato e finalizza.",
    f6_title: "Sovranità e Riservatezza",
    f6_desc: "Sicurezza assoluta per file giudiziari sensibili e conformità rigorosa ai quadri normativi nazionali."
  }
};

Object.entries(translations).forEach(([lang, data]) => {
  const filePath = path.join(MESSAGES_DIR, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(raw);
    json.Problem = data;
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
    console.log(`Successfully updated ${lang}.json Problem namespace.`);
  } else {
    console.error(`File not found: ${filePath}`);
  }
});
