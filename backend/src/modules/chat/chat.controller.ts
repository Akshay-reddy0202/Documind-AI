import type { Request, Response } from "express";
import type { ChatRequest } from "./chat.schema.js";
import { ragService } from "../rag/rag.factory.js";
import { chatRequestSchema } from "./chat.schema.js";
import { ConversationRepository } from "./repositories/conversation.repository.js";

const conversationRepository = new ConversationRepository();

export const chat = async (
  req: Request<{}, {}, ChatRequest>,
  res: Response,
) => {
  const { question, conversationId } = chatRequestSchema.parse(req.body);

  let conversation;

  if (conversationId) {
    conversation =
      await conversationRepository.getConversationById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }
  } else {
    conversation = await conversationRepository.createConversation();
    const trimmedQuestion = question.trim();
    const title =
      trimmedQuestion.length > 60
        ? `${trimmedQuestion.slice(0, 59).trimEnd()}…`
        : trimmedQuestion;

    conversation = await conversationRepository.updateConversationTitle(
      conversation.id,
      title,
    );
  }

  await conversationRepository.saveMessage(conversation.id, "USER", question);

  const result = await ragService.answerQuestion(question);

  await conversationRepository.saveMessage(
    conversation.id,
    "ASSISTANT",
    result.answer,
  );

  return res.status(200).json({
    success: true,
    data: {
      conversationId: conversation.id,
      title: conversation.title,
      answer: result.answer,
      sources: result.sources.map((source) => ({
        documentId: source.documentId,
        pageNumber: source.pageNumber,
        chunkIndex: source.chunkIndex,
      })),
    },
  });
};

export const getConversationHistory = async (
  req: Request<{ conversationId: string }>,
  res: Response,
): Promise<void> => {
  const { conversationId } = req.params;

  const conversation =
    await conversationRepository.getConversationById(conversationId);

  if (!conversation) {
    res.status(404).json({
      success: false,
      message: "conversation not found",
    });
    return;
  }

  const history =
    await conversationRepository.getConversationMessages(conversationId);

  res.status(200).json({
    success: true,
    data: {
      conversation,
      messages: history,
    },
  });
};

export const getAllConversations = async (_req: Request, res: Response) => {
  const conversations = await conversationRepository.getAllConversations();

  return res.status(200).json({
    success: true,
    data: {
      conversations,
    },
  });
};

export const deleteConversation = async (
  req: Request<{ conversationId: string }>,
  res: Response,
): Promise<void> => {
  const { conversationId } = req.params;

  await conversationRepository.deleteConversation(conversationId);

  res.status(200).json({
    success: true,
    message: "Conversation deleted successfully",
  });
};
