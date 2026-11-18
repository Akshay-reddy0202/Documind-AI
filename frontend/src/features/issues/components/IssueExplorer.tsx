import { useIssues } from "../hooks/useIssues";
import { IssueFilterBar } from "./IssueFilterBar";
import { IssueTable } from "./IssueTable";
import { IssueDetailModal } from "./IssueDetailModal";

type IssueExplorerProps = {
  onOpenDocument?: (documentId: string, fileName?: string) => void;
  onSwitchToChat?: () => void;
};

export function IssueExplorer({
  onOpenDocument,
  onSwitchToChat,
}: IssueExplorerProps) {
  const {
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
  } = useIssues();

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        {/* Page Header */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Client Issues & Incident Explorer
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Filter, search, and inspect incidents automatically extracted from client weekly reports and system logs.
            </p>
          </div>

          {onSwitchToChat && (
            <button
              type="button"
              onClick={onSwitchToChat}
              className="mt-2 inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-100 sm:mt-0"
            >
              <span>💬 Ask AI about these issues</span>
            </button>
          )}
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Filters Toolbar */}
        <IssueFilterBar
          filters={filters}
          clients={clients}
          onFilterChange={updateFilter}
          onReset={resetFilters}
        />

        {/* Issues Table & Stats */}
        <IssueTable
          issues={issues}
          stats={stats}
          pagination={pagination}
          isLoading={isLoading}
          onSelectIssue={setSelectedIssue}
          onPageChange={goToPage}
        />
      </div>

      {/* Issue Detail Modal */}
      <IssueDetailModal
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
        onOpenDocument={onOpenDocument}
      />
    </div>
  );
}
