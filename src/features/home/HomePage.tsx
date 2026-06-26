import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { ChatPage } from "@/features/home/ChatPage";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { Lightbulb, MessageCircle, Database, Smartphone } from "lucide-react";

const playStoreUrl =
  "https://play.google.com/store/apps/details?id=org.agroecologymap.agroecology_map_ai&pcampaignid=web_share";
const appStoreUrl =
  "https://apps.apple.com/br/app/agroecology-map-ai/id6779950543";
const playStoreBadgeUrl = "/google-play-badge.png";
const appStoreBadgeUrl = "/app-store-badge.svg";

export function HomePage() {
  const { t } = useTranslation();
  const { isAuthenticated, hasRestoredSession } = useAuth();

  if (!hasRestoredSession) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <ChatPage />;
  }

  return (
    <div className="space-y-3 py-2">
      {/* Hero */}
      <div className="flex flex-col items-center text-center px-4">
        <img src="/logo.png" alt={t("app.name")} className="h-28 w-28 mb-8" />
        <div className="mb-4 flex flex-col items-center gap-3 sm:flex-row">
          <h1 className="flex min-w-0 items-center gap-3 text-center text-4xl font-bold text-text-primary">
            <MessageCircle className="h-8 w-8 shrink-0 text-primary" />
            <span className="min-w-0 break-words">{t("app.name")}</span>
          </h1>
          <span className="px-3 py-1 text-sm font-bold bg-amber-100 text-amber-700 rounded-full border border-amber-300">
            BETA
          </span>
        </div>
        <p className="text-lg text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-6 max-w-xl">
          {t("app.betaDescription")}
        </p>
        <p className="text-xl text-text-secondary max-w-2xl mb-4">
          {t("landing.heroDescription")}
        </p>
        <p className="text-sm text-text-secondary/70 mb-8">
          {t("landing.accessNotice")}
        </p>
        <div className="flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
          <Link to="/register" className="w-full sm:w-auto">
            <button className="w-full rounded-xl bg-primary px-8 py-3 text-center text-lg font-semibold leading-tight text-white transition-colors hover:bg-primary-dark">
              {t("landing.getStarted")}
            </button>
          </Link>
          <Link to="/chat" className="w-full sm:w-auto">
            <button className="w-full rounded-xl border-2 border-primary px-8 py-3 text-center text-lg font-semibold leading-tight text-primary transition-colors hover:bg-primary-50">
              {t("landing.startConversation")}
            </button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid gap-6 md:grid-cols-3 px-4 max-w-6xl mx-auto">
        <Card>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
              <Lightbulb className="h-6 w-6 text-amber-600" />
            </div>
            <div className="flex min-w-0 flex-col items-center justify-center gap-2">
              <div className="flex min-w-0 items-center justify-center gap-2">
                <h3 className="min-w-0 font-semibold text-text-primary">
                  {t("landing.features.suggest.title")}
                </h3>
                <InfoTooltip
                  label={t("landing.features.suggest.description")}
                />
              </div>
              <Badge variant="success" className="shrink-0 text-[10px]">
                {t("landing.allUsers")}
              </Badge>
            </div>
            <p className="text-sm text-text-secondary">
              {t("landing.features.suggest.description")}
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
              <MessageCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex min-w-0 flex-col items-center justify-center gap-2">
              <div className="flex min-w-0 items-center justify-center gap-2">
                <h3 className="min-w-0 font-semibold text-text-primary">
                  {t("landing.features.ask.title")}
                </h3>
                <InfoTooltip label={t("landing.features.ask.description")} />
              </div>
              <Badge variant="success" className="shrink-0 text-[10px]">
                {t("landing.allUsers")}
              </Badge>
            </div>
            <p className="text-sm text-text-secondary">
              {t("landing.features.ask.description")}
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div className="flex min-w-0 flex-col items-center justify-center gap-2">
              <div className="flex min-w-0 items-center justify-center gap-2">
                <h3 className="min-w-0 font-semibold text-text-primary">
                  {t("landing.features.ingest.title")}
                </h3>
                <InfoTooltip label={t("landing.features.ingest.description")} />
              </div>
              <Badge variant="warning" className="shrink-0 text-[10px]">
                {t("admin.section")}
              </Badge>
            </div>
            <p className="text-sm text-text-secondary">
              {t("landing.features.ingest.description")}
            </p>
          </div>
        </Card>
      </div>

      {/* Tech */}
      {/* <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          {t("landing.techTitle")}
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-left">
                <h3 className="font-semibold text-text-primary mb-1">
                  {t("landing.tech.data.title")}
                </h3>
                <p className="text-sm text-text-secondary">
                  {t("landing.tech.data.description")}
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-start gap-3">
              <Cpu className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-left">
                <h3 className="font-semibold text-text-primary mb-1">
                  {t("landing.tech.backends.title")}
                </h3>
                <p className="text-sm text-text-secondary">
                  {t("landing.tech.backends.description")}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div> */}

      {/* Mobile App */}
      <div className="max-w-md mx-auto px-4 text-center">
        <Card>
          <div className="flex flex-col items-center gap-3">
            <Smartphone className="h-8 w-8 text-primary" />
            <h3 className="font-semibold text-text-primary">
              {t("mobile.title")}
            </h3>
            <p className="text-sm text-text-secondary">
              {t("mobile.cta.description")}
            </p>
            <div className="flex flex-col items-center justify-center gap-5">
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
                  className="h-16 max-w-full"
                />
              </a>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center px-4">
        <p className="text-sm text-text-secondary">
          {t("landing.footerPrefix")}{" "}
          <a
            href="https://agroecologymap.org"
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            Agroecology Map
          </a>
        </p>
      </div>
    </div>
  );
}
