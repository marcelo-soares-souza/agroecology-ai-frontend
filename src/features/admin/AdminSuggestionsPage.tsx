import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  CheckCheck,
  FileText,
  Lightbulb,
  Search,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { api } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { QueryResult } from "@/components/ui/QueryResult";
import type { DocumentSuggestion } from "@/services/types";

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusVariant: Record<
  string,
  "default" | "success" | "error" | "info" | "warning"
> = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};

export function AdminSuggestionsPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || "en";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [hasPdfFilter, setHasPdfFilter] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionMsg, setActionMsg] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const query = useQuery({
    queryKey: ["admin-suggestions", statusFilter, hasPdfFilter, searchQuery],
    queryFn: () =>
      api.adminListSuggestions({
        status: statusFilter ?? undefined,
        has_pdf: hasPdfFilter ?? undefined,
        q: searchQuery || undefined,
        limit: 100,
      }),
  });

  const approveAllMutation = useMutation({
    mutationFn: () => api.adminApproveAllPendingSuggestions(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-suggestions"],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["documents"],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["my-suggestions"],
        refetchType: "all",
      });

      if (result.total_pending === 0) {
        setActionMsg({
          text: t("admin.approveAllPendingNone"),
          type: "success",
        });
        return;
      }

      setActionMsg({
        text:
          result.failed_count > 0
            ? t("admin.approveAllPendingPartial", {
                approved: result.approved_count,
                failed: result.failed_count,
                total: result.total_pending,
              })
            : t("admin.approveAllPendingSuccess", {
                approved: result.approved_count,
                total: result.total_pending,
              }),
        type: result.failed_count > 0 ? "error" : "success",
      });
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : String(err);
      setActionMsg({ text: msg, type: "error" });
    },
  });

  const handleApproveAllPending = () => {
    if (!confirm(t("admin.approveAllPendingConfirm"))) {
      return;
    }
    setActionMsg(null);
    approveAllMutation.mutate();
  };

  const statuses = [
    { key: null, label: t("suggestions.all") },
    { key: "pending", label: t("suggestions.status_pending") },
    { key: "approved", label: t("suggestions.status_approved") },
    { key: "rejected", label: t("suggestions.status_rejected") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="flex min-w-0 items-center gap-2 text-2xl font-bold text-text-primary">
            <Lightbulb className="h-6 w-6 shrink-0 text-primary" />
            <span className="min-w-0 break-words">
              {t("admin.suggestions")}
            </span>
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {t("admin.suggestionsDescription")}
          </p>
          {query.data && (
            <p className="text-sm text-text-secondary mt-1">
              {query.data.length} {t("suggestions.total")}
            </p>
          )}
        </div>
        <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:items-center sm:justify-end">
          <Button
            variant="success"
            className="w-full sm:w-auto"
            onClick={handleApproveAllPending}
            disabled={approveAllMutation.isPending}
          >
            <CheckCheck className="h-4 w-4" />
            {approveAllMutation.isPending
              ? t("admin.approvingAllPending")
              : t("admin.approveAllPending")}
          </Button>
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => query.refetch()}
            disabled={query.isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 ${query.isFetching ? "animate-spin" : ""}`}
            />
            {t("documents.refresh")}
          </Button>
        </div>
      </div>

      {actionMsg && (
        <Card
          padding="sm"
          className={
            actionMsg.type === "success"
              ? "text-success text-sm"
              : "text-error text-sm"
          }
        >
          {actionMsg.text}
        </Card>
      )}

      <Card padding="sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary/50" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("common.search")}
              className="pl-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {statuses.map((s) => (
              <Button
                key={s.key || "all"}
                variant={statusFilter === s.key ? "primary" : "secondary"}
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => setStatusFilter(s.key)}
              >
                {s.label}
              </Button>
            ))}
          </div>
          <label className="flex min-h-10 items-center gap-2 rounded-[var(--radius-input)] border border-primary-200 bg-surface px-3 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={hasPdfFilter === true}
              onChange={(e) => setHasPdfFilter(e.target.checked ? true : null)}
              className="rounded border-primary-300"
            />
            {t("admin.hasPdf")}
          </label>
        </div>
      </Card>

      <QueryResult
        query={query}
        empty={
          <Card className="text-center py-12">
            <FileText className="h-12 w-12 text-text-secondary/40 mx-auto mb-3" />
            <p className="text-text-secondary">{t("suggestions.empty")}</p>
          </Card>
        }
      >
        {(suggestions: DocumentSuggestion[]) => (
          <div className="space-y-3">
            {suggestions.map((s) => (
              <div
                key={s.id}
                className="block group"
                onClick={() => navigate(`/admin/suggestions/${s.id}`)}
                role="link"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/admin/suggestions/${s.id}`);
                  }
                }}
              >
                <Card
                  padding="sm"
                  className="hover:bg-primary-50/30 transition-colors cursor-pointer"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-medium text-text-primary truncate">
                          {s.title ||
                            s.url ||
                            s.original_filename ||
                            s.id.slice(0, 8)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                        <Badge variant={statusVariant[s.status] || "default"}>
                          {t(`suggestions.status_${s.status}`)}
                        </Badge>
                        <span className="break-all">
                          User: {s.user_name || s.user_id.slice(0, 8)}
                        </span>
                        {s.original_filename && (
                          <Badge variant="info">PDF</Badge>
                        )}
                        <span>{formatDate(s.created_at, locale)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-1 sm:shrink-0">
                      {s.document_id && (
                        <a
                          href={`/documents/${s.document_id}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </QueryResult>
    </div>
  );
}
