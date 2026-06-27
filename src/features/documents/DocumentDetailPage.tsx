import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import {
  FileText,
  ArrowLeft,
  Pencil,
  Clock,
  Calendar,
  Download,
  Sparkles,
  Loader2,
  User,
  Database,
  ExternalLink,
} from "lucide-react";
import { api, ApiError } from "@/services/api";
import { getDownloadUrl, getViewUrl } from "@/config/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/hooks/use-auth";
import type { DocumentAcademicMetadata } from "@/services/types";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPercent(value: number | null) {
  if (value === null) return null;
  return `${Math.round(value * 100)}%`;
}

function metadataListLabels(
  value:
    Array<Record<string, unknown>> | Record<string, unknown> | null | undefined,
): string[] {
  if (!value) return [];
  const items = Array.isArray(value) ? value : [value];
  return items
    .map((item) => {
      const label =
        item.display_name ||
        item.name ||
        item["award"] ||
        item.URL ||
        item.url ||
        item.DOI;
      return typeof label === "string" ? label : null;
    })
    .filter((label): label is string => Boolean(label))
    .slice(0, 6);
}

function AcademicMetadataDetails({
  metadata,
}: {
  metadata: DocumentAcademicMetadata;
}) {
  const { t } = useTranslation();
  const topics = metadataListLabels(metadata.topics);
  const keywords = metadataListLabels(metadata.keywords);
  const licenses = metadataListLabels(metadata.license);
  const funders = metadataListLabels(metadata.funder);
  const confidence = formatPercent(metadata.match_confidence);

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex min-w-0 items-center gap-2 text-lg font-semibold text-text-primary">
            <Database className="h-5 w-5 text-primary" />
            <span className="min-w-0 break-words">
              {t("documents.academicMetadataTitle")}
            </span>
          </h2>
          <Badge variant="info" className="w-fit">
            {metadata.provider}
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metadata.doi && (
            <MetadataField
              label={t("documents.doiField")}
              value={metadata.doi}
            />
          )}
          {metadata.publication_year && (
            <MetadataField
              label={t("documents.publicationYear")}
              value={String(metadata.publication_year)}
            />
          )}
          {metadata.citation_count !== null && (
            <MetadataField
              label={t("documents.citations")}
              value={String(metadata.citation_count)}
            />
          )}
          {metadata.reference_count !== null && (
            <MetadataField
              label={t("documents.references")}
              value={String(metadata.reference_count)}
            />
          )}
          {metadata.venue && (
            <MetadataField
              label={t("documents.venue")}
              value={metadata.venue}
            />
          )}
          {metadata.publisher && (
            <MetadataField
              label={t("documents.publisher")}
              value={metadata.publisher}
            />
          )}
          {confidence && (
            <MetadataField
              label={t("documents.matchConfidence")}
              value={confidence}
            />
          )}
        </div>

        {(metadata.source_url || metadata.open_access_url) && (
          <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
            {metadata.source_url && (
              <a
                href={metadata.source_url}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto"
              >
                <Button variant="secondary" size="sm" className="w-full">
                  <ExternalLink className="h-4 w-4" />
                  {t("documents.sourceUrl")}
                </Button>
              </a>
            )}
            {metadata.open_access_url && (
              <a
                href={metadata.open_access_url}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto"
              >
                <Button variant="secondary" size="sm" className="w-full">
                  <ExternalLink className="h-4 w-4" />
                  {t("documents.openAccessUrl")}
                </Button>
              </a>
            )}
          </div>
        )}

        {metadata.abstract && (
          <div>
            <span className="text-sm text-text-secondary block mb-1">
              {t("documents.abstract")}
            </span>
            <p className="text-sm text-text-primary leading-relaxed">
              {metadata.abstract}
            </p>
          </div>
        )}

        <MetadataTags label={t("documents.topics")} values={topics} />
        <MetadataTags label={t("documents.keywords")} values={keywords} />
        <MetadataTags label={t("documents.license")} values={licenses} />
        <MetadataTags label={t("documents.funder")} values={funders} />
      </div>
    </Card>
  );
}

