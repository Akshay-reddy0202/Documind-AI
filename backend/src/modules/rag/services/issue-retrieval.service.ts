import type { IssueRepository } from "../../issues/repositories/issue.repository.js";
import type { IssueListItem } from "../../issues/types/index.js";

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "if", "then", "else", "when", "at",
  "from", "by", "for", "with", "about", "against", "between", "into", "through",
  "during", "before", "after", "above", "below", "to", "of", "up", "down",
  "in", "out", "on", "off", "over", "under", "again", "further", "then", "once",
  "here", "there", "all", "any", "both", "each", "few", "more", "most", "other",
  "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too",
  "very", "can", "will", "just", "don", "should", "now", "did", "does", "have",
  "has", "had", "what", "which", "who", "whom", "this", "that", "these", "those",
  "am", "is", "are", "was", "were", "be", "been", "being", "tell", "show", "give",
  "compare", "between", "how", "why", "same", "issue", "issues", "problem", "error",
]);

export class IssueRetrievalService {
  constructor(private readonly issueRepository: IssueRepository) {}

  /**
   * Retrieves relevant structured issues from the database based on:
   * 1. Explicit issue codes (e.g. ISS-C1-101)
   * 2. Client mentions (e.g. AlphaCorp, BetaGlobal, Client 1)
   * 3. Component / technical terms (e.g. database, pool, webhook)
   * 4. Co-occurrence with documents identified by hybrid chunk search
   */
  async retrieveRelevantIssues(
    question: string,
    contextDocumentIds: string[] = [],
    limit: number = 5,
  ): Promise<IssueListItem[]> {
    const trimmed = question.trim();
    if (!trimmed) return [];

    const issueMap = new Map<string, { issue: IssueListItem; score: number }>();

    // 1. Explicit Issue Code Extraction (e.g. ISS-C1-101, ISS-101)
    const issueCodeMatches = trimmed.match(/\b[A-Za-z0-9]+-[A-Za-z0-9]+-[0-9]+\b/g) ||
      trimmed.match(/\bISS-[A-Za-z0-9-]+\b/gi) || [];

    for (const code of issueCodeMatches) {
      const result = await this.issueRepository.findIssues({ search: code, limit: 5 });
      for (const item of result.issues) {
        issueMap.set(item.id, {
          issue: item,
          score: (issueMap.get(item.id)?.score ?? 0) + 100, // High priority for exact code match
        });
      }
    }

    // 2. Client Mention Detection
    const availableClients = await this.issueRepository.getAvailableClients();
    const matchedClients: string[] = [];

    for (const client of availableClients) {
      const nameParts = client.clientName.toLowerCase().split(/[^a-z0-9]+/);
      const idParts = client.clientId.toLowerCase().split(/[^a-z0-9]+/);
      const lowerQ = trimmed.toLowerCase();

      const mentionsName = nameParts.some((part) => part.length >= 4 && lowerQ.includes(part));
      const mentionsId = idParts.some((part) => part.length >= 4 && lowerQ.includes(part));

      if (mentionsName || mentionsId) {
        matchedClients.push(client.clientId);
      }
    }

    // 3. Extract Significant Technical Terms
    const rawTokens = trimmed
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 3 && !STOPWORDS.has(t));

    // Search for issues matching technical tokens
    for (const term of rawTokens.slice(0, 4)) {
      // Query general search
      const result = await this.issueRepository.findIssues({ search: term, limit: 5 });
      for (const item of result.issues) {
        let termScore = 10;
        // Boost score if issue belongs to a client explicitly mentioned in the query
        if (item.document.clientId && matchedClients.includes(item.document.clientId)) {
          termScore += 30;
        }
        issueMap.set(item.id, {
          issue: item,
          score: (issueMap.get(item.id)?.score ?? 0) + termScore,
        });
      }
    }

    // 4. Boost issues belonging to documents found by the hybrid chunk search
    if (contextDocumentIds.length > 0) {
      for (const docId of contextDocumentIds.slice(0, 3)) {
        const docResult = await this.issueRepository.findIssues({ limit: 10 });
        for (const item of docResult.issues) {
          if (item.documentId === docId) {
            issueMap.set(item.id, {
              issue: item,
              score: (issueMap.get(item.id)?.score ?? 0) + 15,
            });
          }
        }
      }
    }

    // 5. Sort by aggregated relevance score and cap at limit
    const sorted = Array.from(issueMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((entry) => entry.issue);

    return sorted;
  }
}
