import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">
        {t("about.title")}
      </h1>

      <Card>
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-3">
            <Info className="h-6 w-6 text-primary mt-0.5 shrink-0" />
            <p className="text-text-primary text-base leading-relaxed">
              {t("about.description")}
            </p>
          </div>

          <div className="border-t border-primary-100 pt-6">
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {t("about.techStack")}
            </h2>
            <div className="space-y-2 text-text-secondary">
              <p>{t("about.frontend")}</p>
              <p>{t("about.backend")}</p>
            </div>
          </div>

          <div className="border-t border-primary-100 pt-6">
            <p className="text-sm text-text-secondary">{t("about.version")}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
