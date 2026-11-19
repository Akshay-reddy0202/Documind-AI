import type { LlmProvider } from "../llm/llm.provider.js";
import type { FusedChunk } from "../retrieval/retrieval.types.js";
import type { RetrievalService } from "../retrieval/retrieval.service.js";
import type { IssueRetrievalService } from "./services/issue-retrieval.service.js";
import type { IssueListItem } from "../issues/types/index.js";
import { DEFAULT_RETRIEVAL_LIMIT } from "../retrieval/retrieval.constants.js";

export class RagService {
  constructor(
    private readonly retrievalService: RetrievalService,
    private readonly llmProvider: LlmProvider,
    private readonly issueRetrievalService?: IssueRetrievalService,
  ) {}

  async answerQuestion(
    question: string,
    limit: number = DEFAULT_RETRIEVAL_LIMIT,
  ): Promise<{
    answer: string;
    sources: FusedChunk[];
    relatedIssues: IssueListItem[];
  }> {
    if (!question.trim()) {
      throw new Error("Question cannot be empty");
    }

    const trimmedQuestion = question.trim();

    // 1. Retrieve hybrid chunks (Vector + GIN Lexical + RRF)
    const chunks = await this.retrievalService.retrieve(trimmedQuestion, limit);

    // 2. Retrieve relevant structured issues from PostgreSQL
    let relatedIssues: IssueListItem[] = [];
    if (this.issueRetrievalService) {
      try {
        const uniqueDocIds = Array.from(new Set(chunks.map((c) => c.documentId)));
        relatedIssues = await this.issueRetrievalService.retrieveRelevantIssues(
          trimmedQuestion,
          uniqueDocIds,
          5,
        );
      } catch (issueError) {
        console.warn("Issue retrieval failed, proceeding with chunk context only:", issueError);
      }
    }

    if (chunks.length === 0 && relatedIssues.length === 0) {
      const isGreeting = /^(hello|hi|hey|greetings|who are you|what'?s up|help|what can you do)[\s!?.]*$/i.test(trimmedQuestion);
      if (isGreeting) {
        const greetingAnswer = await this.llmProvider.generateAnswer(
          trimmedQuestion,
          "User is greeting or asking for an introduction. No specific document context required.",
        );
        return {
          answer: greetingAnswer,
          sources: [],
          relatedIssues: [],
        };
      }

      return {
        answer: "No relevant information was found in the provided documents or issues",
        sources: [],
        relatedIssues: [],
      };
    }

    // 3. Assemble dual-stream context (Structured Entities + Unstructured Chunks)
    const contextSections: string[] = [];

    if (relatedIssues.length > 0) {
      contextSections.push("=== STRUCTURED CLIENT ISSUES (FROM DATABASE) ===");
      for (const issue of relatedIssues) {
        const client =
          issue.document.clientName ?? issue.document.clientId ?? "Unassigned Client";
        const env = issue.document.environment ? ` [Env: ${issue.document.environment}]` : "";
        const period = issue.document.reportingPeriod ? ` [Period: ${issue.document.reportingPeriod}]` : "";
        contextSections.push(
          `• Issue Code: [${issue.issueCode}] ${issue.title}
  Client: ${client}${env}${period} | Component: ${issue.component}
  Severity: ${issue.severity} | Status: ${issue.status}
  Description: ${issue.description}
  Workaround: ${issue.workaround ?? "None reported"}
  Resolution: ${issue.resolution ?? "None reported"}`
        );
      }
    }

    if (chunks.length > 0) {
      contextSections.push("=== VERBATIM DOCUMENT CHUNKS & LOG EVIDENCE ===");
      for (const chunk of chunks) {
        contextSections.push(chunk.content);
      }
    }

    const combinedContext = contextSections.join("\n\n");

    // 4. Generate grounded answer
    const answer = await this.llmProvider.generateAnswer(trimmedQuestion, combinedContext);

    return {
      answer,
      sources: chunks,
      relatedIssues,
    };
  }
}
