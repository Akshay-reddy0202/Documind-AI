import type { Request, Response } from "express";
import type { ChatRequest, ChatResponseData } from "./chat.types.js";
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
  let recentHistory: { role: "USER" | "ASSISTANT"; content: string }[] = [];

  if (conversationId) {
    conversation =
      await conversationRepository.getConversationById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Fetch the last 2 turns (4 messages) before recording the new question
    recentHistory = await conversationRepository.getRecentConversationTurns(
      conversation.id,
      2,
    );
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

  const result = await ragService.answerQuestion(question, recentHistory);

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
        matchSource: source.matchSource,
      })),
      relatedIssues: result.relatedIssues?.map((issue) => ({
        id: issue.id,
        issueCode: issue.issueCode,
        title: issue.title,
        severity: issue.severity,
        status: issue.status,
        clientName: issue.document.clientName,
      })),
    },
  });
};

export const chatStream = async (
  req: Request<{}, {}, ChatRequest>,
  res: Response,
) => {
  const { question, conversationId } = chatRequestSchema.parse(req.body);

  let conversation;
  let recentHistory: { role: "USER" | "ASSISTANT"; content: string }[] = [];

  if (conversationId) {
    conversation =
      await conversationRepository.getConversationById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    recentHistory = await conversationRepository.getRecentConversationTurns(
      conversation.id,
      2,
    );
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

  // 1. Persist the incoming user message
  await conversationRepository.saveMessage(conversation.id, "USER", question);

  // 2. Set SSE Headers for real-time streaming
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const sendEvent = (event: string, data: Record<string, unknown>) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  let isAborted = false;
  req.on("close", () => {
    isAborted = true;
  });

  try {
    const result = await ragService.answerQuestionStream(
      question,
      recentHistory,
      {
        onMetadata: (meta) => {
          if (!isAborted) {
            sendEvent("metadata", {
              conversationId: conversation.id,
              title: conversation.title,
              sources: meta.sources.map((source) => ({
                documentId: source.documentId,
                pageNumber: source.pageNumber,
                chunkIndex: source.chunkIndex,
                matchSource: source.matchSource,
              })),
              relatedIssues: meta.relatedIssues.map((issue) => ({
                id: issue.id,
                issueCode: issue.issueCode,
                title: issue.title,
                severity: issue.severity,
                status: issue.status,
                clientName: issue.document.clientName,
              })),
            });
          }
        },
        onToken: (token) => {
          if (!isAborted) {
            sendEvent("token", { token });
          }
        },
      },
    );

    // Save final assistant answer to database
    await conversationRepository.saveMessage(
      conversation.id,
      "ASSISTANT",
      result.answer,
    );

    if (!isAborted) {
      sendEvent("done", {
        conversationId: conversation.id,
        answer: result.answer,
      });
      res.end();
    }
  } catch (error) {
    if (!isAborted) {
      sendEvent("error", {
        message:
          error instanceof Error ? error.message : "Failed to generate answer",
      });
      res.end();
    }
  }
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
