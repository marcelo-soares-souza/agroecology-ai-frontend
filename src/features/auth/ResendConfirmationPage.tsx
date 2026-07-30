import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/services/api";

export function ResendConfirmationPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.resendConfirmation(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.resendFailed"));
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            {t("auth.emailSent")}
          </h1>
          <p className="text-text-secondary">{t("auth.confirmationResent")}</p>
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

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <h1 className="text-2xl font-bold text-text-primary mb-6">
          {t("auth.resendConfirmationTitle")}
        </h1>
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
            />
          </div>
          {error && <p className="text-error text-sm">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t("auth.sending") : t("auth.resendConfirmation")}
          </Button>
        </form>
        <p className="text-sm text-text-secondary mt-4 text-center">
          <Link to="/login" className="text-primary hover:underline">
            {t("auth.backToLogin")}
          </Link>
        </p>
      </Card>
    </div>
  );
}
