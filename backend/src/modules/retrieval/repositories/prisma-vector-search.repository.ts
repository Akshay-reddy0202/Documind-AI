import { PrismaClient } from "../../../generated/prisma/client.js";
import type { SimilarChunk } from "../retrieval.types.js";
import type { VectorSearchRepository } from "./vector-search.repository.js";

export class PrismaVectorSearchRepository implements VectorSearchRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async searchSimilarChunks(
    embedding: number[],
    limit: number,
  ): Promise<SimilarChunk[]> {
    const vector = `[${embedding.join(",")}]`;

    const chunks = await this.prisma.$queryRaw<SimilarChunk[]>`
      SELECT
        "id",
        "documentId",
        "content",
        "pageNumber",
        "chunkIndex",
        "embedding" <=> ${vector}::vector AS "distance"
      FROM "DocumentChunk"
      ORDER BY "embedding" <=> ${vector}::vector
      LIMIT ${limit}
    `;

    return chunks;
  }
}
