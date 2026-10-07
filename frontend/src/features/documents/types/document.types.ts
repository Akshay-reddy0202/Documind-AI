export type DocumentSummary = {
  id: string;
  title: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  status: "UPLOADED" | "PROCESSING" | "PROCESSED" | "FAILED";
};

export type DocumentUploadResponse = {
  success: boolean;
  data: DocumentSummary[];
};
