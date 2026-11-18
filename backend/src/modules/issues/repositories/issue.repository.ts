import type {
  IssueFilterQuery,
  IssueListItem,
  IssueStats,
  ClientOption,
} from "../types/index.js";

export interface IssueRepository {
  findIssues(filters: IssueFilterQuery): Promise<{
    issues: IssueListItem[];
    totalCount: number;
  }>;

  findIssueById(id: string): Promise<IssueListItem | null>;

  getStats(): Promise<IssueStats>;

  getAvailableClients(): Promise<ClientOption[]>;
}
