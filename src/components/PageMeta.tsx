import { useEffect } from "react";
import { useMatches } from "react-router";
import { useTranslation } from "react-i18next";

interface PageMetaHandle {
  titleKey: string;
  descriptionKey?: string;
}

const SUPPORTED_LANGS = ["pt-BR", "en", "es", "fr"];

export function PageMeta() {
  const matches = useMatches();
  const { t, i18n } = useTranslation();

  const handle = matches[matches.length - 1]?.handle as
    | PageMetaHandle
    | undefined;

  const title = handle?.titleKey ? t(handle.titleKey) : "";
  const description =
    handle?.descriptionKey && typeof t(handle.descriptionKey) === "string"
      ? (t(handle.descriptionKey) as string)
      : "";

  const appName = t("app.name");
  const fullTitle = title ? `${title} - ${appName}` : appName;

  useEffect(() => {
    document.title = fullTitle;
  }, [fullTitle]);

  useEffect(() => {
    const html = document.documentElement;
    const currentLang = i18n.resolvedLanguage || i18n.language || "en";
    if (html.lang !== currentLang) {
      html.lang = currentLang;
    }

    let metaDescription = document.querySelector(
      'meta[name="description"]',
    ) as HTMLMetaElement | null;

    if (description) {
      if (!metaDescription) {
        metaDescription = document.createElement("meta");
        metaDescription.name = "description";
        document.head.appendChild(metaDescription);
      }
      metaDescription.content = description;
    } else if (metaDescription) {
      metaDescription.content = "";
    }

    const existingHreflang = document.querySelectorAll(
      'link[rel="alternate"][hreflang]',
    );
    existingHreflang.forEach((el) => el.remove());

    const url = window.location.href.split("?")[0];
    SUPPORTED_LANGS.forEach((lang) => {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = lang;
      link.href = url;
      document.head.appendChild(link);
    });

    const xDefault = document.createElement("link");
    xDefault.rel = "alternate";
    xDefault.hreflang = "x-default";
    xDefault.href = url;
    document.head.appendChild(xDefault);
  }, [description, i18n.language, i18n.resolvedLanguage]);

  return null;
}
