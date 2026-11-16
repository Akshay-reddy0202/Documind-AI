export interface DocumentChunkInput {
  documentId: string;
  content: string;
  pageNumber: number;
  chunkIndex: number;
  embedding: number[];
}

export type DocumentStatus = "UPLOADED" | "PROCESSING" | "PROCESSED" | "FAILED";

export interface DocumentStatusEvent {
  documentId: string;
  status: DocumentStatus;
}

export interface DocumentSummary {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  status: DocumentStatus;
  clientId?: string | null;
  clientName?: string | null;
  environment?: string | null;
  reportingPeriod?: string | null;
  createdAt: Date;
}
