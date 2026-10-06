export type ChatRequest = {
  question: string;
};

export type ChatSource = {
  documentId: string;
  pageNumber: number;
  chunkIndex: string;
};

export type ChatResponse = {
  success: boolean;
  data: {
    answer: string;
    sources: ChatSource[];
  };
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};