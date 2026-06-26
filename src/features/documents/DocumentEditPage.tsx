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
import { InfoTooltip } from "@/components/ui/InfoTooltip";

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
        <Card className="text-error text-sm">{t("common.notFound")}</Card>
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
        <h1 className="mb-6 break-words text-xl font-bold text-text-primary">
          {t("documents.editTitle")} — {doc.filename}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center gap-1.5">
              <label className="text-sm font-medium text-text-secondary">
                {t("documents.titleField")}
              </label>
              <InfoTooltip label={t("documents.titleHelp")} />
            </div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={doc.filename}
            />
            <p className="mt-1 text-xs text-text-secondary">
              {t("documents.titleHelp")}
            </p>
          </div>

          <div>
            <div className="mb-1.5 flex items-center gap-1.5">
              <label className="text-sm font-medium text-text-secondary">
                {t("documents.authorsField")}
              </label>
              <InfoTooltip label={t("documents.authorsHelp")} />
            </div>
            <Input
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
            />
            <p className="mt-1 text-xs text-text-secondary">
              {t("documents.authorsHelp")}
            </p>
          </div>

          <div>
            <div className="mb-1.5 flex items-center gap-1.5">
              <label className="text-sm font-medium text-text-secondary">
                {t("documents.urlField")}
              </label>
              <InfoTooltip label={t("documents.urlHelp")} />
            </div>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              type="url"
            />
            <p className="mt-1 text-xs text-text-secondary">
              {t("documents.urlHelp")}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="w-full sm:w-auto"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                t("common.save")
              )}
            </Button>
            <Link to={`/documents/${id}`} className="w-full sm:w-auto">
              <Button variant="secondary" type="button" className="w-full">
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
