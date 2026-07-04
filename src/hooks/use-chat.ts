import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { api } from "@/services/api";
import type { ChatMessage, AnswerResponse } from "@/services/types";
import {
  saveChatMessages,
  loadChatMessages,
  clearChatMessages,
  isChatHistoryEnabled,
  setChatHistoryEnabled,
} from "@/lib/ChatStorage";

const MAX_HISTORY_MESSAGES = 6;
const MAX_HISTORY_MESSAGE_CHARS = 1000;
const MAX_HISTORY_TOTAL_CHARS = 2200;

function buildRequestHistory(messages: ChatMessage[]) {
  const recentMessages = messages
    .filter((m) => m.status === "done" && m.content)
    .slice(-MAX_HISTORY_MESSAGES);
  const selected: Array<{ role: ChatMessage["role"]; content: string }> = [];
  let totalChars = 0;

  for (let i = recentMessages.length - 1; i >= 0; i -= 1) {
    const message = recentMessages[i];
    const content = message.content
      .slice(0, MAX_HISTORY_MESSAGE_CHARS)
      .trim();

    if (!content) continue;

    if (
      selected.length > 0 &&
      totalChars + content.length > MAX_HISTORY_TOTAL_CHARS
    ) {
      break;
    }

    selected.unshift({ role: message.role, content });
    totalChars += content.length;
  }

  return selected;
}

function useTaskPolling(
  taskId: string | null,
  enabled: boolean,
  unknownError: string,
) {
  const [result, setResult] = useState<AnswerResponse | null>(null);
  const [pollError, setPollError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !taskId) return;

    setResult(null);
    setPollError(null);

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      if (cancelled) return;
      try {
        const answer = await api.getAnswer(taskId);
        if (cancelled) return;
        setResult(answer);
        if (answer.status === "processing") {
          timer = setTimeout(poll, 2000);
        }
      } catch (err) {
        if (!cancelled) {
          setPollError(err instanceof Error ? err.message : unknownError);
        }
      }
    };

    poll();

    return () => {
      cancelled = true;
      if (timer!) clearTimeout(timer);
    };
  }, [taskId, enabled, unknownError]);

  return { result, error: pollError };
}

export function useChat() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    loadChatMessages(),
  );
  const [localHistoryEnabled, setLocalHistoryEnabled] = useState(() =>
    isChatHistoryEnabled(),
  );
  const [isSending, setIsSending] = useState(false);
  const [pollingTaskId, setPollingTaskId] = useState<string | null>(null);
  const [pendingAssistantId, setPendingAssistantId] = useState<string | null>(
    null,
  );
  const pollRetriesRef = useRef(0);
  const requestIdRef = useRef(0);
  const messagesRef = useRef<ChatMessage[]>([]);
  const startedAtRef = useRef(0);
  const MAX_POLL_RETRIES = 300;

  // Keep messagesRef in sync
  messagesRef.current = messages;

  const { result: pollResult, error: pollError } = useTaskPolling(
    pollingTaskId,
    isSending && pollingTaskId !== null,
    t("common.unknownError"),
  );

  useEffect(() => {
    if (!pollResult || !pendingAssistantId) return;
    if (pollingTaskId && pollResult.task_id !== pollingTaskId) return;

    if (pollResult.status === "processing") {
      pollRetriesRef.current += 1;
      if (pollRetriesRef.current >= MAX_POLL_RETRIES) {
        setPollingTaskId(null);
        setPendingAssistantId(null);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === pendingAssistantId
              ? { ...m, status: "error", error: t("home.pollingTimeout") }
              : m,
          ),
        );
        setIsSending(false);
      }
      return;
    }

    setPollingTaskId(null);
    setPendingAssistantId(null);
    pollRetriesRef.current = 0;

    if (pollResult.status === "done") {
      const durationMs = Date.now() - startedAtRef.current;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingAssistantId
            ? {
                ...m,
                content: pollResult.answer || "",
                sources: pollResult.sources || undefined,
                status: "done",
                durationMs,
              }
            : m,
        ),
      );
    } else {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingAssistantId
            ? {
                ...m,
                status: "error",
                error: pollResult.error || t("common.unknownError"),
              }
            : m,
        ),
      );
    }
    setIsSending(false);
  }, [pollResult, pendingAssistantId, pollingTaskId, t]);

  useEffect(() => {
    if (!pollError || !pendingAssistantId) return;
    setPollingTaskId(null);
    setPendingAssistantId(null);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === pendingAssistantId
          ? { ...m, status: "error", error: pollError }
          : m,
      ),
    );
    setIsSending(false);
  }, [pollError, pendingAssistantId]);

  // Persist messages to localStorage on every change
  useEffect(() => {
    saveChatMessages(messages);
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setPollingTaskId(null);
    setPendingAssistantId(null);
    setIsSending(false);
    clearChatMessages();
  }, []);

  const sendMessage = useCallback(
    async (question: string) => {
      const currentRequestId = ++requestIdRef.current;
      startedAtRef.current = Date.now();

      setPollingTaskId(null);
      setPendingAssistantId(null);
      setIsSending(true);
      pollRetriesRef.current = 0;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: question,
        status: "done",
      };

      const assistantId = crypto.randomUUID();
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        status: "thinking",
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);

      try {
        const recentMessages = buildRequestHistory(messagesRef.current);

        const { task_id } = await api.ask({
          question,
          history: recentMessages,
          locale: i18n.resolvedLanguage || i18n.language || "en",
        });

        if (currentRequestId !== requestIdRef.current) return;

        setPendingAssistantId(assistantId);
        setPollingTaskId(task_id);
      } catch (err) {
        if (currentRequestId !== requestIdRef.current) return;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  status: "error",
                  error:
                    err instanceof Error
                      ? err.message
                      : t("common.unknownError"),
                }
              : m,
          ),
        );
        setIsSending(false);
      }
    },
    [i18n.language, i18n.resolvedLanguage, t],
  );

  const setLocalHistory = useCallback((enabled: boolean) => {
    setChatHistoryEnabled(enabled);
    setLocalHistoryEnabled(enabled);
    if (!enabled) {
      setMessages([]);
    }
  }, []);

  return {
    messages,
    isSending,
    sendMessage,
    clearChat,
    localHistoryEnabled,
    setLocalHistory,
  };
}
