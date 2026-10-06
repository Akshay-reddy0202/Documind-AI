import Chat from "./features/chat/components/Chat";
import DocumentUpload from "./features/documents/components/DocumentUpload";

function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col">
        <header className="border-b border-slate-800 px-6 py-5">
          <h1 className="text-2xl font-semibold tracking-tight">
            DocuMind AI
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Ask questions about your documents
          </p>
        </header>

        <div className="flex flex-1">
          <aside className="w-80 border-r border-slate-800 p-6">
            <DocumentUpload />
          </aside>

          <section className="flex flex-1 flex-col p-6">
            <Chat />
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
