import { useState, useEffect, useCallback, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/services/api";

export function RegisterPage() {
  const { register } = useAuth();
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || "pt-BR";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [challenge, setChallenge] = useState<{
    challenge_id: string;
    question: string;
  } | null>(null);
  const [challengeAnswer, setChallengeAnswer] = useState("");
  const [error, setError] = useState("");
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
      });
      setSuccess(true);
    } catch (err) {
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
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            {t("auth.checkEmail")}
          </h1>
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

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <h1 className="text-2xl font-bold text-text-primary mb-6">
          {t("auth.register")}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              {t("auth.fullName")}
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              {t("auth.email")}
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              {t("auth.password")}
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">
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
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm text-text-secondary">
                  {challenge.question}
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
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
            </div>
          )}
          {error && <p className="text-error text-sm">{error}</p>}
          <Button
            type="submit"
            disabled={loading || !challenge}
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
