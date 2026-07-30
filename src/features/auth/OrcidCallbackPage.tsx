import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/services/api";

type CallbackStatus = "loading" | "message" | "error";

export function OrcidCallbackPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { applyLoginResponse } = useAuth();
  const handledRef = useRef(false);
  const activeRef = useRef(false);
  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [message, setMessage] = useState(t("auth.orcidCompletingDescription"));

  const authCode = searchParams.get("auth_code") || "";
  const statusParam = searchParams.get("status") || "";
  const completionToken = searchParams.get("completion_token") || "";
  const returnTo = safeReturnTo(searchParams.get("return_to") || "/");

  useEffect(() => {
    activeRef.current = true;
    if (handledRef.current) {
      return () => {
        activeRef.current = false;
      };
    }
    handledRef.current = true;

    if (
      (statusParam === "email_required" ||
        statusParam === "profile_required") &&
      completionToken
    ) {
      const nextParams = new URLSearchParams(searchParams);
      navigate(`/auth/orcid/complete-email?${nextParams.toString()}`, {
        replace: true,
      });
      return;
    }

    if (statusParam === "email_confirmation_required") {
      setStatus("message");
      setMessage(t("auth.orcidEmailConfirmationRequired"));
      return;
    }

    if (!authCode) {
      setStatus("error");
      setMessage(t("auth.orcidMissingCode"));
      return;
    }

    api
      .exchangeOrcidAuthCode({ auth_code: authCode })
      .then((tokens) => {
        if (!activeRef.current) {
          return;
        }
        applyLoginResponse(tokens);
        navigate(returnTo, { replace: true });
      })
      .catch((err) => {
        if (!activeRef.current) {
          return;
        }
        setStatus("error");
        setMessage(err instanceof Error ? err.message : t("auth.orcidFailed"));
      });

    return () => {
      activeRef.current = false;
    };
  }, [
    applyLoginResponse,
    authCode,
    completionToken,
    navigate,
    returnTo,
    searchParams,
    statusParam,
    t,
  ]);

  return (
    <div className="mx-auto max-w-md">
      <Card className="text-center">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto mb-4 h-7 w-7 animate-spin text-primary" />
            <h1 className="mb-2 text-2xl font-bold text-text-primary">
              {t("auth.orcidCompletingTitle")}
            </h1>
            <p className="text-text-secondary">{message}</p>
          </>
        )}
        {status === "message" && (
          <>
            <CheckCircle2 className="mx-auto mb-4 h-7 w-7 text-success" />
            <h1 className="mb-2 text-2xl font-bold text-text-primary">
              {t("auth.orcidConfirmationRequiredTitle")}
            </h1>
            <p className="mb-4 text-text-secondary">{message}</p>
            <Link
              to="/login"
              className="block w-full sm:inline-block sm:w-auto"
            >
              <Button className="w-full sm:w-auto">
                {t("auth.goToLogin")}
              </Button>
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="mx-auto mb-4 h-7 w-7 text-error" />
            <h1 className="mb-2 text-2xl font-bold text-text-primary">
              {t("auth.orcidFailed")}
            </h1>
            <p className="text-sm text-error">{message}</p>
            <Link
              to="/login"
              className="mt-4 inline-block text-primary hover:underline"
            >
              {t("auth.backToLogin")}
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}

function safeReturnTo(value: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
}
