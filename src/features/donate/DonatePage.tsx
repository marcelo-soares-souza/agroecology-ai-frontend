import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import {
  Cpu,
  ExternalLink,
  Globe,
  Heart,
  HeartHandshake,
  History,
  Server,
  Sparkles,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/Card";

const koFiUrl = "https://ko-fi.com/agroecologymap";
const patreonUrl = "https://www.patreon.com/c/agroecologymap";
const raisedUsd = 185;
const campaignGoalUsd = 500;
const goalProgress = (raisedUsd / campaignGoalUsd) * 100;

type Supporter = {
  name: string;
  url?: string;
};

const supporters: Supporter[] = [
  { name: "Aimee Fenech" },
  {
    name: "Michael P. Totten",
    url: "https://independent.academia.edu/MichaelTotten/CurriculumVitae",
  },
  { name: "Sam Rossiter" },
  { name: "Tom Watson" },
  { name: "Dominik Jais" },
  {
    name: "Marcelo Soares Souza",
    url: "https://agroecologymap.org/accounts/marcelo-soares-souza",
  },
];

export function DonatePage(): ReactElement {
  const { t } = useTranslation();

  const donateButtons = (
    <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
      <a
        href={koFiUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-w-0 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary px-6 py-3 text-center text-base font-semibold leading-snug text-white transition-colors hover:bg-primary-dark sm:text-lg"
      >
        {t("donate.howToHelp.koFi")}
      </a>
      <a
        href={patreonUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-w-0 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary px-6 py-3 text-center text-base font-semibold leading-snug text-white transition-colors hover:bg-primary-dark sm:text-lg"
      >
        {t("donate.howToHelp.patreon")}
      </a>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 py-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-text-primary">
        <Heart className="h-6 w-6 text-primary" />
        {t("donate.title")}
      </h1>

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <HeartHandshake className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
            <p className="text-base leading-relaxed text-text-primary">
              {t("donate.intro")}
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {donateButtons}
            <div className="min-w-0 sm:min-w-64">
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-text-primary">
                  {t("donate.goal.label")}
                </span>
                <span className="text-text-secondary">
                  {t("donate.goal.amount", {
                    raised: raisedUsd,
                    goal: campaignGoalUsd,
                  })}
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
          <Sparkles className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
          <div>
            <h2 className="mb-2 font-semibold text-text-primary">
              {t("donate.whatIsTitle")}
            </h2>
            <p className="text-base leading-relaxed text-text-primary">
              {t("donate.whatIs")}
            </p>
          </div>
        </div>
      </Card>

      <h2 className="flex items-center gap-2 pt-1 text-xl font-bold text-text-primary">
        <HeartHandshake className="h-5 w-5 text-primary" />
        {t("donate.supporters.title")}
      </h2>

      <Card>
        <p className="mb-4 text-base leading-relaxed text-text-primary">
          {t("donate.supporters.description")}
        </p>
        <div className="divide-y divide-primary-100 rounded-lg border border-primary-100 bg-primary-50">
          {supporters.map((supporter) => {
            const content = (
              <div className="min-w-0">
                <p className="font-semibold text-text-primary">
                  {supporter.name}
                </p>
                <p className="text-sm text-text-secondary">
                  {t("donate.supporters.role")}
                </p>
              </div>
            );

            return supporter.url ? (
              <a
                key={supporter.name}
                href={supporter.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-primary-100"
              >
                {content}
                <ExternalLink className="h-4 w-4 shrink-0 text-primary" />
              </a>
            ) : (
              <div
                key={supporter.name}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                {content}
              </div>
            );
          })}
        </div>
      </Card>

      <SectionTitle icon={History} title={t("donate.history.title")} />
      <TextCard
        content={t("donate.history.content")}
        body={t("donate.history.body")}
      />

      <SectionTitle icon={Globe} title={t("donate.importance.title")} />
      <TextCard
        content={t("donate.importance.content")}
        body={t("donate.importance.body")}
      />

      <SectionTitle icon={Users} title={t("donate.voluntary.title")} />
      <TextCard
        content={t("donate.voluntary.content")}
        body={t("donate.voluntary.body")}
      />

      <SectionTitle icon={Server} title={t("donate.infrastructure.title")} />
      <TextCard
        content={t("donate.infrastructure.content")}
        body={t("donate.infrastructure.body")}
      />

      <SectionTitle icon={Cpu} title={t("donate.costs.title")} />
      <Card>
        <h3 className="mb-3 font-semibold text-text-primary">
          {t("donate.costs.equipment.title")}
        </h3>
        <BulletList
          items={[
            t("donate.costs.equipment.gpu"),
            t("donate.costs.equipment.memory"),
            t("donate.costs.equipment.storage"),
          ]}
        />
        <p className="text-sm leading-relaxed text-text-secondary">
          {t("donate.costs.equipment.description")}
        </p>

        <h3 className="mb-3 mt-6 font-semibold text-text-primary">
          {t("donate.costs.operational.title")}
        </h3>
        <BulletList
          items={[
            t("donate.costs.operational.domains"),
            t("donate.costs.operational.appStore"),
            t("donate.costs.operational.energy"),
          ]}
        />
        <p className="text-sm leading-relaxed text-text-secondary">
          {t("donate.costs.operational.description")}
        </p>
      </Card>

      <SectionTitle icon={Heart} title={t("donate.howToHelp.title")} />
      <Card>
        <p className="mb-4 text-base leading-relaxed text-text-primary">
          {t("donate.howToHelp.description")}
        </p>
        <div className="flex flex-col items-center gap-5">{donateButtons}</div>
      </Card>

      <Card>
        <div className="flex flex-col items-center gap-4 text-center">
          <Heart className="h-10 w-10 text-primary" />
          <h3 className="text-xl font-bold text-text-primary">
            {t("donate.gratitude.title")}
          </h3>
          <p className="max-w-xl text-base leading-relaxed text-text-primary">
            {t("donate.gratitude.content")}
          </p>
          <p className="text-sm italic text-text-secondary">
            {t("donate.gratitude.closing")}
          </p>
        </div>
      </Card>
    </div>
  );
}

type SectionTitleProps = {
  icon: typeof Heart;
  title: string;
};

function SectionTitle({ icon: Icon, title }: SectionTitleProps): ReactElement {
  return (
    <h2 className="flex items-center gap-2 pt-4 text-xl font-bold text-text-primary">
      <Icon className="h-5 w-5 text-primary" />
      {title}
    </h2>
  );
}

type TextCardProps = {
  content: string;
  body: string;
};

function TextCard({ content, body }: TextCardProps): ReactElement {
  return (
    <Card>
      <div className="space-y-4 text-base leading-relaxed text-text-primary">
        <p>{content}</p>
        <p>{body}</p>
      </div>
    </Card>
  );
}

function BulletList({ items }: { items: string[] }): ReactElement {
  return (
    <div className="mb-4 space-y-3 text-base leading-relaxed text-text-primary">
      {items.map((item) => (
        <div key={item} className="flex items-start gap-2">
          <span className="mt-0.5 font-bold text-primary">•</span>
          <p>{item}</p>
        </div>
      ))}
    </div>
  );
}
