import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

export function useChatAvailability() {
  const query = useQuery({
    queryKey: ["public-config"],
    queryFn: api.getPublicConfig,
    staleTime: Infinity,
    retry: false,
  });

  return {
    chatEnabled: query.data?.chat_enabled ?? false,
    isLoading: query.isLoading,
  };
}
