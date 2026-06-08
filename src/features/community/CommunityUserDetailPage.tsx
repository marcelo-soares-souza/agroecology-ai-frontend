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
  Calendar,
  Clock,
} from "lucide-react";
import { api } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/hooks/use-auth";
import { buildApiUrl } from "@/config/api";
import type { DocumentSuggestion } from "@/services/types";

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
  const { userId, isAdmin } = useAuth();

  const userQuery = useQuery({
    queryKey: ["community-user", slug],
    queryFn: () =>
      fetch(`/api/v1/auth/users/by-slug/${slug}`).then((r) => {
        if (!r.ok) throw new Error("User not found");
        return r.json();
      }),
    enabled: !!slug,
  });

  const profileId = userQuery.data?.id as string | undefined;

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
            <div className="h-16 w-16 rounded-full bg-primary-100 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-6 w-48 bg-primary-100 rounded animate-pulse" />
              <div className="h-4 w-32 bg-primary-100 rounded animate-pulse" />
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
        <Card className="text-error">{t("common.notFound")}</Card>
      </div>
    );
  }

  const user = userQuery.data as {
    id: string;
    full_name: string;
    slug: string;
    status: string;
    roles: string[];
    created_at: string;
    updated_at: string;
    last_login_at: string | null;
    about: string | null;
    link: string | null;
    avatar_url: string | null;
  };
  const canEdit = user.id === userId || isAdmin;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/community">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Button>
        </Link>
      </div>

      <Card>
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-100 overflow-hidden">
                {user.avatar_url ? (
                  <img
                    src={buildApiUrl(
                      user.avatar_url +
                        (user.updated_at
                          ? `?v=${encodeURIComponent(user.updated_at)}`
                          : ""),
                    )}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary text-white">
                    <User className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">
                  {user.full_name}
                </h1>
                <p className="text-text-secondary">@{user.slug}</p>
              </div>
            </div>
            {canEdit && (
              <Link to="/profile/edit">
                <Button variant="secondary" size="sm">
                  <Pencil className="h-4 w-4" />
                  {t("common.edit")}
                </Button>
              </Link>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {user.status === "active" ? (
              <Badge variant="success">{t("admin.statusActive")}</Badge>
            ) : (
              <Badge variant="warning">{user.status}</Badge>
            )}
            {(user.roles || []).map((r: string) => (
              <Badge key={r} variant={r === "admin" ? "default" : "info"}>
                {r}
              </Badge>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 border-t border-primary-100 pt-4">
            {user.link && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-text-secondary" />
                <span className="text-text-secondary">
                  {t("profile.link")}:
                </span>
                <a
                  href={user.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline truncate"
                >
                  {user.link}
                </a>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-text-secondary" />
              <span className="text-text-secondary">{t("admin.joined")}:</span>
              <span className="text-text-primary">
                {formatDate(user.created_at, locale)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-text-secondary" />
              <span className="text-text-secondary">
                {t("admin.lastLogin")}:
              </span>
              <span className="text-text-primary">
                {formatDate(user.last_login_at, locale)}
              </span>
            </div>
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
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate text-sm">
                      {s.title ||
                        s.url ||
                        s.original_filename ||
                        s.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {formatDate(s.created_at, locale)}
                    </p>
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
