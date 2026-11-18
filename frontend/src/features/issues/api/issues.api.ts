import type {
  Issue,
  IssueFilterParams,
  IssueListResponse,
} from "../types/issue.types";

const API_URL = import.meta.env.VITE_API_URL;

export const fetchIssues = async (
  params: IssueFilterParams = {},
): Promise<IssueListResponse> => {
  const query = new URLSearchParams();

  if (params.clientId) query.set("clientId", params.clientId);
  if (params.severity) query.set("severity", params.severity);
  if (params.status) query.set("status", params.status);
  if (params.search && params.search.trim()) query.set("search", params.search.trim());
  if (params.page) query.set("page", params.page.toString());
  if (params.limit) query.set("limit", params.limit.toString());

  const queryString = query.toString();
  const url = `${API_URL}/issues${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to fetch issues");
  }

  const result: { success: boolean; data: IssueListResponse } =
    await response.json();
  return result.data;
};

export const fetchIssueById = async (id: string): Promise<Issue> => {
  const response = await fetch(`${API_URL}/issues/${id}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to fetch issue details");
  }

  const result: { success: boolean; data: Issue } = await response.json();
  return result.data;
};
