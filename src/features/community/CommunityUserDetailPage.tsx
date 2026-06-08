import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  FileText,
  ExternalLink,
} from "lucide-react";
import { api } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import type { DocumentSuggestion } from "@/services/types";

function formatDate(iso: string, locale: string) {
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

  const userQuery = useQuery({
    queryKey: ["community-user", slug],
    queryFn: () =>
      fetch(`/api/v1/auth/users/by-slug/${slug}`).then((r) => {
        if (!r.ok) throw new Error("User not found");
        return r.json();
      }),
    enabled: !!slug,
  });

  const userId = userQuery.data?.id as string | undefined;

  const suggestionsQuery = useQuery({
    queryKey: ["community-suggestions", userId],
    queryFn: () => api.listPublicSuggestions(userId!),
    enabled: !!userId,
  });

  if (userQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (userQuery.error || !userQuery.data) {
    return (
      <div className="space-y-4">
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
    email: string;
    created_at: string;
    last_login_at: string | null;
  };

  return (
    <div className="space-y-6">
      <Link to="/community">
        <Button variant="ghost">
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>
      </Link>

      <Card>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary-100 flex items-center justify-center text-primary font-semibold text-xl shrink-0">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">
              {user.full_name}
            </h1>
            <p className="text-sm text-text-secondary">
              {t("community.memberSince", {
                date: formatDate(user.created_at, locale),
              })}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />@{user.slug}
          </div>
        </div>
      </Card>

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
