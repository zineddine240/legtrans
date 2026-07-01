const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, 'messages');
const locales = ['ar', 'fr', 'en', 'es', 'it'];

const translations = {
  fr: {
    title: "Facturation",
    subtitle: "Gérez vos abonnements et consultez l'historique de vos paiements",
    activeSubscription: "Abonnement Actif",
    history: "Historique des paiements",
    date: "Date",
    reference: "Référence",
    plan: "Offre",
    amount: "Montant",
    status: "Statut",
    invoice: "Facture",
    download: "Télécharger",
    paid: "Payé",
    noHistory: "Aucun historique de paiement trouvé.",
    validUntil: "Valide jusqu'au",
    notSubscribed: "Vous n'avez pas d'abonnement actif."
  },
  en: {
    title: "Billing",
    subtitle: "Manage your subscriptions and view your payment history",
    activeSubscription: "Active Subscription",
    history: "Payment History",
    date: "Date",
    reference: "Reference",
    plan: "Plan",
    amount: "Amount",
    status: "Status",
    invoice: "Invoice",
    download: "Download",
    paid: "Paid",
    noHistory: "No payment history found.",
    validUntil: "Valid until",
    notSubscribed: "You do not have an active subscription."
  },
  ar: {
    title: "الفواتير",
    subtitle: "إدارة اشتراكاتك والاطلاع على سجل الدفع",
    activeSubscription: "الاشتراك النشط",
    history: "سجل المدفوعات",
    date: "التاريخ",
    reference: "المرجع",
    plan: "الباقة",
    amount: "المبلغ",
    status: "الحالة",
    invoice: "الفاتورة",
    download: "تحميل",
    paid: "مدفوع",
    noHistory: "لم يتم العثور على سجل مدفوعات.",
    validUntil: "صالح حتى",
    notSubscribed: "ليس لديك اشتراك نشط."
  },
  es: {
    title: "Facturación",
    subtitle: "Gestione sus suscripciones y vea su historial de pagos",
    activeSubscription: "Suscripción Activa",
    history: "Historial de pagos",
    date: "Fecha",
    reference: "Referencia",
    plan: "Plan",
    amount: "Importe",
    status: "Estado",
    invoice: "Factura",
    download: "Descargar",
    paid: "Pagado",
    noHistory: "No se encontró historial de pagos.",
    validUntil: "Válido hasta",
    notSubscribed: "No tienes una suscripción activa."
  },
  it: {
    title: "Fatturazione",
    subtitle: "Gestisci i tuoi abbonamenti e visualizza lo storico dei pagamenti",
    activeSubscription: "Abbonamento Attivo",
    history: "Storico Pagamenti",
    date: "Data",
    reference: "Riferimento",
    plan: "Piano",
    amount: "Importo",
    status: "Stato",
    invoice: "Fattura",
    download: "Scarica",
    paid: "Pagato",
    noHistory: "Nessun pagamento trovato.",
    validUntil: "Valido fino a",
    notSubscribed: "Non hai un abbonamento attivo."
  }
};

locales.forEach(locale => {
  const filePath = path.join(messagesDir, `${locale}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.Billing = translations[locale];
    
    // Check if TopBar translations need update for the link
    if (data.TopBar) {
      if (locale === 'fr') data.TopBar.billing = "Facturation";
      if (locale === 'en') data.TopBar.billing = "Billing";
      if (locale === 'ar') data.TopBar.billing = "الفواتير";
      if (locale === 'es') data.TopBar.billing = "Facturación";
      if (locale === 'it') data.TopBar.billing = "Fatturazione";
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${locale}.json with Billing translations`);
  }
});
