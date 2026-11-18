export type IssueDocumentSummary = {
  id: string;
  fileName: string;
  clientId: string | null;
  clientName: string | null;
  environment: string | null;
  reportingPeriod: string | null;
};

export type Issue = {
  id: string;
  documentId: string;
  issueCode: string;
  title: string;
  severity: string;
  component: string;
  status: string;
  firstObservedAt: string | null;
  description: string;
  logSnippet: string | null;
  workaround: string | null;
  resolution: string | null;
  createdAt: string;
  updatedAt: string;
  document: IssueDocumentSummary;
};

export type IssueFilterParams = {
  clientId?: string;
  severity?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type IssuePagination = {
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

export type IssueListResponse = {
  issues: Issue[];
  pagination: IssuePagination;
  stats: IssueStats;
  clients: ClientOption[];
};
