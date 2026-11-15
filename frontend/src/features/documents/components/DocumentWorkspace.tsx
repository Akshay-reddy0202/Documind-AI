import { useState } from "react";
import Chat from "../../chat/components/Chat";
import DocumentViewer from "./DocumentViewer";

type DocumentWorkspaceProps = {
  fileUrl: string | null;
  textContent?: string | null;
  mimeType?: string | null;
  fileName?: string | null;
  isLoading: boolean;
  error: string | null;
  selectedConversationId: string | null;
  onConversationCreated: (conversationId: string) => void;
  onClose: () => void;
};

const getBadgeInfo = (fileName?: string | null, mimeType?: string | null) => {
  const name = fileName?.toLowerCase() ?? "";
  if (name.endsWith(".pdf") || mimeType === "application/pdf") {
    return { label: "PDF", bg: "bg-blue-50", text: "text-blue-600" };
  }
  if (
    name.endsWith(".md") ||
    name.endsWith(".markdown") ||
    mimeType?.includes("markdown")
  ) {
    return { label: "MD", bg: "bg-purple-50", text: "text-purple-600" };
  }
  if (name.endsWith(".json") || mimeType === "application/json") {
    return { label: "JSON", bg: "bg-emerald-50", text: "text-emerald-600" };
  }
  if (name.endsWith(".csv") || mimeType === "text/csv") {
    return { label: "CSV", bg: "bg-amber-50", text: "text-amber-600" };
  }
  if (name.endsWith(".log")) {
    return { label: "LOG", bg: "bg-rose-50", text: "text-rose-600" };
  }
  return { label: "TXT", bg: "bg-slate-100", text: "text-slate-600" };
};

function DocumentWorkspace({
  fileUrl,
  textContent,
  mimeType,
  fileName,
  isLoading,
  error,
  selectedConversationId,
  onConversationCreated,
  onClose,
}: DocumentWorkspaceProps) {
  const [activePanel, setActivePanel] = useState<"document" | "chat">(
    "document",
  );

  const badge = getBadgeInfo(fileName, mimeType);

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex min-h-0 min-w-0 flex-1">
        {/* Document panel */}
        <div
          className={`min-h-0 min-w-0 flex-1 flex-col border-r border-slate-200 bg-white md:flex-[1.3] ${
            activePanel === "document" ? "flex" : "hidden md:flex"
          }`}
        >
          {/* Dedicated Document Header */}
          <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={`flex h-6 min-w-8 items-center justify-center rounded-md px-1.5 text-[11px] font-bold ${badge.bg} ${badge.text}`}
              >
                {badge.label}
              </span>
              <span
                className="truncate text-sm font-medium text-slate-800"
                title={fileName ?? "Document Viewer"}
              >
                {fileName ?? "Document Viewer"}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              aria-label="Close document"
              title="Close document viewer"
            >
              <span className="text-sm leading-none">✕</span>
              <span>Close</span>
            </button>
          </header>

          <div className="min-h-0 flex-1">
            <DocumentViewer
              fileUrl={fileUrl}
              textContent={textContent}
              mimeType={mimeType}
              fileName={fileName}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>

        {/* Chat panel */}
        <div
          className={`min-h-0 min-w-0 flex-1 flex-col bg-white ${
            activePanel === "chat" ? "flex" : "hidden md:flex"
          }`}
        >
          {/* Dedicated Chat Header */}
          <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-xs font-semibold text-emerald-600">
                AI
              </span>
              <span className="text-sm font-medium text-slate-800">
                Chat Assistant
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 md:hidden"
              title="Close document view"
            >
              <span>✕ Exit</span>
            </button>
          </header>

          <div className="min-h-0 flex-1">
            <Chat
              selectedConversationId={selectedConversationId}
              onConversationCreated={onConversationCreated}
            />
          </div>
        </div>
      </div>

      {/* Mobile panel switcher tabs */}
      <nav className="flex h-12 shrink-0 border-t border-slate-200 bg-white md:hidden">
        <button
          type="button"
          onClick={() => setActivePanel("document")}
          className={`flex flex-1 items-center justify-center gap-1.5 text-xs font-medium transition ${
            activePanel === "document"
              ? "border-t-2 border-blue-600 bg-blue-50/30 text-blue-600"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <span>📄</span>
          <span>Document</span>
        </button>

        <button
          type="button"
          onClick={() => setActivePanel("chat")}
          className={`flex flex-1 items-center justify-center gap-1.5 text-xs font-medium transition ${
            activePanel === "chat"
              ? "border-t-2 border-blue-600 bg-blue-50/30 text-blue-600"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <span>💬</span>
          <span>Chat</span>
        </button>
      </nav>
    </section>
  );
}

export default DocumentWorkspace;
