import type { ChatResponse, ChatRequest } from "../types/chat.types";
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
