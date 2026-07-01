import fs from 'fs';
import path from 'path';

const translations = {
  fr: {
    TopBar: {
      nav: {
        ocr: "Extraction OCR",
        text_translate: "Traduction Texte",
        doc_translate: "Traduction Fichiers",
        dashboard: "Tableau de bord"
      },
      userMenu: {
        account: "Mon compte",
        logout: "Se déconnecter"
      },
      mobile: {
        navigation: "Navigation"
      }
    }
  },
  ar: {
    TopBar: {
      nav: {
        ocr: "استخراج النصوص (OCR)",
        text_translate: "ترجمة النصوص",
        doc_translate: "ترجمة الملفات",
        dashboard: "لوحة التحكم"
      },
      userMenu: {
        account: "حسابي",
        logout: "تسجيل الخروج"
      },
      mobile: {
        navigation: "القائمة"
      }
    }
  },
  en: {
    TopBar: {
      nav: {
        ocr: "OCR Extraction",
        text_translate: "Text Translation",
        doc_translate: "Document Translation",
        dashboard: "Dashboard"
      },
      userMenu: {
        account: "My Account",
        logout: "Sign Out"
      },
      mobile: {
        navigation: "Navigation"
      }
    }
  },
  es: {
    TopBar: {
      nav: {
        ocr: "Extracción OCR",
        text_translate: "Traducción de Texto",
        doc_translate: "Traducción de Archivos",
        dashboard: "Panel de Control"
      },
      userMenu: {
        account: "Mi Cuenta",
        logout: "Cerrar Sesión"
      },
      mobile: {
        navigation: "Navegación"
      }
    }
  },
  it: {
    TopBar: {
      nav: {
        ocr: "Estrazione OCR",
        text_translate: "Traduzione Testo",
        doc_translate: "Traduzione Documenti",
        dashboard: "Pannello di Controllo"
      },
      userMenu: {
        account: "Il Mio Account",
        logout: "Esci"
      },
      mobile: {
        navigation: "Navigazione"
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
  
  const mergedData = { ...currentData, TopBar: data.TopBar };
  fs.writeFileSync(filePath, JSON.stringify(mergedData, null, 2));
  console.log(`Updated ${lang}.json`);
}
