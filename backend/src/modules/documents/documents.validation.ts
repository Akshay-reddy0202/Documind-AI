import { createHash } from "node:crypto";
import { PDFParse } from "pdf-parse";

const PDF_MIME_TYPE = "application/pdf";
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

  // 3. Verify that the PDF can be parsed.
  const parser = new PDFParse({
    data: file.buffer,
  });

  try {
    await parser.getText();
  } catch {
    throw new Error("The PDF file is corrupted or unreadable");
  } finally {
    await parser.destroy();
  }

  // 4. Generate a SHA-256 hash for duplicate detection.
  const fileHash = createHash("sha256")
    .update(file.buffer)
    .digest("hex");

  return { fileHash };
};