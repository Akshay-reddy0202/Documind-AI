import type { DocumentUploadResponse } from "../types/document.types";
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
