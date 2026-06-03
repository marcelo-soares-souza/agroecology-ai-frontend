import { useState, useRef, type FormEvent, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ChatBoxProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatBox({ onSend, disabled }: ChatBoxProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-3 bg-surface border border-primary-200 rounded-[var(--radius-card)] p-3"
    >
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t("home.placeholder")}
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none bg-transparent px-2 py-1.5 text-text-primary placeholder:text-text-secondary/60 focus:outline-none"
      />
      <Button type="submit" disabled={disabled || !input.trim()} size="sm">
        <Send className="h-4 w-4" />
        <span className="hidden sm:inline">{t("home.send")}</span>
      </Button>
    </form>
  );
}
