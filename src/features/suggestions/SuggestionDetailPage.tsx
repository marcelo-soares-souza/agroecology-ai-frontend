import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FileText,
  ArrowLeft,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  ExternalLink,
} from "lucide-react";
import { api } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAppMutation } from "@/hooks/use-app-mutation";
import { useAuth } from "@/hooks/use-auth";
import { getSuggestionViewUrl } from "@/config/api";

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

export function SuggestionDetailPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || "en";
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();

  const {
    data: suggestion,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["suggestion", session?.userId, id],
    queryFn: () => api.getSuggestion(id!),
    enabled: !!id,
  });

  const deleteMutation = useAppMutation({
    mutationFn: api.deleteSuggestion,
    invalidateKeys: [["my-suggestions"], ["suggestion"]],
    onSuccess: () => {
      navigate("/suggestions");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !suggestion) {
    return (
      <div className="space-y-4">
        <Link to="/suggestions">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Button>
        </Link>
        <Card className="text-error text-sm">
          {error?.message || t("suggestions.notFound")}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/suggestions">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {suggestion.status === "pending" && (
            <>
              <Link to={`/suggestions/${suggestion.id}/edit`}>
                <Button variant="secondary">
                  <Pencil className="h-4 w-4" />
                  {t("common.edit")}
                </Button>
              </Link>
              <Button
                variant="danger"
                onClick={() => {
                  if (confirm(t("suggestions.deleteConfirm"))) {
                    deleteMutation.mutate(suggestion.id);
                  }
                }}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
                {t("common.delete")}
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <FileText className="h-8 w-8 text-primary mt-0.5" />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-text-primary">
                {suggestion.title ||
                  suggestion.url ||
                  suggestion.original_filename ||
                  t("suggestions.untitled")}
              </h1>
              <Badge
                variant={statusVariant[suggestion.status] || "default"}
                className="mt-2"
              >
                {t(`suggestions.status_${suggestion.status}`)}
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 mt-2">
            {suggestion.authors && (
              <div>
                <span className="text-sm text-text-secondary block">
                  {t("documents.authorsField")}
                </span>
                <span className="text-text-primary">{suggestion.authors}</span>
              </div>
            )}
            {suggestion.url && (
              <div>
                <span className="text-sm text-text-secondary block">
                  {t("suggestions.url")}
                </span>
                <a
                  href={suggestion.url}
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {suggestion.url}
                </a>
              </div>
            )}
            {suggestion.original_filename && (
              <div>
                <span className="text-sm text-text-secondary block">
                  {t("suggestions.file")}
                </span>
                <span className="text-text-primary">
                  {suggestion.original_filename}
                </span>
              </div>
            )}
          </div>

          <div>
            <span className="text-sm text-text-secondary block">
              {t("suggestions.comment")}
            </span>
            <p className="text-text-primary whitespace-pre-wrap">
              {suggestion.user_comment}
            </p>
          </div>

          {suggestion.admin_comment && (
            <div className="border-t border-primary-100 pt-4">
              <span className="text-sm text-text-secondary block font-medium">
                {t("suggestions.adminComment")}
              </span>
              <p className="text-text-primary whitespace-pre-wrap mt-1">
                {suggestion.admin_comment}
              </p>
            </div>
          )}

          {suggestion.original_filename && suggestion.file_type === "pdf" && (
            <Card padding="none" className="overflow-hidden">
              <iframe
                src={getSuggestionViewUrl(suggestion.id)}
                title={suggestion.original_filename}
                className="w-full h-[80vh] border-0"
              />
            </Card>
          )}

          {suggestion.document_id && (
            <div className="border-t border-primary-100 pt-4">
              <a
                href={`/documents/${suggestion.document_id}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="secondary">
                  <ExternalLink className="h-4 w-4" />
                  {t("suggestions.documentLink")}
                </Button>
              </a>
            </div>
          )}

          <div className="border-t border-primary-100 pt-4 mt-2 flex flex-wrap gap-6">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Calendar className="h-4 w-4" />
              {t("suggestions.created")}:{" "}
              {formatDate(suggestion.created_at, locale)}
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Clock className="h-4 w-4" />
              {t("suggestions.updated")}:{" "}
              {formatDate(suggestion.updated_at, locale)}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
