import { Redis } from "ioredis";
import { env } from "../../../config/env.js";
import type { DocumentStatusEvent } from "../types/index.js";

export type { DocumentStatusEvent };

const redisPublisher = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
});

const DOCUMENT_STATUS_CHANNEL = "document-status";

export const publishDocumentStatus = async (
  event: DocumentStatusEvent,
): Promise<void> => {
  await redisPublisher.publish(DOCUMENT_STATUS_CHANNEL, JSON.stringify(event));
};
