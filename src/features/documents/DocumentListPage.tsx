import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState } from "react";
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
} from "lucide-react";
import { api } from "@/services/api";
import { getDownloadUrl } from "@/config/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { QueryResult } from "@/components/ui/QueryResult";
import { useAppMutation } from "@/hooks/use-app-mutation";

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

const fileTypeColors: Record<string, "default" | "success" | "error" | "info"> =
  {
    pdf: "error",
    md: "success",
    txt: "info",
  };

export function DocumentListPage() {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const [extractMsg, setExtractMsg] = useState<{
    text: string;
    type: "success" | "info";
  } | null>(null);

  const query = useQuery({
    queryKey: ["documents"],
    queryFn: api.listDocuments,
  });

  const deleteMutation = useAppMutation({
    mutationFn: api.deleteDocument,
    invalidateKeys: [["documents"]],
  });

  const extractAllMutation = useAppMutation({
    mutationFn: api.extractAllMetadata,
    invalidateKeys: [["documents"]],
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
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              {t("documents.title")}
            </h1>
            {query.data && (
              <p className="text-sm text-text-secondary mt-1">
                {t("documents.total", { count: query.data.length })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => void query.refetch()}
              disabled={query.isFetching}
            >
              <RefreshCw
                className={`h-4 w-4 ${query.isFetching ? "animate-spin" : ""}`}
              />
              {t("documents.refresh")}
            </Button>
            {isAdmin && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => extractAllMutation.mutate(undefined)}
                  disabled={extractAllMutation.isPending}
                >
                  {extractAllMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Extract All Metadata
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
        {extractMsg && (
          <p
            className={`text-sm mt-2 ${extractMsg.type === "success" ? "text-success" : "text-text-secondary"}`}
          >
            {extractMsg.text}
          </p>
        )}
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
        {(docs) => (
          <div className="space-y-3">
            {docs.map((doc) => (
              <Link
                key={doc.id}
                to={`/documents/${doc.id}`}
                className="block group"
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
                          {doc.ingested ? "Indexed" : "Pending"}
                        </Badge>
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>{formatDate(doc.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <a
                        href={getDownloadUrl(doc.id)}
                        download
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                      {isAdmin && (
                        <>
                          <Link
                            to={`/documents/${doc.id}/edit`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
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
                              <Trash2 className="h-4 w-4 text-red-500" />
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </QueryResult>
    </div>
  );
}
