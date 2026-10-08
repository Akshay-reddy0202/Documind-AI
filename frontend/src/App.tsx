import { useState } from "react";
import Chat from "./features/chat/components/Chat";
import DocumentSidebar from "./features/documents/components/DocumentSidebar";
import DocumentUpload from "./features/documents/components/DocumentUpload";
import DocumentWorkspace from "./features/documents/components/DocumentWorkspace";
import { useDocumentFile } from "./features/documents/hooks/useDocumentFile";

function App() {
  const { fileUrl, isLoading, error, fetchDocumentFile } = useDocumentFile();
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null,
  );

  const handleDocumentSelect = async (documentId: string): Promise<void> => {
    setSelectedDocumentId(documentId);
    await fetchDocumentFile(documentId);
  };

  const handleDocumentClose = (): void => {
    setSelectedDocumentId(null);
  };

  const handleDocumentDelete = (documentId: string): void => {
    if (selectedDocumentId === documentId) {
      setSelectedDocumentId(null);
    }
  };

  return (
    <main className="h-screen overflow-hidden bg-slate-50 text-slate-950">
      <div className="flex h-full flex-col">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center border-b border-slate-200 px-6">
          <h1 className="text-lg font-semibold tracking-tight">DocuMind AI</h1>
        </header>

        {/* Application workspace */}
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          {selectedDocumentId === null ? (
            <>
              <aside className="w-full shrink-0 border-b border-slate-200 bg-slate-50 md:w-72 md:border-b-0 md:border-r">
                <div className="h-full overflow-y-auto p-4">
                  <DocumentSidebar
                    onDocumentSelect={handleDocumentSelect}
                    onDocumentDelete={handleDocumentDelete}
                  />
                  <DocumentUpload />
                </div>
              </aside>

              <section className="min-w-0 flex-1">
                <div className="mx-auto h-full w-full max-w-4xl">
                  <Chat />
                </div>
              </section>
            </>
          ) : (
            <DocumentWorkspace
              fileUrl={fileUrl}
              isLoading={isLoading}
              error={error}
              onClose={handleDocumentClose}
            />
          )}
        </div>
      </div>
    </main>
  );
}

export default App;
