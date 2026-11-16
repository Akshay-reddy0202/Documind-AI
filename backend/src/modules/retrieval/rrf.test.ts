import { RetrievalService } from "./retrieval.service.js";
import type { KeywordChunk, SimilarChunk } from "./retrieval.types.js";

// Mock providers and repositories since we are testing RRF logic
const mockEmbeddingProvider = {
  generateEmbedding: async () => [],
};

const mockVectorRepo = {
  searchSimilarChunks: async () => [],
};

const mockKeywordRepo = {
  searchByKeywords: async () => [],
};

const retrievalService = new RetrievalService(
  mockEmbeddingProvider as any,
  mockVectorRepo as any,
  mockKeywordRepo as any,
);

console.log("--- Testing Reciprocal Rank Fusion (RRF) ---");

// Test data
const vectorChunks: SimilarChunk[] = [
  { id: "chunk-1", documentId: "doc-1", content: "Database pool exhausted", pageNumber: 1, chunkIndex: 0, distance: 0.1 },
  { id: "chunk-2", documentId: "doc-1", content: "JWT token expired", pageNumber: 2, chunkIndex: 1, distance: 0.2 },
];

const keywordChunks: KeywordChunk[] = [
  { id: "chunk-3", documentId: "doc-2", content: "Exact error: ECONNREFUSED", pageNumber: 1, chunkIndex: 0, rank: 0.9 },
  { id: "chunk-1", documentId: "doc-1", content: "Database pool exhausted", pageNumber: 1, chunkIndex: 0, rank: 0.8 }, // in both!
];

const fused = retrievalService.reciprocalRankFusion(vectorChunks, keywordChunks, 5, 60);

console.log("Fused results count:", fused.length);
console.log("Top result:", fused[0]);

// Assertions
if (fused[0].id !== "chunk-1") {
  console.error("FAIL: chunk-1 appeared in both searches and should be #1!");
  process.exit(1);
}

if (fused[0].matchSource !== "hybrid") {
  console.error("FAIL: chunk-1 matchSource should be 'hybrid'!");
  process.exit(1);
}

const chunk1ExpectedScore = (1 / (60 + 1)) + (1 / (60 + 2));
if (Math.abs(fused[0].score - chunk1ExpectedScore) > 0.0001) {
  console.error("FAIL: Score calculation mismatch!");
  process.exit(1);
}

console.log("SUCCESS: RRF algorithm passed all test cases!\nAll scores:", fused.map(f => ({ id: f.id, score: f.score.toFixed(5), source: f.matchSource })));
