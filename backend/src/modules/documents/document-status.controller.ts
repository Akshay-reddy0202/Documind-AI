import type { Request, Response } from "express";
import { prisma } from "../../config/prisma.js";
import {
  DOCUMENT_STATUS_CHANNEL,
  redisSubscriber,
} from "../../config/redis-subscriber.js";

export const streamDocumentStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const documentId = req.params.id as string;

  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      status: true,
    },
  });

  if (!document) {
    res.status(404).json({
      success: false,
      message: "Document not found",
    });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const sendEvent = (event: string, data: Record<string, unknown>) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const subscriber = redisSubscriber.duplicate();

  const cleanup = () => {
    req.off("close", cleanup);
    void subscriber.unsubscribe(DOCUMENT_STATUS_CHANNEL).finally(() => {
      subscriber.disconnect();
    });
  };

  try {
    await subscriber.subscribe(DOCUMENT_STATUS_CHANNEL);

    subscriber.on("message", (channel, message) => {
      if (channel !== DOCUMENT_STATUS_CHANNEL) {
        return;
      }

      try {
        const eventData = JSON.parse(message) as {
          documentId: string;
          status: string;
        };

        if (eventData.documentId === documentId) {
          sendEvent("document-status", eventData);
        }
      } catch {
        // Ignore malformed messages.
      }
    });

    sendEvent("document-status", {
      documentId: document.id,
      status: document.status,
    });

    req.on("close", cleanup);
  } catch (error) {
    cleanup();
    res.end();
    throw error;
  }
};
