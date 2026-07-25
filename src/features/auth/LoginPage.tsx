import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { isAuthRateLimitError, type AuthRateLimitInfo } from "@/services/api";
import { AuthRateLimitBlock } from "./AuthRateLimitBlock";
import { OrcidSignInButton } from "./OrcidSignInButton";

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = (location.state as { from?: string })?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rateLimit, setRateLimit] = useState<AuthRateLimitInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
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
      setError(err instanceof Error ? err.message : t("auth.loginFailed"));
    }
    setLoading(false);
  };

  if (rateLimit) {
    return (
      <AuthRateLimitBlock
        info={rateLimit}
        onRetry={() => {
          setRateLimit(null);
          setError("");
        }}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <div className="mb-6">
          <h1 className="flex min-w-0 items-center gap-2 text-2xl font-bold text-text-primary">
            <LogIn className="h-6 w-6 shrink-0 text-primary" />
            <span className="min-w-0 break-words">{t("auth.login")}</span>
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {t("auth.loginDescription")}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {t("auth.email")}
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
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
            />
          </div>
          {error && <p className="text-error text-sm">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t("auth.loggingIn") : t("auth.login")}
          </Button>
        </form>
        <div className="mt-6">
          <OrcidSignInButton returnTo={from} />
        </div>
        <div className="mt-4 space-y-2 text-center text-sm">
          <Link
            to="/resend-confirmation"
            className="block text-text-secondary hover:text-primary"
          >
            {t("auth.resendConfirmation")}
          </Link>
          <p className="text-text-secondary">
            {t("auth.noAccount")}{" "}
            <Link to="/register" className="text-primary hover:underline">
              {t("auth.register")}
            </Link>
          </p>
          <Link
            to="/forgot-password"
            className="block text-text-secondary hover:text-primary"
          >
            {t("auth.forgotPassword")}
          </Link>
        </div>
      </Card>
    </div>
  );
}

function fallbackBlockedUntil(retryAfterSeconds?: number): string | undefined {
  if (!retryAfterSeconds) return undefined;
  return new Date(Date.now() + retryAfterSeconds * 1000).toISOString();
}
