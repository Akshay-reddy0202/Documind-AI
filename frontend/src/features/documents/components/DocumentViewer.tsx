type DocumentViewerProps = {
  fileUrl: string | null;
  isLoading: boolean;
  error: string | null;
};

function DocumentViewer({ fileUrl, isLoading, error }: DocumentViewerProps) {
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

  if (!fileUrl) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-slate-400">Select a document to view it.</p>
      </div>
    );
  }

  return (
    <iframe
      src={fileUrl}
      title="Document viewer"
      className="h-full w-full border-0"
    />
  );
}

export default DocumentViewer;
