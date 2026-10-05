export interface DocumentChunkRepository {
    createChunk(
      documentId: string,
      content: string,
      pageNumber: number,
      chunkIndex: number,
      embedding: number[],
    ): Promise<void>;
  }