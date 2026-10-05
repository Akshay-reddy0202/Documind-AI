import { createHash } from "node:crypto";
const PDF_SIGNATURE = "%PDF-";

export const validatePdfFile = async (
  file: Express.Multer.File,
): Promise<{ fileHash: string }> => {
  // 1. Validate the file extension.
  if (!file.originalname.toLowerCase().endsWith(".pdf")) {
    throw new Error("Only PDF files are allowed");
  }

  // 2. Validate the PDF file signature.
  const fileSignature = file.buffer
    .subarray(0, PDF_SIGNATURE.length)
    .toString("ascii");

  if (fileSignature !== PDF_SIGNATURE) {
    throw new Error("The uploaded file is not a valid PDF");
  }

  // 3. Generate a SHA-256 hash for duplicate detection.
  const fileHash = createHash("sha256").update(file.buffer).digest("hex");

  return { fileHash };
};
