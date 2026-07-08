import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { api } from "@/services/api";
import type {
  AnswerResponse,
  ChatConversationMessage,
  ChatMessage,
} from "@/services/types";

interface UseChatOptions {
  activeConversationId: string | null;
  onConversationCreated?: (conversationId: string) => void;
  onConversationChanged?: (conversationId: string) => void;
}

function toUiMessage(message: ChatConversationMessage): ChatMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    status: message.status,
    sources: message.sources || undefined,
    error: message.error || undefined,
    durationMs: message.duration_ms ?? undefined,
  };
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
    let timer: ReturnType<typeof setTimeout> | null = null;

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
      if (timer) clearTimeout(timer);
    };
  }, [taskId, enabled, unknownError]);

  return { result, error: pollError };
}

export function useChat({
  activeConversationId,
  onConversationCreated,
  onConversationChanged,
}: UseChatOptions) {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [pollingTaskId, setPollingTaskId] = useState<string | null>(null);
  const [pendingAssistantId, setPendingAssistantId] = useState<string | null>(
    null,
  );
  const activeConversationIdRef = useRef<string | null>(activeConversationId);
  const pollRetriesRef = useRef(0);
  const requestIdRef = useRef(0);
  const startedAtRef = useRef(0);
  const MAX_POLL_RETRIES = 300;

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

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
    setIsSending(false);

    const resultConversationId = pollResult.conversation_id;
    if (resultConversationId) {
      onConversationChanged?.(resultConversationId);
    }

    const isActiveConversation =
      !resultConversationId ||
      activeConversationIdRef.current === resultConversationId;
    if (!isActiveConversation) return;

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
  }, [onConversationChanged, pendingAssistantId, pollResult, pollingTaskId, t]);

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

  const clearChat = useCallback(() => {
    requestIdRef.current += 1;
    setMessages([]);
    setPollingTaskId(null);
    setPendingAssistantId(null);
    setIsSending(false);
  }, []);

  const loadConversationMessages = useCallback(
    (conversationMessages: ChatConversationMessage[]) => {
      requestIdRef.current += 1;
      const nextMessages = conversationMessages.map(toUiMessage);
      setMessages(nextMessages);

      const pendingMessage = [...conversationMessages]
        .reverse()
        .find(
          (message) =>
            message.role === "assistant" &&
            message.status === "thinking" &&
            message.task_id,
        );

      if (pendingMessage?.task_id) {
        setPendingAssistantId(pendingMessage.id);
        setPollingTaskId(pendingMessage.task_id);
        setIsSending(true);
        startedAtRef.current = Date.now();
      } else {
        setPendingAssistantId(null);
        setPollingTaskId(null);
        setIsSending(false);
      }
    },
    [],
  );

  const sendMessage = useCallback(
    async (question: string) => {
      const currentRequestId = ++requestIdRef.current;
      const requestConversationId = activeConversationIdRef.current;
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
        const response = await api.ask({
          question,
          conversation_id: requestConversationId || undefined,
          locale: i18n.resolvedLanguage || i18n.language || "en",
        });

        if (currentRequestId !== requestIdRef.current) return;

        const responseConversationId =
          response.conversation_id || requestConversationId;
        const responseUserMessageId = response.user_message_id || userMsg.id;
        const responseAssistantMessageId =
          response.assistant_message_id || assistantId;

        if (responseConversationId) {
          activeConversationIdRef.current = responseConversationId;
          if (!requestConversationId) {
            onConversationCreated?.(responseConversationId);
          }
          onConversationChanged?.(responseConversationId);
        }

        setMessages((prev) =>
          prev.map((message) => {
            if (message.id === userMsg.id) {
              return { ...message, id: responseUserMessageId };
            }
            if (message.id === assistantId) {
              return { ...message, id: responseAssistantMessageId };
            }
            return message;
          }),
        );

        setPendingAssistantId(responseAssistantMessageId);
        setPollingTaskId(response.task_id);
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
    [
      i18n.language,
      i18n.resolvedLanguage,
      onConversationChanged,
      onConversationCreated,
      t,
    ],
  );

  return {
    messages,
    isSending,
    sendMessage,
    clearChat,
    loadConversationMessages,
  };
}
