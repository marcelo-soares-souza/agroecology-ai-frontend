import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  CheckCircle2,
  BarChart3,
  Database,
  Cpu,
  FileText,
  CheckCircle,
  Clock,
  SlidersHorizontal,
} from "lucide-react";
import { api } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { QueryResult } from "@/components/ui/QueryResult";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

export function StatusPage() {
  const { t } = useTranslation();

  const query = useQuery({
    queryKey: ["server-status"],
    queryFn: api.getStatus,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
  });

  const statusCards = (data: typeof query.data) =>
    [
      {
        icon: <Database className="h-5 w-5" />,
        label: t("status.indexReady"),
        tooltip: t("status.help.indexReady"),
        value: data!.index_ready ? t("status.yes") : t("status.no"),
        variant: data!.index_ready ? ("success" as const) : ("error" as const),
      },
      {
        icon: <BarChart3 className="h-5 w-5" />,
        label: t("status.ingestStatus"),
        tooltip: t("status.help.ingestStatus"),
        value: data!.ingest_status,
        variant:
          data!.ingest_status === "done"
            ? ("success" as const)
            : ("warning" as const),
      },
      {
        icon: <Database className="h-5 w-5" />,
        label: t("status.chunksIndexed"),
        tooltip: t("status.help.chunksIndexed"),
        value: String(data!.chunks_indexed),
        variant: "info" as const,
      },
      {
        icon: <Cpu className="h-5 w-5" />,
        label: t("status.activeTasks"),
        tooltip: t("status.help.activeTasks"),
        value: String(data!.active_tasks),
        variant: "info" as const,
      },
      {
        icon: <CheckCircle2 className="h-5 w-5" />,
        label: t("status.cacheEnabled"),
        tooltip: t("status.help.cacheEnabled"),
        value: data!.cache_enabled ? t("status.yes") : t("status.no"),
        variant: data!.cache_enabled
          ? ("success" as const)
          : ("error" as const),
      },
      {
        icon: <BarChart3 className="h-5 w-5" />,
        label: t("status.cacheHits"),
        tooltip: t("status.help.cacheHits"),
        value: String(data!.cache_hits),
        variant: "info" as const,
      },
    ] as const;

  const ragRows = (data: NonNullable<typeof query.data>) =>
    [
      {
        label: t("status.llmModel"),
        tooltip: t("status.help.llmModel"),
        value: data.llm_model,
      },
      {
        label: t("status.llmProvider"),
        tooltip: t("status.help.llmProvider"),
        value: data.llm_provider,
      },
      {
        label: t("status.llmTransport"),
        tooltip: t("status.help.llmTransport"),
        value: data.llm_transport,
      },
      {
        label: t("status.reasoningMode"),
        tooltip: t("status.help.reasoningMode"),
        value: data.llm_think_enabled
          ? t("status.reasoningEnabled")
          : t("status.reasoningDisabled"),
      },
      {
        label: t("status.embeddingModel"),
        tooltip: t("status.help.embeddingModel"),
        value: data.embedding_model,
      },
      {
        label: t("status.embeddingDevice"),
        tooltip: t("status.help.embeddingDevice"),
        value: data.embedding_device,
      },
      {
        label: t("status.similarityTopK"),
        tooltip: t("status.help.similarityTopK"),
        value: String(data.similarity_top_k),
      },
      {
        label: t("status.bm25TopK"),
        tooltip: t("status.help.bm25TopK"),
        value: String(data.bm25_top_k),
      },
      {
        label: t("status.hybridTopK"),
        tooltip: t("status.help.hybridTopK"),
        value: String(data.hybrid_top_k),
      },
      {
        label: t("status.rerankTopK"),
        tooltip: t("status.help.rerankTopK"),
        value: String(data.rerank_top_k),
      },
      {
        label: t("status.rerankerModel"),
        tooltip: t("status.help.rerankerModel"),
        value: data.reranker_model ?? t("status.disabled"),
      },
      {
        label: t("status.rerankerDevice"),
        tooltip: t("status.help.rerankerDevice"),
        value: data.reranker_device ?? t("status.disabled"),
      },
    ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex min-w-0 items-center gap-2 text-2xl font-bold text-text-primary">
          <Activity className="h-6 w-6 shrink-0 text-primary" />
          <span className="min-w-0 break-words">{t("status.title")}</span>
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {t("status.description")}
        </p>
      </div>
      <QueryResult
        query={query}
        skeleton={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
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
                  <div className="min-w-0">
                    <div className="mb-1 flex min-w-0 items-center gap-1.5">
                      <p className="min-w-0 break-words text-sm text-text-secondary">
                        {card.label}
                      </p>
                      <InfoTooltip label={card.tooltip} />
                    </div>
                    <Badge variant={card.variant}>{card.value}</Badge>
                  </div>
                </div>
              </Card>
            ))}
            <Card>
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-1.5">
                    <p className="text-sm text-text-secondary">
                      {t("status.documents")}
                    </p>
                    <InfoTooltip label={t("status.help.documents")} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex min-w-0 items-center gap-1.5 text-text-secondary">
                        <CheckCircle className="h-3.5 w-3.5 shrink-0 text-green-500" />
                        {t("status.indexedDocs")}
                      </span>
                      <span className="shrink-0 font-semibold text-text-primary">
                        {data.indexed_docs}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex min-w-0 items-center gap-1.5 text-text-secondary">
                        <Clock className="h-3.5 w-3.5 shrink-0 text-yellow-500" />
                        {t("status.pendingDocs")}
                      </span>
                      <span className="shrink-0 font-semibold text-text-primary">
                        {data.pending_docs}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3 border-t border-primary-100 pt-2 text-sm">
                      <span className="min-w-0 break-words text-text-secondary">
                        {t("status.totalDocs")}
                      </span>
                      <span className="shrink-0 font-semibold text-text-primary">
                        {data.total_docs}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            <Card className="md:col-span-2 lg:col-span-3">
              <div className="flex items-start gap-3">
                <SlidersHorizontal className="h-5 w-5 text-primary mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <p className="min-w-0 break-words text-sm text-text-secondary">
                        {t("status.ragConfig")}
                      </p>
                      <InfoTooltip label={t("status.help.ragConfig")} />
                    </div>
                    <Badge
                      variant={
                        data.reranker_enabled
                          ? ("success" as const)
                          : ("warning" as const)
                      }
                    >
                      {data.reranker_enabled
                        ? t("status.rerankerEnabled")
                        : t("status.rerankerDisabled")}
                    </Badge>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    {ragRows(data).map((row) => (
                      <div
                        key={row.label}
                        className="min-w-0 rounded-md border border-primary-100 bg-surface px-3 py-2"
                      >
                        <div className="mb-1 flex min-w-0 items-center gap-1.5">
                          <p className="min-w-0 break-words text-xs font-medium text-text-secondary">
                            {row.label}
                          </p>
                          <InfoTooltip label={row.tooltip} />
                        </div>
                        <p className="break-words text-sm font-semibold text-text-primary">
                          {row.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </QueryResult>
    </div>
  );
}
