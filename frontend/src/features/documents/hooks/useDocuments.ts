import { useState } from "react";
import type { DocumentSummary } from "../types/document.types";
import { getDocuments } from "../api/documents.api";

export const useDocuments = () => {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const documents = await getDocuments();

      setDocuments(documents);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to fetch documents",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    documents,
    isLoading,
    error,
    fetchDocuments,
  };
};
