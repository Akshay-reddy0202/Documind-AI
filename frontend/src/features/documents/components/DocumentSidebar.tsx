import { useState } from "react";
import { useDocuments } from "../hooks/useDocuments";

type DocumentSidebarProps = {
  onDocumentSelect: (documentId: string) => Promise<void>;
};

function DocumentSidebar({ onDocumentSelect }: DocumentSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null,
  );

  const { documents, isLoading, error, fetchDocuments } = useDocuments();

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
        <div className="flex flex-col gap-1 pl-3">
          {isLoading && (
            <p className="px-3 py-2 text-xs text-slate-400">
              Loading documents...
            </p>
          )}

          {error && <p className="px-3 py-2 text-xs text-red-500">{error}</p>}

          {!isLoading && !error && documents.length === 0 && (
            <p className="px-3 py-2 text-xs text-slate-400">
              No documents yet.
            </p>
          )}

          {!isLoading &&
            !error &&
            documents.map((document) => (
              <button
                key={document.id}
                type="button"
                onClick={() => handleDocumentClick(document.id)}
                className={`truncate rounded-lg px-3 py-2 text-left text-sm transition ${
                  selectedDocumentId === document.id
                    ? "bg-slate-200 font-medium text-slate-900"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {document.fileName}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

export default DocumentSidebar;
