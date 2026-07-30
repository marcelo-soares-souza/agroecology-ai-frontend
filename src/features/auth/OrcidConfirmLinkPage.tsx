import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { api } from "@/services/api";

type LinkStatus = "loading" | "success" | "error";

export function OrcidConfirmLinkPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const handledRef = useRef(false);
  const activeRef = useRef(false);
  const [status, setStatus] = useState<LinkStatus>("loading");
  const [message, setMessage] = useState(t("auth.orcidConfirmingLink"));

  useEffect(() => {
    activeRef.current = true;
    if (handledRef.current) {
      return () => {
        activeRef.current = false;
      };
    }
    handledRef.current = true;

    if (!token) {
      setStatus("error");
      setMessage(t("auth.noConfirmationToken"));
      return;
    }

    api
      .confirmOrcidLink(token)
      .then(() => {
        if (!activeRef.current) {
          return;
        }
        setStatus("success");
        setMessage(t("auth.orcidLinkConfirmed"));
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
  }, [t, token]);

  return (
    <div className="mx-auto max-w-md">
      <Card className="text-center">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto mb-4 h-7 w-7 animate-spin text-primary" />
            <p className="text-text-secondary">{message}</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto mb-4 h-7 w-7 text-success" />
            <h1 className="mb-2 text-2xl font-bold text-text-primary">
              {t("auth.orcidLinkConfirmedTitle")}
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
              {t("auth.confirmationFailedTitle")}
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
