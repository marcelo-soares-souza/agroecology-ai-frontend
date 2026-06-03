import { useTranslation } from "react-i18next";
import { User, Bot, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ChatMessage as ChatMessageType } from "@/services/types";
import { SourceCard } from "./SourceCard";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { t } = useTranslation();
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3",
        isUser ? "bg-primary-50/50" : "bg-surface",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary-200 text-primary-700" : "bg-primary text-white",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className="flex-1 min-w-0">
        {message.status === "thinking" ? (
          <div className="flex items-center gap-2 text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t("home.thinking")}</span>
          </div>
        ) : message.status === "error" ? (
          <div className="flex items-center gap-2 text-error">
            <AlertCircle className="h-4 w-4" />
            <span>{message.error || t("common.error")}</span>
          </div>
        ) : (
          <>
            <p className="text-text-primary whitespace-pre-wrap text-base leading-relaxed">
              {message.content}
            </p>
            {message.sources && message.sources.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-text-secondary mb-2">
                  {t("home.sources")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {message.sources.map((source, idx) => (
                    <SourceCard key={idx} source={source} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
