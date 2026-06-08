import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Eraser, FileText, MessageCircle } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { ChatBox } from "@/components/chat/ChatBox";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { Button } from "@/components/ui/Button";

export function ChatPage() {
  const { t } = useTranslation();
  const { messages, isSending, sendMessage, clearChat } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

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
