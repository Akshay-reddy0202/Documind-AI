import { createHash } from "node:crypto";

const PDF_SIGNATURE = "%PDF-";

export const SUPPORTED_EXTENSIONS: Record<string, string> = {
  ".pdf": "application/pdf",
  ".md": "text/markdown",
  ".markdown": "text/markdown",
  ".txt": "text/plain",
  ".log": "text/plain",
  ".json": "application/json",
  ".csv": "text/csv",
};

export const validateDocumentFile = async (
  file: Express.Multer.File,
): Promise<{ fileHash: string; mimeType: string }> => {
  const originalName = file.originalname.toLowerCase();
  const matchedExt = Object.keys(SUPPORTED_EXTENSIONS).find((ext) =>
    originalName.endsWith(ext),
  );

  if (!matchedExt) {
    throw new Error(
      "Unsupported file format. Allowed formats: PDF (.pdf), Markdown (.md), Text (.txt), Log (.log), JSON (.json), CSV (.csv)",
    );
  }

  const mimeType = SUPPORTED_EXTENSIONS[matchedExt];

  if (matchedExt === ".pdf") {
    const fileSignature = file.buffer
      .subarray(0, PDF_SIGNATURE.length)
      .toString("ascii");

    if (fileSignature !== PDF_SIGNATURE) {
      throw new Error("The uploaded file is not a valid PDF");
    }
  } else {
    // For text-based documents (.md, .txt, .log, .json, .csv)
    const textContent = file.buffer.toString("utf-8");

    if (!textContent.trim()) {
      throw new Error("The uploaded file is empty");
    }

    if (matchedExt === ".json") {
      try {
        JSON.parse(textContent);
      } catch {
        throw new Error("The uploaded JSON file contains invalid syntax");
      }
    }
  }

  const fileHash = createHash("sha256").update(file.buffer).digest("hex");

  return { fileHash, mimeType };
};

// Backward-compatible alias for existing imports
export const validatePdfFile = validateDocumentFile;
