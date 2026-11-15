import { useState } from "react";
import { getDocumentFile } from "../api/documents.api";

export const useDocumentFile = () => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocumentFile = async (
    documentId: string,
    docFileName?: string,
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    if (docFileName) {
      setFileName(docFileName);
    }

    try {
      const file = await getDocumentFile(documentId);
      const type = file.type || "application/octet-stream";
      setMimeType(type);

      const isPdf =
        type === "application/pdf" ||
        docFileName?.toLowerCase().endsWith(".pdf");

      if (isPdf) {
        const url = URL.createObjectURL(file);
        setFileUrl(url);
        setTextContent(null);
      } else {
        const text = await file.text();
        setTextContent(text);
        setFileUrl(null);
      }
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
    textContent,
    mimeType,
    fileName,
    isLoading,
    error,
    fetchDocumentFile,
  };
};
