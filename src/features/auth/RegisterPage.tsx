import { useState, useEffect, useCallback, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  api,
  isAuthRateLimitError,
  type AuthRateLimitInfo,
} from "@/services/api";
import { AuthRateLimitBlock } from "./AuthRateLimitBlock";

export function RegisterPage() {
  const { register } = useAuth();
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || "en";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [challenge, setChallenge] = useState<{
    challenge_id: string;
    question: string;
  } | null>(null);
  const [challengeAnswer, setChallengeAnswer] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [error, setError] = useState("");
  const [rateLimit, setRateLimit] = useState<AuthRateLimitInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [challengeLoading, setChallengeLoading] = useState(false);

  const fetchChallenge = useCallback(() => {
    setChallengeLoading(true);
    setChallengeAnswer("");
    setError("");
    api
      .getHumanChallenge(locale)
      .then(setChallenge)
      .catch(() => setError(t("auth.challengeLoadFailed")))
      .finally(() => setChallengeLoading(false));
  }, [locale, t]);

  useEffect(() => {
    fetchChallenge();
  }, [fetchChallenge]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!challenge) return;

    if (password !== passwordConfirm) {
      setError(t("auth.passwordsDoNotMatch"));
      return;
    }

    setError("");
    setLoading(true);
    try {
      await register({
        full_name: fullName,
        email,
        password,
        challenge_id: challenge.challenge_id,
        challenge_answer: challengeAnswer,
        locale,
        privacy_policy_accepted: privacyAccepted,
        tos_accepted: tosAccepted,
      });
      setSuccess(true);
    } catch (err) {
      if (isAuthRateLimitError(err)) {
        setRateLimit({
          retryAfterSeconds: err.retryAfterSeconds,
          blockedUntil:
            err.blockedUntil || fallbackBlockedUntil(err.retryAfterSeconds),
        });
        setLoading(false);
        return;
      }
      setError(
        err instanceof Error ? err.message : t("auth.registrationFailed"),
      );
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <UserPlus className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-text-primary">
              {t("auth.checkEmail")}
            </h1>
          </div>
          <p className="text-text-secondary">
            {t("auth.confirmationEmailSent")}
          </p>
          <Link
            to="/login"
            className="text-primary hover:underline mt-4 inline-block"
          >
            {t("auth.goToLogin")}
          </Link>
        </Card>
      </div>
    );
  }

  if (rateLimit) {
    return (
      <AuthRateLimitBlock
        info={rateLimit}
        onRetry={() => {
          setRateLimit(null);
          fetchChallenge();
        }}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <div className="mb-6">
          <h1 className="flex min-w-0 items-center gap-2 text-2xl font-bold text-text-primary">
            <UserPlus className="h-6 w-6 shrink-0 text-primary" />
            <span className="min-w-0 break-words">{t("auth.register")}</span>
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {t("auth.registerDescription")}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {t("auth.fullName")}
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <p className="mt-1 text-xs text-text-secondary">
              {t("auth.fullNameHelp")}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {t("auth.email")}
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <p className="mt-1 text-xs text-text-secondary">
              {t("auth.emailHelp")}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {t("auth.password")}
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <p className="mt-1 text-xs text-text-secondary">
              {t("auth.passwordHelp")}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {t("auth.confirmPassword")}
            </label>
            <Input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              minLength={8}
            />
          </div>
          {challenge && (
            <div>
              <div className="mb-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <label className="text-sm text-text-secondary break-words">
                  {challenge.question}
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={fetchChallenge}
                  disabled={challengeLoading}
                >
                  {challengeLoading
                    ? t("common.loading")
                    : t("auth.tryAnotherQuestion")}
                </Button>
              </div>
              <Input
                value={challengeAnswer}
                onChange={(e) => setChallengeAnswer(e.target.value)}
                required
              />
              <p className="mt-1 text-xs text-text-secondary">
                {t("auth.challengeHelp")}
              </p>
            </div>
          )}
          {error && <p className="text-error text-sm">{error}</p>}
          <div className="space-y-2">
            <label className="flex items-start gap-2 text-sm text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
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
            <label className="flex items-start gap-2 text-sm text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={tosAccepted}
                onChange={(e) => setTosAccepted(e.target.checked)}
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
          <Button
            type="submit"
            disabled={loading || !challenge || !privacyAccepted || !tosAccepted}
            className="w-full"
          >
            {loading ? t("auth.registering") : t("auth.register")}
          </Button>
        </form>
        <p className="text-sm text-text-secondary mt-4 text-center">
          {t("auth.hasAccount")}{" "}
          <Link to="/login" className="text-primary hover:underline">
            {t("auth.login")}
          </Link>
        </p>
      </Card>
    </div>
  );
}

function fallbackBlockedUntil(retryAfterSeconds?: number): string | undefined {
  if (!retryAfterSeconds) return undefined;
  return new Date(Date.now() + retryAfterSeconds * 1000).toISOString();
}
