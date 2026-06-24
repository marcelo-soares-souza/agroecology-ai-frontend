import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Eraser, FileText, Loader2, MessageCircle } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { ChatBox } from "@/components/chat/ChatBox";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { Button } from "@/components/ui/Button";
import { api } from "@/services/api";

export function ChatPage() {
  const { t } = useTranslation();
  const { messages, isSending, sendMessage, clearChat } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: serverStatus } = useQuery({
    queryKey: ["server-status", "chat"],
    queryFn: api.getStatus,
    refetchInterval: (query) => {
      const status = query.state.data?.ingest_status;
      if (status === "queued" || status === "processing") return 3000;
      return 15000;
    },
  });

  const lastIngestion = serverStatus?.last_ingestion;
  const isReindexing =
    serverStatus?.ingest_status === "queued" ||
    serverStatus?.ingest_status === "processing";
  const documentsTotal = lastIngestion?.documents_total ?? 0;
  const documentsProcessed = lastIngestion?.documents_processed ?? 0;
  const hasDocumentProgress = documentsTotal > 0;
  const progressPercent = hasDocumentProgress
    ? Math.min(100, Math.round((documentsProcessed / documentsTotal) * 100))
    : 0;
  const chunksIndexed = lastIngestion?.chunks_indexed ?? 0;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-2">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            {t("home.title")}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {t("home.description")}
          </p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearChat}>
            <Eraser className="h-4 w-4" />
            {t("home.newChat")}
          </Button>
        )}
      </div>
      <p className="text-sm text-text-secondary mb-4 flex items-center gap-1">
        <FileText className="h-3.5 w-3.5" />
        {t("home.knowledgeBase")}{" "}
        <Link
          to="/documents"
          className="text-primary hover:underline font-medium"
        >
          {t("home.viewDocuments")}
        </Link>
      </p>

      {isReindexing && (
        <div className="mb-4 rounded-[var(--radius-card)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-text-primary">
          <div className="flex items-start gap-3">
            <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-warning" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{t("home.reindexingTitle")}</p>
              <p className="mt-1 text-text-secondary">
                {t("home.reindexingBody")}
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-text-secondary">
                  <span>
                    {hasDocumentProgress
                      ? t("home.reindexingProgressDocuments", {
                          processed: documentsProcessed,
                          total: documentsTotal,
                        })
                      : chunksIndexed > 0
                        ? t("home.reindexingProgressChunks", {
                            count: chunksIndexed,
                          })
                        : t("home.reindexingProgressPreparing")}
                  </span>
                  {hasDocumentProgress && (
                    <span>
                      {t("home.reindexingPercent", { progressPercent })}
                    </span>
                  )}
                </div>
                {hasDocumentProgress && (
                  <div className="h-2 overflow-hidden rounded-full bg-amber-100">
                    <div
                      className="h-full rounded-full bg-warning transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-[var(--radius-card)] border border-primary-100 mb-4"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full p-8">
            <p className="text-text-secondary text-lg">{t("home.empty")}</p>
          </div>
        ) : (
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        )}
      </div>

      <ChatBox onSend={sendMessage} disabled={isSending} />
    </div>
  );
}
