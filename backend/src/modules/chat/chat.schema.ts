import { z } from "zod";

export const chatRequestSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Question cannot be empty")
    .max(2000, "Question cannot exceed 2000 characters"),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
