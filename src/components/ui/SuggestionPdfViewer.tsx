import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

interface SuggestionPdfViewerProps {
  suggestionId: string;
  title: string;
}

export function SuggestionPdfViewer({
  suggestionId,
  title,
}: SuggestionPdfViewerProps) {
  const { t } = useTranslation();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let revokedUrl: string | null = null;
    let cancelled = false;

    async function loadPdf() {
      setPdfUrl(null);
      setError(null);

      try {
        const { blob } = await api.getSuggestionFileBlob(suggestionId);
        if (cancelled) {
          return;
        }
        revokedUrl = URL.createObjectURL(blob);
        setPdfUrl(revokedUrl);
      } catch (err) {
        if (cancelled) {
          return;
        }
        const message =
          err instanceof Error
            ? err.message
            : t("common.unexpectedTemporaryError");
        setError(message);
      }
    }

    void loadPdf();

    return () => {
      cancelled = true;
      if (revokedUrl) {
        URL.revokeObjectURL(revokedUrl);
      }
    };
  }, [suggestionId, t]);

  if (error) {
    return (
      <Card padding="sm" className="text-error text-sm">
        {error}
      </Card>
    );
  }

  if (!pdfUrl) {
    return <Skeleton className="h-[80vh] w-full" />;
  }

  return (
    <iframe src={pdfUrl} title={title} className="w-full h-[80vh] border-0" />
  );
}
