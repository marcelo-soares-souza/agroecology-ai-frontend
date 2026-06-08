import { useTranslation } from "react-i18next";
import {
  HeartHandshake,
  History,
  Globe,
  Users,
  Cpu,
  Server,
  Heart,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/Card";

const koFiUrl = "https://ko-fi.com/agroecologymap";
const koFiQrUrl =
  "https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=https%3A%2F%2Fko-fi.com%2Fagroecologymap";
const goalProgress = 0;

export function DonatePage() {
  const { t } = useTranslation();

  const donateButton = (
    <a
      href={koFiUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-button hover:bg-primary-dark transition-colors text-base sm:text-lg"
    >
      {t("donate.howToHelp.koFi")}
    </a>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
        <Heart className="h-6 w-6 text-primary" />
        {t("donate.title")}
      </h1>

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <HeartHandshake className="h-6 w-6 text-primary mt-0.5 shrink-0" />
            <p className="text-text-primary text-base leading-relaxed">
              {t("donate.intro")}
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {donateButton}
            <div className="min-w-0 sm:min-w-64">
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-text-primary">
                  {t("donate.goal.label")}
                </span>
                <span className="text-text-secondary">
                  {t("donate.goal.amount")}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-primary-100">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${goalProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <Sparkles className="h-6 w-6 text-primary mt-0.5 shrink-0" />
          <div>
            <h2 className="font-semibold text-text-primary mb-2">
              {t("donate.whatIsTitle")}
            </h2>
            <p className="text-text-primary text-base leading-relaxed">
              {t("donate.whatIs")}
            </p>
          </div>
        </div>
      </Card>

      <h2 className="text-xl font-bold text-text-primary flex items-center gap-2 pt-4">
        <History className="h-5 w-5 text-primary" />
        {t("donate.history.title")}
      </h2>

      <Card>
        <div className="space-y-4 text-text-primary text-base leading-relaxed">
          <p>{t("donate.history.content")}</p>
          <p>{t("donate.history.body")}</p>
        </div>
      </Card>

      <h2 className="text-xl font-bold text-text-primary flex items-center gap-2 pt-4">
        <Globe className="h-5 w-5 text-primary" />
        {t("donate.importance.title")}
      </h2>

      <Card>
        <div className="space-y-4 text-text-primary text-base leading-relaxed">
          <p>{t("donate.importance.content")}</p>
          <p>{t("donate.importance.body")}</p>
        </div>
      </Card>

      <h2 className="text-xl font-bold text-text-primary flex items-center gap-2 pt-4">
        <Users className="h-5 w-5 text-primary" />
        {t("donate.voluntary.title")}
      </h2>

      <Card>
        <div className="space-y-4 text-text-primary text-base leading-relaxed">
          <p>{t("donate.voluntary.content")}</p>
          <p>{t("donate.voluntary.body")}</p>
        </div>
      </Card>

      <h2 className="text-xl font-bold text-text-primary flex items-center gap-2 pt-4">
        <Cpu className="h-5 w-5 text-primary" />
        {t("donate.aiNeeds.title")}
      </h2>

      <Card>
        <div className="space-y-4 text-text-primary text-base leading-relaxed">
          <p>{t("donate.aiNeeds.content")}</p>
          <p>{t("donate.aiNeeds.body")}</p>
        </div>
      </Card>

      <h2 className="text-xl font-bold text-text-primary flex items-center gap-2 pt-4">
        <Server className="h-5 w-5 text-primary" />
        {t("donate.costs.title")}
      </h2>

      <Card>
        <div className="flex items-start gap-3">
          <Cpu className="h-6 w-6 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-text-primary mb-3">
              {t("donate.costs.equipment.title")}
            </h3>
            <div className="space-y-3 text-text-primary text-base leading-relaxed mb-4">
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                <p>{t("donate.costs.equipment.gpu")}</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                <p>{t("donate.costs.equipment.memory")}</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                <p>{t("donate.costs.equipment.storage")}</p>
              </div>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              {t("donate.costs.equipment.description")}
            </p>
          </div>
        </div>
      </Card>

      <h2 className="text-xl font-bold text-text-primary flex items-center gap-2 pt-4">
        <Heart className="h-5 w-5 text-primary" />
        {t("donate.howToHelp.title")}
      </h2>

      <Card>
        <p className="text-text-primary text-base leading-relaxed mb-4">
          {t("donate.howToHelp.description")}
        </p>
        <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
          {donateButton}
          <div className="flex flex-col items-center gap-2">
            <img
              src={koFiQrUrl}
              alt={t("donate.howToHelp.qrAlt")}
              className="h-36 w-36 rounded-lg border border-border bg-white p-2"
              loading="lazy"
            />
            <p className="text-xs text-text-secondary">
              {t("donate.howToHelp.qrLabel")}
            </p>
          </div>
        </div>
        <p className="text-text-secondary text-sm mt-4">
          {t("donate.howToHelp.other")}
        </p>
      </Card>

      <h2 className="text-xl font-bold text-text-primary flex items-center gap-2 pt-4">
        <HeartHandshake className="h-5 w-5 text-primary" />
        {t("donate.supporters.title")}
      </h2>

      <Card>
        <p className="text-text-primary text-base leading-relaxed mb-4">
          {t("donate.supporters.description")}
        </p>
        <div className="divide-y divide-border rounded-lg border border-border">
          <a
            href="https://agroecologymap.org/en/accounts/marcelo-soares-souza"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface transition-colors"
          >
            <div>
              <p className="font-semibold text-text-primary">
                Marcelo Soares Souza
              </p>
              <p className="text-sm text-text-secondary">
                {t("donate.supporters.role")}
              </p>
            </div>
            <ExternalLink className="h-4 w-4 text-primary shrink-0" />
          </a>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4 items-center text-center">
          <Heart className="h-10 w-10 text-primary" />
          <h3 className="text-xl font-bold text-text-primary">
            {t("donate.gratitude.title")}
          </h3>
          <p className="text-text-primary text-base leading-relaxed max-w-xl">
            {t("donate.gratitude.content")}
          </p>
          <p className="text-text-secondary text-sm italic">
            {t("donate.gratitude.closing")}
          </p>
        </div>
      </Card>
    </div>
  );
}
