import { useTranslation } from "react-i18next";
import { Scale } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function TermsOfServicePage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Scale className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-bold text-text-primary">
          {t("termsOfService.title")}
        </h1>
      </div>
      <p className="text-sm text-text-secondary">
        {t("termsOfService.lastUpdated")}
      </p>
      <Card>
        <div className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap space-y-2">
          {t("termsOfService.content")
            .split("\n\n")
            .map((paragraph: string, i: number) => (
              <p key={i}>{paragraph}</p>
            ))}
        </div>
      </Card>
    </div>
  );
}
