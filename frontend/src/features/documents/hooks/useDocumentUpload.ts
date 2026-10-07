import { useState } from "react";
import type { DocumentSummary } from "../types/document.types";
import { uploadDocuments } from "../api/documents.api";

export const useDocumentUpload = () => {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (files: File[]): Promise<void> => {
    setIsUploading(true);
    setError(null);

    try {
      const response = await uploadDocuments(files);
      setDocuments(response.data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to upload documents",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return {
    documents,
    isUploading,
    error,
    upload,
  };
};