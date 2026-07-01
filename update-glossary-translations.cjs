const fs = require('fs');
const path = require('path');

const locales = ['fr', 'ar', 'en', 'es', 'it'];

const glossaryTranslations = {
  fr: {
    TopBar: {
      nav: {
        glossary: "Contribuer au glossaire"
      }
    },
    Dashboard: {
      glossary: {
        tag: "Glossaire Juridique",
        title: "Contribuez au glossaire juridique DZ",
        desc: "Suggérez de nouvelles terminologies pour enrichir l'IA de LegTrans DZ. Les meilleures propositions reçoivent un mois d'abonnement gratuit.",
        action: "Proposer un terme"
      }
    },
    Glossary: {
      hero: {
        tag: "INTELLIGENCE COLLECTIVE",
        title: "Enrichir le Glossaire Juridique Algérien",
        desc: "Contribuez à l'excellence terminologique de la plateforme en suggérant des termes et traductions. Chaque proposition fait l'objet d'une validation manuelle par notre comité."
      },
      ranking: {
        title: "Classement des Contributeurs",
        desc: "Reconnaissance de l'engagement académique au sein de la communauté.",
        reward_title: "Récompense Semestrielle",
        reward_desc: "Chaque 6 mois, le meilleur contributeur se voit offrir un mois d'abonnement premium complet.",
        badge_pioneer: "Pionnier",
        badge_expert: "Expert",
        badge_master: "Maître"
      },
      form: {
        title: "Proposer une nouvelle expression",
        original_term: "Terme d'origine",
        original_placeholder: "Ex: Référé-provision, Saisie-arrêt...",
        suggested_translation: "Traduction suggérée",
        suggested_placeholder: "Ex: أمر مستعجل بأداء كفالة...",
        source_lang: "Langue source",
        target_lang: "Langue cible",
        category: "Catégorie",
        category_placeholder: "Sélectionnez une catégorie",
        context: "Contexte / Source officielle",
        context_placeholder: "Ex: Code civil algérien, Article 124...",
        optional: "optionnel",
        submit: "Soumettre la proposition",
        submitting: "Transmission..."
      },
      feedback: {
        title: "Proposition soumise avec succès",
        subtitle: "En attente de validation académique",
        desc: "Votre contribution a été enregistrée. Elle sera étudiée par notre comité sous 48 heures. Aucune mise à jour n'est appliquée automatiquement.",
        timeline_step1: "Enregistrement de la proposition",
        timeline_step2: "Vérification de la conformité juridique",
        timeline_step3: "Validation et intégration au glossaire",
        another: "Proposer une autre terminologie"
      },
      categories: {
        civil: "Droit civil",
        penal: "Droit pénal",
        commercial: "Droit commercial",
        administrative: "Droit administratif",
        vital: "État civil",
        official: "Documents officiels",
        contracts: "Contrats",
        other: "Autre"
      }
    }
  },
  ar: {
    TopBar: {
      nav: {
        glossary: "المساهمة في القاموس"
      }
    },
    Dashboard: {
      glossary: {
        tag: "القاموس القانوني",
        title: "ساهم في إثراء القاموس القانوني الجزائري",
        desc: "اقترح مصطلحات قانونية جديدة لتطوير الذكاء الاصطناعي لـ LegTrans DZ. المساهمات المميزة تكافأ باشتراكات مجانية.",
        action: "اقترح مصطلحاً"
      }
    },
    Glossary: {
      hero: {
        tag: "الذكاء الجماعي",
        title: "إثراء القاموس القانوني الجزائري",
        desc: "ساهم في التميز الأكاديمي للمنصة من خلال اقتراح مصطلحات وترجمات قانونية دقيقة. تخضع كل مساهمة للتدقيق والمراجعة اليدوية من قبل لجنتنا."
      },
      ranking: {
        title: "ترتيب المساهمين",
        desc: "تقدير للمجهودات الأكاديمية والالتزام المهني لأعضاء مجتمعنا.",
        reward_title: "مكافأة نصف سنوية",
        reward_desc: "كل 6 أشهر، يحصل أفضل مساهم في القاموس على شهر اشتراك كامل مجاناً في الفئة الممتازة.",
        badge_pioneer: "رائد",
        badge_expert: "خبير",
        badge_master: "مستشار"
      },
      form: {
        title: "اقتراح مصطلح جديد",
        original_term: "المصطلح الأصلي",
        original_placeholder: "مثال: Référé-provision, Saisie-arrêt...",
        suggested_translation: "الترجمة المقترحة",
        suggested_placeholder: "مثال: أمر مستعجل بأداء كفالة...",
        source_lang: "اللغة المصدر",
        target_lang: "اللغة المستهدفة",
        category: "التصنيف القانوني",
        category_placeholder: "اختر تصنيفاً للمصطلح",
        context: "السياق / المصدر الرسمي",
        context_placeholder: "مثال: القانون المدني الجزائري، المادة 124...",
        optional: "اختياري",
        submit: "إرسال الاقتراح",
        submitting: "جاري الإرسال..."
      },
      feedback: {
        title: "تم تسجيل اقتراحك بنجاح",
        subtitle: "قيد المراجعة والتدقيق الأكاديمي",
        desc: "تم حفظ مساهمتك بأمان. ستراجعها لجنتنا الأكاديمية المختصة في غضون 48 ساعة. لن يتم نشر أي مصطلح تلقائياً.",
        timeline_step1: "تسجيل واكتمال الاقتراح",
        timeline_step2: "التدقيق والمطابقة القانونية",
        timeline_step3: "الاعتماد والدمج في القاموس",
        another: "اقتراح مصطلح آخر"
      },
      categories: {
        civil: "القانون المدني",
        penal: "القانون الجزائي",
        commercial: "القانون التجاري",
        administrative: "القانون الإداري",
        vital: "الحالة المدنية",
        official: "الوثائق الرسمية",
        contracts: "العقود والاتفاقيات",
        other: "أخرى"
      }
    }
  },
  en: {
    TopBar: {
      nav: {
        glossary: "Contribute to glossary"
      }
    },
    Dashboard: {
      glossary: {
        tag: "Legal Glossary",
        title: "Contribute to the DZ legal glossary",
        desc: "Suggest new legal terms to enrich LegTrans DZ's AI. Top approved contributors receive one free premium month.",
        action: "Propose a term"
      }
    },
    Glossary: {
      hero: {
        tag: "COLLECTIVE INTELLIGENCE",
        title: "Enrich the Algerian Legal Glossary",
        desc: "Contribute to academic excellence by suggesting precise terms and translations. Every suggestion undergoes manual validation by our expert committee."
      },
      ranking: {
        title: "Contributor Rankings",
        desc: "Recognizing scholarly dedication within our community.",
        reward_title: "Bi-Annual Reward",
        reward_desc: "Every 6 months, the top glossary contributor receives 1 free month of Premium membership.",
        badge_pioneer: "Pioneer",
        badge_expert: "Expert",
        badge_master: "Master"
      },
      form: {
        title: "Suggest a new expression",
        original_term: "Original term",
        original_placeholder: "E.g., Référé-provision, Saisie-arrêt...",
        suggested_translation: "Suggested translation",
        suggested_placeholder: "E.g., أمر مستعجل بأداء كفالة...",
        source_lang: "Source language",
        target_lang: "Target language",
        category: "Legal Category",
        category_placeholder: "Select a category",
        context: "Context / Official Source",
        context_placeholder: "E.g., Algerian Civil Code, Article 124...",
        optional: "optional",
        submit: "Submit Proposal",
        submitting: "Transmitting..."
      },
      feedback: {
        title: "Proposal Submitted Successfully",
        subtitle: "Pending Academic Validation",
        desc: "Your contribution has been saved. Our expert committee will review it within 48 hours. No changes are applied automatically.",
        timeline_step1: "Proposal recorded",
        timeline_step2: "Legal compliance verification",
        timeline_step3: "Validation & database integration",
        another: "Propose another terminology"
      },
      categories: {
        civil: "Civil Law",
        penal: "Criminal Law",
        commercial: "Commercial Law",
        administrative: "Administrative Law",
        vital: "Civil Status",
        official: "Official Documents",
        contracts: "Contracts",
        other: "Other"
      }
    }
  },
  es: {
    TopBar: {
      nav: {
        glossary: "Contribuir al glosario"
      }
    },
    Dashboard: {
      glossary: {
        tag: "Glosario Jurídico",
        title: "Contribuya al glosario jurídico DZ",
        desc: "Sugiera nuevos términos legales para enriquecer la IA de LegTrans DZ. Las mejores propuestas reciben un mes de suscripción premium gratis.",
        action: "Proponer un término"
      }
    },
    Glossary: {
      hero: {
        tag: "INTELIGENCIA COLECTIVA",
        title: "Enriquecer el Glosario Jurídico Argelino",
        desc: "Contribuya a la excelencia terminológica de la plataforma sugiriendo términos y traducciones. Cada propuesta es validada manualmente por nuestro comité experto."
      },
      ranking: {
        title: "Clasificación de Colaboradores",
        desc: "Reconocimiento de la dedicación académica dentro de la comunidad.",
        reward_title: "Recompensa Semestral",
        reward_desc: "Cada 6 meses, el mejor colaborador del glosario recibe 1 mes de suscripción Premium gratis.",
        badge_pioneer: "Pionero",
        badge_expert: "Experto",
        badge_master: "Maestro"
      },
      form: {
        title: "Proponer una nueva expresión",
        original_term: "Término original",
        original_placeholder: "Ej: Référé-provision, Saisie-arrêt...",
        suggested_translation: "Traducción sugerida",
        suggested_placeholder: "Ej: أمر مستعجل بأداء كفالة...",
        source_lang: "Idioma de origen",
        target_lang: "Idioma de destino",
        category: "Categoría",
        category_placeholder: "Seleccione una categoría",
        context: "Contexto / Fuente oficial",
        context_placeholder: "Ej: Código Civil argelino, Artículo 124...",
        optional: "opcional",
        submit: "Enviar propuesta",
        submitting: "Transmitiendo..."
      },
      feedback: {
        title: "Propuesta enviada con éxito",
        subtitle: "En espera de validación académica",
        desc: "Su contribución ha sido guardada. Nuestro comité de expertos la revisará en un plazo de 48 horas. No se aplican cambios automáticamente.",
        timeline_step1: "Propuesta registrada",
        timeline_step2: "Verificación de cumplimiento legal",
        timeline_step3: "Validación e integración en el glosario",
        another: "Proponer otra terminología"
      },
      categories: {
        civil: "Derecho civil",
        penal: "Derecho penal",
        commercial: "Derecho comercial",
        administrative: "Derecho administrativo",
        vital: "Estado civil",
        official: "Documentos oficiales",
        contracts: "Contratos",
        other: "Otro"
      }
    }
  },
  it: {
    TopBar: {
      nav: {
        glossary: "Contribuisci al glossario"
      }
    },
    Dashboard: {
      glossary: {
        tag: "Glossario Giuridico",
        title: "Contribuisci al glossario giuridico DZ",
        desc: "Suggerisci nuovi termini legali per arricchire l'IA di LegTrans DZ. Le migliori proposte ricevono un mese di abbonamento premium gratuito.",
        action: "Proponi un termine"
      }
    },
    Glossary: {
      hero: {
        tag: "INTELLIGENZA COLLETTIVA",
        title: "Arricchire il Glossario Giuridico Algerino",
        desc: "Contribuisci all'eccellenza terminologica della piattaforma suggerendo termini e traduzioni. Ogni proposta viene validata manualmente dal nostro comitato esperto."
      },
      ranking: {
        title: "Classifica dei Collaboratori",
        desc: "Riconoscimento della dedizione accademica all'interno della comunità.",
        reward_title: "Premio Semestrale",
        reward_desc: "Ogni 6 mesi, il miglior collaboratore del glossario riceve 1 mese di abbonamento Premium gratuito.",
        badge_pioneer: "Pioniere",
        badge_expert: "Esperto",
        badge_master: "Maestro"
      },
      form: {
        title: "Proponi una nuova espressione",
        original_term: "Termine originale",
        original_placeholder: "Es: Référé-provision, Saisie-arrêt...",
        suggested_translation: "Traduzione suggerita",
        suggested_placeholder: "Es: أمر مستعجل بأداء كفالة...",
        source_lang: "Lingua di origine",
        target_lang: "Lingua di destinazione",
        category: "Categoria",
        category_placeholder: "Seleziona una categoria",
        context: "Contesto / Fonte ufficiale",
        context_placeholder: "Es: Codice Civile algerino, Articolo 124...",
        optional: "opzionale",
        submit: "Invia proposta",
        submitting: "Trasmissione..."
      },
      feedback: {
        title: "Proposta inviata con successo",
        subtitle: "In attesa di validazione accademica",
        desc: "Il tuo contributo è stato registrato. Il nostro comitato di esperti lo esaminerà entro 48 ore. Nessuna modifica viene applicata automaticamente.",
        timeline_step1: "Proposta registrata",
        timeline_step2: "Verifica della conformità legale",
        timeline_step3: "Validazione e integrazione nel glossario",
        another: "Proponi un'altra terminologia"
      },
      categories: {
        civil: "Diritto civile",
        penal: "Diritto penale",
        commercial: "Diritto commerciale",
        administrative: "Diritto amministrativo",
        vital: "Stato civile",
        official: "Documenti ufficiali",
        contracts: "Contratti",
        other: "Altro"
      }
    }
  }
};

locales.forEach((locale) => {
  const filePath = path.join(__dirname, 'messages', `${locale}.json`);
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

  const updates = glossaryTranslations[locale];

  // 1. Update TopBar.nav.glossary
  if (data.TopBar && data.TopBar.nav) {
    data.TopBar.nav.glossary = updates.TopBar.nav.glossary;
  }

  // 2. Update Dashboard.glossary
  if (data.Dashboard) {
    data.Dashboard.glossary = updates.Dashboard.glossary;
  }

  // 3. Add root Glossary namespace
  data.Glossary = updates.Glossary;

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Successfully updated ${filePath}`);
});
