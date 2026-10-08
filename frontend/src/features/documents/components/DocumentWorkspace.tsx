import { useState } from "react";
import Chat from "../../chat/components/Chat";
import DocumentViewer from "./DocumentViewer";

type DocumentWorkspaceProps = {
  fileUrl: string | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
};

function DocumentWorkspace({
  fileUrl,
  isLoading,
  error,
  onClose,
}: DocumentWorkspaceProps) {
  const [activePanel, setActivePanel] = useState<"document" | "chat">(
    "document",
  );

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      {/* Workspace header */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
        <span className="text-sm font-medium text-slate-700">
          Document
        </span>

        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="Close document"
        >
          ×
        </button>
      </header>

      {/* Workspace content */}
      <div className="flex min-h-0 min-w-0 flex-1">
        {/* Document panel */}
        <div
          className={`min-h-0 min-w-0 flex-1 flex-col border-r border-slate-200 bg-white md:flex-[1.4] ${
            activePanel === "document" ? "flex" : "hidden md:flex"
          }`}
        >
          <DocumentViewer
            fileUrl={fileUrl}
            isLoading={isLoading}
            error={error}
          />
        </div>

        {/* Chat panel */}
        <div
          className={`min-h-0 min-w-0 flex-1 bg-white ${
            activePanel === "chat" ? "flex" : "hidden md:flex"
          }`}
        >
          <Chat />
        </div>
      </div>

      {/* Mobile panel switcher */}
      <nav className="flex h-14 shrink-0 border-t border-slate-200 bg-white md:hidden">
        <button
          type="button"
          onClick={() => setActivePanel("document")}
          className={`flex flex-1 items-center justify-center text-sm font-medium ${
            activePanel === "document"
              ? "text-blue-600"
              : "text-slate-500"
          }`}
        >
          Document
        </button>

        <button
          type="button"
          onClick={() => setActivePanel("chat")}
          className={`flex flex-1 items-center justify-center text-sm font-medium ${
            activePanel === "chat"
              ? "text-blue-600"
              : "text-slate-500"
          }`}
        >
          Chat
        </button>
      </nav>
    </section>
  );
}

export default DocumentWorkspace;