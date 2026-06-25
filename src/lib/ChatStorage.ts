import type { ChatMessage } from "@/services/types";

const CHAT_STORAGE_KEY = "agroecology_chat_messages";
const CHAT_HISTORY_ENABLED_KEY = "agroecology_chat_history_enabled";
const MAX_STORED_MESSAGES = 100;

export function isChatHistoryEnabled(): boolean {
  try {
    return localStorage.getItem(CHAT_HISTORY_ENABLED_KEY) !== "false";
  } catch {
    return true;
  }
}

export function setChatHistoryEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(CHAT_HISTORY_ENABLED_KEY, enabled ? "true" : "false");
    if (!enabled) {
      localStorage.removeItem(CHAT_STORAGE_KEY);
    }
  } catch {
    // localStorage unavailable - silently ignore
  }
}

export function saveChatMessages(messages: ChatMessage[]): void {
  try {
    if (!isChatHistoryEnabled()) return;
    const trimmed = messages.slice(-MAX_STORED_MESSAGES);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function loadChatMessages(): ChatMessage[] {
  try {
    if (!isChatHistoryEnabled()) return [];
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as ChatMessage[];
  } catch {
    return [];
  }
}

export function clearChatMessages(): void {
  try {
    localStorage.removeItem(CHAT_STORAGE_KEY);
  } catch {
    // silently ignore
  }
}
