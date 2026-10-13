import type { ExtractedPage } from "../../chunking/chunking.types.js";
import { chunkPages } from "../../chunking/chunking.service.js";
import type { EmbeddingProvider } from "../../embeddings/embedding.provider.js";
import type { DocumentChunkRepository } from "../repositories/document-chunk.repository.js";
import type { DocumentProcessingService } from "./document-processing.service.js";
import pLimit from "p-limit";

export class PrismaDocumentProcessingService implements DocumentProcessingService {
  constructor(
    private readonly embeddingProvider: EmbeddingProvider,
    private readonly chunkRepository: DocumentChunkRepository,
  ) {}

  async processDocument(
    documentId: string,
    pages: ExtractedPage[],
  ): Promise<void> {
    const chunks = chunkPages(pages);

    const limit = pLimit(5);

    const chunksWithEmbeddings = await Promise.all(
      chunks.map((chunk) =>
        limit(async () => ({
          documentId,
          content: chunk.content,
          pageNumber: chunk.pageNumber,
          chunkIndex: chunk.chunkIndex,
          embedding: await this.embeddingProvider.generateEmbedding(
            chunk.content,
          ),
        })),
      ),
    );

    await this.chunkRepository.createManyChunks(chunksWithEmbeddings);
  }
}
