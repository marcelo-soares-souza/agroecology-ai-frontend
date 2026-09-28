import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { FileText, Heart, MessageCircleOff } from "lucide-react";
import { Card } from "@/components/ui/Card";

const koFiUrl = "https://ko-fi.com/agroecologymap";

export function ChatUnavailablePage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-2xl items-center py-8">
      <Card className="w-full text-center" padding="lg">
        <MessageCircleOff className="mx-auto h-12 w-12 text-amber-600" />
        <h1 className="mt-4 text-2xl font-bold text-text-primary">
          {t("chatUnavailable.title")}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-text-secondary">
          {t("chatUnavailable.description")}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
          {t("chatUnavailable.documentsDescription")}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/documents"
            className="inline-flex items-center justify-center gap-2 rounded-button bg-primary px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-dark"
          >
            <FileText className="h-4 w-4" />
            {t("chatUnavailable.documentsCta")}
          </Link>
          <a
            href={koFiUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-button bg-primary-100 px-5 py-2.5 font-medium text-primary-700 transition-colors hover:bg-primary-200"
          >
            <Heart className="h-4 w-4" />
            {t("chatUnavailable.supportCta")}
          </a>
        </div>
      </Card>
    </div>
  );
}
