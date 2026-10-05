import type { ExtractedPage } from "../../chunking/chunking.types.js";
import { chunkPages } from "../../chunking/chunking.service.js";
import type { EmbeddingProvider } from "../../embeddings/embedding.provider.js";
import type { DocumentChunkRepository } from "../repositories/document-chunk.repository.js";
import type { DocumentProcessingService } from "./document-processing.service.js";

export class PrismaDocumentProcessingService
  implements DocumentProcessingService {

  constructor(
    private readonly embeddingProvider: EmbeddingProvider,
    private readonly chunkRepository: DocumentChunkRepository,
  ) {}

  async processDocument(
    documentId: string,
    pages: ExtractedPage[],
  ): Promise<void> {
    const chunks = chunkPages(pages);

    for (const chunk of chunks) {
      const embedding =
        await this.embeddingProvider.generateEmbedding(chunk.content);

      await this.chunkRepository.createChunk(
        documentId,
        chunk.content,
        chunk.pageNumber,
        chunk.chunkIndex,
        embedding,
      );
    }
  }
}