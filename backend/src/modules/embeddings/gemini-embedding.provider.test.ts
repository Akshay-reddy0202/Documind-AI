import assert from "node:assert";
import { GeminiEmbeddingProvider } from "./gemini-embedding.provider.js";

const runTest = async (name: string, test: () => Promise<void>) => {
  try {
    await test();
    console.log(`✅ PASS: ${name}`);
  } catch (error) {
    console.error(`❌ FAIL: ${name}`);
    console.error(error);
  }
};

const provider = new GeminiEmbeddingProvider();

await runTest("should generate an embedding", async () => {
  const embedding = await provider.generateEmbedding(
    "What is machine learning?"
  );

  console.log("Embedding dimension:", embedding.length);

  assert.ok(Array.isArray(embedding));
  assert.ok(embedding.length > 0);
  assert.ok(embedding.every((value) => typeof value === "number"));
});

await runTest("should generate embeddings for different text", async () => {
  const embedding = await provider.generateEmbedding(
    "The Transformer architecture uses attention mechanisms."
  );

  assert.ok(Array.isArray(embedding));
  assert.ok(embedding.length > 0);
  assert.ok(embedding.every((value) => typeof value === "number"));
});

await runTest("should reject empty text", async () => {
  await assert.rejects(
    () => provider.generateEmbedding(""),
    /Text cannot be empty/
  );
});

await runTest("should reject whitespace-only text", async () => {
  await assert.rejects(
    () => provider.generateEmbedding("   "),
    /Text cannot be empty/
  );
});

console.log("\nEmbedding test execution completed.");

