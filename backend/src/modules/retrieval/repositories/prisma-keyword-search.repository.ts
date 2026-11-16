import { PrismaClient } from "../../../generated/prisma/client.js";
import type { KeywordChunk } from "../retrieval.types.js";
import type { KeywordSearchRepository } from "./keyword-search.repository.js";

export class PrismaKeywordSearchRepository implements KeywordSearchRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async searchByKeywords(
    query: string,
    limit: number,
  ): Promise<KeywordChunk[]> {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return [];
    }

    const chunks = await this.prisma.$queryRaw<KeywordChunk[]>`
      SELECT
        c."id",
        c."documentId",
        c."content",
        c."pageNumber",
        c."chunkIndex",
        ts_rank_cd(
          to_tsvector('english', c."content"),
          websearch_to_tsquery('english', ${trimmedQuery})
        ) AS "rank"
      FROM "DocumentChunk" c
      INNER JOIN "Document" d ON d."id" = c."documentId"
      WHERE d."status" = 'PROCESSED'
        AND to_tsvector('english', c."content") @@ websearch_to_tsquery('english', ${trimmedQuery})
      ORDER BY "rank" DESC
      LIMIT ${limit}
    `;

    return chunks;
  }
}
