import assert from "node:assert/strict";
import { QueryRewriterService } from "./query-rewriter.service.js";
import { ragService } from "../rag.factory.js";
import type { ChatHistoryTurn } from "../../llm/llm.provider.js";

async function runTests() {
  console.log("=== Testing Query Rewriter & Sliding Window Memory ===");

  const rewriter = new QueryRewriterService();

  // Test 1: No history (Fast Bypass)
  console.log("\n[Test 1] Fast bypass on empty history");
  const q1 = "What issues occurred in Client 1?";
  const rewritten1 = await rewriter.rewrite(q1, []);
  assert.equal(rewritten1, q1, "Should return original query when history is empty");
  console.log("PASS: Query preserved as-is without history.");

  // Test 2: Greeting bypass
  console.log("\n[Test 2] Fast bypass on greeting with history");
  const mockHistory: ChatHistoryTurn[] = [
    { role: "USER", content: "What issues occurred in Client 1?" },
    {
      role: "ASSISTANT",
      content:
        "Client 1 experienced [ISS-C1-101] Database connection pool exhaustion and [ISS-C1-102] JWT token expiration.",
    },
  ];
  const greeting = "hello";
  const rewrittenGreeting = await rewriter.rewrite(greeting, mockHistory);
  assert.equal(rewrittenGreeting, greeting, "Should return greeting without rewriting");
  console.log("PASS: Greeting bypassed rewriter.");

  // Test 3: Pronoun follow-up rewriting
  console.log("\n[Test 3] Pronoun resolution rewrite");
  const followUp = "Which of them was resolved?";
  const rewrittenFollowUp = await rewriter.rewrite(followUp, mockHistory);
  console.log(`Original: "${followUp}"`);
  console.log(`Rewritten: "${rewrittenFollowUp}"`);
  assert.ok(
    rewrittenFollowUp.toLowerCase().includes("client 1") ||
      rewrittenFollowUp.toLowerCase().includes("iss-c1") ||
      rewrittenFollowUp.toLowerCase().includes("database") ||
      rewrittenFollowUp.toLowerCase().includes("issue"),
    "Rewritten query should resolve pronouns to specific client issues",
  );
  console.log("PASS: Follow-up question successfully rewritten into standalone search query.");

  // Test 4: End-to-end RAG Service with History
  console.log("\n[Test 4] Dual-Stream RAG with Sliding Window Turn");
  const turnResult = await ragService.answerQuestion(
    "Was that database issue resolved?",
    mockHistory,
  );

  console.log(`Rewritten Search Query used by RAG: "${turnResult.searchQuery}"`);
  console.log(`Answer:\n${turnResult.answer}`);

  assert.ok(turnResult.answer.length > 20, "Answer should be generated");
  assert.ok(
    turnResult.relatedIssues.length > 0 || turnResult.sources.length > 0,
    "Should find related issues or chunk sources",
  );
  console.log("PASS: End-to-end multi-turn RAG execution succeeded.");

  console.log("\n=== ALL TESTS PASSED SUCCESSFULLY! ===");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
