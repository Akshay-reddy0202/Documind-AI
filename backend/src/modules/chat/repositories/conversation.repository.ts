import { prisma as prismaClient } from "../../../config/prisma.js";
import type { PrismaClient } from "../../../generated/prisma/client.js";

export class ConversationRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient = prismaClient) {
    this.prisma = prisma;
  }

  async createConversation() {
    const conversation = await this.prisma.conversation.create({
      data: {
        title: "New Chat",
      },
    });

    return conversation;
  }

  async saveMessage(
    conversationId: string,
    role: "USER" | "ASSISTANT",
    content: string,
  ) {
    const message = await this.prisma.message.create({
      data: {
        conversationId,
        role,
        content,
      },
    });

    return message;
  }

  async getConversationMessages(conversationId: string) {
    const history = await this.prisma.message.findMany({
      where: {
        conversationId: conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return history;
  }

  async getConversationById(conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
    });
    return conversation;
  }

  async getAllConversations() {
    const conversations = await this.prisma.conversation.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });
    return conversations;
  }

  async updateConversationTitle(conversationId: string, title: string) {
    return this.prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        title,
      },
    });
  }

  async deleteConversation(conversationId: string) {
    return this.prisma.conversation.delete({
      where: {
        id: conversationId,
      },
    });
  }
}
