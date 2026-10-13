import { useEffect, useState } from "react";
import { useDocuments } from "../hooks/useDocuments";

type DocumentSidebarProps = {
  onDocumentSelect: (documentId: string) => Promise<void>;
  onDocumentDelete: (documentId: string) => void;
  refreshTrigger?: number;
};

function DocumentSidebar({
  onDocumentSelect,
  onDocumentDelete,
  refreshTrigger,
}: DocumentSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null,
  );

  const { documents, isLoading, error, fetchDocuments, removeDocument } =
    useDocuments();

  // Re-fetch automatically whenever refreshTrigger changes (e.g. when SSE emits PROCESSED)
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      void fetchDocuments();
    }
  }, [refreshTrigger]);

  const handleDocumentsClick = async () => {
    const nextIsOpen = !isOpen;
    setIsOpen(nextIsOpen);

    if (nextIsOpen) {
      await fetchDocuments();
    }
  };

  const handleDocumentClick = async (documentId: string) => {
    setSelectedDocumentId(documentId);
    await onDocumentSelect(documentId);
  };

  const handleDocumentDelete = async (documentId: string): Promise<void> => {
    await removeDocument(documentId);
    onDocumentDelete(documentId);

    if (selectedDocumentId === documentId) {
      setSelectedDocumentId(null);
    }
  };

  // Only display documents that are fully processed and ready to read/chat with
  const readyDocuments = documents.filter(
    (document) => document.status === "PROCESSED",
  );

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleDocumentsClick}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      >
        <span>Documents</span>
        <span className="text-slate-400">{isOpen ? "⌃" : "⌄"}</span>
      </button>

      {isOpen && (
        <div className="flex max-h-64 flex-col gap-1 overflow-y-auto pl-3">
          {isLoading && (
            <p className="px-3 py-2 text-xs text-slate-400">
              Loading documents...
            </p>
          )}

          {error && <p className="px-3 py-2 text-xs text-red-500">{error}</p>}

          {!isLoading && !error && readyDocuments.length === 0 && (
            <p className="px-3 py-2 text-xs text-slate-400">
              No documents yet.
            </p>
          )}

          {!isLoading &&
            !error &&
            readyDocuments.map((document) => (
              <div
                key={document.id}
                className={`flex items-center gap-1 rounded-lg transition ${
                  selectedDocumentId === document.id
                    ? "bg-slate-200"
                    : "hover:bg-slate-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleDocumentClick(document.id)}
                  className={`min-w-0 flex-1 truncate px-3 py-2 text-left text-sm ${
                    selectedDocumentId === document.id
                      ? "font-medium text-slate-900"
                      : "text-slate-600"
                  }`}
                  title={document.fileName}
                >
                  {document.fileName}
                </button>

                <button
                  type="button"
                  onClick={() => handleDocumentDelete(document.id)}
                  className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                  aria-label={`Delete ${document.fileName}`}
                >
                  ×
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default DocumentSidebar;
