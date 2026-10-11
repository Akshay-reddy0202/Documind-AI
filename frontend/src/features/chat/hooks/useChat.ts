import { useCallback, useState } from "react";
import type { ChatMessage } from "../types/chat.types";
import { sendChatMessage, getConversationHistory } from "../api/chat.api";

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (question: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);

    try {
      const response = await sendChatMessage({
        question,
        ...(conversationId ? { conversationId } : {}),
      });

      const newConversationId = response.data.conversationId;

      setConversationId(newConversationId);

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.data.answer,
      };

      setMessages((currentMessages) => [...currentMessages, assistantMessage]);

      return newConversationId;
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to send chat message",
      );

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversation = useCallback(
    async (selectedConversationId: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getConversationHistory(selectedConversationId);

        setConversationId(response.data.conversation.id);

        setMessages(
          response.data.messages.map((message) => ({
            id: message.id,
            role: message.role === "USER" ? "user" : "assistant",
            content: message.content,
          })),
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load conversation",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const startNewConversation = useCallback((): void => {
    setConversationId(null);
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    conversationId,
    isLoading,
    error,
    sendMessage,
    loadConversation,
    startNewConversation,
  };
};
