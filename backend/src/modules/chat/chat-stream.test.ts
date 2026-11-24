import assert from "node:assert/strict";
import { ragService } from "../rag/rag.factory.js";

async function testStreaming() {
  console.log("=== Testing SSE RAG Streaming Pipeline ===");

  // Test 1: Stream greeting
  console.log("\n[Test 1] Streaming Greeting Response");
  const greetingTokens: string[] = [];
  const greetingResult = await ragService.answerQuestionStream(
    "hello",
    [],
    {
      onToken: (token) => {
        greetingTokens.push(token);
      },
    },
  );

  console.log(`Received ${greetingTokens.length} greeting tokens.`);
  console.log(`Full greeting answer: "${greetingResult.answer.slice(0, 80)}..."`);
  assert.ok(greetingTokens.length > 0, "Should yield tokens for greeting");
  assert.ok(greetingResult.answer.length > 0, "Should generate full answer");

  // Test 2: Stream technical document query
  console.log("\n[Test 2] Streaming Technical Incident Query");
  const techTokens: string[] = [];
  let metadataReceived = false;

  const techResult = await ragService.answerQuestionStream(
    "What database issue occurred for AlphaCorp?",
    [],
    {
      onMetadata: (meta) => {
        metadataReceived = true;
        console.log(`Metadata received: ${meta.sources.length} sources, ${meta.relatedIssues.length} issues.`);
      },
      onToken: (token) => {
        techTokens.push(token);
      },
    },
  );

  console.log(`Received ${techTokens.length} technical tokens.`);
  console.log(`Sample answer preview: "${techResult.answer.slice(0, 100)}..."`);
  assert.ok(metadataReceived, "Should emit metadata before or during streaming");
  assert.ok(techTokens.length > 0, "Should yield tokens for technical query");
  assert.ok(techResult.answer.includes("ISS-C1-101") || techResult.answer.toLowerCase().includes("database"), "Answer should mention AlphaCorp database issue");

  console.log("\n=== ALL STREAMING TESTS PASSED SUCCESSFULLY! ===");
  process.exit(0);
}

testStreaming().catch((err) => {
  console.error("Streaming test failed:", err);
  process.exit(1);
});
