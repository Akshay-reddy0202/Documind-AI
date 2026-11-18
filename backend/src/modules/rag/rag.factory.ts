import { GeminiLlmProvider } from "../llm/gemini-llm.provider.js";
import { retrievalService } from "../retrieval/retrieval.factory.js";
import { issueRepository } from "../issues/issues.factory.js";
import { IssueRetrievalService } from "./services/issue-retrieval.service.js";
import { RagService } from "./rag.service.js";

const llmProvider = new GeminiLlmProvider();
const issueRetrievalService = new IssueRetrievalService(issueRepository);

export const ragService = new RagService(
  retrievalService,
  llmProvider,
  issueRetrievalService,
);
