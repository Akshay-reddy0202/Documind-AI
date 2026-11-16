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
    const prompt = `You are a helpful document assistant.
Answer the user's question using only the provided context.
If the answer cannot be found in the context, say that the information is not available in the provided documents. 
Answer directly and concisely. Provide enough detail to fully answer the question, but avoid unnecessary repetition.
Format your answer using Markdown when appropriate.
Context:${context}
Question:${question}`;

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
