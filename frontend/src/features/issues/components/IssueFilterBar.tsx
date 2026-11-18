import type { ClientOption, IssueFilterParams } from "../types/issue.types";

type IssueFilterBarProps = {
  filters: IssueFilterParams;
  clients: ClientOption[];
  onFilterChange: (
    key: keyof IssueFilterParams,
    value: string | number | undefined,
  ) => void;
  onReset: () => void;
};

export function IssueFilterBar({
  filters,
  clients,
  onFilterChange,
  onReset,
}: IssueFilterBarProps) {
  const hasActiveFilters = Boolean(
    filters.clientId || filters.severity || filters.status || filters.search,
  );

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative min-w-[220px] flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            value={filters.search ?? ""}
            onChange={(e) => onFilterChange("search", e.target.value)}
            placeholder="Search code (e.g. ISS-C1-101), severity (e.g. P1), client, component..."
            className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pr-3 pl-9 text-xs text-slate-800 placeholder-slate-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange("search", "")}
              className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Client Filter Dropdown */}
        <div className="min-w-[150px]">
          <select
            value={filters.clientId ?? ""}
            onChange={(e) => onFilterChange("clientId", e.target.value || undefined)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Clients</option>
            {clients.map((c) => (
              <option key={c.clientId} value={c.clientId}>
                {c.clientName}
              </option>
            ))}
          </select>
        </div>

        {/* Severity Filter Dropdown */}
        <div className="min-w-[130px]">
          <select
            value={filters.severity ?? ""}
            onChange={(e) => onFilterChange("severity", e.target.value || undefined)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Severities</option>
            <option value="P1">P1 - Critical</option>
            <option value="P2">P2 - High</option>
            <option value="P3">P3 - Medium</option>
          </select>
        </div>

        {/* Status Filter Dropdown */}
        <div className="min-w-[130px]">
          <select
            value={filters.status ?? ""}
            onChange={(e) => onFilterChange("status", e.target.value || undefined)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="RESOLVED">Resolved</option>
            <option value="IN_PROGRESS">In Progress</option>
          </select>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
