import { PrismaClient } from "../../../generated/prisma/client.js";
import type {
  DocumentChunkRepository,
  DocumentChunkInput,
} from "./document-chunk.repository.js";
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

  async createManyChunks(chunks: DocumentChunkInput[]): Promise<void> {
    if (chunks.length === 0) {
      return;
    }

    const ids = chunks.map(() => createId());
    const documentIds = chunks.map((chunk) => chunk.documentId);
    const contents = chunks.map((chunk) => chunk.content);
    const pageNumbers = chunks.map((chunk) => chunk.pageNumber);
    const chunkIndexes = chunks.map((chunk) => chunk.chunkIndex);
    const embeddings = chunks.map((chunk) => `[${chunk.embedding.join(",")}]`);

    await this.prisma.$executeRaw`
  INSERT INTO "DocumentChunk" (
    "id",
    "documentId",
    "content",
    "pageNumber",
    "chunkIndex",
    "embedding"
  )
  SELECT
    row_data.id,
    row_data.document_id,
    row_data.content,
    row_data.page_number,
    row_data.chunk_index,
    row_data.embedding::vector
  FROM unnest(
    ${ids}::text[],
    ${documentIds}::text[],
    ${contents}::text[],
    ${pageNumbers}::integer[],
    ${chunkIndexes}::integer[],
    ${embeddings}::text[]
  ) AS row_data(
    id,
    document_id,
    content,
    page_number,
    chunk_index,
    embedding
  )
`;
  }

  async getAllChunks(): Promise<{ id: string; content: string }[]> {
    return this.prisma.$queryRaw<
      { id: string; content: string }[]
    >`SELECT "id","content" FROM "DocumentChunk"`;
  }

  async updateEmbedding(chunkId: string, embedding: number[]): Promise<void> {
    const vector = `[${embedding.join(",")}]`;

    await this.prisma
      .$executeRaw`Update "DocumentChunk" SET "embedding" = ${vector}::vector WHERE "id" = ${chunkId}`;
  }
}
