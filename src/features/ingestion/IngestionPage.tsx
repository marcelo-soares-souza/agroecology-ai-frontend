import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Skeleton } from "@/components/ui/Skeleton";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function IngestionPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const triggerMutation = useMutation({
    mutationFn: api.triggerIngestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingestion-status"] });
      queryClient.invalidateQueries({ queryKey: ["ingestion-runs"] });
    },
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

  const { data: runs, isLoading: runsLoading } = useQuery({
    queryKey: ["ingestion-runs"],
    queryFn: api.listIngestionRuns,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.some((r) => r.status === "processing")) return 3000;
      return false;
    },
  });

  const isProcessing =
    ingestStatus?.status === "processing" || triggerMutation.isPending;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">
        {t("ingestion.title")}
      </h1>

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

            <Button
              size="lg"
              onClick={() => triggerMutation.mutate()}
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
          Histórico de Execuções
        </h2>

        {runsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : !runs || runs.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-text-secondary">
              Nenhuma indexação registrada ainda.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {runs.map((run) => (
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
                          ? "Concluído"
                          : run.status === "error"
                            ? "Erro"
                            : "Processando"}
                      </Badge>
                      {run.chunks_indexed > 0 && (
                        <span className="text-sm text-text-secondary">
                          {run.chunks_indexed} chunks
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-text-secondary">
                      <span>Início: {formatDate(run.started_at)}</span>
                      {run.finished_at && (
                        <span>Fim: {formatDate(run.finished_at)}</span>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
