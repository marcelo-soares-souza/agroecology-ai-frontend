import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router";
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
import type { PublicUserRecord, UserRecord } from "@/services/types";

type ProfileRecord = UserRecord | PublicUserRecord;

function isPrivateUserRecord(profile: ProfileRecord): profile is UserRecord {
  return "email" in profile;
}

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
  const { userId, session } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteRequested, setDeleteRequested] = useState(false);
  const isOwnProfile = !!slug && (slug === userId || slug === session?.slug);

  const query = useQuery({
    queryKey: ["user-profile", slug, isOwnProfile],
    queryFn: () => (isOwnProfile ? api.getMe() : api.getUserBySlug(slug!)),
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
      <div>
        <Link to="/" className="w-full sm:w-auto">
          <Button variant="ghost" className="w-full sm:w-auto">
            {t("common.back")}
          </Button>
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
          const isPrivate = isPrivateUserRecord(profile);
          const canEdit = isPrivate && profile.id === userId;
          const profileIsAdmin =
            isPrivate && (profile.roles || []).includes("admin");
          const avatarVersion = isPrivate ? profile.updated_at : null;
          const displayName =
            profile.full_name || (isPrivate ? profile.email : profile.slug);

          return (
            <>
              <Card>
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-100 overflow-hidden">
                        {profile.avatar_url ? (
                          <img
                            src={buildApiUrl(
                              profile.avatar_url +
                                (avatarVersion
                                  ? `?v=${encodeURIComponent(avatarVersion)}`
                                  : ""),
                            )}
                            alt={t("profile.avatarAlt", {
                              name: displayName,
                            })}
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
                          {displayName}
                        </h1>
                        <p className="break-all text-text-secondary">
                          {t("profile.slugPrefix", { slug: profile.slug })}
                        </p>
                      </div>
                    </div>
                    {canEdit && (
                      <Link to="/profile/edit" className="w-full sm:w-auto">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full"
                        >
                          <Pencil className="h-4 w-4" />
                          {t("common.edit")}
                        </Button>
                      </Link>
                    )}
                  </div>

                  {isPrivate && (
                    <div className="flex flex-wrap gap-2">
                      {profile.status === "active" ? (
                        <Badge variant="success">
                          {t("admin.statusActive")}
                        </Badge>
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
                  )}

                  <div className="grid gap-4 sm:grid-cols-2 border-t border-primary-100 pt-4">
                    {profile.link && (
                      <div className="flex min-w-0 items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 shrink-0 text-text-secondary" />
                        <span className="text-text-secondary">
                          {t("profile.link")}:
                        </span>
                        <a
                          href={profile.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-w-0 break-all text-primary hover:underline"
                        >
                          {profile.link}
                        </a>
                      </div>
                    )}
                    {isPrivate && (
                      <>
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
                      </>
                    )}
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
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full sm:w-auto"
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
                      className="w-full sm:w-auto"
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
