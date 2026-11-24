import type { ChatHistoryTurn, LlmProvider } from "../llm/llm.provider.js";
import type { FusedChunk } from "../retrieval/retrieval.types.js";
import type { RetrievalService } from "../retrieval/retrieval.service.js";
import type { IssueRetrievalService } from "./services/issue-retrieval.service.js";
import type { QueryRewriterService } from "./services/query-rewriter.service.js";
import type { IssueListItem } from "../issues/types/index.js";
import { DEFAULT_RETRIEVAL_LIMIT } from "../retrieval/retrieval.constants.js";

export class RagService {
  constructor(
    private readonly retrievalService: RetrievalService,
    private readonly llmProvider: LlmProvider,
    private readonly issueRetrievalService?: IssueRetrievalService,
    private readonly queryRewriter?: QueryRewriterService,
  ) {}

  async answerQuestion(
    question: string,
    historyOrLimit?: ChatHistoryTurn[] | number,
    maybeLimit?: number,
  ): Promise<{
    answer: string;
    sources: FusedChunk[];
    relatedIssues: IssueListItem[];
    searchQuery?: string;
  }> {
    return this.answerQuestionStream(
      question,
      historyOrLimit,
      undefined,
      maybeLimit,
    );
  }

  async answerQuestionStream(
    question: string,
    historyOrLimit?: ChatHistoryTurn[] | number,
    callbacks?: {
      onMetadata?: (meta: {
        sources: FusedChunk[];
        relatedIssues: IssueListItem[];
        searchQuery?: string;
      }) => void;
      onToken?: (token: string) => void;
    },
    maybeLimit?: number,
  ): Promise<{
    answer: string;
    sources: FusedChunk[];
    relatedIssues: IssueListItem[];
    searchQuery?: string;
  }> {
    if (!question.trim()) {
      throw new Error("Question cannot be empty");
    }

    const history: ChatHistoryTurn[] | undefined = Array.isArray(historyOrLimit)
      ? historyOrLimit
      : undefined;

    const limit: number =
      typeof historyOrLimit === "number"
        ? historyOrLimit
        : (maybeLimit ?? DEFAULT_RETRIEVAL_LIMIT);

    const trimmedQuestion = question.trim();

    // Fast-path bypass for greetings & conversational queries (skips DB queries & embeddings)
    const isGreeting =
      /^(hello|hi|hey|greetings|who are you|what'?s up|help|what can you do)[\s!?.]*$/i.test(
        trimmedQuestion,
      );
    if (isGreeting) {
      callbacks?.onMetadata?.({
        sources: [],
        relatedIssues: [],
        searchQuery: trimmedQuestion,
      });

      const greetingAnswer = await this.llmProvider.generateAnswerStream(
        trimmedQuestion,
        "User is greeting or asking for an introduction. No specific document context required.",
        history,
        callbacks?.onToken,
      );

      return {
        answer: greetingAnswer,
        sources: [],
        relatedIssues: [],
        searchQuery: trimmedQuestion,
      };
    }

    // Optimize search query using history (e.g. resolving pronouns/references)
    const searchQuery = this.queryRewriter
      ? await this.queryRewriter.rewrite(trimmedQuestion, history)
      : trimmedQuestion;

    // 1. Retrieve hybrid chunks (Vector + GIN Lexical + RRF) using the search query
    const chunks = await this.retrievalService.retrieve(searchQuery, limit);

    // 2. Retrieve relevant structured issues from PostgreSQL using the search query
    let relatedIssues: IssueListItem[] = [];
    if (this.issueRetrievalService) {
      try {
        const uniqueDocIds = Array.from(new Set(chunks.map((c) => c.documentId)));
        relatedIssues = await this.issueRetrievalService.retrieveRelevantIssues(
          searchQuery,
          uniqueDocIds,
          5,
        );
      } catch (issueError) {
        console.warn("Issue retrieval failed, proceeding with chunk context only:", issueError);
      }
    }

    if (chunks.length === 0 && relatedIssues.length === 0) {
      const fallbackMsg =
        "No relevant information was found in the provided documents or issues";
      callbacks?.onMetadata?.({
        sources: [],
        relatedIssues: [],
        searchQuery,
      });
      callbacks?.onToken?.(fallbackMsg);

      return {
        answer: fallbackMsg,
        sources: [],
        relatedIssues: [],
        searchQuery,
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

    // Emit metadata before tokens start streaming
    callbacks?.onMetadata?.({
      sources: chunks,
      relatedIssues,
      searchQuery,
    });

    // 4. Stream grounded answer passing original question + evidence + conversation history
    const answer = await this.llmProvider.generateAnswerStream(
      trimmedQuestion,
      combinedContext,
      history,
      callbacks?.onToken,
    );

    return {
      answer,
      sources: chunks,
      relatedIssues,
      searchQuery,
    };
  }
}
