import { useEffect, useState } from "react";
import type { Issue } from "../types/issue.types";

type IssueDetailModalProps = {
  issue: Issue | null;
  onClose: () => void;
  onOpenDocument?: (documentId: string, fileName?: string) => void;
};

export function IssueDetailModal({
  issue,
  onClose,
  onOpenDocument,
}: IssueDetailModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!issue) return null;

  const copyLogSnippet = async () => {
    if (!issue.logSnippet) return;
    try {
      await navigator.clipboard.writeText(issue.logSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-slate-100 p-5">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-800">
                {issue.issueCode}
              </span>
              <span
                className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${getSeverityBadgeClass(
                  issue.severity,
                )}`}
              >
                {issue.severity}
              </span>
              <span
                className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${getStatusBadgeClass(
                  issue.status,
                )}`}
              >
                {issue.status}
              </span>
            </div>
            <h2 className="text-base font-semibold text-slate-900">
              {issue.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close dialog"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5 text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 sm:grid-cols-4">
            <div>
              <p className="font-medium text-slate-400">Client</p>
              <p className="mt-0.5 font-semibold text-slate-800">
                {issue.document.clientName ?? issue.document.clientId ?? "N/A"}
              </p>
            </div>
            <div>
              <p className="font-medium text-slate-400">Component</p>
              <p className="mt-0.5 font-semibold text-slate-800">
                {issue.component}
              </p>
            </div>
            <div>
              <p className="font-medium text-slate-400">Environment</p>
              <p className="mt-0.5 font-semibold text-slate-800">
                {issue.document.environment ?? "N/A"}
              </p>
            </div>
            <div>
              <p className="font-medium text-slate-400">Reporting Period</p>
              <p className="mt-0.5 font-semibold text-slate-800">
                {issue.document.reportingPeriod ?? "N/A"}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-slate-700">Description</h3>
            <p className="mt-1 leading-relaxed text-slate-600">
              {issue.description}
            </p>
          </div>

          {/* Verbatim Log Snippet */}
          {issue.logSnippet && (
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-700">
                  Verbatim Error Log Snippet
                </h3>
                <button
                  type="button"
                  onClick={copyLogSnippet}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700"
                >
                  {copied ? "✓ Copied" : "Copy Snippet"}
                </button>
              </div>
              <div className="relative mt-1.5 overflow-x-auto rounded-lg bg-slate-900 p-3.5 font-mono text-[11px] leading-relaxed text-emerald-400 shadow-inner">
                <pre className="whitespace-pre-wrap">{issue.logSnippet}</pre>
              </div>
            </div>
          )}

          {/* Workaround */}
          {issue.workaround && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
              <h3 className="font-semibold text-amber-900">Workaround</h3>
              <p className="mt-1 leading-relaxed text-amber-800">
                {issue.workaround}
              </p>
            </div>
          )}

          {/* Resolution */}
          {issue.resolution && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
              <h3 className="font-semibold text-emerald-900">
                Confirmed Resolution
              </h3>
              <p className="mt-1 leading-relaxed text-emerald-800">
                {issue.resolution}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3 rounded-b-2xl">
          <span className="text-[11px] text-slate-400">
            Source: <span className="font-medium text-slate-600">{issue.document.fileName}</span>
          </span>

          <div className="flex items-center gap-2">
            {onOpenDocument && (
              <button
                type="button"
                onClick={() => {
                  onOpenDocument(issue.documentId, issue.document.fileName);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Open Source Document
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-800 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-slate-900"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
