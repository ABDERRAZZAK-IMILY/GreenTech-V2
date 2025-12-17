import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Hna kat-hott les traductions
const resources = {
  en: {
    translation: {
      "welcome": "Welcome to GreenTech",
      "energy": "Energy Consumption",
      "switch_lang": "Switch Language"
    }
  },
  fr: {
    translation: {
      "welcome": "Bienvenue chez GreenTech",
      "energy": "Consommation d'Énergie",
      "switch_lang": "Changer de langue"
    }
  },
  darija: {
    translation: {
      "welcome": "Merhba bik f GreenTech",
      "energy": "Istihlak dyal Do",
      "switch_lang": "Beddel Lougha"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "fr", // Lougha par défaut
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;