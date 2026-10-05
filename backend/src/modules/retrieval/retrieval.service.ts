import type { EmbeddingProvider } from "../embeddings/embedding.provider.js";
import type { SimilarChunk } from "./retrieval.types.js";
import type { VectorSearchRepository } from "./repositories/vector-search.repository.js";
import {
  DEFAULT_RETRIEVAL_LIMIT,
  DEFAULT_RETRIEVAL_DISTANCE_THRESHOLD,
} from "./retrieval.constants.js";

export class RetrievalService {
  constructor(
    private readonly embeddingProvider: EmbeddingProvider,
    private readonly vectorSearchRepository: VectorSearchRepository,
  ) {}

  async retrieve(
    question: string,
    limit: number = DEFAULT_RETRIEVAL_LIMIT,
  ): Promise<SimilarChunk[]> {
    const embedding = await this.embeddingProvider.generateEmbedding(question);

    const chunks = await this.vectorSearchRepository.searchSimilarChunks(
      embedding,
      limit,
    );

    return chunks.filter(
      (chunk) => chunk.distance <= DEFAULT_RETRIEVAL_DISTANCE_THRESHOLD,
    );
  }
}
