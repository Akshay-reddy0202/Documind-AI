import type {
  Issue,
  IssuePagination,
  IssueStats,
} from "../types/issue.types";

type IssueTableProps = {
  issues: Issue[];
  stats: IssueStats;
  pagination: IssuePagination;
  isLoading: boolean;
  onSelectIssue: (issue: Issue) => void;
  onPageChange: (page: number) => void;
};

export function IssueTable({
  issues,
  stats,
  pagination,
  isLoading,
  onSelectIssue,
  onPageChange,
}: IssueTableProps) {
  const getSeverityBadgeClass = (severity: string) => {
    const s = severity.toUpperCase();
    if (s.includes("P1")) return "bg-red-50 text-red-700 ring-red-600/20";
    if (s.includes("P2")) return "bg-amber-50 text-amber-700 ring-amber-600/20";
    if (s.includes("P3")) return "bg-blue-50 text-blue-700 ring-blue-600/20";
    return "bg-slate-50 text-slate-700 ring-slate-600/20";
  };

  const getStatusBadgeClass = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes("RESOLVED") || s.includes("FIXED")) {
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    }
    if (s.includes("IN_PROGRESS") || s.includes("PROGRESS")) {
      return "bg-indigo-50 text-indigo-700 ring-indigo-600/20";
    }
    if (s.includes("OPEN") || s.includes("INVESTIGATING")) {
      return "bg-amber-50 text-amber-700 ring-amber-600/20";
    }
    return "bg-slate-50 text-slate-700 ring-slate-600/20";
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top Stats Banner */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Total Extracted</span>
          <span className="mt-1 text-xl font-bold tracking-tight text-slate-900">
            {stats.total}
          </span>
        </div>
        <div className="flex flex-col justify-between rounded-xl border border-red-100 bg-red-50/40 p-3.5 shadow-xs">
          <span className="text-xs font-medium text-red-600">Critical (P1)</span>
          <span className="mt-1 text-xl font-bold tracking-tight text-red-700">
            {stats.p1Count}
          </span>
        </div>
        <div className="flex flex-col justify-between rounded-xl border border-amber-100 bg-amber-50/40 p-3.5 shadow-xs">
          <span className="text-xs font-medium text-amber-600">Active / Open</span>
          <span className="mt-1 text-xl font-bold tracking-tight text-amber-700">
            {stats.openCount}
          </span>
        </div>
      </div>

      {/* Issues Table Container */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <svg
                className="h-5 w-5 animate-spin text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <span>Loading issues...</span>
            </div>
          </div>
        ) : issues.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center p-6">
            <svg
              className="h-10 w-10 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-slate-900">
              No issues found
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your search keywords or clearing active filters.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-3 py-3">Severity</th>
                    <th className="px-4 py-3">Title & Component</th>
                    <th className="px-3 py-3">Client</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {issues.map((issue) => (
                    <tr
                      key={issue.id}
                      onClick={() => onSelectIssue(issue)}
                      className="cursor-pointer transition hover:bg-slate-50/80"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                        {issue.issueCode}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${getSeverityBadgeClass(
                            issue.severity,
                          )}`}
                        >
                          {issue.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900 line-clamp-1">
                          {issue.title}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">
                          {issue.component}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-slate-600">
                        <div className="font-medium">
                          {issue.document.clientName ?? issue.document.clientId ?? "N/A"}
                        </div>
                        {issue.document.environment && (
                          <div className="text-[10px] text-slate-400">
                            {issue.document.environment}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${getStatusBadgeClass(
                            issue.status,
                          )}`}
                        >
                          {issue.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectIssue(issue);
                          }}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-900"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="divide-y divide-slate-100 md:hidden">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => onSelectIssue(issue)}
                  className="flex flex-col gap-2 p-3.5 transition hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {issue.issueCode}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${getSeverityBadgeClass(
                          issue.severity,
                        )}`}
                      >
                        {issue.severity}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${getStatusBadgeClass(
                          issue.status,
                        )}`}
                      >
                        {issue.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-slate-900">
                    {issue.title}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{issue.document.clientName ?? "Client N/A"}</span>
                    <span>{issue.component}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/70 px-4 py-2.5 text-xs text-slate-600">
                <span>
                  Showing Page <strong className="text-slate-900">{pagination.page}</strong> of{" "}
                  <strong className="text-slate-900">{pagination.totalPages}</strong> (
                  {pagination.totalCount} total)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() => onPageChange(pagination.page - 1)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => onPageChange(pagination.page + 1)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
