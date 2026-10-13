
import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export interface DocumentProcessingJob {
  documentId: string;
}

export const documentQueue = new Queue<DocumentProcessingJob>(
  "document-processing",
  {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: 100,
      removeOnFail: 500,
    },
  },
);
