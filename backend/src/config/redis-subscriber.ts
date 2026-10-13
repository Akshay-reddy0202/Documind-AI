import { Redis } from "ioredis";
import { env } from "./env.js";

export const DOCUMENT_STATUS_CHANNEL = "document-status";

export const redisSubscriber = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
});

redisSubscriber.on("error", (error: Error) => {
  console.error("Redis subscriber error:", error.message);
});
