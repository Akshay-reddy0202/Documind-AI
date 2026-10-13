export interface DocumentChunkInput {
  documentId: string;
  content: string;
  pageNumber: number;
  chunkIndex: number;
  embedding: number[];
}

export interface DocumentChunkRepository {
  createChunk(
    documentId: string,
    content: string,
    pageNumber: number,
    chunkIndex: number,
    embedding: number[],
  ): Promise<void>;

  createManyChunks(chunks: DocumentChunkInput[]): Promise<void>;
  getAllChunks(): Promise<{ id: string; content: string }[]>;
  updateEmbedding(chunkId: string, embedding: number[]): Promise<void>;
}
