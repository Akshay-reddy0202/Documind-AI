import type {
  ChatRequest,
  ChatSource,
  ChatIssueCitation,
  ConversationHistoryResponse,
  ConversationListResponse,
  DeleteConversationResponse,
} from "../types/chat.types";
const API_URL = import.meta.env.VITE_API_URL;

export type StreamChatMessageCallbacks = {
  onToken: (token: string) => void;
  onMetadata?: (meta: {
    conversationId: string;
    title: string;
    sources: ChatSource[];
    relatedIssues?: ChatIssueCitation[];
  }) => void;
  onError?: (error: string) => void;
};

export const streamChatMessage = async (
  request: ChatRequest,
  callbacks: StreamChatMessageCallbacks,
): Promise<{ conversationId: string; answer: string }> => {
  const response = await fetch(`${API_URL}/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to stream chat message");
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Streaming not supported by browser");
  }

  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let fullAnswer = "";
  let resolvedConversationId = request.conversationId || "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";

    for (const part of parts) {
      if (!part.trim()) continue;

      let eventType = "message";
      let dataText = "";

      const lines = part.split("\n");
      for (const line of lines) {
        if (line.startsWith("event:")) {
          eventType = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          dataText = line.slice(5).trim();
        }
      }

      if (!dataText) continue;

      try {
        const parsed = JSON.parse(dataText);

        if (eventType === "metadata") {
          if (parsed.conversationId) {
            resolvedConversationId = parsed.conversationId;
          }
          callbacks.onMetadata?.(parsed);
        } else if (eventType === "token") {
          if (parsed.token) {
            fullAnswer += parsed.token;
            callbacks.onToken(parsed.token);
          }
        } else if (eventType === "done") {
          if (parsed.conversationId) {
            resolvedConversationId = parsed.conversationId;
          }
          if (parsed.answer) {
            fullAnswer = parsed.answer;
          }
        } else if (eventType === "error") {
          const errMsg = parsed.message || "Streaming error";
          callbacks.onError?.(errMsg);
          throw new Error(errMsg);
        }
      } catch (err) {
        if (
          err instanceof Error &&
          err.message !== "Unexpected end of JSON input"
        ) {
          console.warn("SSE chunk parse warning:", err);
        }
      }
    }
  }

  return { conversationId: resolvedConversationId, answer: fullAnswer };
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
