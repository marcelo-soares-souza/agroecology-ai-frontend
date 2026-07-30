import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Shield, Loader2 } from "lucide-react";
import { api } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { authStore } from "@/stores/AuthStore";

export function ConfirmDeleteAccountPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg(t("profile.deleteAccountNoToken"));
      return;
    }
    api
      .confirmDeleteAccount(token)
      .then(() => {
        authStore.clearSession();
        setStatus("success");
      })
      .catch((err) => {
        setStatus("error");
        setErrorMsg(
          err instanceof Error ? err.message : t("profile.deleteAccountFailed"),
        );
      });
  }, [token, t]);

  return (
    <div className="max-w-md mx-auto">
      <Card className="text-center">
        {status === "loading" && (
          <>
            <div className="flex justify-center mb-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-text-primary">
              {t("profile.deletingAccount")}
            </h1>
            <p className="text-text-secondary mt-2">
              {t("profile.deletingAccountDescription")}
            </p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="flex justify-center mb-4">
              <Shield className="h-8 w-8 text-success" />
            </div>
            <h1 className="text-xl font-bold text-text-primary">
              {t("profile.accountDeleted")}
            </h1>
            <p className="text-text-secondary mt-2">
              {t("profile.accountDeletedDescription")}
            </p>
            <Link
              to="/"
              className="mt-4 block w-full sm:inline-block sm:w-auto"
            >
              <Button variant="primary" className="w-full sm:w-auto">
                {t("common.back")}
              </Button>
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="flex justify-center mb-4">
              <Shield className="h-8 w-8 text-error" />
            </div>
            <h1 className="text-xl font-bold text-text-primary">
              {t("profile.deleteAccountFailed")}
            </h1>
            <p className="text-text-secondary mt-2">{errorMsg}</p>
            <Link
              to="/"
              className="mt-4 block w-full sm:inline-block sm:w-auto"
            >
              <Button variant="primary" className="w-full sm:w-auto">
                {t("common.back")}
              </Button>
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}
