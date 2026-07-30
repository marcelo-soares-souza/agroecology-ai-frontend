import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  Code2,
  Database,
  ExternalLink,
  FileText,
  Heart,
  MessageCircle,
  Search,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/Card";

const sourceCodeUrl = "https://codeberg.org/agroecologymap";
const infographicUrl = "/rag-infographic.png";

export function RagPage() {
  const { t } = useTranslation();

  const workflowSteps = [
    {
      icon: MessageCircle,
      title: t("rag.workflow.ask.title"),
      description: t("rag.workflow.ask.description"),
    },
    {
      icon: Search,
      title: t("rag.workflow.search.title"),
      description: t("rag.workflow.search.description"),
    },
    {
      icon: FileText,
      title: t("rag.workflow.retrieve.title"),
      description: t("rag.workflow.retrieve.description"),
    },
    {
      icon: Brain,
      title: t("rag.workflow.generate.title"),
      description: t("rag.workflow.generate.description"),
    },
    {
      icon: BookOpen,
      title: t("rag.workflow.sources.title"),
      description: t("rag.workflow.sources.description"),
    },
  ];

  const benefits = [
    {
      icon: ShieldCheck,
      title: t("rag.benefits.transparent.title"),
      description: t("rag.benefits.transparent.description"),
    },
    {
      icon: CheckCircle2,
      title: t("rag.benefits.verifiable.title"),
      description: t("rag.benefits.verifiable.description"),
    },
    {
      icon: Database,
      title: t("rag.benefits.reliable.title"),
      description: t("rag.benefits.reliable.description"),
    },
    {
      icon: Users,
      title: t("rag.benefits.useful.title"),
      description: t("rag.benefits.useful.description"),
    },
  ];

  const knowledgeBaseItems = [
    t("rag.knowledgeBase.technicalGuides"),
    t("rag.knowledgeBase.academicPapers"),
    t("rag.knowledgeBase.communityMaterials"),
    t("rag.knowledgeBase.reports"),
    t("rag.knowledgeBase.manuals"),
    t("rag.knowledgeBase.otherResources"),
  ];

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <a
          href={infographicUrl}
          target="_blank"
          rel="noreferrer"
          className="mx-auto block max-w-6xl overflow-hidden rounded-[var(--radius-card)] border border-primary-100 bg-surface"
        >
          <img
            src={infographicUrl}
            alt={t("rag.infographicAlt")}
            className="h-auto w-full"
          />
        </a>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="flex min-w-0 items-center gap-2 text-2xl font-bold text-text-primary">
              <Database className="h-6 w-6 shrink-0 text-primary" />
              <span className="min-w-0 break-words">{t("rag.title")}</span>
            </h1>
            <p className="max-w-3xl text-base leading-relaxed text-text-primary">
              {t("rag.intro")}
            </p>
          </div>
          <a
            href={infographicUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-button bg-primary-100 px-4 py-2 text-center font-medium leading-tight text-primary-700 transition-colors hover:bg-primary-200 sm:w-auto sm:shrink-0"
          >
            <ExternalLink className="h-4 w-4" />
            {t("rag.openInfographic")}
          </a>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-start gap-3">
            <Brain className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
            <div>
              <h2 className="mb-2 text-lg font-semibold text-text-primary">
                {t("rag.llm.title")}
              </h2>
              <p className="text-base leading-relaxed text-text-primary">
                {t("rag.llm.description")}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            <Search className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
            <div>
              <h2 className="mb-2 text-lg font-semibold text-text-primary">
                {t("rag.rag.title")}
              </h2>
              <p className="text-base leading-relaxed text-text-primary">
                {t("rag.rag.description")}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">
            {t("rag.workflow.title")}
          </h2>
          <p className="mt-2 max-w-3xl text-base leading-relaxed text-text-secondary">
            {t("rag.workflow.description")}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={step.title}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Icon className="h-6 w-6 shrink-0 text-primary" />
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-text-primary">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <h2 className="text-xl font-bold text-text-primary">
            {t("rag.benefits.title")}
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
                  <div>
                    <h3 className="font-semibold text-text-primary">
                      {benefit.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-text-primary">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-text-primary">
            {t("rag.knowledgeBase.title")}
          </h2>
          <p className="mt-2 text-base leading-relaxed text-text-primary">
            {t("rag.knowledgeBase.description")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {knowledgeBaseItems.map((item) => (
              <span
                key={item}
                className="rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700"
              >
                {item}
              </span>
            ))}
          </div>
        </Card>
      </section>

      <Card>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              {t("rag.cta.title")}
            </h2>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-text-primary">
              {t("rag.cta.description")}
            </p>
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-3">
            <Link
              to="/chat"
              className="inline-flex items-center justify-center gap-2 rounded-button bg-primary px-4 py-2 text-center font-medium leading-tight text-white transition-colors hover:bg-primary-dark"
            >
              <MessageCircle className="h-4 w-4" />
              {t("rag.cta.chat")}
            </Link>
            <Link
              to="/documents"
              className="inline-flex items-center justify-center gap-2 rounded-button bg-primary-100 px-4 py-2 text-center font-medium leading-tight text-primary-700 transition-colors hover:bg-primary-200"
            >
              <BookOpen className="h-4 w-4" />
              {t("rag.cta.documents")}
            </Link>
            <Link
              to="/suggestions/new"
              className="inline-flex items-center justify-center gap-2 rounded-button bg-primary-100 px-4 py-2 text-center font-medium leading-tight text-primary-700 transition-colors hover:bg-primary-200"
            >
              <FileText className="h-4 w-4" />
              {t("rag.cta.suggest")}
            </Link>
            <Link
              to="/mobile"
              className="inline-flex items-center justify-center gap-2 rounded-button bg-primary-100 px-4 py-2 text-center font-medium leading-tight text-primary-700 transition-colors hover:bg-primary-200"
            >
              <Smartphone className="h-4 w-4" />
              {t("rag.cta.mobile")}
            </Link>
            <a
              href={sourceCodeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-button bg-primary-100 px-4 py-2 text-center font-medium leading-tight text-primary-700 transition-colors hover:bg-primary-200"
            >
              <Code2 className="h-4 w-4" />
              {t("rag.cta.source")}
            </a>
            <Link
              to="/donate"
              className="inline-flex items-center justify-center gap-2 rounded-button bg-primary-100 px-4 py-2 text-center font-medium leading-tight text-primary-700 transition-colors hover:bg-primary-200"
            >
              <Heart className="h-4 w-4" />
              {t("rag.cta.support")}
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
