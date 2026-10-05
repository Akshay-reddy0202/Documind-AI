import { PrismaClient } from "../../../generated/prisma/client.js";
import { DocumentChunkRepository } from "./document-chunk.repository.js";
import { createId } from "@paralleldrive/cuid2";

export class PrismaDocumentChunkRepository implements DocumentChunkRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createChunk(
    documentId: string,
    content: string,
    pageNumber: number,
    chunkIndex: number,
    embedding: number[],
  ): Promise<void> {
    const id = createId();
    const vector = `[${embedding.join(",")}]`;
  
    await this.prisma.$executeRaw`
      INSERT INTO "DocumentChunk" (
        "id",
        "documentId",
        "content",
        "pageNumber",
        "chunkIndex",
        "embedding"
      )
      VALUES (
        ${id},
        ${documentId},
        ${content},
        ${pageNumber},
        ${chunkIndex},
        ${vector}::vector
      )
    `;
  }
}
