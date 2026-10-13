import { useEffect, useRef, useState } from "react";
import type { DocumentSummary } from "../types/document.types";
import {
  uploadDocuments,
  subscribeToDocumentStatus,
} from "../api/documents.api";

type DocumentStatus = "UPLOADED" | "PROCESSING" | "PROCESSED" | "FAILED";

export const useDocumentUpload = (
  onDocumentProcessed?: (documentId: string) => void,
) => {
  // Only stores the documents uploaded in THIS active session
  const [activeUploads, setActiveUploads] = useState<DocumentSummary[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentStatuses, setDocumentStatuses] = useState<
    Record<string, DocumentStatus>
  >({});

  const subscriptionsRef = useRef<Map<string, () => void>>(new Map());

  useEffect(() => {
    return () => {
      subscriptionsRef.current.forEach((unsubscribe) => unsubscribe());
      subscriptionsRef.current.clear();
    };
  }, []);

  const upload = async (files: File[]): Promise<void> => {
    setIsUploading(true);
    setError(null);

    try {
      const response = await uploadDocuments(files);

      // Extract the actual document objects from response.data items
      const newDocs: DocumentSummary[] = response.data
        .map((item: any) => item.data)
        .filter((doc): doc is DocumentSummary => Boolean(doc && doc.id));

      // Show ONLY these uploaded files in the upload box
      setActiveUploads(newDocs);

      for (const doc of newDocs) {
        setDocumentStatuses((prev) => ({
          ...prev,
          [doc.id]: doc.status,
        }));

        // Subscribe to SSE using the valid doc.id
        const unsubscribe = subscribeToDocumentStatus(doc.id, (event) => {
          setDocumentStatuses((prev) => ({
            ...prev,
            [event.documentId]: event.status,
          }));

          // Once processed or failed, clean up SSE stream
          if (event.status === "PROCESSED" || event.status === "FAILED") {
            const cleanup = subscriptionsRef.current.get(event.documentId);
            cleanup?.();
            subscriptionsRef.current.delete(event.documentId);

            // Notify sidebar to refresh!
            if (event.status === "PROCESSED") {
              onDocumentProcessed?.(event.documentId);
            }
          }
        });

        subscriptionsRef.current.set(doc.id, unsubscribe);
      }
    } catch (uploadError: unknown) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload documents",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const clearUploads = () => {
    setActiveUploads([]);
    setDocumentStatuses({});
  };

  return {
    activeUploads,
    documentStatuses,
    isUploading,
    error,
    upload,
    clearUploads,
  };
};
