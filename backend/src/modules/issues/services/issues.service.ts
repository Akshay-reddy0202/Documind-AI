import type { IssueRepository } from "../repositories/issue.repository.js";
import type {
  IssueFilterQuery,
  IssueListResponseData,
  IssueListItem,
} from "../types/index.js";

export class IssuesService {
  constructor(private readonly issueRepository: IssueRepository) {}

  async listIssues(filters: IssueFilterQuery): Promise<IssueListResponseData> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    const [issuesResult, stats, clients] = await Promise.all([
      this.issueRepository.findIssues({ ...filters, page, limit }),
      this.issueRepository.getStats(),
      this.issueRepository.getAvailableClients(),
    ]);

    const totalPages = Math.ceil(issuesResult.totalCount / limit) || 1;

    return {
      issues: issuesResult.issues,
      pagination: {
        page,
        limit,
        totalCount: issuesResult.totalCount,
        totalPages,
      },
      stats,
      clients,
    };
  }

  async getIssueById(id: string): Promise<IssueListItem | null> {
    return this.issueRepository.findIssueById(id);
  }
}
