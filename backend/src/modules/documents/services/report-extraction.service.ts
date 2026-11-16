import { prisma } from "../../../config/prisma.js";
import type {
  ExtractedReportMetadata,
  ExtractedIssue,
  ReportExtractionResult,
} from "../types/index.js";

export type { ExtractedReportMetadata, ExtractedIssue, ReportExtractionResult };

/**
 * Extracts client metadata (Client Name, Environment, Period) from Markdown header.
 */
export const extractReportMetadata = (
  content: string,
): ExtractedReportMetadata => {
  const metadata: ExtractedReportMetadata = {};

  // Extract Client Name (e.g., **Client Name:** AlphaCorp Enterprises (Client 1))
  const clientMatch = content.match(
    /\*\*Client Name:\*\*\s*([^\n\r]+)/i,
  );
  if (clientMatch) {
    const rawClient = clientMatch[1].trim();
    metadata.clientName = rawClient;

    // Derive a clean clientId slug (e.g. "Client 1" -> "client-1", or "AlphaCorp" -> "alphacorp")
    const clientNumMatch = rawClient.match(/\(Client\s*(\d+)\)/i);
    if (clientNumMatch) {
      metadata.clientId = `client-${clientNumMatch[1]}`;
    } else {
      metadata.clientId = rawClient
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }
  }

  // Extract Reporting Period
  const periodMatch = content.match(
    /\*\*Reporting Period:\*\*\s*([^\n\r]+)/i,
  );
  if (periodMatch) {
    metadata.reportingPeriod = periodMatch[1].trim();
  }

  // Extract Environment
  const envMatch = content.match(
    /\*\*Environment:\*\*\s*([^\n\r]+)/i,
  );
  if (envMatch) {
    metadata.environment = envMatch[1].trim();
  }

  return metadata;
};

/**
 * Parses individual issues reported under Markdown headers (e.g. ### [ISS-C1-101] Title).
 */
export const extractReportIssues = (content: string): ExtractedIssue[] => {
  const issues: ExtractedIssue[] = [];

  // Match headers formatted like: ### [ISS-C1-101] Title or ### ISS-C1-101: Title
  const issueHeaderRegex = /^###\s*\[?([A-Za-z0-9_-]+)\]?[:\s-]+([^\n\r]+)/gm;
  const matches = Array.from(content.matchAll(issueHeaderRegex));

  if (matches.length === 0) {
    return [];
  }

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const issueCode = match[1].trim();
    const title = match[2].trim();

    // Determine the text block belonging to this issue (up to next ### or end of file)
    const startIndex = match.index + match[0].length;
    const endIndex =
      i + 1 < matches.length ? matches[i + 1].index : content.length;
    const sectionBody = content.slice(startIndex, endIndex);

    // Extract Severity (e.g. - **Severity:** P1 - Critical)
    const severityMatch = sectionBody.match(
      /-\s*\*\*Severity:\*\*\s*([^\n\r]+)/i,
    );
    const severity = severityMatch ? severityMatch[1].trim() : "Unspecified";

    // Extract Component (e.g. - **Component:** Database)
    const componentMatch = sectionBody.match(
      /-\s*\*\*Component:\*\*\s*([^\n\r]+)/i,
    );
    const component = componentMatch
      ? componentMatch[1].trim()
      : "General";

    // Extract Status (e.g. - **Status:** OPEN (Under Investigation) or RESOLVED)
    const statusMatch = sectionBody.match(
      /-\s*\*\*Status:\*\*\s*([^\n\r]+)/i,
    );
    let status = statusMatch ? statusMatch[1].trim() : "OPEN";

    // Extract First Observed Timestamp
    const observedMatch = sectionBody.match(
      /-\s*\*\*First Observed:\*\*\s*([^\n\r]+)/i,
    );
    let firstObservedAt: Date | null = null;
    if (observedMatch) {
      const parsedDate = new Date(observedMatch[1].trim());
      if (!isNaN(parsedDate.getTime())) {
        firstObservedAt = parsedDate;
      }
    }

    // Extract Log Snippet (e.g. ```text ... ```)
    const logMatch = sectionBody.match(/```[a-zA-Z]*\r?\n([\s\S]*?)```/);
    const logSnippet = logMatch ? logMatch[1].trim() : null;

    // Extract Description or Update Summary
    let description = "";
    const descMatch = sectionBody.match(
      /-\s*\*\*(?:Description|Update|Resolution Summary):\*\*\s*([\s\S]*?)(?=(?:-\s*\*\*|```|---|$))/i,
    );
    if (descMatch) {
      description = descMatch[1].trim();
    } else {
      description = title;
    }

    // Extract Temporary Workaround
    const workaroundMatch = sectionBody.match(
      /-\s*\*\*(?:Temporary Workaround|Workaround):\*\*\s*([\s\S]*?)(?=(?:-\s*\*\*|```|---|$))/i,
    );
    const workaround = workaroundMatch ? workaroundMatch[1].trim() : null;

    // Extract Resolution
    const resolutionMatch = sectionBody.match(
      /-\s*\*\*Resolution Summary:\*\*\s*([\s\S]*?)(?=(?:-\s*\*\*|```|---|$))/i,
    );
    const resolution = resolutionMatch ? resolutionMatch[1].trim() : null;

    issues.push({
      issueCode,
      title,
      severity,
      component,
      firstObservedAt,
      status,
      description,
      logSnippet,
      workaround,
      resolution,
    });
  }

  return issues;
};

/**
 * Orchestrates parsing and storing client metadata and extracted issues.
 * Safe and idempotent: can be called repeatedly without duplicating records.
 */
export const processReportExtraction = async (
  documentId: string,
  content: string,
): Promise<{
  metadata: ExtractedReportMetadata;
  extractedIssuesCount: number;
}> => {
  const metadata = extractReportMetadata(content);
  const issues = extractReportIssues(content);

  // 1. Update Document client metadata if present
  if (
    metadata.clientId ||
    metadata.clientName ||
    metadata.environment ||
    metadata.reportingPeriod
  ) {
    await prisma.document.update({
      where: { id: documentId },
      data: {
        clientId: metadata.clientId ?? null,
        clientName: metadata.clientName ?? null,
        environment: metadata.environment ?? null,
        reportingPeriod: metadata.reportingPeriod ?? null,
      },
    });
  }

  // 2. Idempotently replace existing issues for this document
  await prisma.issue.deleteMany({
    where: { documentId },
  });

  // 3. Insert newly extracted issues
  if (issues.length > 0) {
    await prisma.issue.createMany({
      data: issues.map((issue) => ({
        documentId,
        issueCode: issue.issueCode,
        title: issue.title,
        severity: issue.severity,
        component: issue.component,
        firstObservedAt: issue.firstObservedAt,
        status: issue.status,
        description: issue.description,
        logSnippet: issue.logSnippet,
        workaround: issue.workaround,
        resolution: issue.resolution,
      })),
    });
  }

  return {
    metadata,
    extractedIssuesCount: issues.length,
  };
};
