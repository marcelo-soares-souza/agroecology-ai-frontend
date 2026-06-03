import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  FileText,
  Trash2,
  Eye,
  Pencil,
  Plus,
  Loader2,
  Download,
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

  const query = useQuery({
    queryKey: ["documents"],
    queryFn: api.listDocuments,
  });

  const deleteMutation = useAppMutation({
    mutationFn: api.deleteDocument,
    invalidateKeys: [["documents"]],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">
          {t("documents.title")}
        </h1>
        <Link to="/upload">
          <Button>
            <Plus className="h-4 w-4" />
            {t("nav.upload")}
          </Button>
        </Link>
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
              <Card key={doc.id} padding="sm">
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-medium text-text-primary truncate">
                        {doc.title || doc.filename}
                      </span>
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
                      <span>{formatFileSize(doc.file_size)}</span>
                      <span>{formatDate(doc.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <a href={getDownloadUrl(doc.id)} download>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                    <Link to={`/documents/${doc.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
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
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </QueryResult>
    </div>
  );
}
