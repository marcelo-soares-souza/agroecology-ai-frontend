import { useTranslation } from "react-i18next";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
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
} from "lucide-react";
import { api } from "@/services/api";
import { getDownloadUrl } from "@/config/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { QueryResult } from "@/components/ui/QueryResult";
import { useAppMutation } from "@/hooks/use-app-mutation";
import type { DocumentRecord } from "@/services/types";

const PAGE_SIZE = 50;
const STATS_PAGE_SIZE = 100;

async function fetchDocumentsForStats(searchQuery: string) {
  const q = searchQuery.trim() || undefined;
  const firstPage = await api.listDocuments({
    q,
    limit: STATS_PAGE_SIZE,
    offset: 0,
  });
  const allDocuments = [...firstPage.data];

  while (allDocuments.length < firstPage.total) {
    const nextPage = await api.listDocuments({
      q,
      limit: STATS_PAGE_SIZE,
      offset: allDocuments.length,
    });
    allDocuments.push(...nextPage.data);

    if (nextPage.data.length === 0) break;
  }

  return allDocuments;
}

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
  const [extractMsg, setExtractMsg] = useState<{
    text: string;
    type: "success" | "info";
  } | null>(null);
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
    queryKey: ["documents", debouncedSearchQuery],
    queryFn: () =>
      api.listDocuments({
        q: debouncedSearchQuery.trim() || undefined,
        limit: PAGE_SIZE,
        offset: 0,
      }),
    placeholderData: keepPreviousData,
  });
  const statsQuery = useQuery({
    queryKey: ["documents", "stats", debouncedSearchQuery],
    queryFn: () => fetchDocumentsForStats(debouncedSearchQuery),
    placeholderData: keepPreviousData,
  });
  const metadataStatusQuery = useQuery({
    queryKey: ["documents", "metadata-status"],
    queryFn: api.getMetadataExtractionStatus,
    enabled: isAdmin,
  });
  const statsDocuments = statsQuery.data ?? [];
  const metadataStats = statsDocuments.reduce(
    (acc, doc) => {
      if (doc.file_type !== "pdf") return acc;
      acc.total += 1;
      if (doc.title?.trim() && doc.authors?.trim()) {
        acc.extracted += 1;
      }
      return acc;
    },
    { extracted: 0, total: 0 },
  );
  const metadataPending = metadataStats
    ? metadataStats.total - metadataStats.extracted
    : 0;
  const metadataActive = metadataStatusQuery.data?.active ?? 0;
  const indexStats = statsDocuments.reduce(
    (acc, doc) => {
      acc.total += 1;
      if (doc.ingested) {
        acc.indexed += 1;
      }
      return acc;
    },
    { indexed: 0, total: 0 },
  );
  const indexPending = indexStats ? indexStats.total - indexStats.indexed : 0;
  const totalDocuments = query.data?.total ?? 0;
  const isSearchSettling = searchQuery !== debouncedSearchQuery;
  const hasMore = !isSearchSettling && documents.length < totalDocuments;

  useEffect(() => {
    if (query.data) {
      setDocuments(query.data.data);
    }
  }, [query.data]);

  async function loadMore(): Promise<void> {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = await api.listDocuments({
        q: debouncedSearchQuery.trim() || undefined,
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
              }}
              disabled={
                query.isFetching ||
                statsQuery.isFetching ||
                metadataStatusQuery.isFetching
              }
            >
              <RefreshCw
                className={`h-4 w-4 ${query.isFetching || statsQuery.isFetching || metadataStatusQuery.isFetching ? "animate-spin" : ""}`}
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
                <p className="font-semibold text-text-primary">
                  {t("documents.indexProgress", {
                    indexed: indexStats.indexed,
                    total: indexStats.total,
                  })}
                </p>
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
                  <p className="font-semibold text-text-primary">
                    {t("documents.metadataProgress", {
                      extracted: metadataStats.extracted,
                      total: metadataStats.total,
                    })}
                  </p>
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
                          <Badge variant={doc.ingested ? "success" : "warning"}>
                            {doc.ingested
                              ? t("documents.indexed")
                              : t("documents.pending")}
                          </Badge>
                          {doc.file_type === "pdf" && (
                            <Badge
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
