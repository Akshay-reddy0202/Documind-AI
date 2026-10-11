
export type ChatRequest = {
  question: string;
  conversationId?: string;
};

export type ChatSource = {
  documentId: string;
  pageNumber: number;
  chunkIndex: number;
};

export type ChatResponse = {
  success: boolean;
  data: {
    conversationId: string;
    title: string;
    answer: string;
    sources: ChatSource[];
  };
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type Conversation = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type ConversationHistoryResponse = {
  success: boolean;
  data: {
    conversation: Conversation;
    messages: {
      id: string;
      role: "USER" | "ASSISTANT";
      content: string;
      createdAt: string;
    }[];
  };
};

export type ConversationListResponse = {
  success: boolean;
  data: {
    conversations: Conversation[];
  };
};

export type DeleteConversationResponse = {
  success: boolean;
  message: string;
};
