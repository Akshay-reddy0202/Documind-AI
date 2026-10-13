import { useRef } from "react";
import { useDocumentUpload } from "../hooks/useDocumentUpload";

type DocumentUploadProps = {
  onDocumentProcessed?: (documentId: string) => void;
};

function DocumentUpload({ onDocumentProcessed }: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    activeUploads,
    documentStatuses,
    isUploading,
    error,
    upload,
    clearUploads,
  } = useDocumentUpload(onDocumentProcessed);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    await upload(files);
    event.target.value = "";
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        multiple
        hidden
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={handleUploadClick}
        disabled={isUploading}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-
allowed disabled:opacity-50"
      >
        <span className="text-lg leading-none">+</span>
        {isUploading ? "Uploading..." : "Upload PDF"}
      </button>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <p className="text-xs leading-5 text-red-600">{error}</p>
        </div>
      )}

      {/* Shows ONLY active files currently uploading / processing */}
      {activeUploads.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-slate-500">
              Current Upload
            </span>
            <button
              type="button"
              onClick={clearUploads}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          </div>

          {activeUploads.map((document) => {
            const status = documentStatuses[document.id] ?? document.status;

            const statusColor =
              status === "PROCESSED"
                ? "bg-emerald-500"
                : status === "FAILED"
                  ? "bg-red-500"
                  : "bg-amber-500 animate-pulse";

            return (
              <div
                key={document.id}
                className="rounded-xl border border-slate-200 bg-white px-3 py-3"
              >
                <p
                  className="truncate text-sm font-medium text-slate-700"
                  title={document.fileName}
                >
                  {document.fileName}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${statusColor}`} />
                  <span className="text-xs text-slate-500 capitalize">
                    {status.toLowerCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DocumentUpload;
