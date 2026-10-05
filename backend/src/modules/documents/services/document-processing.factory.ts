import { prisma } from "../../../config/prisma.js";
import { GeminiEmbeddingProvider } from "../../embeddings/gemini-embedding.provider.js";
import { PrismaDocumentChunkRepository } from "../repositories/prisma-document-chunk.repository.js";
import { PrismaDocumentProcessingService } from "./prisma-document-processing.service.js";
import type { DocumentProcessingService } from "./document-processing.service.js";

const embeddingProvider = new GeminiEmbeddingProvider();

const chunkRepository = new PrismaDocumentChunkRepository(prisma);

export const documentProcessingService: DocumentProcessingService =
  new PrismaDocumentProcessingService(
    embeddingProvider,
    chunkRepository,
  );