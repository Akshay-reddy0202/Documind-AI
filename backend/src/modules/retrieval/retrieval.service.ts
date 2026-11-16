import type { EmbeddingProvider } from "../embeddings/embedding.provider.js";
import type { FusedChunk, KeywordChunk, SimilarChunk } from "./retrieval.types.js";
import type { VectorSearchRepository } from "./repositories/vector-search.repository.js";
import type { KeywordSearchRepository } from "./repositories/keyword-search.repository.js";
import {
  DEFAULT_RETRIEVAL_LIMIT,
  DEFAULT_RETRIEVAL_DISTANCE_THRESHOLD,
  DEFAULT_RRF_K,
} from "./retrieval.constants.js";

export class RetrievalService {
  constructor(
    private readonly embeddingProvider: EmbeddingProvider,
    private readonly vectorSearchRepository: VectorSearchRepository,
    private readonly keywordSearchRepository: KeywordSearchRepository,
  ) {}

  /**
   * Performs hybrid search combining Dense Vector Search (semantic similarity)
   * with Lexical Full-Text Search (exact keyword / phrase matches),
   * fusing their rankings using Reciprocal Rank Fusion (RRF).
   */
  async retrieve(
    question: string,
    limit: number = DEFAULT_RETRIEVAL_LIMIT,
  ): Promise<FusedChunk[]> {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      return [];
    }

    // Candidate pool multiplier (fetch more candidates before fusing)
    const candidateLimit = Math.max(limit * 2, 20);

    const [vectorChunks, keywordChunks] = await Promise.all([
      this.fetchVectorChunks(trimmedQuestion, candidateLimit),
      this.fetchKeywordChunks(trimmedQuestion, candidateLimit),
    ]);

    return this.reciprocalRankFusion(vectorChunks, keywordChunks, limit);
  }

  private async fetchVectorChunks(
    question: string,
    limit: number,
  ): Promise<SimilarChunk[]> {
    try {
      const embedding = await this.embeddingProvider.generateEmbedding(question);
      return await this.vectorSearchRepository.searchSimilarChunks(
        embedding,
        limit,
        DEFAULT_RETRIEVAL_DISTANCE_THRESHOLD,
      );
    } catch (error) {
      console.warn("Vector search failed, falling back to keyword search:", error);
      return [];
    }
  }

  private async fetchKeywordChunks(
    question: string,
    limit: number,
  ): Promise<KeywordChunk[]> {
    try {
      return await this.keywordSearchRepository.searchByKeywords(question, limit);
    } catch (error) {
      console.warn("Keyword search failed, falling back to vector search:", error);
      return [];
    }
  }

  /**
   * Reciprocal Rank Fusion (RRF) algorithm:
   * score(d) = sum( 1 / (k + rank_i(d)) )
   *
   * @param vectorChunks Ranked results from vector search
   * @param keywordChunks Ranked results from full-text search
   * @param limit Final number of results to return
   * @param k Smoothing constant (default: 60)
   */
  public reciprocalRankFusion(
    vectorChunks: SimilarChunk[],
    keywordChunks: KeywordChunk[],
    limit: number,
    k = DEFAULT_RRF_K,
  ): FusedChunk[] {
    const chunkMap = new Map<
      string,
      {
        chunk: SimilarChunk | KeywordChunk;
        vectorRank?: number;
        keywordRank?: number;
      }
    >();

    // 1. Record rank positions from vector search
    vectorChunks.forEach((chunk, index) => {
      const rank = index + 1; // 1-based rank
      chunkMap.set(chunk.id, {
        chunk,
        vectorRank: rank,
      });
    });

    // 2. Record rank positions from keyword search
    keywordChunks.forEach((chunk, index) => {
      const rank = index + 1; // 1-based rank
      const existing = chunkMap.get(chunk.id);
      if (existing) {
        existing.keywordRank = rank;
      } else {
        chunkMap.set(chunk.id, {
          chunk,
          keywordRank: rank,
        });
      }
    });

    // 3. Compute RRF score for each unique chunk
    const fusedResults: FusedChunk[] = [];

    for (const [id, entry] of chunkMap.entries()) {
      let rrfScore = 0;
      let matchSource: "vector" | "keyword" | "hybrid" = "vector";

      if (entry.vectorRank !== undefined && entry.keywordRank !== undefined) {
        rrfScore = 1 / (k + entry.vectorRank) + 1 / (k + entry.keywordRank);
        matchSource = "hybrid";
      } else if (entry.vectorRank !== undefined) {
        rrfScore = 1 / (k + entry.vectorRank);
        matchSource = "vector";
      } else if (entry.keywordRank !== undefined) {
        rrfScore = 1 / (k + entry.keywordRank);
        matchSource = "keyword";
      }

      fusedResults.push({
        id,
        documentId: entry.chunk.documentId,
        content: entry.chunk.content,
        pageNumber: entry.chunk.pageNumber,
        chunkIndex: entry.chunk.chunkIndex,
        score: rrfScore,
        matchSource,
      });
    }

    // 4. Sort descending by RRF score and slice to top `limit`
    fusedResults.sort((a, b) => b.score - a.score);

    return fusedResults.slice(0, limit);
  }
}
