import type { TFunction } from "i18next";
import type { SupportedLocale } from "@/hooks/use-locale";

const localeLabelKeys: Record<SupportedLocale, string> = {
  "pt-BR": "ptBR",
  en: "en",
};

export function getLocaleLabel(locale: SupportedLocale, t: TFunction): string {
  return t(`common.locales.${localeLabelKeys[locale]}`);
}

export function getLocaleOptions(
  t: TFunction,
): Array<{ value: SupportedLocale; label: string }> {
  return (Object.keys(localeLabelKeys) as SupportedLocale[]).map((locale) => ({
    value: locale,
    label: getLocaleLabel(locale, t),
  }));
}
