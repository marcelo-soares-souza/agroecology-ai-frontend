import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function ConfirmEmailPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const { confirmEmail } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError(t("auth.noConfirmationToken"));
      return;
    }
    confirmEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setError(
          err instanceof Error ? err.message : t("auth.confirmationFailed"),
        );
      });
  }, [token, confirmEmail, t]);

  return (
    <div className="max-w-md mx-auto">
      <Card className="text-center">
        {status === "loading" && (
          <p className="text-text-secondary">{t("auth.confirmingEmail")}</p>
        )}
        {status === "success" && (
          <>
            <h1 className="text-2xl font-bold text-text-primary mb-4">
              {t("auth.emailConfirmed")}
            </h1>
            <p className="text-text-secondary mb-4">
              {t("auth.accountActive")}
            </p>
            <Link to="/login">
              <Button>{t("auth.goToLogin")}</Button>
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-2xl font-bold text-text-primary mb-4">
              {t("auth.confirmationFailedTitle")}
            </h1>
            <p className="text-error text-sm">{error}</p>
            <Link
              to="/login"
              className="text-primary hover:underline mt-4 inline-block"
            >
              {t("auth.backToLogin")}
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}
