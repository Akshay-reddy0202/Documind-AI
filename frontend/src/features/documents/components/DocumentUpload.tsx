import { useRef, useState } from "react";
import { useDocumentUpload } from "../hooks/useDocumentUpload";

type DocumentUploadProps = {
  onDocumentProcessed?: (documentId: string) => void;
};

function DocumentUpload({ onDocumentProcessed }: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    activeUploads,
    documentStatuses,
    isUploading,
    error: hookError,
    upload,
    clearUploads,
  } = useDocumentUpload(onDocumentProcessed);

  const error = localError ?? hookError;

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setLocalError(null);
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    if (files.length > 5) {
      setLocalError("You can upload a maximum of 5 files at a time");
      event.target.value = "";
      return;
    }

    await upload(files);
    event.target.value = "";
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    setLocalError(null);

    if (isUploading) return;

    const droppedFiles = Array.from(event.dataTransfer.files);
    const pdfFiles = droppedFiles.filter(
      (file) =>
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf"),
    );

    if (pdfFiles.length === 0) {
      if (droppedFiles.length > 0) {
        setLocalError("Only PDF files are supported");
      }
      return;
    }

    if (pdfFiles.length > 5) {
      setLocalError("You can upload a maximum of 5 files at a time");
      return;
    }

    await upload(pdfFiles);
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

      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleUploadClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleUploadClick();
          }
        }}
        className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-3 text-center transition ${
          isDragOver
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"
        } ${isUploading ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <span className="mb-1 text-base">{isDragOver ? "📥" : "📄"}</span>
        <span className="text-xs font-medium text-slate-700">
          {isUploading
            ? "Uploading..."
            : isDragOver
              ? "Drop PDF here"
              : "Upload or drag PDF"}
        </span>
        <span className="mt-0.5 text-[10px] text-slate-400">PDFs up to 5</span>
      </div>

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
                  <span className="text-xs capitalize text-slate-500">
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
