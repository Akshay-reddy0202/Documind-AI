import { Redis } from "ioredis";
import { env } from "../../../config/env.js";

const redisPublisher = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
});

const DOCUMENT_STATUS_CHANNEL = "document-status";

export interface DocumentStatusEvent {
  documentId: string;
  status: "UPLOADED" | "PROCESSING" | "PROCESSED" | "FAILED";
}

export const publishDocumentStatus = async (
  event: DocumentStatusEvent,
): Promise<void> => {
  await redisPublisher.publish(DOCUMENT_STATUS_CHANNEL, JSON.stringify(event));
};
