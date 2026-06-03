import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { FileText, ArrowLeft, Pencil, Clock, Calendar } from "lucide-react";
import { api } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DocumentDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const { data: doc, isLoading, error } = useQuery({
    queryKey: ["document", id],
    queryFn: () => api.getDocument(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="space-y-4">
        <Link to="/documents">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Button>
        </Link>
        <Card className="text-error">
          {error?.message || t("common.notFound")}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/documents">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Button>
        </Link>
        <Link to={`/documents/${doc.id}/edit`}>
          <Button variant="secondary">
            <Pencil className="h-4 w-4" />
            {t("common.edit")}
          </Button>
        </Link>
      </div>

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <FileText className="h-8 w-8 text-primary mt-0.5" />
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                {doc.title || doc.filename}
              </h1>
              {doc.title && (
                <p className="text-text-secondary text-base mt-1">
                  {doc.filename}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Badge variant="default">{doc.file_type.toUpperCase()}</Badge>
            <Badge variant="info">{formatFileSize(doc.file_size)}</Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 mt-4">
            {doc.authors && (
              <div>
                <span className="text-sm text-text-secondary block">
                  {t("documents.authorsField")}
                </span>
                <span className="text-text-primary">{doc.authors}</span>
              </div>
            )}
            {doc.url && (
              <div>
                <span className="text-sm text-text-secondary block">
                  {t("documents.urlField")}
                </span>
                <a
                  href={doc.url}
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {doc.url}
                </a>
              </div>
            )}
          </div>

          <div className="border-t border-primary-100 pt-4 mt-2 flex flex-wrap gap-6">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Calendar className="h-4 w-4" />
              {t("documents.createdAt")}: {formatDate(doc.created_at)}
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Clock className="h-4 w-4" />
              {formatDate(doc.updated_at)}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
