export type SimilarChunk = {
    id: string;
    documentId: string;
    content: string;
    pageNumber: number;
    chunkIndex: number;
    distance: number;
  };