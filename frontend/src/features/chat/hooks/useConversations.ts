import { useCallback, useEffect, useState } from "react";
import type { Conversation } from "../types/chat.types";
import { getConversations, deleteConversation } from "../api/chat.api";

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getConversations();
      setConversations(response.data.conversations);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch conversations",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeConversation = async (conversationId: string): Promise<void> => {
    setError(null);
    try {
      await deleteConversation(conversationId);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete conversation",
      );
    }
  };

  useEffect(() => {
    void fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    isLoading,
    error,
    fetchConversations,
    removeConversation,
  };
};
