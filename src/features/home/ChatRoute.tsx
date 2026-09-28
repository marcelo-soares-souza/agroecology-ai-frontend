import { AuthGuard } from "@/components/AuthGuard";
import { useChatAvailability } from "@/hooks/use-chat-availability";
import { ChatPage } from "./ChatPage";
import { ChatUnavailablePage } from "./ChatUnavailablePage";

export function ChatRoute() {
  const { chatEnabled, isLoading } = useChatAvailability();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!chatEnabled) return <ChatUnavailablePage />;

  return (
    <AuthGuard>
      <ChatPage />
    </AuthGuard>
  );
}
