import type { LlmProvider } from "../llm/llm.provider.js";
import type { SimilarChunk } from "../retrieval/retrieval.types.js";
import type { RetrievalService } from "../retrieval/retrieval.service.js";
import { DEFAULT_RETRIEVAL_LIMIT } from "../retrieval/retrieval.constants.js";

export class RagService {
  constructor(
    private readonly retrievalService: RetrievalService,
    private readonly llmProvider: LlmProvider,
  ) {}

  async answerQuestion(
    question: string,
    limit: number = DEFAULT_RETRIEVAL_LIMIT,
  ): Promise<{
    answer: string;
    sources: SimilarChunk[];
  }> {
    if (!question.trim()) {
      throw new Error("Question cannot be empty");
    }

    const chunks = await this.retrievalService.retrieve(question, limit);

    const context = chunks.map((chunk) => chunk.content).join("\n\n");

    const answer = await this.llmProvider.generateAnswer(question, context);

    return {
      answer,
      sources: chunks,
    };
  }
}
