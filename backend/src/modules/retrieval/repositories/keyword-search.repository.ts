import type { KeywordChunk } from "../retrieval.types.js";

export interface KeywordSearchRepository {
  searchByKeywords(
    query: string,
    limit: number,
  ): Promise<KeywordChunk[]>;
}
