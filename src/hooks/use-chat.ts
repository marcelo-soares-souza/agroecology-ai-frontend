import { useState, useCallback, useEffect, useRef } from "react";
import { api } from "@/services/api";
import type { ChatMessage, AnswerResponse } from "@/services/types";

function useTaskPolling(taskId: string | null, enabled: boolean) {
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
          setPollError(err instanceof Error ? err.message : "Unknown error");
        }
      }
    };

    poll();

    return () => {
      cancelled = true;
      if (timer!) clearTimeout(timer);
    };
  }, [taskId, enabled]);

  return { result, error: pollError };
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
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
              ? { ...m, status: "error", error: "Polling timeout" }
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
                error: pollResult.error || "Unknown error",
              }
            : m,
        ),
      );
    }
    setIsSending(false);
  }, [pollResult, pendingAssistantId, pollingTaskId]);

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
    setMessages([]);
    setPollingTaskId(null);
    setPendingAssistantId(null);
    setIsSending(false);
  }, []);

  const sendMessage = useCallback(async (question: string) => {
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
      const recentMessages = messagesRef.current
        .filter((m) => m.status === "done" && m.content)
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      const { task_id } = await api.ask({
        question,
        history: recentMessages,
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
                error: err instanceof Error ? err.message : "Unknown error",
              }
            : m,
        ),
      );
      setIsSending(false);
    }
  }, []);

  return { messages, isSending, sendMessage, clearChat };
}
