import { useState } from "react";
import { getDocumentFile } from "../api/documents.api";

export const useDocumentFile = () => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocumentFile = async (documentId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const file = await getDocumentFile(documentId);
      const url = URL.createObjectURL(file);

      setFileUrl(url);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to load document",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fileUrl,
    isLoading,
    error,
    fetchDocumentFile,
  };
};
