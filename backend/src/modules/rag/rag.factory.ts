import { GeminiLlmProvider } from "../llm/gemini-llm.provider.js";
import { retrievalService } from "../retrieval/retrieval.factory.js";
import { RagService } from "./rag.service.js";

const llmProvider = new GeminiLlmProvider();

export const ragService = new RagService(retrievalService, llmProvider);
