export type DocumentSummary = {
  id: string;
  title: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  status: "UPLOADED" | "PROCESSING" | "PROCESSED" | "FAILED";
};

export type DocumentUploadResult = {
  fileName: string;
  success: boolean;
  message: string;
  data: DocumentSummary;
};

export type DocumentUploadResponse = {
  success: boolean;
  message: string;
  data: DocumentUploadResult[];
};
