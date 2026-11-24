import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import type { ChatHistoryTurn, LlmProvider } from "./llm.provider.js";

export class GeminiLlmProvider implements LlmProvider {
  private readonly ai: GoogleGenAI;
  private readonly models = ["gemini-3.5-flash-lite", "gemini-2.5-flash"];

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  private buildPrompt(
    question: string,
    context: string,
    history?: ChatHistoryTurn[],
  ): string {
    const historySection =
      history && history.length > 0
        ? `\n\nPrevious Conversation Context (Use strictly to resolve references, follow-ups, and pronouns. If the current question introduces a new topic, do not blend prior unrelated issues):\n` +
          history
            .map(
              (h) =>
                `${h.role === "USER" ? "User" : "Assistant"}: ${h.content}`,
            )
            .join("\n\n")
        : "";

    return `You are a Senior Technical Systems & Incident Investigation Assistant for DocuMind AI.
Answer the user's question using the provided context (Structured Issues and Verbatim Document Evidence).

CORE GUIDELINES:
1. FACTUAL DISCIPLINE: Rely strictly on the provided context. Quote verbatim log lines, error codes, and configuration parameters when discussing technical failures. Never invent details not present in the evidence.
2. CITATIONS: Always cite the Issue Code (e.g. [ISS-C1-101]), Client Name, and Environment when discussing incidents or errors.
3. CHRONOLOGICAL INTEGRITY: If an issue appeared in an earlier report or timeframe but is omitted in later records, DO NOT assume it is resolved. Explicitly mention that no follow-up or resolution was documented.
4. HONESTY ABOUT GAPS: If information is missing, truncated, or unverified in the documents, state that clearly rather than guessing.
5. ADAPTIVE FORMATTING: Format your response dynamically and naturally based on the question. Use clean, readable Markdown (bullet points, bold text, code blocks for logs) without forcing rigid template headers.
6. CONVERSATIONAL & GENERAL QUERIES: If the user offers a greeting (e.g. "hello", "hi", "hey", "what's up"), asks who you are, or makes casual conversation, respond warmly and conversationally as DocuMind AI. Introduce yourself as their AI assistant for document intelligence and technical incident investigation, and invite them to ask about their uploaded documents or client reports.
7. MULTI-TURN RESOLUTION: Use the provided conversation history solely to resolve pronouns, references, and follow-ups. If the user introduces a new topic, answer the new question directly based on the fresh context without carrying over unrelated prior issues.${historySection}

Context:
${context}

Question:
${question}`;
  }

  async generateAnswer(
    question: string,
    context: string,
    history?: ChatHistoryTurn[],
  ): Promise<string> {
    return this.generateAnswerStream(question, context, history);
  }

  async generateAnswerStream(
    question: string,
    context: string,
    history?: ChatHistoryTurn[],
    onToken?: (token: string) => void,
  ): Promise<string> {
    const prompt = this.buildPrompt(question, context, history);

    let lastError: unknown;

    for (const model of this.models) {
      try {
        const responseStream = await this.ai.models.generateContentStream({
          model,
          config: {
            maxOutputTokens: 2048,
          },
          contents: prompt,
        });

        let fullAnswer = "";

        for await (const chunk of responseStream) {
          const text = chunk.text;
          if (text) {
            fullAnswer += text;
            if (onToken) {
              onToken(text);
            }
          }
        }

        if (fullAnswer.trim()) {
          return fullAnswer;
        }
      } catch (error) {
        lastError = error;
        console.warn(
          `Gemini model ${model} streaming failed, attempting fallback:`,
          error instanceof Error ? error.message : error,
        );
      }
    }

    if (lastError instanceof Error) {
      throw lastError;
    }

    throw new Error("Gemini streaming did not return an answer");
  }
}