function MetadataField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-sm text-text-secondary block">{label}</span>
      <span className="text-text-primary break-words">{value}</span>
    </div>
  );
}

function MetadataTags({ label, values }: { label: string; values: string[] }) {
  if (values.length === 0) return null;
  return (
    <div>
      <span className="text-sm text-text-secondary block mb-2">{label}</span>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <Badge key={value} variant="default">
            {value}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export function DocumentDetailPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || "en";
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const [academicRunId, setAcademicRunId] = useState<string | null>(null);

  const {
    data: doc,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["document", id],
    queryFn: () => api.getDocument(id!),
    enabled: !!id,
  });

  const academicRunStatusQuery = useQuery({
    queryKey: ["documents", "academic-metadata-run", academicRunId],
    queryFn: () => api.getAcademicMetadataRun(academicRunId!),
    enabled: isAdmin && Boolean(academicRunId),
    refetchInterval: (statusQuery) => {
      const data = statusQuery.state.data;
      if (data?.status === "queued" || data?.status === "processing") {
        return 5000;
      }
      return false;
    },
  });

  const extractMutation = useMutation({
    mutationFn: () => api.extractMetadata(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", id] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  const extractAcademicMutation = useMutation({
    mutationFn: () => api.extractDocumentAcademicMetadata(id!, { force: true }),
    onSuccess: (data) => {
      setAcademicRunId(data.run_id);
      queryClient.invalidateQueries({
        queryKey: ["documents", "academic-metadata-status"],
      });
    },
  });

  const academicRunStatus = academicRunStatusQuery.data;
  const academicRunStatusPending = Boolean(academicRunId) && !academicRunStatus;
  const academicRunActive =
    academicRunStatusPending ||
    academicRunStatus?.status === "queued" ||
    academicRunStatus?.status === "processing";
  const academicMetadataMissingInputs =
    !doc?.title?.trim() || !doc?.authors?.trim();
  const academicMetadataButtonTitle = academicMetadataMissingInputs
    ? t("documents.academicMetadataRequiresTitleAuthors")
    : academicRunActive
      ? t("documents.extractMoreMetadataProcessingShort")
      : undefined;
  const academicMetadataStatusText = extractAcademicMutation.isPending
    ? t("documents.extractMoreMetadataStarting")
    : extractAcademicMutation.error instanceof ApiError &&
        extractAcademicMutation.error.status === 409
      ? t("documents.academicMetadataAnotherRunActive")
      : extractAcademicMutation.error
        ? extractAcademicMutation.error.message
        : academicRunStatus?.status === "error"
          ? academicRunStatus.error || t("documents.academicMetadataError")
          : academicRunStatus?.status === "done"
            ? t("documents.academicMetadataDone", {
                enriched: academicRunStatus.documents_enriched,
                skipped: academicRunStatus.documents_skipped,
                failed: academicRunStatus.documents_failed,
              })
            : academicRunStatus?.status === "processing"
              ? t("documents.academicMetadataProcessing", {
                  processed: academicRunStatus.documents_processed,
                  total: academicRunStatus.documents_total,
                })
              : academicRunId
                ? t("documents.academicMetadataQueued")
                : null;
  const academicMetadataStatusIsError =
    Boolean(extractAcademicMutation.error) ||
    academicRunStatus?.status === "error";

  useEffect(() => {
    if (
      !id ||
      (academicRunStatus?.status !== "done" &&
        academicRunStatus?.status !== "error")
    ) {
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["document", id] });
    queryClient.invalidateQueries({ queryKey: ["documents"] });
    queryClient.invalidateQueries({
      queryKey: ["documents", "academic-metadata-status"],
    });
  }, [
    academicRunStatus?.status,
    academicRunStatus?.updated_at,
    id,
    queryClient,
  ]);

  useEffect(() => {
    setAcademicRunId(null);
  }, [id]);

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
        <Card className="text-error text-sm">
          {error?.message || t("common.notFound")}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <Link to="/documents" className="w-full sm:w-auto">
            <Button variant="ghost" className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4" />
              {t("common.back")}
            </Button>
          </Link>
          <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end">
            {isAdmin && (
              <Link
                to={`/documents/${doc.id}/edit`}
                className="w-full sm:w-auto"
              >
                <Button variant="secondary" className="w-full sm:w-auto">
                  <Pencil className="h-4 w-4" />
                  {t("common.edit")}
                </Button>
              </Link>
            )}
            {isAdmin && doc.file_type === "pdf" && (
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => extractMutation.mutate()}
                disabled={extractMutation.isPending}
              >
                {extractMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {t("documents.extractMetadata")}
              </Button>
            )}
            {isAdmin && (
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => extractAcademicMutation.mutate()}
                disabled={
                  extractAcademicMutation.isPending ||
                  academicRunActive ||
                  academicMetadataMissingInputs
                }
                title={academicMetadataButtonTitle}
              >
                {extractAcademicMutation.isPending || academicRunActive ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                {extractAcademicMutation.isPending
                  ? t("documents.extractMoreMetadataStarting")
                  : academicRunActive
                    ? t("documents.extractMoreMetadataProcessingShort")
                    : t("documents.extractMoreMetadata")}
              </Button>
            )}
            {doc.full_file_available && (
              <a
                href={getDownloadUrl(doc.id)}
                download
                className="w-full sm:w-auto"
              >
                <Button variant="secondary" className="w-full sm:w-auto">
                  <Download className="h-4 w-4" />
                  {t("common.download")}
                </Button>
              </a>
            )}
          </div>
        </div>
        {isAdmin && academicMetadataStatusText && (
          <p
            className={`text-left text-sm sm:text-right ${
              academicMetadataStatusIsError
                ? "text-error"
                : "text-text-secondary"
            }`}
          >
            {academicMetadataStatusText}
          </p>
        )}
      </div>

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <FileText className="h-8 w-8 text-primary mt-0.5 shrink-0" />
            <div className="min-w-0">
              <h1 className="break-words text-2xl font-bold text-text-primary">
                {doc.title || doc.filename}
              </h1>
              {doc.title && (
                <p className="break-words text-text-secondary text-base mt-1">
                  {doc.filename}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Badge variant="default">{doc.file_type.toUpperCase()}</Badge>
            <Badge variant="info">{formatFileSize(doc.file_size)}</Badge>
            <Badge variant={doc.ingested ? "success" : "warning"}>
              {doc.ingested ? t("documents.indexed") : t("documents.pending")}
            </Badge>
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
                  className="break-all text-primary hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {doc.url}
                </a>
              </div>
            )}
          </div>

          <div className="border-t border-primary-100 pt-4 mt-2 flex flex-wrap gap-6">
            {doc.suggested_by_user_name && doc.suggested_by_user_slug && (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <User className="h-4 w-4" />
                {t("documents.suggestedBy")}:{" "}
                <Link
                  to={`/community/${doc.suggested_by_user_slug}`}
                  className="text-primary hover:underline font-medium"
                >
                  {doc.suggested_by_user_name}
                </Link>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Calendar className="h-4 w-4" />
              {t("documents.uploadedAt")}: {formatDate(doc.created_at, locale)}
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Clock className="h-4 w-4" />
              {t("documents.updatedAt")}: {formatDate(doc.updated_at, locale)}
            </div>
          </div>
        </div>
      </Card>

      {doc.academic_metadata && (
        <AcademicMetadataDetails metadata={doc.academic_metadata} />
      )}

      {doc.file_type === "pdf" && doc.full_file_available && (
        <Card padding="none" className="overflow-hidden">
          <iframe
            src={getViewUrl(doc.id)}
            title={doc.filename}
            className="w-full h-[80vh] border-0"
          />
        </Card>
      )}
    </div>
  );
}
