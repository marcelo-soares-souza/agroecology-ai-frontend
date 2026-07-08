import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Loader2,
  MessageCircle,
  PanelLeft,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { ChatBox } from "@/components/chat/ChatBox";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { ApiError, api } from "@/services/api";
import type {
  ChatConversationDetail,
  ChatConversationListResponse,
  ChatConversationSummary,
} from "@/services/types";

interface ConversationPanelProps {
  conversations: ChatConversationSummary[];
  activeConversationId: string | null;
  isLoading: boolean;
  isCreatingConversation: boolean;
  deletingConversationId: string | null;
  mobileOpen: boolean;
  locale: string;
  onNewChat: () => void;
  onSelect: (conversationId: string) => void;
  onDelete: (conversationId: string) => void;
  onCloseMobile: () => void;
}

function formatConversationDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function titleFromQuestion(question: string): string {
  const normalized = question.trim().replace(/\s+/g, " ");
  if (normalized.length <= 80) return normalized;
  return `${normalized.slice(0, 77).trimEnd()}...`;
}

const DEFAULT_CONVERSATION_TITLES = new Set([
  "new chat",
  "nova conversa",
  "nueva conversacion",
  "nouvelle conversation",
]);

function normalizeConversationTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isDefaultConversationTitle(title: string): boolean {
  return DEFAULT_CONVERSATION_TITLES.has(normalizeConversationTitle(title));
}

