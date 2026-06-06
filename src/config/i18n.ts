import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import ptBR from "@/locales/pt-BR/translation.json";
import en from "@/locales/en/translation.json";
import es from "@/locales/es/translation.json";
import fr from "@/locales/fr/translation.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["pt-BR", "en", "es", "fr"],
    defaultNS: "translation",
    resources: {
      "pt-BR": { translation: ptBR },
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
    },
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "agroecology_locale",
    },
  });

export default i18n;
