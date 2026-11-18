import { useState } from "react";
import Chat from "./features/chat/components/Chat";
import ConversationHistory from "./features/chat/components/ConversationHistory";
import NewChatButton from "./features/chat/components/NewChatButton";
import { useConversations } from "./features/chat/hooks/useConversations";
import DocumentSidebar from "./features/documents/components/DocumentSidebar";
import DocumentUpload from "./features/documents/components/DocumentUpload";
import DocumentWorkspace from "./features/documents/components/DocumentWorkspace";
import { useDocumentFile } from "./features/documents/hooks/useDocumentFile";
import { IssueExplorer } from "./features/issues/components/IssueExplorer";

function App() {
  const [activeView, setActiveView] = useState<"workspace" | "issues">("workspace");
  const {
    fileUrl,
    textContent,
    mimeType,
    fileName: documentFileName,
    isLoading: isDocumentLoading,
    error: documentError,
    fetchDocumentFile,
  } = useDocumentFile();

  const [documentRefreshKey, setDocumentRefreshKey] = useState(0);

  const {
    conversations,
    isLoading: isConversationsLoading,
    error: conversationsError,
    fetchConversations,
    removeConversation,
  } = useConversations();

  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null,
  );

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleDocumentSelect = async (
    documentId: string,
    fileName?: string,
  ): Promise<void> => {
    setSelectedDocumentId(documentId);
    setIsMobileDrawerOpen(false);
    await fetchDocumentFile(documentId, fileName);
  };

  const handleDocumentClose = (): void => {
    setSelectedDocumentId(null);
  };

  const handleDocumentDelete = (documentId: string): void => {
    if (selectedDocumentId === documentId) {
      setSelectedDocumentId(null);
    }
  };

  const handleNewChat = (): void => {
    setSelectedConversationId(null);
    setSelectedDocumentId(null);
    setIsMobileDrawerOpen(false);
  };

  const handleConversationCreated = (conversationId: string): void => {
    setSelectedConversationId(conversationId);
    void fetchConversations();
  };

  const handleConversationSelect = async (
    conversationId: string,
  ): Promise<void> => {
    setSelectedDocumentId(null);
    setSelectedConversationId(conversationId);
    setIsMobileDrawerOpen(false);
  };

  const handleConversationDelete = async (
    conversationId: string,
  ): Promise<void> => {
    await removeConversation(conversationId);

    if (selectedConversationId === conversationId) {
      setSelectedConversationId(null);
    }
  };

  const toggleSidebar = (): void => {
    if (window.innerWidth < 1024) {
      setIsMobileDrawerOpen((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => !prev);
    }
  };

  const handleDocumentProcessed = (): void => {
    setDocumentRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="h-screen overflow-hidden bg-slate-50 text-slate-950">
      <div className="flex h-full flex-col">
        {/* Top Navbar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSidebar}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Toggle sidebar"
              title="Toggle sidebar"
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-slate-900">
                DocuMind AI
              </h1>
              {selectedDocumentId && activeView === "workspace" && (
                <span className="hidden items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 sm:inline-flex">
                  Document Mode
                </span>
              )}
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center rounded-lg bg-slate-100 p-1 text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setActiveView("workspace")}
              className={`rounded-md px-3 py-1 transition ${
                activeView === "workspace"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "hover:text-slate-900"
              }`}
            >
              Documents & Chat
            </button>
            <button
              type="button"
              onClick={() => setActiveView("issues")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 transition ${
                activeView === "issues"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "hover:text-slate-900"
              }`}
            >
              <span>Issue Explorer</span>
              <span className="flex h-2 w-2 rounded-full bg-red-500" />
            </button>
          </div>
        </header>

        {/* Main Layout Area */}
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          {/* Mobile Drawer Backdrop */}
          {isMobileDrawerOpen && (
            <div
              onClick={() => setIsMobileDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity lg:hidden"
              aria-hidden="true"
            />
          )}

          {/* Sidebar */}
          <aside
            className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-slate-50 transition-transform duration-200 ease-in-out lg:static lg:z-auto ${
              activeView === "issues" || isSidebarCollapsed ? "lg:hidden" : "lg:flex"
            } ${
              isMobileDrawerOpen
                ? "translate-x-0 shadow-2xl lg:shadow-none"
                : "-translate-x-full lg:translate-x-0"
            }`}
          >
            {/* Mobile drawer top close button */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-4 lg:hidden">
              <span className="text-sm font-semibold text-slate-800">
                Navigation
              </span>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                aria-label="Close navigation drawer"
              >
                ✕
              </button>
            </div>

            <div className="shrink-0 p-4">
              <NewChatButton onClick={handleNewChat} />

              <DocumentSidebar
                onDocumentSelect={handleDocumentSelect}
                onDocumentDelete={handleDocumentDelete}
                refreshTrigger={documentRefreshKey}
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4">
              <ConversationHistory
                conversations={conversations}
                isLoading={isConversationsLoading}
                error={conversationsError}
                selectedConversationId={selectedConversationId}
                onConversationSelect={handleConversationSelect}
                onConversationDelete={handleConversationDelete}
              />
            </div>

            <div className="shrink-0 border-t border-slate-200 p-4">
              <DocumentUpload onDocumentProcessed={handleDocumentProcessed} />
            </div>
          </aside>

          {/* Main Content Area */}
          {activeView === "issues" ? (
            <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <IssueExplorer
                onOpenDocument={(docId, fileName) => {
                  setActiveView("workspace");
                  void handleDocumentSelect(docId, fileName);
                }}
                onSwitchToChat={() => {
                  setActiveView("workspace");
                  handleNewChat();
                }}
              />
            </section>
          ) : (
            <section className="flex min-h-0 min-w-0 flex-1 flex-col">
              {selectedDocumentId === null ? (
                <div className="mx-auto h-full w-full max-w-4xl">
                  <Chat
                    selectedConversationId={selectedConversationId}
                    onConversationCreated={handleConversationCreated}
                  />
                </div>
              ) : (
                <DocumentWorkspace
                  fileUrl={fileUrl}
                  textContent={textContent}
                  mimeType={mimeType}
                  fileName={documentFileName}
                  isLoading={isDocumentLoading}
                  error={documentError}
                  selectedConversationId={selectedConversationId}
                  onConversationCreated={handleConversationCreated}
                  onClose={handleDocumentClose}
                />
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

export default App;
