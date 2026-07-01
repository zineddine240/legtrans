import fs from 'fs';
import path from 'path';

const translations = {
  fr: {
    Dashboard: {
      header: {
        welcome: "Bienvenue",
        title: "Tableau de bord"
      },
      buttons: {
        ocr: "Extraction (OCR)",
        translate: "Traduction de Document"
      },
      hero: {
        badge: "Propulsé par intelligence artificielle",
        title: "Extrayez le texte en quelques secondes",
        desc: "Glissez votre document PDF ou image scannée — l'IA extrait, structure et exporte le texte automatiquement.",
        action: "Lancer l'OCR"
      },
      subscription: {
        title: "Abonnement",
        dueDate: "Date d'échéance",
        limits: "Limites journalières",
        extractions: "Extractions (OCR)",
        translations: "Traductions IA",
        freeTrial: "Essai Gratuit",
        admin: "Admin",
        subscribePro: "S'abonner Pro",
        subscribePlus: "S'abonner Plus",
        upgradePlus: "Passer à Plus (6 000 DA)",
        maxActive: "✓ Plan Plus Maximum Actif",
        adminActive: "✓ Administrateur Illimité",
        permanent: "Accès permanent",
        active: "Actif",
        trialDays: "14 jours d'essai"
      },
      stats: {
        docs: "Documents traités",
        docsSub: "par nos utilisateurs",
        accuracy: "Précision OCR moyenne",
        accuracySub: "sur documents légaux",
        time: "Temps d'extraction",
        timeSub: "par page en moyenne"
      },
      support: {
        title: "Assistance Personnalisée",
        heading: "Obtenir un support dédié",
        desc: "Réservez une assistance personnalisée et échangez directement avec notre support.",
        action: "Réserver une assistance"
      },
      community: {
        title: "Espace Communauté",
        heading: "Rejoindre la communauté",
        desc: "Échangez avec vos confrères et accédez à l'entraide en direct sur WhatsApp.",
        action: "Rejoindre le groupe"
      },
      features: {
        f1_tag: "Technologie IA",
        f1_title: "Précision OCR supérieure à 98%",
        f1_desc: "Extraction haute fidélité des documents juridiques arabes et français, même en basse résolution ou avec des fonds complexes.",
        f2_tag: "Tableaux & Structures",
        f2_title: "Extraction automatique des tableaux",
        f2_desc: "Détection et reconstruction intelligente des tableaux — relevés de notes, jugements — exportables en Excel (.xlsx).",
        f3_tag: "Manuscrits & Archives",
        f3_title: "Lecture de l'écriture à la plume",
        f3_desc: "Reconnaissance de la calligraphie maghrébine et documents historiques du XIXe siècle — actes d'état civil et archives coloniales."
      },
      how: {
        tag: "Comment ça marche",
        title: "4 étapes — de l'extraction à la traduction certifiée",
        s1_title: "Déposez votre document",
        s1_desc: "PDF, image scannée ou photo — tous formats acceptés jusqu'à 200 Mo.",
        s2_title: "L'IA extrait le texte",
        s2_desc: "Notre moteur IA analyse la mise en page, les tableaux et l'écriture manuscrite avec une précision supérieure à 98%.",
        s3_title: "Traduisez en un clic",
        s3_desc: "Envoyez le texte extrait directement vers l'éditeur de traduction assermentée intégré à la plateforme.",
        s4_title: "Exportez le document final",
        s4_desc: "Téléchargez la traduction certifiée en .docx — prête pour dépôt officiel auprès des tribunaux ou ambassades."
      },
      types: {
        tag: "Types de documents pris en charge",
        desc: "Optimisé pour les documents juridiques algériens et maghrébins",
        badge: "Certifié conforme",
        list: [
          "Actes manuscrits anciens",
          "Relevés de notes & bulletins",
          "Tableaux structurés",
          "Documents à colonnes",
          "Écriture à la plume",
          "Calligraphie maghrébine",
          "Formulaires administratifs",
          "Factures & devis",
          "Contrats multicolonnes",
          "Archives numérisées",
          "Documents mixtes arabe/français",
          "Scans basse résolution"
        ]
      }
    }
  },
  ar: {
    Dashboard: {
      header: {
        welcome: "مرحباً بكم",
        title: "لوحة التحكم"
      },
      buttons: {
        ocr: "استخراج النصوص (OCR)",
        translate: "ترجمة المستندات"
      },
      hero: {
        badge: "مدعوم بالذكاء الاصطناعي",
        title: "استخرج النصوص في ثوانٍ",
        desc: "قم بإسقاط ملف الـ PDF أو الصورة الممسوحة — وسيقوم الذكاء الاصطناعي باستخراج وتنظيم وتصدير النص تلقائياً.",
        action: "ابدأ عملية الـ OCR"
      },
      subscription: {
        title: "الاشتراك",
        dueDate: "تاريخ الانتهاء",
        limits: "الحدود اليومية",
        extractions: "عمليات الاستخراج",
        translations: "الترجمات بالذكاء الاصطناعي",
        freeTrial: "فترة تجريبية",
        admin: "المدير",
        subscribePro: "اشترك بـ Pro",
        subscribePlus: "اشترك بـ Plus",
        upgradePlus: "ترقية إلى Plus (6 000 دج)",
        maxActive: "✓ باقة Plus نشطة كحد أقصى",
        adminActive: "✓ مدير النظام",
        permanent: "وصول دائم",
        active: "نشط",
        trialDays: "14 يوماً تجريبياً"
      },
      stats: {
        docs: "مستند تمت معالجته",
        docsSub: "من قِبل مستخدمينا",
        accuracy: "متوسط دقة الاستخراج",
        accuracySub: "على المستندات القانونية",
        time: "وقت الاستخراج",
        timeSub: "للصفحة في المتوسط"
      },
      support: {
        title: "دعم مخصص",
        heading: "احصل على دعم متخصص",
        desc: "احجز جلسة دعم مخصصة وتواصل مباشرة مع فريقنا.",
        action: "حجز موعد دعم"
      },
      community: {
        title: "مجتمع المترجمين",
        heading: "انضم إلى المجتمع",
        desc: "تبادل الخبرات مع زملائك المترجمين واحصل على مساعدة فورية عبر WhatsApp.",
        action: "الانضمام للمجموعة"
      },
      features: {
        f1_tag: "تكنولوجيا الذكاء الاصطناعي",
        f1_title: "دقة استخراج تفوق 98%",
        f1_desc: "استخراج عالي الدقة للمستندات القانونية العربية والفرنسية، حتى بجودة منخفضة أو بخلفيات معقدة.",
        f2_tag: "الجداول والهيكلة",
        f2_title: "استخراج الجداول تلقائياً",
        f2_desc: "اكتشاف وإعادة بناء الجداول بذكاء — كشوف النقاط والأحكام — قابلة للتصدير كملف Excel.",
        f3_tag: "المخطوطات والأرشيف",
        f3_title: "قراءة الكتابة اليدوية",
        f3_desc: "التعرف على الخط المغاربي والوثائق التاريخية للقرن التاسع عشر — شهادات الحالة المدنية والأرشيف الاستعماري."
      },
      how: {
        tag: "كيف يعمل النظام",
        title: "4 خطوات — من الاستخراج إلى الترجمة المعتمدة",
        s1_title: "ارفع مستندك",
        s1_desc: "ملفات PDF أو صور — نقبل جميع الصيغ بحجم يصل إلى 200 ميجابايت.",
        s2_title: "الذكاء الاصطناعي يستخرج النص",
        s2_desc: "يحلل محركنا الذكي تخطيط الصفحة والجداول والكتابة اليدوية بدقة تفوق 98%.",
        s3_title: "ترجم بنقرة واحدة",
        s3_desc: "أرسل النص المستخرج مباشرة إلى محرر الترجمة المحلفة المدمج في المنصة.",
        s4_title: "تصدير المستند النهائي",
        s4_desc: "حمّل ترجمتك المعتمدة كملف .docx — جاهزة للتقديم للجهات الرسمية."
      },
      types: {
        tag: "أنواع المستندات المدعومة",
        desc: "محسّن للمستندات القانونية الجزائرية والمغاربية",
        badge: "معتمد وموثق",
        list: [
          "عقود مخطوطة قديمة",
          "كشوف النقاط والشهادات",
          "جداول مهيكلة",
          "مستندات متعددة الأعمدة",
          "كتابة بخط اليد",
          "خط مغاربي",
          "نماذج إدارية",
          "فواتير وعروض أسعار",
          "عقود متعددة الأعمدة",
          "أرشيف رقمي",
          "مستندات مزدوجة (عربي/فرنسي)",
          "مسح ضوئي بجودة منخفضة"
        ]
      }
    }
  },
  en: {
    Dashboard: {
      header: {
        welcome: "Welcome",
        title: "Dashboard"
      },
      buttons: {
        ocr: "OCR Extraction",
        translate: "Document Translation"
      },
      hero: {
        badge: "Powered by Artificial Intelligence",
        title: "Extract text in seconds",
        desc: "Drag and drop your PDF or scanned image — the AI automatically extracts, structures, and exports the text.",
        action: "Launch OCR"
      },
      subscription: {
        title: "Subscription",
        dueDate: "Due Date",
        limits: "Daily Limits",
        extractions: "Extractions (OCR)",
        translations: "AI Translations",
        freeTrial: "Free Trial",
        admin: "Admin",
        subscribePro: "Subscribe Pro",
        subscribePlus: "Subscribe Plus",
        upgradePlus: "Upgrade to Plus (6 000 DA)",
        maxActive: "✓ Maximum Plus Plan Active",
        adminActive: "✓ Unlimited Administrator",
        permanent: "Permanent Access",
        active: "Active",
        trialDays: "14 days trial"
      },
      stats: {
        docs: "Documents Processed",
        docsSub: "by our users",
        accuracy: "Average OCR Accuracy",
        accuracySub: "on legal documents",
        time: "Extraction Time",
        timeSub: "per page on average"
      },
      support: {
        title: "Personalized Support",
        heading: "Get dedicated support",
        desc: "Book a personalized support session and chat directly with our team.",
        action: "Book a session"
      },
      community: {
        title: "Community Space",
        heading: "Join the community",
        desc: "Connect with colleagues and access live help on WhatsApp.",
        action: "Join the group"
      },
      features: {
        f1_tag: "AI Technology",
        f1_title: "OCR Accuracy > 98%",
        f1_desc: "High-fidelity extraction of Arabic and French legal documents, even at low resolution or with complex backgrounds.",
        f2_tag: "Tables & Structures",
        f2_title: "Automatic Table Extraction",
        f2_desc: "Intelligent detection and reconstruction of tables — transcripts, judgments — exportable to Excel (.xlsx).",
        f3_tag: "Manuscripts & Archives",
        f3_title: "Handwriting Recognition",
        f3_desc: "Recognition of Maghrebi calligraphy and 19th-century historical documents — civil status acts and colonial archives."
      },
      how: {
        tag: "How it works",
        title: "4 steps — from extraction to certified translation",
        s1_title: "Upload your document",
        s1_desc: "PDF, scanned image, or photo — all formats accepted up to 200 MB.",
        s2_title: "AI extracts the text",
        s2_desc: "Our AI engine analyzes layout, tables, and handwriting with over 98% accuracy.",
        s3_title: "Translate in one click",
        s3_desc: "Send the extracted text directly to the platform's integrated sworn translation editor.",
        s4_title: "Export the final document",
        s4_desc: "Download the certified translation in .docx — ready for official submission."
      },
      types: {
        tag: "Supported document types",
        desc: "Optimized for Algerian and Maghrebi legal documents",
        badge: "Certified Compliant",
        list: [
          "Old handwritten deeds",
          "Transcripts & report cards",
          "Structured tables",
          "Multi-column documents",
          "Pen handwriting",
          "Maghrebi calligraphy",
          "Administrative forms",
          "Invoices & quotes",
          "Multi-column contracts",
          "Digitized archives",
          "Mixed Arabic/French documents",
          "Low-resolution scans"
        ]
      }
    }
  },
  es: {
    Dashboard: {
      header: {
        welcome: "Bienvenido",
        title: "Panel de Control"
      },
      buttons: {
        ocr: "Extracción OCR",
        translate: "Traducción de Documentos"
      },
      hero: {
        badge: "Impulsado por Inteligencia Artificial",
        title: "Extrae texto en segundos",
        desc: "Arrastra tu PDF o imagen escaneada — la IA extrae, estructura y exporta el texto automáticamente.",
        action: "Lanzar OCR"
      },
      subscription: {
        title: "Suscripción",
        dueDate: "Fecha de Vencimiento",
        limits: "Límites Diarios",
        extractions: "Extracciones (OCR)",
        translations: "Traducciones con IA",
        freeTrial: "Prueba Gratuita",
        admin: "Admin",
        subscribePro: "Suscribirse Pro",
        subscribePlus: "Suscribirse Plus",
        upgradePlus: "Mejorar a Plus (6 000 DA)",
        maxActive: "✓ Plan Plus Máximo Activo",
        adminActive: "✓ Administrador Ilimitado",
        permanent: "Acceso Permanente",
        active: "Activo",
        trialDays: "14 días de prueba"
      },
      stats: {
        docs: "Documentos Procesados",
        docsSub: "por nuestros usuarios",
        accuracy: "Precisión OCR Promedio",
        accuracySub: "en documentos legales",
        time: "Tiempo de Extracción",
        timeSub: "por página en promedio"
      },
      support: {
        title: "Soporte Personalizado",
        heading: "Obtenga soporte dedicado",
        desc: "Reserve una sesión de soporte personalizada y chatee directamente con nuestro equipo.",
        action: "Reservar sesión"
      },
      community: {
        title: "Espacio Comunitario",
        heading: "Únete a la comunidad",
        desc: "Conéctate con colegas y accede a ayuda en vivo por WhatsApp.",
        action: "Unirse al grupo"
      },
      features: {
        f1_tag: "Tecnología de IA",
        f1_title: "Precisión OCR superior al 98%",
        f1_desc: "Extracción de alta fidelidad de documentos legales árabes y franceses, incluso en baja resolución o con fondos complejos.",
        f2_tag: "Tablas y Estructuras",
        f2_title: "Extracción automática de tablas",
        f2_desc: "Detección y reconstrucción inteligente de tablas — transcripciones, juicios — exportables a Excel (.xlsx).",
        f3_tag: "Manuscritos y Archivos",
        f3_title: "Reconocimiento de escritura a mano",
        f3_desc: "Reconocimiento de la caligrafía magrebí y documentos históricos del siglo XIX — actas de estado civil y archivos coloniales."
      },
      how: {
        tag: "Cómo funciona",
        title: "4 pasos — de la extracción a la traducción certificada",
        s1_title: "Sube tu documento",
        s1_desc: "PDF, imagen escaneada o foto — se aceptan todos los formatos de hasta 200 MB.",
        s2_title: "La IA extrae el texto",
        s2_desc: "Nuestro motor de IA analiza el diseño, las tablas y la escritura a mano con una precisión superior al 98%.",
        s3_title: "Traducir en un clic",
        s3_desc: "Envía el texto extraído directamente al editor de traducción jurada integrado de la plataforma.",
        s4_title: "Exporta el documento final",
        s4_desc: "Descarga la traducción jurada en .docx — lista para su presentación oficial."
      },
      types: {
        tag: "Tipos de documentos admitidos",
        desc: "Optimizado para documentos legales argelinos y magrebíes",
        badge: "Certificado de Conformidad",
        list: [
          "Antiguas escrituras manuscritas",
          "Expedientes académicos",
          "Tablas estructuradas",
          "Documentos multicolumna",
          "Escritura a pluma",
          "Caligrafía magrebí",
          "Formularios administrativos",
          "Facturas y presupuestos",
          "Contratos multicolumna",
          "Archivos digitalizados",
          "Documentos mixtos árabe/francés",
          "Escaneos de baja resolución"
        ]
      }
    }
  },
  it: {
    Dashboard: {
      header: {
        welcome: "Benvenuto",
        title: "Pannello di Controllo"
      },
      buttons: {
        ocr: "Estrazione OCR",
        translate: "Traduzione Documenti"
      },
      hero: {
        badge: "Basato sull'Intelligenza Artificiale",
        title: "Estrai il testo in pochi secondi",
        desc: "Trascina il tuo PDF o immagine scansionata — l'IA estrae, struttura ed esporta il testo automaticamente.",
        action: "Avvia OCR"
      },
      subscription: {
        title: "Abbonamento",
        dueDate: "Data di Scadenza",
        limits: "Limiti Giornalieri",
        extractions: "Estrazioni (OCR)",
        translations: "Traduzioni con IA",
        freeTrial: "Prova Gratuita",
        admin: "Admin",
        subscribePro: "Abbonati Pro",
        subscribePlus: "Abbonati Plus",
        upgradePlus: "Passa a Plus (6 000 DA)",
        maxActive: "✓ Piano Plus Massimo Attivo",
        adminActive: "✓ Amministratore Illimitato",
        permanent: "Accesso Permanente",
        active: "Attivo",
        trialDays: "14 giorni di prova"
      },
      stats: {
        docs: "Documenti Elaborati",
        docsSub: "dai nostri utenti",
        accuracy: "Precisione OCR Media",
        accuracySub: "su documenti legali",
        time: "Tempo di Estrazione",
        timeSub: "per pagina in media"
      },
      support: {
        title: "Supporto Personalizzato",
        heading: "Ottieni supporto dedicato",
        desc: "Prenota una sessione di supporto personalizzata e chatta direttamente con il nostro team.",
        action: "Prenota una sessione"
      },
      community: {
        title: "Spazio Comunità",
        heading: "Unisciti alla comunità",
        desc: "Connettiti con i colleghi e accedi all'aiuto dal vivo su WhatsApp.",
        action: "Unisciti al gruppo"
      },
      features: {
        f1_tag: "Tecnologia IA",
        f1_title: "Precisione OCR superiore al 98%",
        f1_desc: "Estrazione ad alta fedeltà di documenti legali arabi e francesi, anche a bassa risoluzione o con sfondi complessi.",
        f2_tag: "Tabelle e Strutture",
        f2_title: "Estrazione automatica delle tabelle",
        f2_desc: "Rilevamento e ricostruzione intelligente delle tabelle — trascrizioni, sentenze — esportabili in Excel (.xlsx).",
        f3_tag: "Manoscritti e Archivi",
        f3_title: "Riconoscimento della scrittura a mano",
        f3_desc: "Riconoscimento della calligrafia maghrebina e dei documenti storici del XIX secolo — atti di stato civile e archivi coloniali."
      },
      how: {
        tag: "Come funziona",
        title: "4 passaggi — dall'estrazione alla traduzione certificata",
        s1_title: "Carica il tuo documento",
        s1_desc: "PDF, immagine scansionata o foto — si accettano tutti i formati fino a 200 MB.",
        s2_title: "L'IA estrae il testo",
        s2_desc: "Il nostro motore IA analizza il layout, le tabelle e la scrittura a mano con una precisione superiore al 98%.",
        s3_title: "Traduci in un clic",
        s3_desc: "Invia il testo estratto direttamente all'editor di traduzione giurata integrato della piattaforma.",
        s4_title: "Esporta il documento finale",
        s4_desc: "Scarica la traduzione certificata in .docx — pronta per la presentazione ufficiale."
      },
      types: {
        tag: "Tipi di documenti supportati",
        desc: "Ottimizzato per documenti legali algerini e maghrebini",
        badge: "Certificato di Conformità",
        list: [
          "Antichi atti manoscritti",
          "Pagelle e trascrizioni",
          "Tabelle strutturate",
          "Documenti a più colonne",
          "Scrittura a pennino",
          "Calligrafia maghrebina",
          "Moduli amministrativi",
          "Fatture e preventivi",
          "Contratti a più colonne",
          "Archivi digitalizzati",
          "Documenti misti arabo/francese",
          "Scansioni a bassa risoluzione"
        ]
      }
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
  
  const mergedData = { ...currentData, Dashboard: data.Dashboard };
  fs.writeFileSync(filePath, JSON.stringify(mergedData, null, 2));
  console.log(`Updated ${lang}.json`);
}
