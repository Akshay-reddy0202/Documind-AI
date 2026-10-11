import { useState } from "react";
import Chat from "../../chat/components/Chat";
import DocumentViewer from "./DocumentViewer";

type DocumentWorkspaceProps = {
  fileUrl: string | null;
  isLoading: boolean;
  error: string | null;
  selectedConversationId: string | null;
  onConversationCreated: (conversationId: string) => void;
  onClose: () => void;
};

function DocumentWorkspace({
  fileUrl,
  isLoading,
  error,
  selectedConversationId,
  onConversationCreated,
  onClose,
}: DocumentWorkspaceProps) {
  const [activePanel, setActivePanel] = useState<"document" | "chat">(
    "document",
  );

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
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-xs font-semibold text-blue-600">
                PDF
              </span>
              <span className="truncate text-sm font-medium text-slate-800">
                Document Viewer
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
