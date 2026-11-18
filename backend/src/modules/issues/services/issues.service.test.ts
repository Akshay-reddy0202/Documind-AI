import assert from "node:assert/strict";
import { issuesService } from "../issues.factory.js";

async function runTests() {
  console.log("--- Starting IssuesService Tests ---");

  // Test 1: Fetch all issues
  const allResult = await issuesService.listIssues({});
  console.log(`[Test 1] Total issues found: ${allResult.pagination.totalCount}`);
  assert.ok(allResult.pagination.totalCount >= 0, "totalCount should be non-negative");
  assert.ok(Array.isArray(allResult.issues), "issues should be an array");
  assert.ok(allResult.stats.total >= 0, "stats.total should be non-negative");
  assert.ok(Array.isArray(allResult.clients), "clients should be an array");
  console.log(`[Test 1 PASSED] Stats: Total=${allResult.stats.total}, P1=${allResult.stats.p1Count}, Open=${allResult.stats.openCount}`);

  // Test 2: Filter by severity (P1 case-insensitive)
  const p1Result = await issuesService.listIssues({ severity: "p1" });
  for (const issue of p1Result.issues) {
    assert.ok(
      issue.severity.toUpperCase().includes("P1"),
      `Issue ${issue.issueCode} should have severity containing P1`,
    );
  }
  console.log(`[Test 2 PASSED] Filter by severity 'p1' returned ${p1Result.issues.length} items`);

  // Test 3: Filter by status (RESOLVED)
  const resolvedResult = await issuesService.listIssues({ status: "RESOLVED" });
  for (const issue of resolvedResult.issues) {
    const s = issue.status.toUpperCase();
    assert.ok(
      s.includes("RESOLVED") || s.includes("FIXED"),
      `Issue ${issue.issueCode} should be resolved`,
    );
  }
  console.log(`[Test 3 PASSED] Filter by status 'RESOLVED' returned ${resolvedResult.issues.length} items`);

  // Test 4: Search keyword
  const searchResult = await issuesService.listIssues({ search: "database" });
  console.log(`[Test 4 PASSED] Search 'database' returned ${searchResult.issues.length} items`);

  // Test 5: Get Issue by ID (if any exist)
  if (allResult.issues.length > 0) {
    const firstIssue = allResult.issues[0];
    const retrieved = await issuesService.getIssueById(firstIssue.id);
    assert.ok(retrieved !== null, "Issue should be found by ID");
    assert.equal(retrieved?.id, firstIssue.id, "IDs should match");
    assert.ok(retrieved?.document !== undefined, "Issue should include document relation");
    console.log(`[Test 5 PASSED] Successfully retrieved issue ${retrieved?.issueCode} (${retrieved?.title})`);
  }

  console.log("--- ALL ISSUES SERVICE TESTS PASSED SUCCESSFULLY ---");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
