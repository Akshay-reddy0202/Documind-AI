import Chat from "./features/chat/components/Chat";
import DocumentSidebar from "./features/documents/components/DocumentSidebar";
import DocumentUpload from "./features/documents/components/DocumentUpload";
import { useDocumentFile } from "./features/documents/hooks/useDocumentFile";
import DocumentViewer from "./features/documents/components/DocumentViewer";

function App() {
  const { fileUrl, isLoading, error, fetchDocumentFile } = useDocumentFile();
  return (
    <main className="h-screen overflow-hidden bg-slate-50 text-slate-950">
      <div className="flex h-full flex-col">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center border-b border-slate-200 px-6">
          <h1 className="text-lg font-semibold tracking-tight">DocuMind AI</h1>
        </header>

        {/* Application workspace */}
        <div className="flex min-h-0 flex-1">
          {/* Sidebar */}
          <aside className="w-72 shrink-0 border-r border-slate-200 bg-slate-50">
            <div className="h-full overflow-y-auto p-4">
              <DocumentSidebar onDocumentSelect={fetchDocumentFile} />
              <DocumentUpload />
            </div>
          </aside>

          {/* Main chat area */}
          <section className="min-w-0 flex-1">
            <div className="mx-auto h-full w-full max-w-4xl">
              {/* <Chat /> */}
              <DocumentViewer
                fileUrl={fileUrl}
                isLoading={isLoading}
                error={error}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
