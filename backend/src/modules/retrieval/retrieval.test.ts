import { prisma } from "../../config/prisma.js";
import { GeminiEmbeddingProvider } from "../embeddings/gemini-embedding.provider.js";
import { PrismaVectorSearchRepository } from "./repositories/prisma-vector-search.repository.js";
import { PrismaKeywordSearchRepository } from "./repositories/prisma-keyword-search.repository.js";
import { RetrievalService } from "./retrieval.service.js";

const embeddingProvider = new GeminiEmbeddingProvider();
const vectorSearchRepository = new PrismaVectorSearchRepository(prisma);
const keywordSearchRepository = new PrismaKeywordSearchRepository(prisma);

const retrievalService = new RetrievalService(
  embeddingProvider,
  vectorSearchRepository,
  keywordSearchRepository,
);

const results = await retrievalService.retrieve(
  "Explain the transformer model architecture?",
  5,
);

console.log("Hybrid Search Results:", results);

await prisma.$disconnect();
