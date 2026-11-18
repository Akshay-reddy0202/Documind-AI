import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import type { LlmProvider } from "./llm.provider.js";

export class GeminiLlmProvider implements LlmProvider {
  private readonly ai: GoogleGenAI;
  private readonly models = ["gemini-3.5-flash-lite", "gemini-2.5-flash"];

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  async generateAnswer(question: string, context: string): Promise<string> {
    const prompt = `You are a Senior Technical Systems & Incident Investigation Assistant for DocuMind AI.
Answer the user's question using the provided context (Structured Issues and Verbatim Document Evidence).

CORE GUIDELINES:
1. FACTUAL DISCIPLINE: Rely strictly on the provided context. Quote verbatim log lines, error codes, and configuration parameters when discussing technical failures. Never invent details not present in the evidence.
2. CITATIONS: Always cite the Issue Code (e.g. [ISS-C1-101]), Client Name, and Environment when discussing incidents or errors.
3. CHRONOLOGICAL INTEGRITY: If an issue appeared in an earlier report or timeframe but is omitted in later records, DO NOT assume it is resolved. Explicitly mention that no follow-up or resolution was documented.
4. HONESTY ABOUT GAPS: If information is missing, truncated, or unverified in the documents, state that clearly rather than guessing.
5. ADAPTIVE FORMATTING: Format your response dynamically and naturally based on the question. Use clean, readable Markdown (bullet points, bold text, code blocks for logs) without forcing rigid template headers.
6. CONVERSATIONAL & GENERAL QUERIES: If the user offers a greeting (e.g. "hello", "hi", "hey", "what's up"), asks who you are, or makes casual conversation, respond warmly and conversationally as DocuMind AI. Introduce yourself as their AI assistant for document intelligence and technical incident investigation, and invite them to ask about their uploaded documents or client reports.

Context:
${context}

Question:
${question}`;

    let lastError: unknown;

    for (const model of this.models) {
      try {
        const response = await this.ai.models.generateContent({
          model,
          config: {
            maxOutputTokens: 2048,
          },
          contents: prompt,
        });

        const answer = response.text;
        if (answer?.trim()) {
          return answer;
        }
      } catch (error) {
        lastError = error;
        console.warn(
          `Gemini model ${model} failed, attempting fallback to next model:`,
          error instanceof Error ? error.message : error,
        );
      }
    }

    if (lastError instanceof Error) {
      throw lastError;
    }

    throw new Error("Gemini did not return an answer");
  }
}
