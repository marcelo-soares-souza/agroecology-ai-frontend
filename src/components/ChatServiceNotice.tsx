import { useTranslation } from "react-i18next";
import { Heart, MessageCircleOff } from "lucide-react";
import { useChatAvailability } from "@/hooks/use-chat-availability";

const koFiUrl = "https://ko-fi.com/agroecologymap";

export function ChatServiceNotice() {
  const { t } = useTranslation();
  const { chatEnabled, isLoading } = useChatAvailability();

  if (isLoading || chatEnabled) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
      <div className="mx-auto flex w-full max-w-screen-2xl items-start gap-3 text-sm md:px-2 lg:px-0">
        <MessageCircleOff className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
        <div className="min-w-0">
          <p className="font-semibold">{t("chatUnavailable.title")}</p>
          <p className="mt-0.5 text-amber-800">
            {t("chatUnavailable.bannerDescription")}{" "}
            <a
              href={koFiUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-amber-900 underline underline-offset-2 hover:text-primary"
            >
              <Heart className="h-3.5 w-3.5" />
              {t("chatUnavailable.supportCta")}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
