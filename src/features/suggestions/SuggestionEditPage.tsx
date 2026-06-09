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
import { useAuth } from "@/hooks/use-auth";

export function SuggestionEditPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();

  const { data: suggestion, isLoading } = useQuery({
    queryKey: ["suggestion", session?.userId, id],
    queryFn: () => api.getSuggestion(id!),
    enabled: !!id,
  });

  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [userComment, setUserComment] = useState("");
  const [initialized, setInitialized] = useState(false);

  if (suggestion && !initialized) {
    setTitle(suggestion.title || "");
    setAuthors(suggestion.authors || "");
    setUserComment(suggestion.user_comment || "");
    setInitialized(true);
  }

  const updateMutation = useAppMutation({
    mutationFn: (data: {
      title?: string | null;
      authors?: string | null;
      user_comment?: string | null;
    }) => api.updateSuggestion(id!, data),
    invalidateKeys: [["suggestion"], ["my-suggestions"]],
    onSuccess: () => {
      navigate(`/suggestions/${id}`);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      title: title.trim() || null,
      authors: authors.trim() || null,
      user_comment: userComment.trim() || null,
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

  if (!suggestion) {
    return (
      <div className="space-y-4">
        <Link to="/suggestions">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Button>
        </Link>
        <Card className="text-error">{t("suggestions.notFound")}</Card>
      </div>
    );
  }

  if (suggestion.status !== "pending") {
    return (
      <div className="space-y-4">
        <Link to={`/suggestions/${id}`}>
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Button>
        </Link>
        <Card className="text-error">{t("suggestions.noAccess")}</Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to={`/suggestions/${id}`}>
        <Button variant="ghost">
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>
      </Link>

      <Card>
        <h1 className="text-xl font-bold text-text-primary mb-6">
          {t("suggestions.editTitle")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {t("documents.titleField")}
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("documents.titlePlaceholder")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {t("documents.authorsField")}
            </label>
            <Input
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              placeholder={t("documents.authorsPlaceholder")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {t("suggestions.comment")}
            </label>
            <textarea
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              rows={4}
              className="w-full rounded-[var(--radius-input)] border border-primary-200 bg-white px-3 py-2 text-base text-text-primary placeholder:text-text-secondary/50 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary resize-vertical"
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
            <Link to={`/suggestions/${id}`}>
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
