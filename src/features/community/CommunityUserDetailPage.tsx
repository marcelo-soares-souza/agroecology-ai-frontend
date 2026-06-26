import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  FileText,
  ExternalLink,
  Pencil,
  Globe,
} from "lucide-react";
import { api } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/hooks/use-auth";
import { buildApiUrl } from "@/config/api";
import type { DocumentSuggestion, PublicUserRecord } from "@/services/types";

function formatDate(iso: string | null, locale: string) {
  if (!iso) return "\u2014";
  return new Date(iso).toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CommunityUserDetailPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || "en";
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { userId } = useAuth();

  const userQuery = useQuery({
    queryKey: ["community-user", slug],
    queryFn: () => api.getUserBySlug(slug!),
    enabled: !!slug,
  });

  const profileId = userQuery.data?.id;

  const suggestionsQuery = useQuery({
    queryKey: ["community-suggestions", profileId],
    queryFn: () => api.listPublicSuggestions(profileId!),
    enabled: !!profileId,
  });

  if (userQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Card>
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (userQuery.error || !userQuery.data) {
    return (
      <div className="space-y-6">
        <Link to="/community">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Button>
        </Link>
        <Card className="text-error text-sm">{t("common.notFound")}</Card>
      </div>
    );
  }

  const user = userQuery.data as PublicUserRecord;
  const canEdit = user.id === userId;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/community" className="w-full sm:w-auto">
          <Button variant="ghost" className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Button>
        </Link>
      </div>

      <Card>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-100 overflow-hidden">
                {user.avatar_url ? (
                  <img
                    src={buildApiUrl(user.avatar_url)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary text-white">
                    <User className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="break-words text-2xl font-bold text-text-primary">
                  {user.full_name}
                </h1>
                <p className="break-all text-text-secondary">@{user.slug}</p>
              </div>
            </div>
            {canEdit && (
              <Link to="/profile/edit" className="w-full sm:w-auto">
                <Button variant="secondary" size="sm" className="w-full">
                  <Pencil className="h-4 w-4" />
                  {t("common.edit")}
                </Button>
              </Link>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 border-t border-primary-100 pt-4">
            {user.link && (
              <div className="flex min-w-0 items-center gap-2 text-sm">
                <Globe className="h-4 w-4 shrink-0 text-text-secondary" />
                <span className="text-text-secondary">
                  {t("profile.link")}:
                </span>
                <a
                  href={user.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 break-all text-primary hover:underline"
                >
                  {user.link}
                </a>
              </div>
            )}
          </div>
        </div>
      </Card>

      {user.about && (
        <Card>
          <h2 className="text-lg font-semibold text-text-primary mb-3">
            {t("profile.about")}
          </h2>
          <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">
            {user.about}
          </p>
        </Card>
      )}

      {suggestionsQuery.data && suggestionsQuery.data.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-3">
            {t("community.approvedSuggestions")}
          </h2>
          <div className="space-y-2">
            {suggestionsQuery.data.map((s: DocumentSuggestion) => (
              <Card
                key={s.id}
                padding="sm"
                className="hover:bg-primary-50/30 transition-colors cursor-pointer"
                onClick={() =>
                  s.document_id && navigate(`/documents/${s.document_id}`)
                }
              >
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate text-sm">
                      {s.title ||
                        s.url ||
                        s.original_filename ||
                        s.id.slice(0, 8)}
                    </p>
                    {s.authors && (
                      <p className="text-xs text-text-primary truncate">
                        {s.authors}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-text-secondary">
                        {formatDate(s.created_at, locale)}
                      </p>
                      {s.document_id && (
                        <Badge variant={s.ingested ? "success" : "warning"}>
                          {s.ingested
                            ? t("documents.indexed")
                            : t("documents.pending")}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {s.document_id && (
                    <ExternalLink className="h-4 w-4 text-text-secondary shrink-0" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
