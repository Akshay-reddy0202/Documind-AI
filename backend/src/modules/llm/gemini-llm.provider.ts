import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import type { LlmProvider } from "./llm.provider.js";

export class GeminiLlmProvider implements LlmProvider {
  private readonly ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  async generateAnswer(question: string, context: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      config: {
        maxOutputTokens: 2048,
      },
      contents: `You are a helpful document assistant.
        Answer the user's question using only the provided context.
        If the answer cannot be found in the context, say that the information is not available in the provided documents. 
        Answer directly and concisely. Provide enough detail to fully answer the question, but avoid unnecessary repetition.
        Format your answer using Markdown when appropriate.
        Context:${context}
        Question:${question}
        `,
    });
    const answer = response.text;

    if (!answer?.trim()) {
      throw new Error("Gemini did not return an answer");
    }

    return answer;
  }
}
