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
import { useAppMutation } from "@/hooks/use-app-mutation";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
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
  const { t } = useTranslation();

  const triggerMutation = useAppMutation({
    mutationFn: () => api.triggerIngestion(false),
    invalidateKeys: [
      ["documents"],
      ["ingestion-status"],
      ["ingestion-runs"],
      ["server-status"],
    ],
  });

  const forceMutation = useAppMutation({
    mutationFn: () => api.triggerIngestion(true),
    invalidateKeys: [
      ["documents"],
      ["ingestion-status"],
      ["ingestion-runs"],
      ["server-status"],
    ],
  });

  const { data: ingestStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["ingestion-status"],
    queryFn: api.getIngestionStatus,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === "processing") return 3000;
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

  const queryClient = useQueryClient();

  useEffect(() => {
    if (ingestStatus?.status === "done") {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    }
  }, [ingestStatus?.status, queryClient]);

  const isProcessing =
    ingestStatus?.status === "processing" ||
    triggerMutation.isPending ||
    forceMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          {t("ingestion.title")}
        </h1>
        <p className="text-sm text-text-secondary mt-2">
          {t("ingestion.description")}
        </p>
      </div>

      <Card>
        <div className="flex flex-col gap-6 items-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
            <RefreshCw
              className={`h-8 w-8 text-primary ${isProcessing ? "animate-spin" : ""}`}
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              {t("ingestion.title")}
            </h2>
            <p className="text-text-secondary mb-6 max-w-md">
              {t("ingestion.trigger")}
            </p>

            <div className="flex gap-3">
              <Button
                size="lg"
                onClick={() => triggerMutation.mutate(undefined)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t("ingestion.processing")}
                  </>
                ) : (
                  t("ingestion.trigger")
                )}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => forceMutation.mutate(undefined)}
                disabled={isProcessing}
              >
                {t("ingestion.forceRebuild")}
              </Button>
            </div>

            {!isProcessing && pendingDocs === 0 && !statusLoading && (
              <p className="text-success text-sm mt-2">
                {t("ingestion.allProcessed")}
              </p>
            )}
            {!isProcessing && pendingDocs > 0 && (
              <p className="text-text-secondary text-sm mt-2">
                {t("ingestion.pendingDocuments", { count: pendingDocs })}
              </p>
            )}
          </div>

          {ingestStatus && ingestStatus.status !== "idle" && !statusLoading && (
            <div className="w-full max-w-sm border-t border-primary-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">
                  {t("ingestion.status")}
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
                  {ingestStatus.status === "done"
                    ? t("ingestion.done")
                    : ingestStatus.status === "error"
                      ? t("ingestion.error")
                      : t("ingestion.processing")}
                </Badge>
              </div>
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

          {triggerMutation.data?.status === "already_running" && (
            <p className="text-warning text-sm">
              {t("ingestion.alreadyRunning")}
            </p>
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
              if (data?.some((r) => r.status === "processing")) return 3000;
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

                return (
                  <Card key={run.id} padding="sm">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          run.status === "done"
                            ? "bg-green-100 text-green-700"
                            : run.status === "error"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {run.status === "done" ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : run.status === "error" ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              run.status === "done"
                                ? "success"
                                : run.status === "error"
                                  ? "error"
                                  : "warning"
                            }
                          >
                            {run.status === "done"
                              ? t("ingestion.completed")
                              : run.status === "error"
                                ? t("ingestion.errorLabel")
                                : t("ingestion.processingLabel")}
                          </Badge>
                          {run.chunks_indexed > 0 && (
                            <span className="text-sm text-text-secondary">
                              {run.chunks_indexed} {t("ingestion.chunks")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-text-secondary">
                          <span>
                            {t("ingestion.started")}:{" "}
                            {formatDate(run.started_at)}
                          </span>
                          {run.finished_at && (
                            <>
                              <span>
                                {t("ingestion.finished")}:{" "}
                                {formatDate(run.finished_at)}
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
