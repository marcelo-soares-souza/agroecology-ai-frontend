import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import {
  Info,
  Heart,
  Users,
  User,
  Cpu,
  BookOpen,
  ShieldCheck,
  Code2,
  ExternalLink,
  Lightbulb,
  Send,
} from "lucide-react";
import { Card } from "@/components/ui/Card";

export function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="flex min-w-0 items-center gap-2 text-2xl font-bold text-text-primary">
          <Info className="h-6 w-6 shrink-0 text-primary" />
          <span className="min-w-0 break-words">{t("about.title")}</span>
        </h1>
        <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-700 rounded-full border border-amber-300">
          {t("about.betaBadge")}
        </span>
      </div>

      <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
        {t("about.betaNotice")}
      </div>

      <Card>
        <div className="space-y-4 text-text-primary text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-text-primary">
            {t("about.intro")}
          </h2>
          <p>{t("about.description")}</p>
          <p>{t("about.ragDescription")}</p>
          <p>{t("about.para1")}</p>
          <p>{t("about.para2")}</p>
          <p>{t("about.agroecologyMapDescription")}</p>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-6 w-6 text-primary mt-0.5 shrink-0" />
            <div>
              <h2 className="font-semibold text-text-primary mb-2">
                {t("about.privacyCommitmentTitle")}
              </h2>
              <p className="text-text-primary text-base leading-relaxed">
                {t("about.privacyCommitmentDescription")}
              </p>
            </div>
          </div>
          <Link
            to="/privacy"
            className="inline-flex w-full items-center justify-center rounded-button bg-primary-100 px-4 py-2 text-center font-medium leading-tight text-primary-700 transition-colors hover:bg-primary-200 sm:w-auto sm:shrink-0"
          >
            {t("about.privacyCommitmentCta")}
          </Link>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <BookOpen className="h-6 w-6 text-primary mt-0.5 shrink-0" />
            <div>
              <h2 className="font-semibold text-text-primary mb-2">
                {t("about.knowledgeBaseTitle")}
              </h2>
              <p className="text-text-primary text-base leading-relaxed">
                {t("about.knowledgeBaseDescription")}
              </p>
            </div>
          </div>
          <Link
            to="/documents"
            className="inline-flex w-full items-center justify-center rounded-button bg-primary-100 px-4 py-2 text-center font-medium leading-tight text-primary-700 transition-colors hover:bg-primary-200 sm:w-auto sm:shrink-0"
          >
            {t("about.ctaDocuments")}
          </Link>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-6 w-6 text-primary mt-0.5 shrink-0" />
            <div>
              <h2 className="font-semibold text-text-primary mb-2">
                {t("about.suggestInviteTitle")}
              </h2>
              <p className="text-text-primary text-base leading-relaxed">
                {t("about.suggestInviteDescription")}
              </p>
            </div>
          </div>
          <Link
            to="/suggestions/new"
            className="inline-flex w-full items-center justify-center rounded-button bg-primary px-4 py-2 text-center font-medium leading-tight text-white transition-colors hover:bg-primary-dark sm:w-auto sm:shrink-0"
          >
            <Send className="mr-2 h-4 w-4 shrink-0" />
            {t("about.suggestInviteCta")}
          </Link>
        </div>
      </Card>

      <h2 className="text-xl font-bold text-text-primary flex items-center gap-2 pt-4">
        <ShieldCheck className="h-5 w-5 text-primary" />
        {t("about.principles")}
      </h2>

      <Card>
        <div className="grid gap-6 md:grid-cols-2">
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
          <div className="flex items-start gap-3">
            <BookOpen className="h-6 w-6 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-text-primary mb-2">
                {t("about.sourceKnowledge")}
              </h3>
              <p className="text-text-primary text-base leading-relaxed">
                {t("about.sourceKnowledgeDescription")}
              </p>
            </div>
          </div>
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
          <div className="flex items-start gap-3">
            <Cpu className="h-6 w-6 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-text-primary mb-2">
                {t("about.localFirst")}
              </h3>
              <p className="text-text-primary text-base leading-relaxed">
                {t("about.para3")}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <User className="h-6 w-6 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-text-primary mb-2">
              {t("about.creators")}
            </h3>
            <p className="text-text-primary text-base leading-relaxed">
              {t("about.creatorsDescription")}
            </p>
            <div className="mt-3 space-y-2">
              <div>
                <a
                  href="https://agroecologymap.org/en/accounts/marcelo-soares-souza"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  Marcelo Soares Souza
                </a>
              </div>
              <div>
                <a
                  href="https://agroecologymap.org/accounts/eduardo-fernandes-formighieri"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  Eduardo Fernandes Formighieri, Ph.D.
                </a>
              </div>
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
              <p>{t("about.mobile")}</p>
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

      <Card>
        <div className="flex items-start gap-3">
          <Code2 className="h-6 w-6 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-text-primary mb-3">
              {t("about.repositories")}
            </h3>
            <div className="space-y-2">
              <a
                href="https://codeberg.org/agroecologymap"
                target="_blank"
                rel="noreferrer"
                className="inline-flex max-w-full items-center gap-1.5 break-words font-medium text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4 shrink-0" />
                {t("about.sourceCodeRepo")}
              </a>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              {t("about.ctaTitle")}
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              {t("about.ctaDescription")}
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              to="/"
              className="inline-flex w-full items-center justify-center rounded-button bg-primary px-4 py-2 text-center font-medium leading-tight text-white transition-colors hover:bg-primary-dark sm:w-auto"
            >
              {t("about.ctaChat")}
            </Link>
            <Link
              to="/donate"
              className="inline-flex w-full items-center justify-center rounded-button bg-primary-100 px-4 py-2 text-center font-medium leading-tight text-primary-700 transition-colors hover:bg-primary-200 sm:w-auto"
            >
              {t("about.ctaDonate")}
            </Link>
            <Link
              to="/documents"
              className="inline-flex w-full items-center justify-center rounded-button bg-primary-100 px-4 py-2 text-center font-medium leading-tight text-primary-700 transition-colors hover:bg-primary-200 sm:w-auto"
            >
              {t("about.ctaDocuments")}
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
