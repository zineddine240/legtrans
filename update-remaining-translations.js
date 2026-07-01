import fs from 'fs';
import path from 'path';

const translations = {
  fr: {
    Register: {
      title: "Rejoignez LegTrans DZ",
      subtitle: "Accès instantané pour les traducteurs professionnels.",
      formIncomplete: "Formulaire incomplet",
      formIncompleteDesc: "Veuillez vérifier les champs en rouge.",
      legalRequired: "Conditions requises",
      legalRequiredDesc: "Veuillez accepter les conditions d'utilisation.",
      creating: "Création de votre compte en cours...",
      emailInUse: "Compte déjà existant",
      emailInUseDesc: "Cet e-mail est déjà utilisé. Vous pouvez vous connecter directement.",
      weakPassword: "Mot de passe trop faible",
      weakPasswordDesc: "Le mot de passe doit contenir au moins 8 caractères.",
      signInAction: "Se connecter",
      successTitle: "Compte créé avec succès !",
      lastNameLabel: "Nom / اللقب",
      lastNamePlaceholder: "Nom",
      firstNameLabel: "Prénom / الاسم",
      firstNamePlaceholder: "Prénom",
      emailLabel: "Email / الإيمايل",
      emailPlaceholder: "votre@email.dz",
      phoneLabel: "Téléphone / الهاتف",
      licenseLabel: "N° Agrément / رقم الاعتماد",
      passwordLabel: "Mot de passe / كلمة المرور",
      legalText: "J'accepte les",
      legalLink: "conditions d'utilisation",
      legalSuffix: "et la politique de confidentialité.*",
      submitBtn: "Créer mon compte",
      alreadyRegistered: "Déjà inscrit ?",
      signIn: "Se connecter"
    },
    Navbar: {
      features: "Fonctionnalités",
      pricing: "Tarifs",
      howItWorks: "Comment ça marche",
      about: "À propos",
      contact: "Contact",
      mySpace: "Mon Espace",
      login: "Connexion",
      freeTrial: "Essai gratuit"
    },
    FAQ: {
      title: "Questions fréquentes",
      subtitle: "Tout ce que vous devez savoir sur LegTrans DZ",
      items: [
        {
          q: "Est-ce que la plateforme gère la mise en page des tableaux et des actes complexes ?",
          a: "Oui. Notre modèle reconnaît et reproduit fidèlement la structure des documents originaux, y compris les tableaux, les colonnes et les listes. Vous gagnez un temps précieux sur la mise en forme."
        },
        {
          q: "Puis-je exporter les documents traduits vers Microsoft Word ?",
          a: "Oui, tous vos documents traités peuvent être exportés en un clic vers Microsoft Word (.docx) ou Excel (.xlsx) pour vous permettre d'effectuer vos révisions finales facilement."
        },
        {
          q: "Le système est-il adapté au lexique juridique algérien ?",
          a: "Absolument. LegTrans DZ a été optimisé spécifiquement pour le marché algérien, avec une excellente compréhension du français juridique, de l'arabe classique et de la terminologie administrative locale."
        },
        {
          q: "Mes documents sont-ils vraiment sécurisés ?",
          a: "Absolument. Tous les documents sont chiffrés avec des standards de haute sécurité. La confidentialité de vos actes officiels est notre priorité absolue."
        },
        {
          q: "Que se passe-t-il lorsque j'épuise mon quota d'essai gratuit ?",
          a: "Lors de votre essai, vous disposez de 5 documents par jour. Une fois le quota atteint, vous pouvez attendre le renouvellement automatique le lendemain à minuit, ou passer à l'offre Pro pour un accès sans limites."
        },
        {
          q: "L'IA remplacera-t-elle mon expertise ?",
          a: "Absolument pas. L'IA est un assistant qui automatise les tâches répétitives (saisie, tableaux, mise en page). Votre expertise reste indispensable pour la révision finale et l'interprétation juridique."
        },
        {
          q: "Quels formats de documents puis-je traiter ?",
          a: "PDF, JPG, PNG, TIFF. Nous supportons les documents volumineux. Les documents scannés même de qualité moyenne sont traités avec une très haute précision."
        }
      ]
    },
    FinalCTA: {
      title: "Prêt à transformer votre cabinet ?",
      subtitle: "Rejoignez les 52 traducteurs assermentés qui ont déjà gagné des centaines d'heures chaque mois.",
      btn: "Démarrer l'essai gratuit",
      email: "Email:",
      phone: "Téléphone:"
    },
    HowItWorks: {
      title: "Comment ça fonctionne",
      subtitle: "De l'upload au document traduit en 4 étapes simples",
      steps: [
        { title: "Téléversez", text: "Glissez votre PDF, JPG, ou scan dans l'interface intuitive." },
        { title: "Nos Modèles traitent", text: "OCR + traduction automatique spécialisée" },
        { title: "Vérifiez", text: "Relisez et validez les suggestions de notre modèle via notre éditeur." },
        { title: "Certifiez", text: "Exportez votre document finalisé prêt pour votre cachet." }
      ]
    }
  },
  ar: {
    Register: {
      title: "انضم إلى LegTrans DZ",
      subtitle: "وصول فوري للمترجمين المهنيين.",
      formIncomplete: "النموذج غير مكتمل",
      formIncompleteDesc: "يرجى التحقق من الحقول المميزة باللون الأحمر.",
      legalRequired: "الشروط مطلوبة",
      legalRequiredDesc: "يرجى قبول شروط الاستخدام.",
      creating: "جاري إنشاء حسابك...",
      emailInUse: "الحساب موجود مسبقاً",
      emailInUseDesc: "هذا البريد الإلكتروني مستخدم بالفعل. يمكنك تسجيل الدخول مباشرةً.",
      weakPassword: "كلمة المرور ضعيفة جداً",
      weakPasswordDesc: "يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل.",
      signInAction: "تسجيل الدخول",
      successTitle: "تم إنشاء الحساب بنجاح!",
      lastNameLabel: "اللقب / Nom",
      lastNamePlaceholder: "اللقب",
      firstNameLabel: "الاسم / Prénom",
      firstNamePlaceholder: "الاسم",
      emailLabel: "البريد الإلكتروني / Email",
      emailPlaceholder: "your@email.dz",
      phoneLabel: "الهاتف / Téléphone",
      licenseLabel: "رقم الاعتماد / N° Agrément",
      passwordLabel: "كلمة المرور / Mot de passe",
      legalText: "أوافق على",
      legalLink: "شروط الاستخدام",
      legalSuffix: "وسياسة الخصوصية.*",
      submitBtn: "إنشاء حسابي",
      alreadyRegistered: "هل لديك حساب بالفعل؟",
      signIn: "تسجيل الدخول"
    },
    Navbar: {
      features: "المميزات",
      pricing: "الأسعار",
      howItWorks: "كيف يعمل",
      about: "حول",
      contact: "اتصل بنا",
      mySpace: "مساحتي",
      login: "تسجيل الدخول",
      freeTrial: "تجربة مجانية"
    },
    FAQ: {
      title: "الأسئلة الشائعة",
      subtitle: "كل ما تحتاج معرفته عن LegTrans DZ",
      items: [
        {
          q: "هل تتعامل المنصة مع تنسيق الجداول والوثائق المعقدة؟",
          a: "نعم. نموذجنا يتعرف على هيكل المستندات الأصلية ويعيد إنتاجه بدقة، بما في ذلك الجداول والأعمدة والقوائم. توفر وقتاً ثميناً في التنسيق."
        },
        {
          q: "هل يمكنني تصدير الوثائق المترجمة إلى Microsoft Word؟",
          a: "نعم، يمكن تصدير جميع مستنداتك المعالجة بنقرة واحدة إلى Microsoft Word (.docx) أو Excel (.xlsx) لإجراء مراجعاتك النهائية بسهولة."
        },
        {
          q: "هل النظام متوافق مع المعجم القانوني الجزائري؟",
          a: "بالتأكيد. تم تحسين LegTrans DZ خصيصاً للسوق الجزائرية، مع فهم ممتاز للفرنسية القانونية والعربية الفصيحة والمصطلحات الإدارية المحلية."
        },
        {
          q: "هل مستنداتي آمنة حقاً؟",
          a: "بالتأكيد. يتم تشفير جميع المستندات وفق معايير الأمان العالية. سرية عقودك الرسمية هي أولويتنا المطلقة."
        },
        {
          q: "ما الذي يحدث عند استنفاد حصة التجربة المجانية؟",
          a: "خلال فترة التجربة، لديك 5 مستندات يومياً. بمجرد الوصول إلى الحصة، يمكنك الانتظار حتى التجديد التلقائي في منتصف الليل من اليوم التالي، أو الترقية إلى الباقة Pro للوصول غير المحدود."
        },
        {
          q: "هل سيحل الذكاء الاصطناعي محل خبرتي؟",
          a: "بالتأكيد لا. الذكاء الاصطناعي مساعد يؤتمت المهام المتكررة (الإدخال، الجداول، التخطيط). تظل خبرتك لا غنى عنها للمراجعة النهائية والتفسير القانوني."
        },
        {
          q: "ما صيغ المستندات التي يمكنني معالجتها؟",
          a: "PDF, JPG, PNG, TIFF. ندعم المستندات الكبيرة. تُعالَج المستندات الممسوحة ضوئياً حتى متوسطة الجودة بدقة عالية جداً."
        }
      ]
    },
    FinalCTA: {
      title: "هل أنت مستعد لتحويل مكتبك؟",
      subtitle: "انضم إلى 52 مترجماً محلفاً وفّروا بالفعل مئات الساعات كل شهر.",
      btn: "ابدأ الفترة التجريبية المجانية",
      email: "البريد الإلكتروني:",
      phone: "الهاتف:"
    },
    HowItWorks: {
      title: "كيف يعمل",
      subtitle: "من الرفع إلى المستند المترجم في 4 خطوات بسيطة",
      steps: [
        { title: "ارفع ملفك", text: "أسقط ملف PDF أو JPG أو المسح الضوئي في الواجهة البسيطة." },
        { title: "نماذجنا تعالج", text: "OCR + ترجمة آلية متخصصة" },
        { title: "راجع", text: "اقرأ واعتمد اقتراحات نموذجنا عبر المحرر." },
        { title: "اعتمد الوثيقة", text: "صدّر مستندك النهائي جاهزاً لختمك الرسمي." }
      ]
    }
  },
  en: {
    Register: {
      title: "Join LegTrans DZ",
      subtitle: "Instant access for professional translators.",
      formIncomplete: "Incomplete form",
      formIncompleteDesc: "Please check the highlighted fields.",
      legalRequired: "Terms required",
      legalRequiredDesc: "Please accept the terms of use.",
      creating: "Creating your account...",
      emailInUse: "Account already exists",
      emailInUseDesc: "This email is already in use. You can log in directly.",
      weakPassword: "Password too weak",
      weakPasswordDesc: "Password must be at least 8 characters.",
      signInAction: "Sign In",
      successTitle: "Account created successfully!",
      lastNameLabel: "Last Name",
      lastNamePlaceholder: "Last Name",
      firstNameLabel: "First Name",
      firstNamePlaceholder: "First Name",
      emailLabel: "Email",
      emailPlaceholder: "your@email.dz",
      phoneLabel: "Phone",
      licenseLabel: "License No.",
      passwordLabel: "Password",
      legalText: "I accept the",
      legalLink: "terms of use",
      legalSuffix: "and privacy policy.*",
      submitBtn: "Create my account",
      alreadyRegistered: "Already registered?",
      signIn: "Sign in"
    },
    Navbar: {
      features: "Features",
      pricing: "Pricing",
      howItWorks: "How it works",
      about: "About",
      contact: "Contact",
      mySpace: "My Dashboard",
      login: "Login",
      freeTrial: "Free trial"
    },
    FAQ: {
      title: "Frequently Asked Questions",
      subtitle: "Everything you need to know about LegTrans DZ",
      items: [
        {
          q: "Does the platform handle the layout of tables and complex documents?",
          a: "Yes. Our model faithfully recognizes and reproduces the structure of original documents, including tables, columns, and lists. You save precious time on formatting."
        },
        {
          q: "Can I export translated documents to Microsoft Word?",
          a: "Yes, all your processed documents can be exported in one click to Microsoft Word (.docx) or Excel (.xlsx) to allow easy final revisions."
        },
        {
          q: "Is the system adapted to Algerian legal terminology?",
          a: "Absolutely. LegTrans DZ has been specifically optimized for the Algerian market, with an excellent understanding of legal French, classical Arabic, and local administrative terminology."
        },
        {
          q: "Are my documents really secure?",
          a: "Absolutely. All documents are encrypted with high-security standards. The confidentiality of your official documents is our absolute priority."
        },
        {
          q: "What happens when I exhaust my free trial quota?",
          a: "During your trial, you have 5 documents per day. Once the quota is reached, you can wait for the automatic renewal the next day at midnight, or upgrade to the Pro offer for unlimited access."
        },
        {
          q: "Will AI replace my expertise?",
          a: "Absolutely not. AI is an assistant that automates repetitive tasks (data entry, tables, layout). Your expertise remains essential for final review and legal interpretation."
        },
        {
          q: "What document formats can I process?",
          a: "PDF, JPG, PNG, TIFF. We support large documents. Even medium-quality scanned documents are processed with very high accuracy."
        }
      ]
    },
    FinalCTA: {
      title: "Ready to transform your office?",
      subtitle: "Join 52 sworn translators who have already saved hundreds of hours each month.",
      btn: "Start free trial",
      email: "Email:",
      phone: "Phone:"
    },
    HowItWorks: {
      title: "How it works",
      subtitle: "From upload to translated document in 4 simple steps",
      steps: [
        { title: "Upload", text: "Drag your PDF, JPG, or scan into the intuitive interface." },
        { title: "Our Models process", text: "OCR + specialized automatic translation" },
        { title: "Review", text: "Read and validate our model's suggestions via our editor." },
        { title: "Certify", text: "Export your finalized document ready for your stamp." }
      ]
    }
  },
  es: {
    Register: {
      title: "Únete a LegTrans DZ",
      subtitle: "Acceso instantáneo para traductores profesionales.",
      formIncomplete: "Formulario incompleto",
      formIncompleteDesc: "Por favor, revisa los campos resaltados.",
      legalRequired: "Términos requeridos",
      legalRequiredDesc: "Por favor, acepta los términos de uso.",
      creating: "Creando tu cuenta...",
      emailInUse: "Cuenta ya existente",
      emailInUseDesc: "Este correo electrónico ya está en uso. Puedes iniciar sesión directamente.",
      weakPassword: "Contraseña demasiado débil",
      weakPasswordDesc: "La contraseña debe tener al menos 8 caracteres.",
      signInAction: "Iniciar sesión",
      successTitle: "¡Cuenta creada con éxito!",
      lastNameLabel: "Apellido",
      lastNamePlaceholder: "Apellido",
      firstNameLabel: "Nombre",
      firstNamePlaceholder: "Nombre",
      emailLabel: "Correo electrónico",
      emailPlaceholder: "tu@email.dz",
      phoneLabel: "Teléfono",
      licenseLabel: "N° Licencia",
      passwordLabel: "Contraseña",
      legalText: "Acepto los",
      legalLink: "términos de uso",
      legalSuffix: "y la política de privacidad.*",
      submitBtn: "Crear mi cuenta",
      alreadyRegistered: "¿Ya registrado?",
      signIn: "Iniciar sesión"
    },
    Navbar: {
      features: "Funcionalidades",
      pricing: "Precios",
      howItWorks: "Cómo funciona",
      about: "Acerca de",
      contact: "Contacto",
      mySpace: "Mi Panel",
      login: "Iniciar sesión",
      freeTrial: "Prueba gratuita"
    },
    FAQ: {
      title: "Preguntas frecuentes",
      subtitle: "Todo lo que necesitas saber sobre LegTrans DZ",
      items: [
        {
          q: "¿La plataforma gestiona el diseño de tablas y documentos complejos?",
          a: "Sí. Nuestro modelo reconoce y reproduce fielmente la estructura de los documentos originales, incluidas tablas, columnas y listas."
        },
        {
          q: "¿Puedo exportar los documentos traducidos a Microsoft Word?",
          a: "Sí, todos sus documentos procesados pueden exportarse con un clic a Microsoft Word (.docx) o Excel (.xlsx)."
        },
        {
          q: "¿El sistema está adaptado al léxico jurídico argelino?",
          a: "Absolutamente. LegTrans DZ ha sido optimizado específicamente para el mercado argelino, con una excelente comprensión del francés jurídico, el árabe clásico y la terminología administrativa local."
        },
        {
          q: "¿Mis documentos están realmente seguros?",
          a: "Absolutamente. Todos los documentos están cifrados con estándares de alta seguridad. La confidencialidad de sus actos oficiales es nuestra prioridad absoluta."
        },
        {
          q: "¿Qué ocurre cuando agoto mi cuota de prueba gratuita?",
          a: "Durante su prueba, tiene 5 documentos por día. Una vez alcanzada la cuota, puede esperar la renovación automática al día siguiente a medianoche, o actualizar al plan Pro."
        },
        {
          q: "¿Reemplazará la IA mi experiencia?",
          a: "En absoluto. La IA es un asistente que automatiza tareas repetitivas. Su experiencia sigue siendo indispensable para la revisión final y la interpretación jurídica."
        },
        {
          q: "¿Qué formatos de documentos puedo procesar?",
          a: "PDF, JPG, PNG, TIFF. Soportamos documentos grandes. Incluso los documentos escaneados de calidad media se procesan con muy alta precisión."
        }
      ]
    },
    FinalCTA: {
      title: "¿Listo para transformar tu despacho?",
      subtitle: "Únete a los 52 traductores jurados que ya han ahorrado cientos de horas cada mes.",
      btn: "Comenzar prueba gratuita",
      email: "Email:",
      phone: "Teléfono:"
    },
    HowItWorks: {
      title: "Cómo funciona",
      subtitle: "Desde la carga hasta el documento traducido en 4 pasos simples",
      steps: [
        { title: "Carga", text: "Arrastra tu PDF, JPG o escaneo a la interfaz intuitiva." },
        { title: "Nuestros modelos procesan", text: "OCR + traducción automática especializada" },
        { title: "Revisa", text: "Lee y valida las sugerencias de nuestro modelo a través del editor." },
        { title: "Certifica", text: "Exporta tu documento finalizado listo para tu sello." }
      ]
    }
  },
  it: {
    Register: {
      title: "Unisciti a LegTrans DZ",
      subtitle: "Accesso istantaneo per traduttori professionisti.",
      formIncomplete: "Modulo incompleto",
      formIncompleteDesc: "Si prega di verificare i campi evidenziati.",
      legalRequired: "Termini richiesti",
      legalRequiredDesc: "Accetta i termini di utilizzo.",
      creating: "Creazione del tuo account in corso...",
      emailInUse: "Account già esistente",
      emailInUseDesc: "Questa email è già in uso. Puoi accedere direttamente.",
      weakPassword: "Password troppo debole",
      weakPasswordDesc: "La password deve contenere almeno 8 caratteri.",
      signInAction: "Accedi",
      successTitle: "Account creato con successo!",
      lastNameLabel: "Cognome",
      lastNamePlaceholder: "Cognome",
      firstNameLabel: "Nome",
      firstNamePlaceholder: "Nome",
      emailLabel: "Email",
      emailPlaceholder: "tuo@email.dz",
      phoneLabel: "Telefono",
      licenseLabel: "N° Licenza",
      passwordLabel: "Password",
      legalText: "Accetto i",
      legalLink: "termini di utilizzo",
      legalSuffix: "e l'informativa sulla privacy.*",
      submitBtn: "Crea il mio account",
      alreadyRegistered: "Già registrato?",
      signIn: "Accedi"
    },
    Navbar: {
      features: "Funzionalità",
      pricing: "Prezzi",
      howItWorks: "Come funziona",
      about: "Chi siamo",
      contact: "Contatti",
      mySpace: "La mia Dashboard",
      login: "Accedi",
      freeTrial: "Prova gratuita"
    },
    FAQ: {
      title: "Domande frequenti",
      subtitle: "Tutto ciò che devi sapere su LegTrans DZ",
      items: [
        {
          q: "La piattaforma gestisce il layout di tabelle e documenti complessi?",
          a: "Sì. Il nostro modello riconosce e riproduce fedelmente la struttura dei documenti originali, incluse tabelle, colonne ed elenchi."
        },
        {
          q: "Posso esportare i documenti tradotti in Microsoft Word?",
          a: "Sì, tutti i documenti elaborati possono essere esportati con un clic in Microsoft Word (.docx) o Excel (.xlsx)."
        },
        {
          q: "Il sistema è adatto al lessico giuridico algerino?",
          a: "Assolutamente. LegTrans DZ è stato ottimizzato specificamente per il mercato algerino, con un'eccellente comprensione del francese giuridico, dell'arabo classico e della terminologia amministrativa locale."
        },
        {
          q: "I miei documenti sono davvero sicuri?",
          a: "Assolutamente. Tutti i documenti sono crittografati con standard di alta sicurezza. La riservatezza dei tuoi atti ufficiali è la nostra priorità assoluta."
        },
        {
          q: "Cosa succede quando esaurisco la quota di prova gratuita?",
          a: "Durante la prova, hai 5 documenti al giorno. Una volta raggiunta la quota, puoi aspettare il rinnovo automatico il giorno successivo a mezzanotte, o passare al piano Pro."
        },
        {
          q: "L'IA sostituirà la mia competenza?",
          a: "Assolutamente no. L'IA è un assistente che automatizza le attività ripetitive. La tua competenza rimane indispensabile per la revisione finale e l'interpretazione giuridica."
        },
        {
          q: "Quali formati di documento posso elaborare?",
          a: "PDF, JPG, PNG, TIFF. Supportiamo documenti di grandi dimensioni. Anche i documenti scansionati di qualità media vengono elaborati con altissima precisione."
        }
      ]
    },
    FinalCTA: {
      title: "Pronto a trasformare il tuo studio?",
      subtitle: "Unisciti ai 52 traduttori giurati che hanno già risparmiato centinaia di ore ogni mese.",
      btn: "Inizia la prova gratuita",
      email: "Email:",
      phone: "Telefono:"
    },
    HowItWorks: {
      title: "Come funziona",
      subtitle: "Dall'upload al documento tradotto in 4 semplici passaggi",
      steps: [
        { title: "Carica", text: "Trascina il tuo PDF, JPG o scansione nell'interfaccia intuitiva." },
        { title: "I nostri modelli elaborano", text: "OCR + traduzione automatica specializzata" },
        { title: "Verifica", text: "Leggi e valida i suggerimenti del nostro modello tramite l'editor." },
        { title: "Certifica", text: "Esporta il tuo documento finalizzato pronto per il tuo timbro." }
      ]
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
  
  const mergedData = { 
    ...currentData, 
    Register: data.Register,
    Navbar: data.Navbar,
    FAQ: data.FAQ,
    FinalCTA: data.FinalCTA,
    HowItWorks: data.HowItWorks
  };
  fs.writeFileSync(filePath, JSON.stringify(mergedData, null, 2));
  console.log(`Updated ${lang}.json`);
}
