import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import type { ChatHistoryTurn } from "../../llm/llm.provider.js";

export class QueryRewriterService {
  private readonly ai: GoogleGenAI;
  private readonly models = ["gemini-3.5-flash-lite", "gemini-2.5-flash"];

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  async rewrite(
    question: string,
    history?: ChatHistoryTurn[],
  ): Promise<string> {
    const trimmed = question.trim();
    if (!trimmed) return trimmed;

    // Fast bypass 1: No conversation history to reference
    if (!history || history.length === 0) {
      return trimmed;
    }

    // Fast bypass 2: Pure greeting or casual conversation
    const isGreeting =
      /^(hello|hi|hey|greetings|who are you|what'?s up|help|what can you do)[\s!?.]*$/i.test(
        trimmed,
      );
    if (isGreeting) {
      return trimmed;
    }

    // Format the recent turns for the rewriter (limit to last 4 messages max)
    const recentTurns = history.slice(-4);
    const historyText = recentTurns
      .map((h) => `${h.role === "USER" ? "User" : "Assistant"}: ${h.content}`)
      .join("\n\n");

    const prompt = `You are a Search Query Optimizer for a Technical Incident & Document Retrieval System.
Given the recent conversation history and the user's latest question, rewrite the latest question into a single, standalone search query that can be used for vector and keyword search.

RULES:
1. If the user's question references previous topics or uses pronouns (e.g. "it", "them", "that", "those", "which one", "was it resolved", "why did that happen"), replace the pronouns with the specific issue codes, client names, components, or error descriptions from the conversation history.
2. If the user's question is already complete, standalone, or introduces a brand new topic, return the question EXACTLY as written.
3. Preserve all technical identifiers, such as [ISS-C1-101], client names, dates, or error codes.
4. Keep the rewritten query concise, factual, and optimized for search retrieval.
5. DO NOT answer the question. DO NOT add conversational preamble or explanations. Return ONLY the rewritten query text.

Conversation History:
${historyText}

Latest Question:
${trimmed}

Standalone Search Query:`;

    for (const model of this.models) {
      try {
        const response = await this.ai.models.generateContent({
          model,
          config: {
            maxOutputTokens: 120,
            temperature: 0.1,
          },
          contents: prompt,
        });

        const rewritten = response.text?.trim();
        if (rewritten && rewritten.length > 0) {
          const cleaned = rewritten
            .replace(/^["']|["']$/g, "")
            .replace(/^Standalone Search Query:\s*/i, "")
            .trim();

          return cleaned || trimmed;
        }
      } catch (error) {
        console.warn(`Query rewriting failed on model ${model}:`, error);
      }
    }

    return trimmed;
  }
}
