import { useTranslation } from "react-i18next";
import { Smartphone, BookOpen, Users, Globe, Shield } from "lucide-react";
import { Card } from "@/components/ui/Card";

const playStoreUrl =
  "https://play.google.com/store/apps/details?id=org.agroecologymap.agroecology_map_ai&pcampaignid=web_share";
const appStoreUrl =
  "https://apps.apple.com/br/app/agroecology-map-ai/id6779950543";
const playStoreBadgeUrl = "/google-play-badge.png";
const appStoreBadgeUrl = "/app-store-badge.svg";

export function MobilePage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex min-w-0 items-center gap-3">
        <Smartphone className="h-7 w-7 shrink-0 text-primary" />
        <h1 className="min-w-0 break-words text-2xl font-bold text-text-primary">
          {t("mobile.title")}
        </h1>
      </div>

      <Card>
        <div className="space-y-4">
          <p className="text-text-primary text-base leading-relaxed">
            {t("mobile.intro")}
          </p>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <a
              href={playStoreUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 max-w-full items-center"
            >
              <img
                src={playStoreBadgeUrl}
                alt={t("mobile.playStoreDownloadButton")}
                className="h-21 max-w-full"
              />
            </a>
            <a
              href={appStoreUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 max-w-full items-center"
            >
              <img
                src={appStoreBadgeUrl}
                alt={t("mobile.appStoreDownloadButton")}
                className="h-15 max-w-full"
              />
            </a>
          </div>
        </div>
      </Card>

      <h2 className="text-xl font-bold text-text-primary flex items-center gap-2 pt-4">
        <BookOpen className="h-5 w-5 text-primary" />
        {t("mobile.features.title")}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <div className="flex items-start gap-3">
            <Globe className="h-6 w-6 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-text-primary mb-1">
                {t("mobile.features.access.title")}
              </h3>
              <p className="text-text-primary text-sm leading-relaxed">
                {t("mobile.features.access.description")}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            <Users className="h-6 w-6 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-text-primary mb-1">
                {t("mobile.features.democratize.title")}
              </h3>
              <p className="text-text-primary text-sm leading-relaxed">
                {t("mobile.features.democratize.description")}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            <BookOpen className="h-6 w-6 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-text-primary mb-1">
                {t("mobile.features.knowledge.title")}
              </h3>
              <p className="text-text-primary text-sm leading-relaxed">
                {t("mobile.features.knowledge.description")}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-text-primary mb-1">
                {t("mobile.features.privacy.title")}
              </h3>
              <p className="text-text-primary text-sm leading-relaxed">
                {t("mobile.features.privacy.description")}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col items-center gap-4 text-center">
          <Smartphone className="h-10 w-10 text-primary" />
          <h2 className="text-xl font-bold text-text-primary">
            {t("mobile.cta.title")}
          </h2>
          <p className="text-text-primary text-base leading-relaxed max-w-xl">
            {t("mobile.cta.description")}
          </p>
          <div className="flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <a
              href={playStoreUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 max-w-full items-center"
            >
              <img
                src={playStoreBadgeUrl}
                alt={t("mobile.playStoreDownloadButton")}
                className="h-21 max-w-full"
              />
            </a>
            <a
              href={appStoreUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 max-w-full items-center"
            >
              <img
                src={appStoreBadgeUrl}
                alt={t("mobile.appStoreDownloadButton")}
                className="h-15 max-w-full"
              />
            </a>
          </div>
          <p className="text-text-secondary text-sm">{t("mobile.cta.free")}</p>
        </div>
      </Card>
    </div>
  );
}
