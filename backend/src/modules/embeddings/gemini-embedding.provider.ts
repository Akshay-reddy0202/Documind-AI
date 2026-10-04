import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { EmbeddingProvider } from "./embedding.provider.js";

export class GeminiEmbeddingProvider implements EmbeddingProvider {
  private readonly ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {

    if (!text.trim()) {
        throw new Error("Text cannot be empty");
      }
      
    try {
      const response = await this.ai.models.embedContent({
        model: "gemini-embedding-2",
        contents: text,
      });

      const embedding = response.embeddings?.[0]?.values;

      if (!embedding || embedding.length === 0) {
        throw new Error("Gemini did not return an embedding");
      }

      return embedding;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate embedding: ${error.message}`, {
          cause: error,
        });
      }

      throw new Error("Failed to generate embedding", {
        cause: error,
      });
    }
  }
}

