import assert from "node:assert/strict";
import { ragService } from "./rag.factory.js";

async function testCorrelation() {
  console.log("=== Testing Dual-Stream RAG with Structured Issue Correlation ===");

  const query = "What database issues occurred for AlphaCorp and what was the workaround?";
  console.log(`Prompt: "${query}"`);

  const result = await ragService.answerQuestion(query, 5);

  console.log("\n[1] RELATED STRUCTURED ISSUES FOUND:");
  console.log(
    result.relatedIssues.map(
      (i) => `[${i.issueCode}] ${i.title} (${i.document.clientName}) - Status: ${i.status}`,
    ),
  );

  console.log(`\n[2] HYBRID CHUNK SOURCES FOUND: ${result.sources.length}`);

  console.log("\n[3] GENERATED ANSWER:");
  console.log(result.answer);

  // Assertions
  assert.ok(result.relatedIssues.length > 0, "Should retrieve at least one related structured issue");
  const hasDbIssue = result.relatedIssues.some(
    (i) => i.issueCode === "ISS-C1-101" || i.component.toLowerCase().includes("database"),
  );
  assert.ok(hasDbIssue, "Should retrieve the AlphaCorp database issue (ISS-C1-101)");
  assert.ok(result.sources.length > 0, "Should retrieve hybrid chunk sources");
  assert.ok(result.answer.length > 50, "Answer should be substantive");

  console.log("\n=== OPTION 2 TEST PASSED WITH 100% SUCCESS! ===");
  process.exit(0);
}

testCorrelation().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
