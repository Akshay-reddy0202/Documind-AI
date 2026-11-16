import { z } from "zod";
import type { ChatRequest } from "./chat.types.js";

export const chatRequestSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Question cannot be empty")
    .max(2000, "Question cannot exceed 2000 characters"),

  conversationId: z.string().optional(),
});

export type { ChatRequest };
