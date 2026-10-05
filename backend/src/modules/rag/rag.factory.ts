import { prisma } from "../../config/prisma.js";
import { GeminiEmbeddingProvider } from "../embeddings/gemini-embedding.provider.js";
import { GeminiLlmProvider } from "../llm/gemini-llm.provider.js";
import { PrismaVectorSearchRepository } from "../retrieval/repositories/prisma-vector-search.repository.js";
import { RetrievalService } from "../retrieval/retrieval.service.js";
import { RagService } from "./rag.service.js";

const embeddingProvider = new GeminiEmbeddingProvider();

const vectorSearchRepository = new PrismaVectorSearchRepository(prisma);

const retrievalService = new RetrievalService(
  embeddingProvider,
  vectorSearchRepository,
);

const llmProvider = new GeminiLlmProvider();

export const ragService = new RagService(retrievalService, llmProvider);
