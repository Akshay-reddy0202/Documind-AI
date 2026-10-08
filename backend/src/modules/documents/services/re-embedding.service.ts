import { GeminiEmbeddingProvider } from "../../embeddings/gemini-embedding.provider.js";
import { PrismaDocumentChunkRepository } from "../repositories/prisma-document-chunk.repository.js";
import { prisma } from "../../../config/prisma.js";

const embeddingProvider = new GeminiEmbeddingProvider();
const chunkRepository = new PrismaDocumentChunkRepository(prisma);

export const reEmbedAllChunks = async (): Promise<void> => {
  const chunks = await chunkRepository.getAllChunks();

  console.log(`Found ${chunks.length} chunks to re-embed`);

  for (const chunk of chunks) {
    console.log(`Processing chunk: ${chunk.id}`);
    const embedding = await embeddingProvider.generateEmbedding(chunk.content);

    await chunkRepository.updateEmbedding(chunk.id, embedding);
    console.log(`Updated chunk: ${chunk.id}`);
  }
};
