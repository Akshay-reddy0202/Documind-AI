import z from "zod";

const updateDocumentSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").optional(),
    description: z
      .string()
      .max(500, "Description cannot exceed 500 characters")
      .optional(),
  })
  .refine(
    (data) => data.title !== undefined || data.description !== undefined,
    {
      message: "At least one field is required to update",
    },
  );

const documentIdSchema = z.object({
  id: z.string().min(1, "Document ID is required"),
});

export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;

export { updateDocumentSchema, documentIdSchema };
