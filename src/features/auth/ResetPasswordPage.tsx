import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/services/api";

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError(t("auth.passwordsDoNotMatch"));
      return;
    }
    if (password.length < 8) {
      setError(t("auth.passwordMinLength"));
      return;
    }
    setStatus("loading");
    try {
      await api.resetPassword({ token, new_password: password });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : t("auth.resetFailed"));
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            {t("auth.invalidLink")}
          </h1>
          <p className="text-text-secondary">{t("auth.noResetToken")}</p>
          <Link
            to="/login"
            className="text-primary hover:underline mt-4 inline-block"
          >
            {t("auth.backToLogin")}
          </Link>
        </Card>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            {t("auth.passwordResetSuccessTitle")}
          </h1>
          <p className="text-text-secondary mb-4">
            {t("auth.passwordChanged")}
          </p>
          <Link to="/login" className="block w-full sm:inline-block sm:w-auto">
            <Button className="w-full sm:w-auto">{t("auth.goToLogin")}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <h1 className="mb-6 break-words text-2xl font-bold text-text-primary">
          {t("auth.resetPassword")}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {t("auth.newPassword")}
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
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {t("auth.confirmPassword")}
            </label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-error text-sm">{error}</p>}
          <Button
            type="submit"
            disabled={status === "loading"}
            className="w-full"
          >
            {status === "loading"
              ? t("auth.resetting")
              : t("auth.resetPassword")}
          </Button>
        </form>
      </Card>
    </div>
  );
}
