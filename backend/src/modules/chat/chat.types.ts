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

export interface ChatIssueCitation {
  id: string;
  issueCode: string;
  title: string;
  severity: string;
  status: string;
  clientName: string | null;
}

export interface ChatResponseData {
  conversationId: string;
  title: string;
  answer: string;
  sources: ChatSourceCitation[];
  relatedIssues?: ChatIssueCitation[];
}

export interface ConversationHistoryMessage {
  id: string;
  conversationId: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: Date;
}

export interface ChatHistoryTurn {
  role: "USER" | "ASSISTANT";
  content: string;
}
