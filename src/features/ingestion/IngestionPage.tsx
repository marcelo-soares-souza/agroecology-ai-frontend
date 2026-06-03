import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, FileText, Loader2 } from "lucide-react";
import { api } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { usePolling } from "@/hooks/use-polling";

export function IngestionPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const triggerMutation = useMutation({
    mutationFn: api.triggerIngestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingestion-status"] });
    },
  });

  const { data, loading } = usePolling({
    fetchFn: api.getIngestionStatus,
    isDone: (d) => d.status === "done" || d.status === "error" || d.status === "idle",
    interval: 3000,
    enabled: triggerMutation.isSuccess,
  });

  const isProcessing =
    data?.status === "processing" || triggerMutation.isPending || loading;

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

          {data && data.status !== "idle" && !loading && (
            <div className="w-full max-w-sm border-t border-primary-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">
                  {t("ingestion.status")}
                </span>
                <Badge
                  variant={
                    data.status === "done"
                      ? "success"
                      : data.status === "error"
                        ? "error"
                        : "warning"
                  }
                >
                  {data.status === "done"
                    ? t("ingestion.done")
                    : data.status === "error"
                      ? t("ingestion.error")
                      : t("ingestion.processing")}
                </Badge>
              </div>
              {data.chunks_indexed != null && (
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-text-secondary">
                    <FileText className="h-4 w-4 inline mr-1" />
                    {t("ingestion.chunksIndexed", {
                      count: data.chunks_indexed,
                    })}
                  </span>
                </div>
              )}
              {data.error && (
                <p className="text-error text-sm mt-3">{data.error}</p>
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
    </div>
  );
}
