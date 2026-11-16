export type SimilarChunk = {
  id: string;
  documentId: string;
  content: string;
  pageNumber: number;
  chunkIndex: number;
  distance: number;
};

export type KeywordChunk = {
  id: string;
  documentId: string;
  content: string;
  pageNumber: number;
  chunkIndex: number;
  rank: number;
};

export type FusedChunk = {
  id: string;
  documentId: string;
  content: string;
  pageNumber: number;
  chunkIndex: number;
  score: number;
  matchSource: "vector" | "keyword" | "hybrid";
};
