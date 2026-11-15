import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type DocumentViewerProps = {
  fileUrl: string | null;
  textContent?: string | null;
  mimeType?: string | null;
  fileName?: string | null;
  isLoading: boolean;
  error: string | null;
};

function DocumentViewer({
  fileUrl,
  textContent,
  mimeType,
  fileName,
  isLoading,
  error,
}: DocumentViewerProps) {
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-slate-400">Loading document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (!fileUrl && !textContent) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-slate-400">Select a document to view it.</p>
      </div>
    );
  }

  // PDF Document Viewer
  if (fileUrl) {
    return (
      <iframe
        src={fileUrl}
        title={fileName ?? "Document viewer"}
        className="h-full w-full border-0"
      />
    );
  }

  const isMarkdown =
    mimeType === "text/markdown" ||
    fileName?.toLowerCase().endsWith(".md") ||
    fileName?.toLowerCase().endsWith(".markdown");

  // Markdown Document Viewer
  if (isMarkdown && textContent) {
    return (
      <div className="h-full overflow-y-auto p-6 text-slate-800">
        <article className="prose max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="mb-4 border-b border-slate-200 pb-2 text-2xl font-bold text-slate-900">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="mb-3 mt-6 text-xl font-semibold text-slate-900">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="mb-2 mt-4 text-base font-semibold text-slate-800">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="mb-4 text-sm leading-6 text-slate-700">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-4 list-decimal space-y-1 pl-5 text-sm text-slate-700">
                  {children}
                </ol>
              ),
              code: ({ children }) => (
                <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="mb-4 overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-xs text-slate-100">
                  {children}
                </pre>
              ),
              table: ({ children }) => (
                <div className="mb-4 overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 border border-slate-200 text-left text-xs text-slate-700">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border-b border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-900">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border-b border-slate-100 px-3 py-2">
                  {children}
                </td>
              ),
            }}
          >
            {textContent}
          </ReactMarkdown>
        </article>
      </div>
    );
  }

  // Text, Log, JSON, CSV Viewer
  return (
    <div className="h-full overflow-y-auto bg-slate-50/50 p-4 font-mono text-xs leading-relaxed text-slate-800">
      <pre className="whitespace-pre-wrap break-words">{textContent}</pre>
    </div>
  );
}

export default DocumentViewer;
