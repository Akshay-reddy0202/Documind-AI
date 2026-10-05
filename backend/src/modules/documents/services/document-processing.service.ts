import type { ExtractedPage } from "../../chunking/chunking.types.js";

export interface DocumentProcessingService {
  processDocument(
    documentId: string,
    pages: ExtractedPage[],
  ): Promise<void>;
}