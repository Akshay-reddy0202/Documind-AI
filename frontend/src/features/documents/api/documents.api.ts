import type {
  DocumentSummary,
  DocumentUploadResponse,
} from "../types/document.types";
const API_URL = import.meta.env.VITE_API_URL;

export const uploadDocuments = async (
  files: File[],
): Promise<DocumentUploadResponse> => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });
  const response = await fetch(`${API_URL}/documents/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload documents");
  }

  return response.json();
};

export const getDocuments = async (): Promise<DocumentSummary[]> => {
  const response = await fetch(`${API_URL}/documents`);

  if (!response.ok) {
    throw new Error("Failed to fetch documents");
  }

  const result: {
    success: boolean;
    data: DocumentSummary[];
  } = await response.json();

  return result.data;
};

export const getDocumentFile = async (documentId: string): Promise<Blob> => {
  const response = await fetch(`${API_URL}/documents/${documentId}/file`);

  if (!response.ok) {
    throw new Error("Failed to fetch document");
  }

  return response.blob();
};

export const deleteDocument = async (documentId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/documents/${documentId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete doucment");
  }
};
