import { useTranslation } from "react-i18next";
import { Shield, FileText } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function PrivacyPolicyPage() {
  const { t } = useTranslation();

  const sections = [
    "intro",
    "dataController",
    "whatWeCollect",
    "automaticallyCollected",
    "whatWeDontCollect",
    "purpose",
    "dataStorage",
    "dataSharing",
    "dataRetention",
    "userRights",
    "rightToBeForgotten",
    "appStoreCompliance",
    "contact",
    "updates",
  ] as const;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-bold text-text-primary">
          {t("privacyPolicy.title")}
        </h1>
      </div>
      <p className="text-sm text-text-secondary">
        {t("privacyPolicy.lastUpdated")}
      </p>

      {sections.map((section) => {
        const title = t(`privacyPolicy.sections.${section}.title`);
        const content = t(`privacyPolicy.sections.${section}.content`);

        if (!title || title === `privacyPolicy.sections.${section}.title`) {
          return null;
        }

        return (
          <Card key={section}>
            <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {title}
            </h2>
            <div className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap space-y-2">
              {content.split("\n\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
