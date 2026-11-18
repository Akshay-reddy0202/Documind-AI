import { useState, useEffect, useCallback } from "react";
import type {
  Issue,
  IssueFilterParams,
  IssuePagination,
  IssueStats,
  ClientOption,
} from "../types/issue.types";
import { fetchIssues } from "../api/issues.api";

export function useIssues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<IssueStats>({
    total: 0,
    p1Count: 0,
    openCount: 0,
  });
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [pagination, setPagination] = useState<IssuePagination>({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 1,
  });

  const [filters, setFilters] = useState<IssueFilterParams>({
    clientId: "",
    severity: "",
    status: "",
    search: "",
    page: 1,
    limit: 20,
  });

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadIssues = useCallback(async (currentFilters: IssueFilterParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchIssues(currentFilters);
      setIssues(data.issues);
      setPagination(data.pagination);
      setStats(data.stats);
      setClients(data.clients);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load issues";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      void loadIssues(filters);
    }, 250);

    return () => clearTimeout(handler);
  }, [filters, loadIssues]);

  const updateFilter = (
    key: keyof IssueFilterParams,
    value: string | number | undefined,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? (value as number) : 1, // Reset to page 1 on filter change
    }));
  };

  const resetFilters = () => {
    setFilters({
      clientId: "",
      severity: "",
      status: "",
      search: "",
      page: 1,
      limit: 20,
    });
  };

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    updateFilter("page", newPage);
  };

  return {
    issues,
    stats,
    clients,
    pagination,
    filters,
    isLoading,
    error,
    selectedIssue,
    setSelectedIssue,
    updateFilter,
    resetFilters,
    goToPage,
    refetch: () => loadIssues(filters),
  };
}
