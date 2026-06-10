import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { api } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAppMutation } from "@/hooks/use-app-mutation";

export function DocumentEditPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: doc, isLoading } = useQuery({
    queryKey: ["document", id],
    queryFn: () => api.getDocument(id!),
    enabled: !!id,
  });

  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [url, setUrl] = useState("");
  const [initialized, setInitialized] = useState(false);

  if (doc && !initialized) {
    setTitle(doc.title || "");
    setAuthors(doc.authors || "");
    setUrl(doc.url || "");
    setInitialized(true);
  }

  const updateMutation = useAppMutation({
    mutationFn: (data: {
      title: string | null;
      authors: string | null;
      url: string | null;
    }) => api.updateDocument(id!, data),
    invalidateKeys: [["document", id], ["documents"]],
    onSuccess: () => {
      navigate(`/documents/${id}`);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      title: title.trim() || null,
      authors: authors.trim() || null,
      url: url.trim() || null,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="space-y-4">
        <Link to="/documents">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Button>
        </Link>
        <Card className="text-error">{t("common.notFound")}</Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to={`/documents/${id}`}>
        <Button variant="ghost">
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>
      </Link>

      <Card>
        <h1 className="text-xl font-bold text-text-primary mb-6">
          {t("documents.editTitle")} — {doc.filename}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {t("documents.titleField")}
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={doc.filename}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {t("documents.authorsField")}
            </label>
            <Input
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {t("documents.urlField")}
            </label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              type="url"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                t("common.save")
              )}
            </Button>
            <Link to={`/documents/${id}`}>
              <Button variant="secondary" type="button">
                {t("common.cancel")}
              </Button>
            </Link>
          </div>

          {updateMutation.isError && (
            <p className="text-error text-sm">
              {updateMutation.error?.message || t("common.error")}
            </p>
          )}
        </form>
      </Card>
    </div>
  );
}
