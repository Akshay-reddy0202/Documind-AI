import { SimilarChunk } from "../retrieval.types.js";

export interface VectorSearchRepository {
    searchSimilarChunks(
      embedding: number[],
      limit: number,
    ): Promise<SimilarChunk[]>;
  }