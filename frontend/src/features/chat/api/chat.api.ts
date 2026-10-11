import type {
  ChatResponse,
  ChatRequest,
  ConversationHistoryResponse,
  ConversationListResponse,
  DeleteConversationResponse,
} from "../types/chat.types";
const API_URL = import.meta.env.VITE_API_URL;

export const sendChatMessage = async (
  request: ChatRequest,
): Promise<ChatResponse> => {
  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to send chat message");
  }
  return response.json();
};

export const getConversations = async (): Promise<ConversationListResponse> => {
  const response = await fetch(`${API_URL}/chat`);

  if (!response.ok) {
    throw new Error("Failed to fetch conversations");
  }

  return response.json();
};

export const getConversationHistory = async (
  conversationId: string,
): Promise<ConversationHistoryResponse> => {
  const response = await fetch(
    `${API_URL}/chat/${encodeURIComponent(conversationId)}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch conversation history");
  }

  return response.json();
};

export const deleteConversation = async (
  conversationId: string,
): Promise<DeleteConversationResponse> => {
  const response = await fetch(
    `${API_URL}/chat/${encodeURIComponent(conversationId)}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to delete conversation");
  }

  return response.json();
};
