import { useTranslation } from "react-i18next";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  FileText,
  Trash2,
  Pencil,
  Plus,
  Loader2,
  Download,
  Sparkles,
  RefreshCw,
  Search,
  Database,
} from "lucide-react";
import { api } from "@/services/api";
import { getDownloadUrl } from "@/config/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { QueryResult } from "@/components/ui/QueryResult";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { useAppMutation } from "@/hooks/use-app-mutation";
import type { DocumentRecord } from "@/services/types";

const PAGE_SIZE = 50;

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

const fileTypeColors: Record<string, "default" | "success" | "error" | "info"> =
  {
    pdf: "error",
    md: "success",
    txt: "info",
  };

export function DocumentListPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || "en";
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [extractMsg, setExtractMsg] = useState<{
    text: string;
    type: "success" | "info";
  } | null>(null);
  const [fullMetadataOnly, setFullMetadataOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  const query = useQuery({
    queryKey: ["documents", debouncedSearchQuery, fullMetadataOnly],
    queryFn: () =>
      api.listDocuments({
        q: debouncedSearchQuery.trim() || undefined,
        full_metadata: fullMetadataOnly,
        limit: PAGE_SIZE,
        offset: 0,
      }),
    placeholderData: keepPreviousData,
  });
  const statsQuery = useQuery({
    queryKey: ["documents", "stats"],
    queryFn: api.getDocumentStats,
    placeholderData: keepPreviousData,
  });
  const metadataStatusQuery = useQuery({
    queryKey: ["documents", "metadata-status"],
    queryFn: api.getMetadataExtractionStatus,
    enabled: isAdmin,
  });
  const academicMetadataStatusQuery = useQuery({
    queryKey: ["documents", "academic-metadata-status"],
    queryFn: api.getAcademicMetadataStatus,
    enabled: isAdmin,
    refetchInterval: (statusQuery) => {
      if (!isAdmin) return false;
      const data = statusQuery.state.data;
      if (data?.status === "queued" || data?.status === "processing")
        return 5000;
      return false;
    },
  });
  const documentStats = statsQuery.data;
  const metadataStats = documentStats
    ? {
        extracted: documentStats.metadata_extracted,
        total: documentStats.metadata_total,
      }
    : null;
  const metadataPending = metadataStats
    ? metadataStats.total - metadataStats.extracted
    : 0;
  const metadataActive = metadataStatusQuery.data?.active ?? 0;
  const indexStats = documentStats
    ? { indexed: documentStats.indexed, total: documentStats.total }
    : null;
  const indexPending = indexStats ? indexStats.total - indexStats.indexed : 0;
  const totalDocuments = query.data?.total ?? 0;
  const isSearchSettling = searchQuery !== debouncedSearchQuery;
  const hasMore = !isSearchSettling && documents.length < totalDocuments;
  const academicStatus = academicMetadataStatusQuery.data;
  const academicIsActive =
    academicStatus?.status === "queued" ||
    academicStatus?.status === "processing";
  const academicProgress =
    academicStatus && academicStatus.documents_total > 0
      ? Math.round(
          (academicStatus.documents_processed /
            academicStatus.documents_total) *
            100,
        )
      : 0;
  const academicHasNoDocuments = Boolean(
    documentStats && documentStats.total === 0,
  );
  const academicHasNoPendingDocuments = Boolean(
    academicStatus &&
    !academicIsActive &&
    academicStatus.documents_pending === 0,
  );

  useEffect(() => {
    if (query.data) {
      setDocuments(query.data.data);
    }
  }, [query.data]);

  useEffect(() => {
    if (!isAdmin) return;
    if (
      academicStatus?.status === "done" ||
      academicStatus?.status === "error"
    ) {
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
    }
  }, [
    academicStatus?.status,
    academicStatus?.updated_at,
    isAdmin,
    queryClient,
  ]);

  async function loadMore(): Promise<void> {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = await api.listDocuments({
        q: debouncedSearchQuery.trim() || undefined,
        full_metadata: fullMetadataOnly,
        limit: PAGE_SIZE,
        offset: documents.length,
      });
      setDocuments((current) => [...current, ...nextPage.data]);
    } finally {
      setLoadingMore(false);
    }
  }

  const deleteMutation = useAppMutation({
    mutationFn: api.deleteDocument,
    invalidateKeys: [["documents"]],
  });

  const extractAllMutation = useAppMutation({
    mutationFn: api.extractAllMetadata,
    invalidateKeys: [["documents"], ["documents", "metadata-status"]],
    onSuccess: (data) => {
      const msg = (data as { message: string }).message || "";
      if (msg.startsWith("0 ")) {
        setExtractMsg({ text: msg, type: "info" });
      } else {
        setExtractMsg({ text: msg, type: "success" });
      }
    },
  });

  const extractAcademicMetadataMutation = useAppMutation({
    mutationFn: () => api.extractAcademicMetadata(),
    invalidateKeys: [["documents", "academic-metadata-status"], ["documents"]],
    onSuccess: () => {
      setExtractMsg({
        text: t("documents.academicMetadataQueued"),
        type: "success",
      });
    },
  });
  const academicExtractionDisabled =
    extractAcademicMetadataMutation.isPending ||
    academicIsActive ||
    statsQuery.isLoading ||
    academicMetadataStatusQuery.isLoading ||
    academicHasNoDocuments ||
    academicHasNoPendingDocuments;
  const academicButtonTitle = academicHasNoDocuments
    ? t("documents.academicMetadataNoDocuments")
    : academicHasNoPendingDocuments
      ? t("documents.academicMetadataNoPending")
      : undefined;
  const academicStatusText = academicHasNoDocuments
    ? t("documents.academicMetadataNoDocuments")
    : academicIsActive && academicStatus
      ? t("documents.academicMetadataProcessing", {
          processed: academicStatus.documents_processed,
          total: academicStatus.documents_total,
        })
      : academicStatus?.status === "done"
        ? t("documents.academicMetadataDone", {
            enriched: academicStatus.documents_enriched,
            skipped: academicStatus.documents_skipped,
            failed: academicStatus.documents_failed,
          })
        : academicStatus?.status === "error"
          ? academicStatus.error || t("documents.academicMetadataError")
          : academicHasNoPendingDocuments
            ? t("documents.academicMetadataNoPending")
            : t("documents.academicMetadataIdle");

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary shrink-0" />
            {t("documents.title")}
          </h1>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              onClick={() => {
                void query.refetch();
                void statsQuery.refetch();
                if (isAdmin) void metadataStatusQuery.refetch();
                if (isAdmin) void academicMetadataStatusQuery.refetch();
              }}
              disabled={
                query.isFetching ||
                statsQuery.isFetching ||
                metadataStatusQuery.isFetching ||
                academicMetadataStatusQuery.isFetching
              }
            >
              <RefreshCw
                className={`h-4 w-4 ${query.isFetching || statsQuery.isFetching || metadataStatusQuery.isFetching || academicMetadataStatusQuery.isFetching ? "animate-spin" : ""}`}
              />
              {t("documents.refresh")}
            </Button>
            {isAdmin && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => extractAllMutation.mutate(undefined)}
                  disabled={
                    extractAllMutation.isPending ||
                    statsQuery.isLoading ||
                    metadataPending === 0 ||
                    metadataActive > 0
                  }
                >
                  {extractAllMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {t("documents.extractAllMetadata")}
                </Button>
                <Link to="/upload">
                  <Button>
                    <Plus className="h-4 w-4" />
                    {t("nav.upload")}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
        <p className="text-sm text-text-secondary">
          {t("documents.listDescription")}
        </p>
        {query.data && (
          <p className="text-sm text-text-secondary mt-1">
            {t("documents.total", { count: query.data.total })}
          </p>
        )}
      </div>
      {indexStats && indexStats.total > 0 && (
        <Card padding="sm" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-text-primary">
                    {t("documents.indexProgress", {
                      indexed: indexStats.indexed,
                      total: indexStats.total,
                    })}
                  </p>
                  <InfoTooltip label={t("documents.indexStatusHelp")} />
                </div>
                <p className="text-sm text-text-secondary">
                  {indexPending === 0
                    ? t("documents.indexComplete")
                    : t("documents.indexPending", {
                        count: indexPending,
                      })}
                </p>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-primary-100">
                <div
                  className="h-full rounded-full bg-info transition-all"
                  style={{
                    width: `${Math.round(
                      (indexStats.indexed / indexStats.total) * 100,
                    )}%`,
                  }}
                />
              </div>
            </div>

            {metadataStats && metadataStats.total > 0 && (
              <div className="flex flex-col gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-text-primary">
                      {t("documents.metadataProgress", {
                        extracted: metadataStats.extracted,
                        total: metadataStats.total,
                      })}
                    </p>
                    <InfoTooltip label={t("documents.metadataStatusHelp")} />
                  </div>
                  <p className="text-sm text-text-secondary">
                    {metadataActive > 0
                      ? t("documents.metadataInProgress", {
                          count: metadataActive,
                        })
                      : metadataPending === 0
                        ? t("documents.metadataComplete")
                        : t("documents.metadataPending", {
                            count: metadataPending,
                          })}
                  </p>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-primary-100">
                  <div
                    className="h-full rounded-full bg-success transition-all"
                    style={{
                      width: `${Math.round(
                        (metadataStats.extracted / metadataStats.total) * 100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
      {extractMsg && (
        <p
          className={`text-sm mt-2 ${extractMsg.type === "success" ? "text-success" : "text-error"}`}
        >
          {extractMsg.text}
        </p>
      )}

      {isAdmin && (
        <Card padding="sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-primary shrink-0" />
                <p className="font-semibold text-text-primary">
                  {t("documents.academicMetadataTitle")}
                </p>
                <InfoTooltip label={t("documents.academicMetadataHelp")} />
              </div>
              <p className="text-sm text-text-secondary mt-1">
                {academicStatusText}
              </p>
              {academicStatus && academicStatus.documents_total > 0 && (
                <div className="h-2 overflow-hidden rounded-full bg-primary-100 mt-3 max-w-xl">
                  <div
                    className="h-full rounded-full bg-info transition-all"
                    style={{ width: `${academicProgress}%` }}
                  />
                </div>
              )}
            </div>

            <div className="flex shrink-0">
              <Button
                variant="secondary"
                onClick={() =>
                  extractAcademicMetadataMutation.mutate(undefined)
                }
                disabled={academicExtractionDisabled}
                title={academicButtonTitle}
              >
                {extractAcademicMetadataMutation.isPending ||
                academicIsActive ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                {t("documents.extractMoreMetadata")}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary/50" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("common.search")}
            className="pl-9"
          />
        </div>
        <label className="flex min-h-11 shrink-0 items-center gap-2 rounded-[var(--radius-input)] border border-primary-200 bg-surface px-3 text-sm font-medium text-text-primary">
          <input
            type="checkbox"
            checked={fullMetadataOnly}
            onChange={(event) => setFullMetadataOnly(event.target.checked)}
            className="h-4 w-4 rounded border-primary-300 accent-primary"
          />
          <span>{t("documents.fullMetadata")}</span>
          <InfoTooltip label={t("documents.fullMetadataHelp")} />
        </label>
      </div>

      <QueryResult
        query={query}
        empty={
          <Card className="text-center py-12">
            <FileText className="h-12 w-12 text-text-secondary/40 mx-auto mb-3" />
            <p className="text-text-secondary">{t("documents.empty")}</p>
          </Card>
        }
      >
        {() => {
          if (documents.length === 0 && totalDocuments > 0) {
            return (
              <Card className="text-center py-12">
                <Search className="h-12 w-12 text-text-secondary/40 mx-auto mb-3" />
                <p className="text-text-secondary">{t("common.noResults")}</p>
              </Card>
            );
          }
          if (documents.length === 0) {
            return (
              <Card className="text-center py-12">
                <FileText className="h-12 w-12 text-text-secondary/40 mx-auto mb-3" />
                <p className="text-text-secondary">
                  {debouncedSearchQuery.trim()
                    ? t("common.noResults")
                    : fullMetadataOnly
                      ? t("common.noResults")
                      : t("documents.empty")}
                </p>
              </Card>
            );
          }
          return (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="block group"
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest("button, a")) return;
                    navigate(`/documents/${doc.id}`);
                  }}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/documents/${doc.id}`);
                    }
                  }}
                >
                  <Card
                    padding="sm"
                    className="hover:bg-primary-50/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <span className="font-medium text-text-primary group-hover:text-primary transition-colors">
                              {doc.title || doc.filename}
                            </span>
                            {doc.authors && (
                              <p className="text-xs text-text-secondary truncate">
                                {doc.authors}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                          <Badge
                            variant={
                              (fileTypeColors[doc.file_type] as
                                | "default"
                                | "success"
                                | "error"
                                | "info") || "default"
                            }
                          >
                            {doc.file_type.toUpperCase()}
                          </Badge>
                          <Badge
                            variant={doc.ingested ? "success" : "warning"}
                            title={
                              doc.ingested
                                ? t("documents.indexStatusHelp")
                                : t("documents.pendingStatusHelp")
                            }
                          >
                            {doc.ingested
                              ? t("documents.indexed")
                              : t("documents.pending")}
                          </Badge>
                          {doc.file_type === "pdf" && (
                            <Badge
                              title={t("documents.metadataStatusHelp")}
                              variant={
                                doc.title?.trim() && doc.authors?.trim()
                                  ? "success"
                                  : "warning"
                              }
                            >
                              {doc.title?.trim() && doc.authors?.trim()
                                ? t("documents.metadataExtracted")
                                : t("documents.metadataQueued")}
                            </Badge>
                          )}
                          {doc.academic_metadata && (
                            <Badge
                              title={t("documents.academicMetadataHelp")}
                              variant="info"
                            >
                              {doc.academic_metadata.doi
                                ? t("documents.doiBadge")
                                : t("documents.academicMetadataBadge")}
                            </Badge>
                          )}
                          {doc.academic_metadata?.citation_count !== null &&
                            doc.academic_metadata?.citation_count !==
                              undefined && (
                              <span>
                                {t("documents.citationsShort", {
                                  count: doc.academic_metadata.citation_count,
                                })}
                              </span>
                            )}
                          {doc.academic_metadata?.publication_year && (
                            <span>
                              {doc.academic_metadata.publication_year}
                            </span>
                          )}
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span>{formatDate(doc.created_at, locale)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <a href={getDownloadUrl(doc.id)} download>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                        {isAdmin && (
                          <>
                            <Link to={`/documents/${doc.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm(t("documents.deleteConfirm"))) {
                                  deleteMutation.mutate(doc.id);
                                }
                              }}
                              disabled={deleteMutation.isPending}
                            >
                              {deleteMutation.isPending &&
                              deleteMutation.variables === doc.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-error" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
              {hasMore && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="secondary"
                    onClick={() => void loadMore()}
                    disabled={loadingMore}
                  >
                    {loadingMore && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {loadingMore
                      ? t("common.loadingMore")
                      : t("common.loadMore")}
                  </Button>
                </div>
              )}
            </div>
          );
        }}
      </QueryResult>
    </div>
  );
}
