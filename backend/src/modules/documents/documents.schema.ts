import z from "zod";

const documentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
});

export type DocumentInput = z.infer<typeof documentSchema>;

export default documentSchema;
