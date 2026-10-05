import type { Request, Response } from "express";
import type { ChatRequest } from "./chat.schema.js";
import { ragService } from "../rag/rag.factory.js";
import { chatRequestSchema } from "./chat.schema.js";

export const chat = async (
  req: Request<{}, {}, ChatRequest>,
  res: Response,
) => {
  const { question } = chatRequestSchema.parse(req.body);

  const result = await ragService.answerQuestion(question);

  return res.status(200).json({
    success: true,
    data: {
      answer: result.answer,
      sources: result.sources.map((source) => ({
        documentId: source.documentId,
        pageNumber: source.pageNumber,
        chunkIndex: source.chunkIndex,
      })),
    },
  });
};
