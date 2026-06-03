import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, BarChart3, Database, Cpu } from "lucide-react";
import { api } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { QueryResult } from "@/components/ui/QueryResult";

export function StatusPage() {
  const { t } = useTranslation();

  const query = useQuery({
    queryKey: ["server-status"],
    queryFn: api.getStatus,
    refetchInterval: 10000,
  });

  const statusCards = (data: typeof query.data) =>
    [
      {
        icon: <Database className="h-5 w-5" />,
        label: t("status.indexReady"),
        value: data!.index_ready ? t("status.yes") : t("status.no"),
        variant: data!.index_ready ? ("success" as const) : ("error" as const),
      },
      {
        icon: <BarChart3 className="h-5 w-5" />,
        label: t("status.ingestStatus"),
        value: data!.ingest_status,
        variant:
          data!.ingest_status === "done"
            ? ("success" as const)
            : ("warning" as const),
      },
      {
        icon: <Database className="h-5 w-5" />,
        label: t("status.chunksIndexed"),
        value: String(data!.chunks_indexed),
        variant: "info" as const,
      },
      {
        icon: <Cpu className="h-5 w-5" />,
        label: t("status.activeTasks"),
        value: String(data!.active_tasks),
        variant: "info" as const,
      },
      {
        icon: <CheckCircle2 className="h-5 w-5" />,
        label: t("status.cacheEnabled"),
        value: data!.cache_enabled ? t("status.yes") : t("status.no"),
        variant: data!.cache_enabled
          ? ("success" as const)
          : ("error" as const),
      },
      {
        icon: <BarChart3 className="h-5 w-5" />,
        label: t("status.cacheHits"),
        value: String(data!.cache_hits),
        variant: "info" as const,
      },
    ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          {t("status.title")}
        </h1>
        <p className="text-sm text-text-secondary mt-2">
          {t("status.description")}
        </p>
      </div>
      <QueryResult
        query={query}
        skeleton={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded bg-primary-100 animate-pulse mt-0.5" />
                  <div className="flex-1">
                    <div className="h-4 w-20 bg-primary-100 rounded animate-pulse mb-2" />
                    <div className="h-5 w-12 bg-primary-100 rounded animate-pulse" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        }
      >
        {(data) => (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {statusCards(data).map((card) => (
              <Card key={card.label}>
                <div className="flex items-start gap-3">
                  <div className="text-primary mt-0.5">{card.icon}</div>
                  <div>
                    <p className="text-sm text-text-secondary mb-1">
                      {card.label}
                    </p>
                    <Badge variant={card.variant}>{card.value}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </QueryResult>
    </div>
  );
}
