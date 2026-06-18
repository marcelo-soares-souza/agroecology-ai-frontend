import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  RefreshCw,
  FileText,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { api } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { QueryResult } from "@/components/ui/QueryResult";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { useAppMutation } from "@/hooks/use-app-mutation";

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatElapsedMinutes(startedAt: string, finishedAt: string) {
  const start = new Date(startedAt).getTime();
  const end = new Date(finishedAt).getTime();

  if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
    return null;
  }

  const elapsedMinutes = (end - start) / (1000 * 60);
  return elapsedMinutes.toFixed(1);
}

export function IngestionPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || "en";

  const queryClient = useQueryClient();

  const triggerMutation = useAppMutation({
    mutationFn: () => api.triggerIngestion(false),
    invalidateKeys: [
      ["documents"],
      ["ingestion-status"],
      ["ingestion-runs"],
      ["server-status"],
    ],
    onSuccess: (data) => {
      queryClient.setQueryData(["ingestion-status"], {
        status: data.status,
        phase: data.status,
        chunks_indexed: null,
        chunks_generated: null,
        documents_total: null,
        documents_processed: null,
        error: null,
        run_id: data.run_id,
      });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["ingestion-status"] });
    },
  });

  const forceMutation = useAppMutation({
    mutationFn: () => api.triggerIngestion(true),
    invalidateKeys: [
      ["documents"],
      ["ingestion-status"],
      ["ingestion-runs"],
      ["server-status"],
    ],
    onSuccess: (data) => {
      queryClient.setQueryData(["ingestion-status"], {
        status: data.status,
        phase: data.status,
        chunks_indexed: null,
        chunks_generated: null,
        documents_total: null,
        documents_processed: null,
        error: null,
        run_id: data.run_id,
      });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["ingestion-status"] });
    },
  });

  const { data: ingestStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["ingestion-status"],
    queryFn: api.getIngestionStatus,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === "queued" || data?.status === "processing")
        return 3000;
      return false;
    },
  });

  const { data: serverStatus } = useQuery({
    queryKey: ["server-status"],
    queryFn: api.getStatus,
    refetchInterval: 5000,
    staleTime: 0,
  });

  const pendingDocs = serverStatus?.pending_docs ?? 0;

  useEffect(() => {
    if (ingestStatus?.status === "done") {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    }
  }, [ingestStatus?.status, queryClient]);

  const isProcessing =
    ingestStatus?.status === "queued" ||
    ingestStatus?.status === "processing" ||
    triggerMutation.isPending ||
    forceMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <RefreshCw className="h-6 w-6 text-primary" />
          {t("ingestion.title")}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {t("ingestion.description")}
        </p>
        <p className="mt-2 text-xs text-text-secondary/80">
          {t("ingestion.processHelp")}
        </p>
      </div>

      <Card>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-100">
                <RefreshCw
                  className={`h-7 w-7 text-primary ${isProcessing ? "animate-spin" : ""}`}
                />
              </div>

              <div className="min-w-0">
                <h2 className="text-xl font-semibold text-text-primary">
                  {t("ingestion.title")}
                </h2>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-secondary">
                  <span>{t("ingestion.processHelp")}</span>
                </div>

                {!isProcessing && pendingDocs === 0 && !statusLoading && (
                  <p className="text-success text-sm mt-3">
                    {t("ingestion.allProcessed")}
                  </p>
                )}
                {!isProcessing && pendingDocs > 0 && (
                  <p className="text-text-secondary text-sm mt-3">
                    {t("ingestion.pendingDocuments", { count: pendingDocs })}
                  </p>
                )}
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button
                size="lg"
                className="w-full whitespace-nowrap sm:w-auto"
                onClick={() => triggerMutation.mutate(undefined)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t("ingestion.processing")}
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5" />
                    {t("ingestion.trigger")}
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full whitespace-nowrap sm:w-auto"
                onClick={() => forceMutation.mutate(undefined)}
                disabled={isProcessing}
              >
                {t("ingestion.forceRebuild")}
              </Button>
            </div>
          </div>

          {ingestStatus && ingestStatus.status !== "idle" && !statusLoading && (
            <div className="w-full border-t border-primary-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-sm text-text-secondary">
                  {t("ingestion.status")}
                  <InfoTooltip label={t("ingestion.processHelp")} />
                </span>
                <Badge
                  variant={
                    ingestStatus.status === "done"
                      ? "success"
                      : ingestStatus.status === "error"
                        ? "error"
                        : "warning"
                  }
                >
                  {ingestStatus.status === "queued"
                    ? t("ingestion.queued")
                    : ingestStatus.status === "done"
                      ? t("ingestion.done")
                      : ingestStatus.status === "error"
                        ? t("ingestion.error")
                        : t("ingestion.processing")}
                </Badge>
              </div>
              {ingestStatus.documents_total != null &&
                ingestStatus.documents_total > 0 && (
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-text-secondary">
                      <FileText className="h-4 w-4 inline mr-1" />
                      {t("ingestion.documentsProcessed", {
                        processed: ingestStatus.documents_processed ?? 0,
                        total: ingestStatus.documents_total,
                      })}
                    </span>
                  </div>
                )}
              {ingestStatus.chunks_generated != null &&
                ingestStatus.chunks_generated > 0 && (
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-text-secondary">
                      <FileText className="h-4 w-4 inline mr-1" />
                      {t("ingestion.chunksGenerated", {
                        count: ingestStatus.chunks_generated,
                      })}
                    </span>
                  </div>
                )}
              {ingestStatus.chunks_indexed != null &&
                ingestStatus.chunks_indexed > 0 && (
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-text-secondary">
                      <FileText className="h-4 w-4 inline mr-1" />
                      {t("ingestion.chunksIndexed", {
                        count: ingestStatus.chunks_indexed,
                      })}
                    </span>
                  </div>
                )}
              {ingestStatus.error && (
                <p className="text-error text-sm mt-3">{ingestStatus.error}</p>
              )}
            </div>
          )}

          {triggerMutation.isError && !ingestStatus && (
            <div className="w-full max-w-sm border-t border-error/20 pt-4">
              <Badge variant="error">{t("ingestion.alreadyRunning")}</Badge>
            </div>
          )}
        </div>
      </Card>

      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t("ingestion.history")}
        </h2>

        <QueryResult
          query={useQuery({
            queryKey: ["ingestion-runs"],
            queryFn: api.listIngestionRuns,
            refetchInterval: (query) => {
              const data = query.state.data;
              if (
                data?.some(
                  (r) => r.status === "queued" || r.status === "processing",
                )
              )
                return 3000;
              return false;
            },
          })}
          empty={
            <Card className="text-center py-8">
              <p className="text-text-secondary">
                {t("ingestion.emptyHistory")}
              </p>
            </Card>
          }
        >
          {(runs) => (
            <div className="space-y-2">
              {runs.map((run) => {
                const elapsedMinutes = run.finished_at
                  ? formatElapsedMinutes(run.started_at, run.finished_at)
                  : null;

                const isQueued = run.status === "queued";
                const isDone = run.status === "done";
                const isError = run.status === "error";

                return (
                  <Card key={run.id} padding="sm">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          isDone
                            ? "bg-green-100 text-green-700"
                            : isError
                              ? "bg-error/10 text-error"
                              : isQueued
                                ? "bg-blue-100 text-blue-700"
                                : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : isError ? (
                          <XCircle className="h-4 w-4" />
                        ) : isQueued ? (
                          <Clock className="h-4 w-4" />
                        ) : (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant={
                              isDone
                                ? "success"
                                : isError
                                  ? "error"
                                  : isQueued
                                    ? "info"
                                    : "warning"
                            }
                          >
                            {isDone
                              ? t("ingestion.completed")
                              : isError
                                ? t("ingestion.errorLabel")
                                : isQueued
                                  ? t("ingestion.queuedLabel")
                                  : t("ingestion.processingLabel")}
                          </Badge>
                          {run.documents_total > 0 && (
                            <span className="text-sm text-text-secondary">
                              {run.documents_processed}/{run.documents_total}{" "}
                              {t("ingestion.documents")}
                            </span>
                          )}
                          {run.chunks_generated > 0 && (
                            <span className="text-sm text-text-secondary">
                              {run.chunks_generated} {t("ingestion.chunks")}
                            </span>
                          )}
                          {run.chunks_indexed > 0 && (
                            <span className="text-sm text-text-secondary">
                              {run.chunks_indexed} {t("ingestion.indexed")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-text-secondary flex-wrap">
                          {run.queued_at && (
                            <span>
                              {t("ingestion.queued")}:{" "}
                              {formatDate(run.queued_at, locale)}
                            </span>
                          )}
                          <span>
                            {t("ingestion.started")}:{" "}
                            {formatDate(run.started_at, locale)}
                          </span>
                          {run.finished_at && (
                            <>
                              <span>
                                {t("ingestion.finished")}:{" "}
                                {formatDate(run.finished_at, locale)}
                              </span>
                              {elapsedMinutes && (
                                <span>
                                  {t("ingestion.elapsedMinutes", {
                                    count: Number(elapsedMinutes),
                                    value: elapsedMinutes,
                                  })}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        {run.error && (
                          <p className="text-error text-xs mt-1 truncate">
                            {run.error}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </QueryResult>
      </div>
    </div>
  );
}
