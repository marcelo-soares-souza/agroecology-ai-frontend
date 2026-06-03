import { useState, useCallback, useRef } from "react";
import { api } from "@/services/api";
import type { ChatMessage } from "@/services/types";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  const sendMessage = useCallback(async (question: string) => {
    setIsSending(true);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
      status: "done",
    };

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      status: "thinking",
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    try {
      const { task_id } = await api.ask({ question });

      pollingRef.current = setInterval(async () => {
        try {
          const answer = await api.getAnswer(task_id);

          if (answer.status === "done") {
            clearInterval(pollingRef.current);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsg.id
                  ? {
                      ...m,
                      content: answer.answer || "",
                      sources: answer.sources || undefined,
                      status: "done",
                    }
                  : m,
              ),
            );
            setIsSending(false);
          } else if (answer.status === "error") {
            clearInterval(pollingRef.current);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsg.id
                  ? {
                      ...m,
                      status: "error",
                      error: answer.error || "Unknown error",
                    }
                  : m,
              ),
            );
            setIsSending(false);
          }
        } catch (err) {
          clearInterval(pollingRef.current);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? {
                    ...m,
                    status: "error",
                    error: err instanceof Error ? err.message : "Unknown error",
                  }
                : m,
            ),
          );
          setIsSending(false);
        }
      }, 2000);
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? {
                ...m,
                status: "error",
                error: err instanceof Error ? err.message : "Unknown error",
              }
            : m,
        ),
      );
      setIsSending(false);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  return { messages, isSending, sendMessage, clearChat };
}
