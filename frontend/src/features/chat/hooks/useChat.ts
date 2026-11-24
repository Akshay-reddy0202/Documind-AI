import { useCallback, useState } from "react";
import type { ChatMessage } from "../types/chat.types";
import {
  streamChatMessage,
  getConversationHistory,
} from "../api/chat.api";

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

    const assistantPlaceholderId = crypto.randomUUID();
    const assistantPlaceholder: ChatMessage = {
      id: assistantPlaceholderId,
      role: "assistant",
      content: "",
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      assistantPlaceholder,
    ]);

    try {
      const result = await streamChatMessage(
        {
          question,
          ...(conversationId ? { conversationId } : {}),
        },
        {
          onMetadata: (meta) => {
            if (meta.conversationId) {
              setConversationId(meta.conversationId);
            }
            if (meta.sources || meta.relatedIssues) {
              setMessages((currentMessages) =>
                currentMessages.map((msg) =>
                  msg.id === assistantPlaceholderId
                    ? {
                        ...msg,
                        sources: meta.sources,
                        relatedIssues: meta.relatedIssues,
                      }
                    : msg,
                ),
              );
            }
          },
          onToken: (token) => {
            setMessages((currentMessages) =>
              currentMessages.map((msg) =>
                msg.id === assistantPlaceholderId
                  ? { ...msg, content: msg.content + token }
                  : msg,
              ),
            );
          },
          onError: (streamError) => {
            setError(streamError);
          },
        },
      );

      setConversationId(result.conversationId);
      return result.conversationId;
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to send chat message",
      );

      // Clean up empty placeholder on error
      setMessages((currentMessages) =>
        currentMessages.filter(
          (msg) => !(msg.id === assistantPlaceholderId && msg.content === ""),
        ),
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
