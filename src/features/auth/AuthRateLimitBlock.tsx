import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Clock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { AuthRateLimitInfo } from "@/services/api";

interface AuthRateLimitBlockProps {
  info: AuthRateLimitInfo;
  onRetry: () => void;
}

export function AuthRateLimitBlock({ info, onRetry }: AuthRateLimitBlockProps) {
  const { t } = useTranslation();
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    calculateRemainingSeconds(info),
  );

  useEffect(() => {
    setRemainingSeconds(calculateRemainingSeconds(info));
    const timer = window.setInterval(() => {
      setRemainingSeconds(calculateRemainingSeconds(info));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [info]);

  const retryText = useMemo(() => {
    if (remainingSeconds <= 0) {
      return t("auth.rateLimitRetryAvailable");
    }

    return t("auth.rateLimitRetryIn", {
      time: formatDuration(remainingSeconds),
    });
  }, [remainingSeconds, t]);

  return (
    <div className="max-w-md mx-auto">
      <Card className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error/10 text-error">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">
          {t("auth.rateLimitTitle")}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          {t("auth.rateLimitDescription")}
        </p>
        <div className="mt-4 flex min-w-0 items-center justify-center gap-2 text-sm font-medium text-text-primary">
          <Clock className="h-4 w-4 shrink-0 text-primary" />
          <span className="min-w-0 break-words">{retryText}</span>
        </div>
        <Button
          type="button"
          className="mt-6 w-full"
          disabled={remainingSeconds > 0}
          onClick={onRetry}
        >
          {t("auth.rateLimitTryAgain")}
        </Button>
      </Card>
    </div>
  );
}

function calculateRemainingSeconds(info: AuthRateLimitInfo): number {
  if (info.blockedUntil) {
    const blockedUntilMs = Date.parse(info.blockedUntil);
    if (Number.isFinite(blockedUntilMs)) {
      return Math.max(0, Math.ceil((blockedUntilMs - Date.now()) / 1000));
    }
  }

  return Math.max(0, Math.ceil(info.retryAfterSeconds || 0));
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
