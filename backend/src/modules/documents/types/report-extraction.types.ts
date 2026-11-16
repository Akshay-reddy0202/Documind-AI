export interface ExtractedReportMetadata {
  clientId?: string;
  clientName?: string;
  environment?: string;
  reportingPeriod?: string;
}

export interface ExtractedIssue {
  issueCode: string;
  title: string;
  severity: string;
  component: string;
  firstObservedAt?: Date | null;
  status: string;
  description: string;
  logSnippet?: string | null;
  workaround?: string | null;
  resolution?: string | null;
}

export interface ReportExtractionResult {
  metadata: ExtractedReportMetadata;
  extractedIssuesCount: number;
}
