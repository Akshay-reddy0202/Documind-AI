export interface ChatRequest {
  question: string;
  conversationId?: string;
}

export interface ChatSourceCitation {
  documentId: string;
  pageNumber: number;
  chunkIndex: number;
  matchSource?: "vector" | "keyword" | "hybrid";
}

export interface ChatResponseData {
  conversationId: string;
  title: string;
  answer: string;
  sources: ChatSourceCitation[];
}

export interface ConversationHistoryMessage {
  id: string;
  conversationId: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: Date;
}
