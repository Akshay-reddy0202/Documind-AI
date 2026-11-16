import {
  extractReportMetadata,
  extractReportIssues,
} from "./report-extraction.service.js";

const sampleMarkdown = `# Client 1 - Weekly Incident & Issue Log (Week 1)
**Client Name:** AlphaCorp Enterprises (Client 1)  
**Reporting Period:** 2026-10-01 to 2026-10-07 (Week 1)  
**System / Application:** DocuMind Platform v2.4.0  
**Environment:** Production (US-East-1)  
**Report Author:** DevOps & Client Support Team  

---

## 2. Detailed Incident Logs

### [ISS-C1-101] Database connection pool exhaustion during peak batch sync
- **Severity:** P1 - Critical
- **Component:** PostgreSQL Database / Backend API
- **First Observed:** 2026-10-02 09:15:32 UTC
- **Status:** OPEN (Under Investigation)
- **Description:**  
  Client batch ingestion jobs failed with database connection errors during morning peak traffic.
- **Log Snippet:**  
  \`\`\`text
  [ERROR] 2026-10-02 09:15:32 [pg-pool] Connection terminated unexpectedly
  \`\`\`
- **Temporary Workaround:** Manual restart of backend API pods.

---

### [ISS-C1-102] JWT authentication token expires prematurely on refresh
- **Severity:** P2 - High
- **Component:** Authentication Gateway
- **Status:** OPEN
- **Description:**  
  Users are unexpectedly logged out every 15 minutes.
`;

console.log("--- Testing Report Extraction Service ---");

const metadata = extractReportMetadata(sampleMarkdown);
console.log("Extracted Metadata:", metadata);

if (metadata.clientName !== "AlphaCorp Enterprises (Client 1)") {
  console.error("FAIL: clientName mismatch!");
  process.exit(1);
}

if (metadata.clientId !== "client-1") {
  console.error("FAIL: clientId slug mismatch!");
  process.exit(1);
}

if (metadata.environment !== "Production (US-East-1)") {
  console.error("FAIL: environment mismatch!");
  process.exit(1);
}

const issues = extractReportIssues(sampleMarkdown);
console.log(`Extracted ${issues.length} issues.`);

if (issues.length !== 2) {
  console.error(`FAIL: Expected 2 issues, got ${issues.length}`);
  process.exit(1);
}

const iss101 = issues[0];
console.log("Issue 101 parsed:", {
  code: iss101.issueCode,
  severity: iss101.severity,
  component: iss101.component,
  status: iss101.status,
  logSnippet: iss101.logSnippet,
});

if (iss101.issueCode !== "ISS-C1-101") {
  console.error("FAIL: Issue 101 code mismatch!");
  process.exit(1);
}

if (!iss101.logSnippet?.includes("Connection terminated unexpectedly")) {
  console.error("FAIL: Issue 101 log snippet missing!");
  process.exit(1);
}

console.log("SUCCESS: All report extraction tests passed!");
