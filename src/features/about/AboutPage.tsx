import { useTranslation } from "react-i18next";
import { Info, Map, Heart, Globe, Users, User, Cpu } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-text-primary">
          {t("about.title")}
        </h1>
        <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-700 rounded-full border border-amber-300">
          BETA
        </span>
      </div>

      <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
        {t("about.betaNotice")}
      </div>

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <Info className="h-6 w-6 text-primary mt-0.5 shrink-0" />
            <h2 className="text-xl font-semibold text-text-primary">
              {t("about.intro")}
            </h2>
          </div>
          <p className="text-text-primary text-base leading-relaxed">
            {t("about.description")}
          </p>
        </div>
      </Card>

      <Card>
        <p className="text-text-primary text-base leading-relaxed">
          {t("about.para1")}
        </p>
      </Card>

      <Card>
        <p className="text-text-primary text-base leading-relaxed">
          {t("about.para2")}
        </p>
      </Card>

      <Card>
        <p className="text-text-primary text-base leading-relaxed">
          {t("about.para3")}
        </p>
      </Card>

      <h2 className="text-xl font-bold text-text-primary flex items-center gap-2 pt-4">
        <Map className="h-5 w-5 text-primary" />
        {t("about.aboutAgroecologyMap")}
      </h2>

      <Card>
        <div className="flex items-start gap-3">
          <Globe className="h-6 w-6 text-primary mt-0.5 shrink-0" />
          <p className="text-text-primary text-base leading-relaxed">
            {t("about.agroecologyMapDescription")}
          </p>
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <Heart className="h-6 w-6 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-text-primary mb-2">
              {t("about.freeSoftware")}
            </h3>
            <p className="text-text-primary text-base leading-relaxed">
              {t("about.freeSoftwareDescription")}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <Users className="h-6 w-6 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-text-primary mb-2">
              {t("about.community")}
            </h3>
            <p className="text-text-primary text-base leading-relaxed">
              {t("about.communityDescription")}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <User className="h-6 w-6 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-text-primary mb-3">
              {t("about.creators")}
            </h3>
            <div className="space-y-2">
              <p>
                <a
                  href="https://agroecologymap.org/accounts/marcelo-soares-souza"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  Marcelo Soares Souza
                </a>
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <Cpu className="h-6 w-6 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-text-primary mb-3">
              {t("about.techStack")}
            </h3>
            <div className="space-y-1 text-text-secondary text-sm">
              <p>{t("about.frontend")}</p>
              <p>{t("about.backend")}</p>
              <p>{t("about.embedding")}</p>
              <p>{t("about.vectorStore")}</p>
              <p>{t("about.llm")}</p>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-100 pt-4 mt-4">
          <p className="text-sm text-text-secondary">{t("about.version")}</p>
        </div>
      </Card>
    </div>
  );
}
