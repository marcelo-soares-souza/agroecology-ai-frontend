import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  Lightbulb,
  Plus,
  FileText,
  Trash2,
  Pencil,
  ExternalLink,
  Search,
} from "lucide-react";
import { api } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { QueryResult } from "@/components/ui/QueryResult";
import { useAppMutation } from "@/hooks/use-app-mutation";
import { useAuth } from "@/hooks/use-auth";

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

export function SuggestionListPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || "en";
  const navigate = useNavigate();
  const { session } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const query = useQuery({
    queryKey: ["my-suggestions", session?.userId, filterStatus],
    queryFn: () => api.listMySuggestions(filterStatus ?? undefined),
  });

  const filteredSuggestions = useMemo(
    () =>
      query.data?.filter((s) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          (s.title ?? "").toLowerCase().includes(q) ||
          (s.url ?? "").toLowerCase().includes(q) ||
          (s.original_filename ?? "").toLowerCase().includes(q)
        );
      }),
    [query.data, searchQuery],
  );

  const deleteMutation = useAppMutation({
    mutationFn: api.deleteSuggestion,
    invalidateKeys: [["my-suggestions"]],
  });

  const statuses = [
    { key: null, label: t("suggestions.all") },
    { key: "pending", label: t("suggestions.status_pending") },
    { key: "approved", label: t("suggestions.status_approved") },
    { key: "rejected", label: t("suggestions.status_rejected") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            {t("suggestions.title")}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {t("suggestions.description")}
          </p>
          {query.data && (
            <p className="text-sm text-text-secondary mt-1">
              {query.data.length} {t("suggestions.total")}
            </p>
          )}
        </div>
        <Button onClick={() => navigate("/suggestions/new")}>
          <Plus className="h-4 w-4" />
          {t("suggestions.new")}
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {statuses.map((s) => (
          <Button
            key={s.key || "all"}
            variant={filterStatus === s.key ? "primary" : "secondary"}
            size="sm"
            onClick={() => setFilterStatus(s.key)}
          >
            {s.label}
          </Button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary/50" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("common.search")}
          className="pl-9"
        />
      </div>

      <QueryResult
        query={query}
        empty={
          <Card className="text-center py-12">
            <FileText className="h-12 w-12 text-text-secondary/40 mx-auto mb-3" />
            <p className="text-text-secondary">{t("suggestions.empty")}</p>
          </Card>
        }
      >
        {() => {
          const suggestions = filteredSuggestions ?? [];
          if (suggestions.length === 0 && (query.data?.length ?? 0) > 0) {
            return (
              <Card className="text-center py-12">
                <Search className="h-12 w-12 text-text-secondary/40 mx-auto mb-3" />
                <p className="text-text-secondary">{t("common.noResults")}</p>
              </Card>
            );
          }
          return (
            <div className="space-y-3">
              {suggestions.map((s) => (
                <div
                  key={s.id}
                  className="block group"
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest("button, a")) return;
                    navigate(`/suggestions/${s.id}`);
                  }}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/suggestions/${s.id}`);
                    }
                  }}
                >
                  <Card
                    padding="sm"
                    className="hover:bg-primary-50/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
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
                          <Badge
                            variant={statusVariant[s.status] || "default"}
                            title={t(`suggestions.statusHelp.${s.status}`)}
                          >
                            {t(`suggestions.status_${s.status}`)}
                          </Badge>
                          {s.original_filename && (
                            <span className="text-xs">
                              {s.original_filename}
                            </span>
                          )}
                          <span>{formatDate(s.created_at, locale)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {s.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/suggestions/${s.id}/edit`);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(t("suggestions.deleteConfirm"))) {
                                  deleteMutation.mutate(s.id);
                                }
                              }}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-error" />
                            </Button>
                          </>
                        )}
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
          );
        }}
      </QueryResult>
    </div>
  );
}
