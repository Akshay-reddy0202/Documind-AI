import { prisma } from "../../config/prisma.js";
import { GeminiEmbeddingProvider } from "../embeddings/gemini-embedding.provider.js";
import { PrismaVectorSearchRepository } from "./repositories/prisma-vector-search.repository.js";
import { RetrievalService } from "./retrieval.service.js";

const embeddingProvider = new GeminiEmbeddingProvider();

const vectorSearchRepository =
  new PrismaVectorSearchRepository(prisma);

export const retrievalService = new RetrievalService(
  embeddingProvider,
  vectorSearchRepository,
);