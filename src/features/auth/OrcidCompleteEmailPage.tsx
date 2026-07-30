import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router";
import { CheckCircle2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { api } from "@/services/api";

export function OrcidCompleteEmailPage() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const completionToken = searchParams.get("completion_token") || "";
  const hasInitialEmail = Boolean(searchParams.get("email"));
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [fullName, setFullName] = useState(searchParams.get("full_name") || "");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultStatus, setResultStatus] = useState("");

  const locale = i18n.resolvedLanguage || i18n.language || "en";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!privacyAccepted || !tosAccepted) {
      setError(t("auth.orcidConsentRequired"));
      return;
    }

    setError("");
    setLoading(true);
    try {
      const result = await api.completeOrcidEmail({
        completion_token: completionToken,
        email,
        full_name: fullName,
        locale,
        privacy_policy_accepted: privacyAccepted,
        tos_accepted: tosAccepted,
      });
      setResultStatus(result.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.orcidFailed"));
    }
    setLoading(false);
  };

  if (!completionToken) {
    return (
      <div className="mx-auto max-w-md">
        <Card className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-text-primary">
            {t("auth.invalidLink")}
          </h1>
          <p className="text-sm text-error">{t("auth.orcidMissingCode")}</p>
          <Link
            to="/login"
            className="mt-4 inline-block text-primary hover:underline"
          >
            {t("auth.backToLogin")}
          </Link>
        </Card>
      </div>
    );
  }

  if (resultStatus) {
    const isLinkConfirmation =
      resultStatus === "account_link_confirmation_required";
    return (
      <div className="mx-auto max-w-md">
        <Card className="text-center">
          <MailCheck className="mx-auto mb-4 h-7 w-7 text-success" />
          <h1 className="mb-2 text-2xl font-bold text-text-primary">
            {t("auth.orcidConfirmationRequiredTitle")}
          </h1>
          <p className="mb-4 text-text-secondary">
            {isLinkConfirmation
              ? t("auth.orcidLinkConfirmationRequired")
              : t("auth.orcidEmailConfirmationRequired")}
          </p>
          <Link to="/login" className="block w-full sm:inline-block sm:w-auto">
            <Button className="w-full sm:w-auto">{t("auth.goToLogin")}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <div className="mb-6">
          <h1 className="flex min-w-0 items-center gap-2 text-2xl font-bold text-text-primary">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-[#338000]" />
            <span className="min-w-0 break-words">
              {hasInitialEmail
                ? t("auth.orcidProfileRequiredTitle")
                : t("auth.orcidEmailRequiredTitle")}
            </span>
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {hasInitialEmail
              ? t("auth.orcidProfileRequiredDescription")
              : t("auth.orcidEmailRequiredDescription")}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              {t("auth.email")}
            </label>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              {t("auth.fullName")}
            </label>
            <Input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
            <p className="mt-1 text-xs text-text-secondary">
              {t("auth.fullNameHelp")}
            </p>
          </div>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-start gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(event) => setPrivacyAccepted(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-primary-200 text-primary focus:ring-primary"
              />
              <span>
                {t("auth.acceptPrivacyPolicy.prefix")}{" "}
                <Link
                  to="/privacy"
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  {t("auth.acceptPrivacyPolicy.link")}
                </Link>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={tosAccepted}
                onChange={(event) => setTosAccepted(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-primary-200 text-primary focus:ring-primary"
              />
              <span>
                {t("auth.acceptTos.prefix")}{" "}
                <Link
                  to="/terms"
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  {t("auth.acceptTos.link")}
                </Link>
              </span>
            </label>
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          <Button
            type="submit"
            disabled={loading || !privacyAccepted || !tosAccepted}
            className="w-full"
          >
            {loading ? t("auth.sending") : t("auth.orcidCompleteEmail")}
          </Button>
        </form>
      </Card>
    </div>
  );
}
