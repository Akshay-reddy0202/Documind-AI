import { useRef } from "react";
import { useDocumentUpload } from "../hooks/useDocumentUpload";

function DocumentUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { documents, isUploading, error, upload } = useDocumentUpload();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    await upload(files);
    event.target.value = "";
  };
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        multiple
        hidden
        onChange={handleFileChange}
      />

      <button type="button" onClick={handleUploadClick} disabled={isUploading}>
        {isUploading ? "Uploading..." : "Upload PDF"}
      </button>

      {error && <p>{error}</p>}

      {documents.length > 0 && (
        <div>
          {documents.map((document) => (
            <p key={document.id}>
              {document.fileName} — {document.status}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
export default DocumentUpload;