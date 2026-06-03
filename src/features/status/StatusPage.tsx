import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, BarChart3, Database, Cpu } from "lucide-react";
import { api } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";

export function StatusPage() {
  const { t } = useTranslation();

  const { data, isLoading, error } = useQuery({
    queryKey: ["server-status"],
    queryFn: api.getStatus,
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-text-primary">
          {t("status.title")}
        </h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-text-primary">
          {t("status.title")}
        </h1>
        <Card className="text-error">
          {error?.message || t("common.error")}
        </Card>
      </div>
    );
  }

  const statusCards = [
    {
      icon: <Database className="h-5 w-5" />,
      label: t("status.indexReady"),
      value: data.index_ready ? t("status.yes") : t("status.no"),
      variant: data.index_ready ? "success" : "error",
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: t("status.ingestStatus"),
      value: data.ingest_status,
      variant: data.ingest_status === "done" ? "success" : "warning",
    },
    {
      icon: <Database className="h-5 w-5" />,
      label: t("status.chunksIndexed"),
      value: String(data.chunks_indexed),
      variant: "info",
    },
    {
      icon: <Cpu className="h-5 w-5" />,
      label: t("status.activeTasks"),
      value: String(data.active_tasks),
      variant: "info",
    },
    {
      icon: <CheckCircle2 className="h-5 w-5" />,
      label: t("status.cacheEnabled"),
      value: data.cache_enabled ? t("status.yes") : t("status.no"),
      variant: data.cache_enabled ? "success" : "error",
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: t("status.cacheHits"),
      value: String(data.cache_hits),
      variant: "info",
    },
  ] as const;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">
        {t("status.title")}
      </h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statusCards.map((card) => (
          <Card key={card.label}>
            <div className="flex items-start gap-3">
              <div className="text-primary mt-0.5">{card.icon}</div>
              <div>
                <p className="text-sm text-text-secondary mb-1">{card.label}</p>
                <Badge variant={card.variant}>{card.value}</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
