import fs from 'fs';
import path from 'path';

const accountTranslations = {
  fr: {
    Account: {
      header: {
        settings: "Paramètres",
        title: "Mon Compte"
      },
      profile: {
        title: "Profil",
        fullName: "Nom complet",
        email: "E-mail",
        phone: "Téléphone",
        profession: "Profession / Cabinet",
        license: "N° D'agrément",
        notProvided: "Non renseigné",
        editBtn: "Modifier mes informations",
        modifyInfoTitle: "Modification de profil",
        modifyInfoDesc: "Cette fonctionnalité sera disponible très bientôt."
      },
      subscription: {
        title: "Abonnement",
        currentPlan: "Formule actuelle",
        freeTrial: "Essai Gratuit",
        pro: "Pro",
        plus: "Plus",
        expirationDate: "Date d'expiration",
        subscribePro: "S'abonner à Pro (3k DA)",
        subscribePlus: "S'abonner à Plus (6k DA)",
        upgradePlus: "Passer à Plus (6 000 DA)",
        paymentHistory: "Historique des paiements",
        noPayment: "Aucun paiement enregistré pour le moment.",
        loginRequired: "Veuillez vous connecter pour vous abonner.",
        redirecting: "Redirection vers le paiement...",
        paymentError: "Erreur de paiement",
        sessionError: "Une erreur est survenue lors de la création de la session."
      },
      usage: {
        title: "Utilisation",
        ocrTitle: "OCR — Extraction d'images",
        ocrDesc: "Utilisé aujourd'hui",
        docTitle: "Traduction de Documents AI",
        docDesc: "Utilisé aujourd'hui",
        textTitle: "Traduction de Texte",
        textUnlimited: "✓ Usage illimité",
        textReasonable: "Usage raisonnable (essai)",
        resetNote: "Réinitialisation automatique à 00:00 chaque nuit"
      },
      security: {
        title: "Sécurité",
        changePassword: "Changer le mot de passe",
        changePasswordDesc: "Réinitialiser via votre adresse e-mail",
        emailVerification: "Vérification e-mail",
        emailVerified: "Votre e-mail est vérifié ✓",
        emailResending: "Renvoi de l'e-mail...",
        emailNotVerified: "E-mail non encore vérifié — Cliquez pour renvoyer l'activation",
        logout: "Se déconnecter",
        logoutDesc: "Fermer la session sur cet appareil",
        alreadyVerified: "Votre adresse e-mail est déjà confirmée !",
        resendSuccess: "E-mail d'activation renvoyé !",
        resendSuccessDesc: "Veuillez vérifier votre boîte de réception ainsi que vos spams.",
        resendFailed: "Échec de l'envoi de l'e-mail de confirmation.",
        resendError: "Une erreur s'est produite lors de l'envoi."
      },
      assistance: {
        title: "Assistance",
        bookSupport: "Réserver une assistance",
        bookSupportDescPaid: "Envoyer un message WhatsApp directement",
        bookSupportDescFree: "Réservé aux abonnés Pro & Plus",
        joinCommunity: "Rejoindre la communauté WhatsApp",
        joinCommunityDescPaid: "Groupe privé des traducteurs LegTrans",
        joinCommunityDescFree: "Réservé aux abonnés Pro & Plus",
        contactSupport: "Contacter le support",
        contactSupportDesc: "contact@legtransdz.com",
        communityError: "Accès réservé",
        communityErrorDesc: "La communauté est réservée aux abonnés Pro & Plus.",
        supportError: "Accès réservé",
        supportErrorDesc: "L'assistance est réservée aux abonnés Pro & Plus."
      }
    }
  },
  ar: {
    Account: {
      header: {
        settings: "الإعدادات",
        title: "حسابي"
      },
      profile: {
        title: "الملف الشخصي",
        fullName: "الاسم الكامل",
        email: "البريد الإلكتروني",
        phone: "الهاتف",
        profession: "المهنة / المكتب",
        license: "رقم الاعتماد",
        notProvided: "غير محدد",
        editBtn: "تعديل معلوماتي",
        modifyInfoTitle: "تعديل الملف الشخصي",
        modifyInfoDesc: "ستكون هذه الميزة متاحة قريباً جداً."
      },
      subscription: {
        title: "الاشتراك",
        currentPlan: "الصيغة الحالية",
        freeTrial: "تجربة مجانية",
        pro: "برو",
        plus: "بلس",
        expirationDate: "تاريخ انتهاء الصلاحية",
        subscribePro: "الاشتراك في برو (3 آلاف دج)",
        subscribePlus: "الاشتراك في بلس (6 آلاف دج)",
        upgradePlus: "الترقية إلى بلس (6,000 دج)",
        paymentHistory: "سجل المدفوعات",
        noPayment: "لا توجد مدفوعات مسجلة حالياً.",
        loginRequired: "يرجى تسجيل الدخول للاشتراك.",
        redirecting: "جاري التوجيه إلى صفحة الدفع...",
        paymentError: "خطأ في الدفع",
        sessionError: "حدث خطأ أثناء إنشاء الجلسة."
      },
      usage: {
        title: "الاستخدام",
        ocrTitle: "OCR — استخراج الصور",
        ocrDesc: "مستخدم اليوم",
        docTitle: "ترجمة المستندات بالذكاء الاصطناعي",
        docDesc: "مستخدم اليوم",
        textTitle: "ترجمة النصوص",
        textUnlimited: "✓ استخدام غير محدود",
        textReasonable: "استخدام معقول (تجريبي)",
        resetNote: "تتم إعادة التعيين تلقائياً عند 00:00 كل ليلة"
      },
      security: {
        title: "الأمان",
        changePassword: "تغيير كلمة المرور",
        changePasswordDesc: "إعادة التعيين عبر البريد الإلكتروني",
        emailVerification: "التحقق من البريد الإلكتروني",
        emailVerified: "بريدك الإلكتروني موثق ✓",
        emailResending: "جاري إعادة إرسال البريد...",
        emailNotVerified: "البريد الإلكتروني غير موثق بعد — اضغط لإعادة إرسال التفعيل",
        logout: "تسجيل الخروج",
        logoutDesc: "إغلاق الجلسة على هذا الجهاز",
        alreadyVerified: "تم تأكيد بريدك الإلكتروني بالفعل!",
        resendSuccess: "تم إعادة إرسال بريد التفعيل!",
        resendSuccessDesc: "يرجى التحقق من علبة الوارد وكذلك الرسائل غير المرغوب فيها (Spam).",
        resendFailed: "فشل إرسال بريد التأكيد الإلكتروني.",
        resendError: "حدث خطأ أثناء الإرسال."
      },
      assistance: {
        title: "الدعم والمساعدة",
        bookSupport: "حجز خدمة الدعم",
        bookSupportDescPaid: "إرسال رسالة واتساب مباشرة",
        bookSupportDescFree: "خاص بمشتركي برو وبلس",
        joinCommunity: "الانضمام إلى مجتمع واتساب",
        joinCommunityDescPaid: "مجموعة خاصة بمترجمي LegTrans",
        joinCommunityDescFree: "خاص بمشتركي برو وبلس",
        contactSupport: "الاتصال بالدعم الفني",
        contactSupportDesc: "contact@legtransdz.com",
        communityError: "وصول محدود",
        communityErrorDesc: "المجتمع مخصص للمشتركين في برو وبلس فقط.",
        supportError: "وصول محدود",
        supportErrorDesc: "الدعم مخصص للمشتركين في برو وبلس فقط."
      }
    }
  },
  en: {
    Account: {
      header: {
        settings: "Settings",
        title: "My Account"
      },
      profile: {
        title: "Profile",
        fullName: "Full Name",
        email: "Email",
        phone: "Phone",
        profession: "Profession / Office",
        license: "License Number",
        notProvided: "Not specified",
        editBtn: "Edit My Information",
        modifyInfoTitle: "Profile Edit",
        modifyInfoDesc: "This feature will be available very soon."
      },
      subscription: {
        title: "Subscription",
        currentPlan: "Current Plan",
        freeTrial: "Free Trial",
        pro: "Pro",
        plus: "Plus",
        expirationDate: "Expiration Date",
        subscribePro: "Subscribe to Pro (3k DZD)",
        subscribePlus: "Subscribe to Plus (6k DZD)",
        upgradePlus: "Upgrade to Plus (6,000 DZD)",
        paymentHistory: "Payment History",
        noPayment: "No payments recorded yet.",
        loginRequired: "Please log in to subscribe.",
        redirecting: "Redirecting to payment...",
        paymentError: "Payment error",
        sessionError: "An error occurred while creating the session."
      },
      usage: {
        title: "Usage",
        ocrTitle: "OCR — Image Extraction",
        ocrDesc: "Used today",
        docTitle: "AI Document Translation",
        docDesc: "Used today",
        textTitle: "Text Translation",
        textUnlimited: "✓ Unlimited usage",
        textReasonable: "Reasonable usage (trial)",
        resetNote: "Resets automatically at 00:00 every night"
      },
      security: {
        title: "Security",
        changePassword: "Change Password",
        changePasswordDesc: "Reset via your email address",
        emailVerification: "Email Verification",
        emailVerified: "Your email is verified ✓",
        emailResending: "Resending email...",
        emailNotVerified: "Email not verified yet — Click to resend activation",
        logout: "Log Out",
        logoutDesc: "End session on this device",
        alreadyVerified: "Your email address is already verified!",
        resendSuccess: "Activation email resent!",
        resendSuccessDesc: "Please check your inbox and spam folder.",
        resendFailed: "Failed to send confirmation email.",
        resendError: "An error occurred during sending."
      },
      assistance: {
        title: "Assistance",
        bookSupport: "Book Support",
        bookSupportDescPaid: "Send a WhatsApp message directly",
        bookSupportDescFree: "Reserved for Pro & Plus subscribers",
        joinCommunity: "Join WhatsApp Community",
        joinCommunityDescPaid: "Private group for LegTrans translators",
        joinCommunityDescFree: "Reserved for Pro & Plus subscribers",
        contactSupport: "Contact Support",
        contactSupportDesc: "contact@legtransdz.com",
        communityError: "Access Reserved",
        communityErrorDesc: "The community is reserved for Pro & Plus subscribers.",
        supportError: "Access Reserved",
        supportErrorDesc: "Assistance is reserved for Pro & Plus subscribers."
      }
    }
  },
  es: {
    Account: {
      header: {
        settings: "Ajustes",
        title: "Mi Cuenta"
      },
      profile: {
        title: "Perfil",
        fullName: "Nombre completo",
        email: "Correo electrónico",
        phone: "Teléfono",
        profession: "Profesión / Despacho",
        license: "Número de licencia",
        notProvided: "No especificado",
        editBtn: "Editar mi información",
        modifyInfoTitle: "Editar Perfil",
        modifyInfoDesc: "Esta función estará disponible muy pronto."
      },
      subscription: {
        title: "Suscripción",
        currentPlan: "Plan actual",
        freeTrial: "Prueba Gratuita",
        pro: "Pro",
        plus: "Plus",
        expirationDate: "Fecha de vencimiento",
        subscribePro: "Suscribirse a Pro (3k DZD)",
        subscribePlus: "Suscribirse a Plus (6k DZD)",
        upgradePlus: "Pasar a Plus (6,000 DZD)",
        paymentHistory: "Historial de pagos",
        noPayment: "Aún no se han registrado pagos.",
        loginRequired: "Inicie sesión para suscribirse.",
        redirecting: "Redirigiendo al pago...",
        paymentError: "Error de pago",
        sessionError: "Ocurrió un error al crear la sesión."
      },
      usage: {
        title: "Uso",
        ocrTitle: "OCR — Extracción de imágenes",
        ocrDesc: "Usado hoy",
        docTitle: "Traducción de documentos AI",
        docDesc: "Usado hoy",
        textTitle: "Traducción de texto",
        textUnlimited: "✓ Uso ilimitado",
        textReasonable: "Uso razonable (prueba)",
        resetNote: "Se restablece automáticamente a las 00:00 todas las noches"
      },
      security: {
        title: "Seguridad",
        changePassword: "Cambiar contraseña",
        changePasswordDesc: "Restablecer a través de su correo electrónico",
        emailVerification: "Verificación de correo",
        emailVerified: "Su correo está verificado ✓",
        emailResending: "Reenviando correo...",
        emailNotVerified: "Correo no verificado — Haga clic para reenviar activación",
        logout: "Cerrar sesión",
        logoutDesc: "Cerrar sesión en este dispositivo",
        alreadyVerified: "¡Su dirección de correo ya está confirmada!",
        resendSuccess: "¡Correo de activación reenviado!",
        resendSuccessDesc: "Por favor, revise su bandeja de entrada y carpeta de spam.",
        resendFailed: "No se pudo enviar el correo de confirmación.",
        resendError: "Ocurrió un error durante el envío."
      },
      assistance: {
        title: "Asistencia",
        bookSupport: "Reservar asistencia",
        bookSupportDescPaid: "Enviar un mensaje de WhatsApp directamente",
        bookSupportDescFree: "Reservado para suscriptores Pro & Plus",
        joinCommunity: "Unirse a la comunidad de WhatsApp",
        joinCommunityDescPaid: "Grupo privado para traductores de LegTrans",
        joinCommunityDescFree: "Reservado para suscriptores Pro & Plus",
        contactSupport: "Contactar soporte",
        contactSupportDesc: "contact@legtransdz.com",
        communityError: "Acceso Reservado",
        communityErrorDesc: "La comunidad está reservada para suscriptores Pro & Plus.",
        supportError: "Acceso Reservado",
        supportErrorDesc: "La asistencia está reservada para suscriptores Pro & Plus."
      }
    }
  },
  it: {
    Account: {
      header: {
        settings: "Impostazioni",
        title: "Il Mio Account"
      },
      profile: {
        title: "Profilo",
        fullName: "Nome completo",
        email: "E-mail",
        phone: "Telefono",
        profession: "Professione / Studio",
        license: "Numero di licenza",
        notProvided: "Non specificato",
        editBtn: "Modifica informazioni",
        modifyInfoTitle: "Modifica Profilo",
        modifyInfoDesc: "Questa funzionalità sarà disponible molto presto."
      },
      subscription: {
        title: "Abbonamento",
        currentPlan: "Piano attuale",
        freeTrial: "Prova Gratuita",
        pro: "Pro",
        plus: "Plus",
        expirationDate: "Data di scadenza",
        subscribePro: "Abbonati a Pro (3k DZD)",
        subscribePlus: "Abbonati a Plus (6k DZD)",
        upgradePlus: "Passa a Plus (6,000 DZD)",
        paymentHistory: "Cronologia dei pagamenti",
        noPayment: "Nessun pagamento registrato al momento.",
        loginRequired: "Accedi per abbonarti.",
        redirecting: "Reindirizzamento al pagamento...",
        paymentError: "Errore di pagamento",
        sessionError: "Si è verificato un errore durante la creazione della sessione."
      },
      usage: {
        title: "Utilizzo",
        ocrTitle: "OCR — Estrazione immagini",
        ocrDesc: "Usato oggi",
        docTitle: "Traduzione documenti AI",
        docDesc: "Usato oggi",
        textTitle: "Traduzione testo",
        textUnlimited: "✓ Utilizzo illimitato",
        textReasonable: "Utilizzo ragionevole (prova)",
        resetNote: "Si ripristina automaticamente alle 00:00 ogni notte"
      },
      security: {
        title: "Sicurezza",
        changePassword: "Cambia password",
        changePasswordDesc: "Reimposta tramite il tuo indirizzo e-mail",
        emailVerification: "Verifica e-mail",
        emailVerified: "La tua e-mail è verificata ✓",
        emailResending: "Rinvio e-mail...",
        emailNotVerified: "E-mail non ancora verificata — Clicca per rinviare l'attivazione",
        logout: "Disconnettiti",
        logoutDesc: "Chiudi la sessione su questo dispositivo",
        alreadyVerified: "Il tuo indirizzo e-mail è già confermato!",
        resendSuccess: "E-mail di attivazione reinviata!",
        resendSuccessDesc: "Controlla la tua casella di posta e la cartella spam.",
        resendFailed: "Impossibile inviare l'e-mail di conferma.",
        resendError: "Si è verificato un errore durante l'invio."
      },
      assistance: {
        title: "Assistenza",
        bookSupport: "Prenota assistenza",
        bookSupportDescPaid: "Invia un messaggio WhatsApp direttamente",
        bookSupportDescFree: "Riservato agli abbonati Pro & Plus",
        joinCommunity: "Unisci alla community WhatsApp",
        joinCommunityDescPaid: "Gruppo privato per traduttori LegTrans",
        joinCommunityDescFree: "Riservato agli abbonati Pro & Plus",
        contactSupport: "Contatta il supporto",
        contactSupportDesc: "contact@legtransdz.com",
        communityError: "Accesso Riservato",
        communityErrorDesc: "La community è riservata agli abbonati Pro & Plus.",
        supportError: "Accesso Riservato",
        supportErrorDesc: "L'assistenza è riservata agli abbonati Pro & Plus."
      }
    }
  }
};

const messagesDir = path.join(process.cwd(), 'messages');

for (const [lang, data] of Object.entries(accountTranslations)) {
  const filePath = path.join(messagesDir, `${lang}.json`);
  let currentData = {};
  if (fs.existsSync(filePath)) {
    try {
      currentData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.error(`Error parsing ${lang}.json:`, e);
    }
  }
  
  const mergedData = { 
    ...currentData, 
    Account: data.Account
  };
  fs.writeFileSync(filePath, JSON.stringify(mergedData, null, 2));
  console.log(`Successfully added Account translation to ${lang}.json`);
}
