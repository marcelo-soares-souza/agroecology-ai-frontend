import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import {
  User,
  Calendar,
  Clock,
  Globe,
  Pencil,
  Download,
  Trash2,
} from "lucide-react";
import { api } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { QueryResult } from "@/components/ui/QueryResult";
import { Button } from "@/components/ui/Button";
import { buildApiUrl } from "@/config/api";
import { useAuth } from "@/hooks/use-auth";

function formatDate(iso: string | null, locale: string, fallback: string) {
  if (!iso) return fallback;
  return new Date(iso).toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ProfilePage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || "en";
  const { slug } = useParams<{ slug: string }>();
  const { userId, isAdmin } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteRequested, setDeleteRequested] = useState(false);

  const query = useQuery({
    queryKey: ["user-profile", slug],
    queryFn: () => api.getUserBySlug(slug!),
    enabled: !!slug,
  });

  const handleExportData = async () => {
    setExporting(true);
    try {
      const data = await api.exportMyData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `agroecology-export-${slug}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert(t("profile.exportFailed"));
    }
    setExporting(false);
  };

  const handleRequestDelete = async () => {
    if (!window.confirm(t("profile.deleteAccountConfirm"))) return;
    setDeleting(true);
    try {
      await api.requestDeleteAccount();
      setDeleteRequested(true);
    } catch {
      alert(t("profile.deleteAccountFailed"));
    }
    setDeleting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/">
          <Button variant="ghost">{t("common.back")}</Button>
        </Link>
      </div>

      <QueryResult
        query={query}
        skeleton={
          <Card>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-48 bg-primary-100 rounded animate-pulse" />
                <div className="h-4 w-32 bg-primary-100 rounded animate-pulse" />
              </div>
            </div>
          </Card>
        }
      >
        {(profile) => {
          const canEdit = profile.id === userId || isAdmin;
          const profileIsAdmin =
            (profile.roles || []).includes("admin");

          return (
            <>
              <Card>
                <div className="flex flex-col gap-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-100 overflow-hidden">
                        {profile.avatar_url ? (
                          <img
                            src={buildApiUrl(
                              profile.avatar_url +
                                (profile.updated_at
                                  ? `?v=${encodeURIComponent(profile.updated_at)}`
                                  : ""),
                            )}
                            alt={t("profile.avatarAlt", {
                              name: profile.full_name || profile.email,
                            })}
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
                          {profile.full_name || profile.email}
                        </h1>
                        <p className="text-text-secondary">
                          {t("profile.slugPrefix", { slug: profile.slug })}
                        </p>
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
                    {profile.status === "active" ? (
                      <Badge variant="success">{t("admin.statusActive")}</Badge>
                    ) : (
                      <Badge variant="warning">{profile.status}</Badge>
                    )}
                    {(profile.roles || []).map((r: string) => (
                      <Badge
                        key={r}
                        variant={r === "admin" ? "default" : "info"}
                      >
                        {r === "admin"
                          ? t("profile.role_admin")
                          : r === "user"
                            ? t("profile.role_user")
                            : r}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 border-t border-primary-100 pt-4">
                    {profile.link && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-text-secondary" />
                        <span className="text-text-secondary">
                          {t("profile.link")}:
                        </span>
                        <a
                          href={profile.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate"
                        >
                          {profile.link}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-text-secondary" />
                      <span className="text-text-secondary">
                        {t("admin.joined")}:
                      </span>
                      <span className="text-text-primary">
                        {formatDate(
                          profile.created_at || null,
                          locale,
                          t("profile.notAvailable"),
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-text-secondary" />
                      <span className="text-text-secondary">
                        {t("admin.lastLogin")}:
                      </span>
                      <span className="text-text-primary">
                        {formatDate(
                          profile.last_login_at || null,
                          locale,
                          t("profile.notAvailable"),
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {profile.about && (
                <Card className="mt-6">
                  <h2 className="text-lg font-semibold text-text-primary mb-3">
                    {t("profile.about")}
                  </h2>
                  <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">
                    {profile.about}
                  </p>
                </Card>
              )}

              {canEdit && !profileIsAdmin && (
                <Card className="mt-6">
                  <h2 className="text-lg font-semibold text-text-primary mb-4">
                    {t("profile.dataAndPrivacy")}
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleExportData}
                      disabled={exporting}
                    >
                      <Download className="h-4 w-4" />
                      {exporting
                        ? t("profile.exporting")
                        : t("profile.exportMyData")}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleRequestDelete}
                      disabled={deleting || deleteRequested}
                    >
                      <Trash2 className="h-4 w-4" />
                      {deleteRequested
                        ? t("profile.deleteRequested")
                        : deleting
                          ? t("profile.deleting")
                          : t("profile.deleteMyAccount")}
                    </Button>
                  </div>
                  {deleteRequested && (
                    <p className="text-sm text-text-secondary mt-3">
                      {t("profile.checkEmailForDeleteConfirmation")}
                    </p>
                  )}
                </Card>
              )}
            </>
          );
        }}
      </QueryResult>
    </div>
  );
}
