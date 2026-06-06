import { useTranslation } from "react-i18next";

export type SupportedLocale = "pt-BR" | "en" | "es" | "fr";

export function useLocale() {
  const { i18n } = useTranslation();

  return {
    locale: (i18n.resolvedLanguage || i18n.language || "en") as SupportedLocale,
    setLocale: (locale: SupportedLocale) => i18n.changeLanguage(locale),
  };
}
