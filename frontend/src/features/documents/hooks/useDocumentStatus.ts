import { useEffect, useState } from "react";

type DocumentStatus = "UPLOADED" | "PROCESSING" | "PROCESSED" | "FAILED";

interface DocumentStatusResponse {
  success: boolean;
  data: {
    id: string;
    status: DocumentStatus;
  };
}

const API_URL = import.meta.env.VITE_API_URL;
const POLLING_INTERVAL = 2000;

export const useDocumentStatus = (
  documentId: string | null,
  onComplete?: () => void,
) => {
  const [status, setStatus] = useState<DocumentStatus | null>(null);

  useEffect(() => {
    if (!documentId) {
      setStatus(null);
      return;
    }

    let isActive = true;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const checkStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/documents/${documentId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch document status");
        }

        const result: DocumentStatusResponse = await response.json();

        if (!isActive || !result.success || !result.data) {
          return;
        }

        const currentStatus = result.data.status;
        setStatus(currentStatus);

        if (currentStatus === "PROCESSED" || currentStatus === "FAILED") {
          if (intervalId !== undefined) {
            clearInterval(intervalId);
          }

          onComplete?.();
        }
      } catch (error) {
        if (isActive) {
          console.error("Failed to check document status:", error);
        }
      }
    };

    void checkStatus();

    intervalId = setInterval(() => {
      void checkStatus();
    }, POLLING_INTERVAL);

    return () => {
      isActive = false;

      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
    };
  }, [documentId, onComplete]);

  return { status };
};
