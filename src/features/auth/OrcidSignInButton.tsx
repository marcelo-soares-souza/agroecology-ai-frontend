import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BadgeCheck } from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import { Button } from "@/components/ui/Button";
import { api } from "@/services/api";

interface OrcidSignInButtonProps {
  returnTo: string;
}

export function OrcidSignInButton({ returnTo }: OrcidSignInButtonProps) {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .getAuthProviders()
      .then((providers) => {
        if (!cancelled) {
          setEnabled(providers.orcid_enabled);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEnabled(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!enabled) {
    return null;
  }

  const params = new URLSearchParams();
  params.set("return_to", safeReturnTo(returnTo));
  const startUrl = `${API_BASE_URL}/api/v1/auth/orcid/start?${params.toString()}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-xs uppercase text-text-secondary">
        <span className="h-px flex-1 bg-primary-100" />
        <span>{t("auth.orcidDivider")}</span>
        <span className="h-px flex-1 bg-primary-100" />
      </div>
      <Button
        type="button"
        variant="secondary"
        className="w-full border border-[#A6CE39] bg-[#F7FBEE] text-[#338000] hover:bg-[#EEF8DC]"
        onClick={() => {
          window.location.href = startUrl;
        }}
      >
        <BadgeCheck className="h-5 w-5" />
        {t("auth.signInWithOrcid")}
      </Button>
    </div>
  );
}

function safeReturnTo(value: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
}
