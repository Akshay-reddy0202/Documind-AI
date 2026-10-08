import { useState } from "react";
import type { DocumentSummary } from "../types/document.types";
import { deleteDocument, getDocuments } from "../api/documents.api";

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

  const removeDocument = async (documentId: string): Promise<void> => {
    setError(null);

    try {
      await deleteDocument(documentId);

      setDocuments((currentDocuments) =>
        currentDocuments.filter((document) => document.id !== documentId),
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to delete document",
      );
    }
  };

  return {
    documents,
    isLoading,
    error,
    fetchDocuments,
    removeDocument,
  };
};
