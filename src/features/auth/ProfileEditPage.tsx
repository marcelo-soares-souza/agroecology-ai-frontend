import { useState, useEffect, useRef, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, Loader2, User, Globe, Upload } from "lucide-react";
import { api } from "@/services/api";
import { queryClient } from "@/services/query-client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/use-auth";
import { buildApiUrl } from "@/config/api";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export function ProfileEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [about, setAbout] = useState("");
  const [link, setLink] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarVersion, setAvatarVersion] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(buildApiUrl("/api/v1/auth/me"), {
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("agroecology_access_token")}`,
      },
    })
      .then((r) => r.json())
      .then((data) => {
        setFullName(data.full_name || "");
        setAbout(data.about || "");
        setLink(data.link || "");
        setAvatarUrl(data.avatar_url || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(
        t("profile.avatarUnsupportedType") ||
          "Unsupported image type. Use JPEG, PNG, or WebP.",
      );
      return;
    }
    if (file.size > MAX_SIZE) {
      setError(t("profile.avatarTooLarge") || "Image must not exceed 5MB.");
      return;
    }

    setAvatarUploading(true);
    setError(null);
    try {
      const result = await api.uploadAvatar(file);
      setAvatarUrl(result.avatar_url || null);
      setAvatarVersion((v) => v + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!fullName.trim()) {
      setError(t("auth.fullNameRequired"));
      return;
    }
    if (about.length > 4096) {
      setError(t("profile.aboutTooLong"));
      return;
    }
    if (link && !link.startsWith("http://") && !link.startsWith("https://")) {
      setError(t("profile.invalidLink"));
      return;
    }

    setSaving(true);
    try {
      await api.updateMyProfile({
        full_name: fullName.trim() || null,
        about: about.trim() || null,
        link: link.trim() || null,
      });
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      setTimeout(() => navigate(`/profile/${session?.slug}`), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link to={session?.slug ? `/profile/${session.slug}` : "/community"}>
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Button>
        </Link>
        <Card>
          <div className="space-y-6 animate-pulse">
            <div className="h-8 w-48 bg-primary-100 rounded" />
            <div className="h-16 w-16 rounded-full bg-primary-100" />
            <div className="h-12 bg-primary-100 rounded" />
            <div className="h-32 bg-primary-100 rounded" />
            <div className="h-12 bg-primary-100 rounded" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to={session?.slug ? `/profile/${session.slug}` : "/community"}>
        <Button variant="ghost">
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>
      </Link>

      <Card>
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-primary-100">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-100 overflow-hidden">
            {avatarUrl ? (
              <img
                src={`${buildApiUrl(avatarUrl)}?v=${avatarVersion}`}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary text-white">
                <User className="h-7 w-7" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">
              {t("profile.editTitle")}
            </h1>
            <p className="text-sm text-text-secondary">
              {session?.slug && `@${session.slug}`}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-primary-100">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
            >
              {avatarUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {t("profile.changePhoto") || "Change Photo"}
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {t("profile.name")}
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t("auth.fullName")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {t("profile.about")}
            </label>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder={t("profile.aboutPlaceholder")}
              rows={5}
              maxLength={4096}
              className="w-full rounded-[var(--radius-input)] border border-primary-200 bg-surface px-4 py-2.5 text-text-primary placeholder:text-text-secondary/60 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-vertical"
            />
            <p className="text-xs text-text-secondary mt-1 text-right">
              {about.length}/4096
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {t("profile.link")}
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                type="url"
                placeholder="https://..."
                className="w-full rounded-[var(--radius-input)] border border-primary-200 bg-surface pl-10 pr-4 py-2.5 text-text-primary placeholder:text-text-secondary/60 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {t("common.save")}
                </>
              )}
            </Button>
            <Link
              to={session?.slug ? `/profile/${session.slug}` : "/community"}
            >
              <Button type="button" variant="ghost">
                {t("common.cancel")}
              </Button>
            </Link>
          </div>

          {error && (
            <p className="text-error text-sm bg-error/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p className="text-success text-sm bg-success/10 rounded-lg px-3 py-2">
              {t("profile.saved")}
            </p>
          )}
        </form>
      </Card>
    </div>
  );
}
