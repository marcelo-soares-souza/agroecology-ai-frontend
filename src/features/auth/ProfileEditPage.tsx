import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { api } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function ProfileEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [about, setAbout] = useState("");
  const [link, setLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

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
        about: about.trim() || null,
        link: link.trim() || null,
      });
      setSuccess(true);
      setTimeout(() => navigate("/profile/edit"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <Link to="/community">
        <Button variant="ghost">
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>
      </Link>

      <Card>
        <h1 className="text-xl font-bold text-text-primary mb-6">
          {t("profile.editTitle")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {t("profile.about")}
            </label>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder={t("profile.aboutPlaceholder")}
              rows={4}
              maxLength={4096}
              className="w-full rounded-[var(--radius-input)] border border-primary-200 bg-white px-3 py-2 text-base text-text-primary placeholder:text-text-secondary/50 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary resize-vertical"
            />
            <p className="text-xs text-text-secondary mt-1">
              {about.length}/4096
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {t("profile.link")}
            </label>
            <Input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              type="url"
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-3 pt-2">
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
          </div>

          {error && <p className="text-error text-sm">{error}</p>}
          {success && (
            <p className="text-success text-sm">{t("profile.saved")}</p>
          )}
        </form>
      </Card>
    </div>
  );
}
