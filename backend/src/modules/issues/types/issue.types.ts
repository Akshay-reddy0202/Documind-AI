export type IssueDocumentSummary = {
  id: string;
  fileName: string;
  clientId: string | null;
  clientName: string | null;
  environment: string | null;
  reportingPeriod: string | null;
};

export type IssueListItem = {
  id: string;
  documentId: string;
  issueCode: string;
  title: string;
  severity: string;
  component: string;
  status: string;
  firstObservedAt: Date | null;
  description: string;
  logSnippet: string | null;
  workaround: string | null;
  resolution: string | null;
  createdAt: Date;
  updatedAt: Date;
  document: IssueDocumentSummary;
};

export type IssueFilterQuery = {
  clientId?: string;
  severity?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type IssuePaginationMeta = {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
};

export type IssueStats = {
  total: number;
  p1Count: number;
  openCount: number;
};

export type ClientOption = {
  clientId: string;
  clientName: string;
};

export type IssueListResponseData = {
  issues: IssueListItem[];
  pagination: IssuePaginationMeta;
  stats: IssueStats;
  clients: ClientOption[];
};
