export type DocumentSummary = {
  id: string;
  title: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  status: "UPLOADED" | "PROCESSING" | "PROCESSED" | "FAILED";
  clientId?: string | null;
  clientName?: string | null;
  environment?: string | null;
  reportingPeriod?: string | null;
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

export type IssueSummary = {
  id: string;
  documentId: string;
  issueCode: string;
  title: string;
  severity: string;
  component: string;
  firstObservedAt?: string | null;
  status: string;
  description: string;
  logSnippet?: string | null;
  workaround?: string | null;
  resolution?: string | null;
  createdAt: string;
  updatedAt: string;
};