function ConversationPanel({
  conversations,
  activeConversationId,
  isLoading,
  isCreatingConversation,
  deletingConversationId,
  mobileOpen,
  locale,
  onNewChat,
  onSelect,
  onDelete,
  onCloseMobile,
}: ConversationPanelProps) {
  const { t } = useTranslation();

  return (
    <aside
      className={cn(
        "min-h-0 flex-col overflow-hidden border border-primary-100 bg-surface",
        mobileOpen
          ? "fixed inset-y-0 left-0 z-50 flex w-[min(88vw,360px)] rounded-none border-y-0 border-l-0 shadow-2xl"
          : "hidden",
        "md:static md:z-auto md:flex md:w-auto md:rounded-[var(--radius-card)] md:border md:shadow-none",
      )}
    >
      <div className="border-b border-primary-100 p-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-text-primary">
            <MessageCircle className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{t("home.conversations")}</span>
          </h2>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-8 px-2"
              onClick={onNewChat}
              disabled={isCreatingConversation}
              title={t("home.newChat")}
            >
              {isCreatingConversation ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span className="hidden lg:inline">{t("home.newChat")}</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 px-2 md:hidden"
              onClick={onCloseMobile}
              title={t("common.close")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-text-secondary">
          {t("home.registeredHistoryNotice")}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex items-center gap-2 px-2 py-3 text-sm text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("home.loadingConversations")}
          </div>
        ) : conversations.length === 0 ? (
          <p className="px-2 py-3 text-sm text-text-secondary">
            {t("home.emptyConversations")}
          </p>
        ) : (
          <div className="space-y-1">
            {conversations.map((conversation) => {
              const active = conversation.id === activeConversationId;
              const deleting = conversation.id === deletingConversationId;
              return (
                <div
                  key={conversation.id}
                  className={cn(
                    "group flex items-start gap-1 rounded-[var(--radius-input)] border border-transparent",
                    active
                      ? "border-primary-200 bg-primary-50"
                      : "hover:bg-primary-50/60",
                  )}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 px-2 py-2 text-left"
                    onClick={() => onSelect(conversation.id)}
                  >
                    <span className="block truncate text-sm font-medium text-text-primary">
                      {conversation.title}
                    </span>
                    {conversation.last_message_preview && (
                      <span className="mt-0.5 block truncate text-xs text-text-secondary">
                        {conversation.last_message_preview}
                      </span>
                    )}
                    <span className="mt-1 block text-xs text-text-muted">
                      {formatConversationDate(
                        conversation.last_message_at,
                        locale,
                      )}
                    </span>
                  </button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="mt-1 h-8 px-2 text-text-muted hover:text-error"
                    onClick={() => onDelete(conversation.id)}
                    disabled={deleting}
                    title={t("home.deleteConversation")}
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}

export function ChatPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [deletingConversationId, setDeletingConversationId] = useState<
    string | null
  >(null);
  const [chatNotice, setChatNotice] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversationsQuery = useQuery({
    queryKey: ["chat-conversations"],
    queryFn: () => api.listChatConversations({ limit: 100 }),
  });
  const activeConversationQuery = useQuery({
    queryKey: ["chat-conversation", activeConversationId],
    queryFn: () => api.getChatConversation(activeConversationId as string),
    enabled: activeConversationId !== null,
  });
  const { data: serverStatus } = useQuery({
    queryKey: ["server-status", "chat"],
    queryFn: api.getStatus,
    refetchInterval: (query) => {
      const status = query.state.data?.ingest_status;
      if (status === "queued" || status === "processing") return 3000;
      return 15000;
    },
  });

  const refreshConversationQueries = useCallback(
    (conversationId: string) => {
      void queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      void queryClient.invalidateQueries({
        queryKey: ["chat-conversation", conversationId],
      });
    },
    [queryClient],
  );

  const {
    messages,
    isSending,
    sendMessage,
    clearChat,
    loadConversationMessages,
  } = useChat({
    activeConversationId,
    onConversationCreated: (conversationId) => {
      setActiveConversationId(conversationId);
      setMobilePanelOpen(false);
    },
    onConversationChanged: refreshConversationQueries,
  });

  const conversations = conversationsQuery.data?.data ?? [];
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
  const locale = i18n.resolvedLanguage || i18n.language || "en";
  const activeConversation =
    activeConversationQuery.data?.conversation ??
    conversations.find(
      (conversation) => conversation.id === activeConversationId,
    );
  const isConversationLoading =
    activeConversationId !== null &&
    activeConversationQuery.isLoading &&
    messages.length === 0;

  const applyConversationSummary = useCallback(
    (conversation: ChatConversationSummary) => {
      queryClient.setQueryData<ChatConversationListResponse>(
        ["chat-conversations"],
        (current) => {
          if (!current) return current;
          return {
            ...current,
            data: current.data.map((item) =>
              item.id === conversation.id ? conversation : item,
            ),
          };
        },
      );
      queryClient.setQueryData<ChatConversationDetail>(
        ["chat-conversation", conversation.id],
        (current) => {
          if (!current) return current;
          return {
            ...current,
            conversation,
          };
        },
      );
    },
    [queryClient],
  );

  const updateConversationTitle = useCallback(
    (conversationId: string, title: string) => {
      queryClient.setQueryData<ChatConversationListResponse>(
        ["chat-conversations"],
        (current) => {
          if (!current) return current;
          return {
            ...current,
            data: current.data.map((conversation) =>
              conversation.id === conversationId
                ? { ...conversation, title }
                : conversation,
            ),
          };
        },
      );
      queryClient.setQueryData<ChatConversationDetail>(
        ["chat-conversation", conversationId],
        (current) => {
          if (!current) return current;
          return {
            ...current,
            conversation: {
              ...current.conversation,
              title,
            },
          };
        },
      );
    },
    [queryClient],
  );

  const renameConversationFromQuestion = useCallback(
    async (conversationId: string, question: string) => {
      const title = titleFromQuestion(question);
      updateConversationTitle(conversationId, title);

      try {
        const conversation = await api.renameChatConversation(
          conversationId,
          title,
        );
        applyConversationSummary(conversation);
      } catch {
        void queryClient.invalidateQueries({
          queryKey: ["chat-conversations"],
        });
        void queryClient.invalidateQueries({
          queryKey: ["chat-conversation", conversationId],
        });
      }
    },
    [applyConversationSummary, queryClient, updateConversationTitle],
  );

  const handleSendMessage = useCallback(
    (question: string) => {
      if (
        activeConversationId &&
        messages.length === 0 &&
        activeConversation?.message_count === 0
      ) {
        void renameConversationFromQuestion(activeConversationId, question);
      }

      sendMessage(question);
    },
    [
      activeConversation?.message_count,
      activeConversationId,
      messages.length,
      renameConversationFromQuestion,
      sendMessage,
    ],
  );

  useEffect(() => {
    if (!activeConversationId || !activeConversationQuery.data) return;
    const { conversation, messages: conversationMessages } =
      activeConversationQuery.data;
    loadConversationMessages(conversationMessages);

    const firstUserMessage = conversationMessages.find(
      (message) => message.role === "user" && message.content.trim(),
    );
    if (firstUserMessage && isDefaultConversationTitle(conversation.title)) {
      void renameConversationFromQuestion(
        conversation.id,
        firstUserMessage.content,
      );
    }
  }, [
    activeConversationId,
    activeConversationQuery.data,
    loadConversationMessages,
    renameConversationFromQuestion,
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleNewChat = useCallback(async () => {
    setChatNotice(null);
    if (
      activeConversationId &&
      messages.length === 0 &&
      activeConversation?.message_count === 0
    ) {
      setMobilePanelOpen(false);
      clearChat();
      return;
    }

    setIsCreatingConversation(true);
    try {
      const conversation = await api.createChatConversation(t("home.newChat"));
      queryClient.setQueryData(["chat-conversation", conversation.id], {
        conversation,
        messages: [],
      });
      queryClient.setQueryData<ChatConversationListResponse>(
        ["chat-conversations"],
        (current) => {
          if (!current) return current;
          const data = [
            conversation,
            ...current.data.filter((item) => item.id !== conversation.id),
          ];
          return {
            ...current,
            data,
            total: current.data.some((item) => item.id === conversation.id)
              ? current.total
              : current.total + 1,
          };
        },
      );
      setActiveConversationId(conversation.id);
      setMobilePanelOpen(false);
      clearChat();
      void queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.code === "chat_conversation_limit_reached"
      ) {
        setChatNotice(t("home.chatConversationLimitReached"));
      } else {
        setChatNotice(
          error instanceof Error ? error.message : t("common.unknownError"),
        );
      }
    } finally {
      setIsCreatingConversation(false);
    }
  }, [
    activeConversation?.message_count,
    activeConversationId,
    clearChat,
    messages.length,
    queryClient,
    t,
  ]);

  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      if (conversationId === activeConversationId) {
        setMobilePanelOpen(false);
        return;
      }
      setChatNotice(null);
      setActiveConversationId(conversationId);
      setMobilePanelOpen(false);
      clearChat();
    },
    [activeConversationId, clearChat],
  );

  const handleDeleteConversation = useCallback(
    async (conversationId: string) => {
      if (!window.confirm(t("home.deleteConversationConfirm"))) return;

      setChatNotice(null);
      setDeletingConversationId(conversationId);
      try {
        await api.deleteChatConversation(conversationId);
        if (conversationId === activeConversationId) {
          setActiveConversationId(null);
          clearChat();
        }
        queryClient.removeQueries({
          queryKey: ["chat-conversation", conversationId],
        });
        void queryClient.invalidateQueries({
          queryKey: ["chat-conversations"],
        });
      } finally {
        setDeletingConversationId(null);
      }
    },
    [activeConversationId, clearChat, queryClient, t],
  );

  return (
    <div className="flex h-[calc(100dvh-6.5rem)] flex-col gap-3 md:h-[calc(100vh-6rem)]">
      {mobilePanelOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setMobilePanelOpen(false)}
          aria-label={t("common.close")}
        />
      )}

      <div className="md:hidden">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="min-w-0 flex-1"
            onClick={() => setMobilePanelOpen(true)}
          >
            <PanelLeft className="h-4 w-4" />
            <span className="truncate">{t("home.conversations")}</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="px-2"
            onClick={handleNewChat}
            disabled={isCreatingConversation}
            title={t("home.newChat")}
          >
            {isCreatingConversation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span className="sr-only">{t("home.newChat")}</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="px-2 text-text-muted hover:text-error"
            onClick={() =>
              activeConversationId &&
              handleDeleteConversation(activeConversationId)
            }
            disabled={
              !activeConversationId ||
              deletingConversationId === activeConversationId
            }
            title={t("home.deleteCurrentConversation")}
          >
            {deletingConversationId === activeConversationId ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span className="sr-only">
              {t("home.deleteCurrentConversation")}
            </span>
          </Button>
        </div>
        {activeConversation && (
          <p className="mt-2 truncate text-xs text-text-secondary">
            {activeConversation.title}
          </p>
        )}
      </div>

      <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-[300px_minmax(0,1fr)]">
        <ConversationPanel
          conversations={conversations}
          activeConversationId={activeConversationId}
          isLoading={conversationsQuery.isLoading}
          isCreatingConversation={isCreatingConversation}
          deletingConversationId={deletingConversationId}
          mobileOpen={mobilePanelOpen}
          locale={locale}
          onNewChat={handleNewChat}
          onSelect={handleSelectConversation}
          onDelete={handleDeleteConversation}
          onCloseMobile={() => setMobilePanelOpen(false)}
        />

        <section className="flex min-h-0 flex-col">
          <div className="mb-2 hidden flex-col gap-3 md:flex md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <h1 className="flex min-w-0 items-center gap-2 text-2xl font-bold text-text-primary">
                <MessageCircle className="h-6 w-6 shrink-0 text-primary" />
                <span className="min-w-0 break-words">{t("home.title")}</span>
              </h1>
              <p className="mt-1 text-sm text-text-secondary">
                {t("home.description")}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full md:w-auto"
              onClick={handleNewChat}
              disabled={isCreatingConversation}
            >
              {isCreatingConversation ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {t("home.newChat")}
            </Button>
          </div>
          <p className="mb-4 hidden items-center gap-1 text-sm text-text-secondary md:flex">
            <FileText className="h-3.5 w-3.5" />
            {t("home.knowledgeBase")}{" "}
            <Link
              to="/documents"
              className="font-medium text-primary hover:underline"
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

          {chatNotice && (
            <div className="mb-4 rounded-[var(--radius-card)] border border-error/30 bg-error/10 px-4 py-3 text-sm font-medium text-error">
              {chatNotice}
            </div>
          )}

          <div
            ref={scrollRef}
            className="mb-4 flex-1 overflow-y-auto rounded-[var(--radius-card)] border border-primary-100"
          >
            {isConversationLoading ? (
              <div className="flex h-full items-center justify-center gap-2 p-8 text-text-secondary">
                <Loader2 className="h-5 w-5 animate-spin" />
                {t("home.loadingConversation")}
              </div>
            ) : activeConversationQuery.isError ? (
              <div className="flex h-full items-center justify-center p-8">
                <p className="text-sm text-error">
                  {t("home.loadConversationError")}
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center p-8">
                <p className="text-lg text-text-secondary">{t("home.empty")}</p>
              </div>
            ) : (
              messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
            )}
          </div>

          <ChatBox
            onSend={handleSendMessage}
            disabled={
              isSending ||
              isConversationLoading ||
              activeConversationQuery.isError
            }
          />
        </section>
      </div>
    </div>
  );
}
