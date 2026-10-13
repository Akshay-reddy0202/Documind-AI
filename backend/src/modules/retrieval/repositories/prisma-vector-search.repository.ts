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
    distanceThreshold: number,
  ): Promise<SimilarChunk[]> {
    const vector = `[${embedding.join(",")}]`;

    const chunks = await this.prisma.$queryRaw<SimilarChunk[]>`
      WITH candidates AS MATERIALIZED (
        SELECT
          c."id",
          c."documentId",
          c."content",
          c."pageNumber",
          c."chunkIndex",
          (c."embedding"::halfvec(3072))
            <=> (${vector}::halfvec(3072)) AS "distance"
        FROM "DocumentChunk" c
        INNER JOIN "Document" d ON d."id" = c."documentId"
        WHERE d."status" = 'PROCESSED'
        ORDER BY
          (c."embedding"::halfvec(3072))
            <=> (${vector}::halfvec(3072))
        LIMIT ${limit}
      )
      SELECT
        "id",
        "documentId",
        "content",
        "pageNumber",
        "chunkIndex",
        "distance"
      FROM candidates
      WHERE "distance" <= ${distanceThreshold}
      ORDER BY "distance" ASC
    `;

    return chunks;
  }
}
