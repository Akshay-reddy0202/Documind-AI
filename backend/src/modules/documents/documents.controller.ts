import { Request, Response } from "express";
import { errorResponse, successResponse } from "../../utils/api.response.js";
import {
  getDocuments as getDocumentsService,
  getDocument as getDocumentService,
  updateDocument as updateDocumentService,
  deleteDocument as deleteDocumentService,
  uploadDocuments as uploadDocumentsService,
  getDocumentFile as getDocumentFileService,
} from "./documents.service.js";

export const uploadDocuments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    errorResponse(res, 400, "Please upload at least one PDF file");
    return;
  }

  const results = await uploadDocumentsService(files);

  successResponse(res, "Upload processing completed", results);
};

export const getDocuments = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const documents = await getDocumentsService();

  successResponse(res, "Documents retrieved succesfully", documents);
};

export const getDocument = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const document = await getDocumentService(req.params.id as string);
  if (!document) {
    errorResponse(res, 404, "Document not found");
    return;
  }
  successResponse(res, "Document retrived successfully", document);
};

export const getDocumentFile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const document = await getDocumentFileService(
    req.params.id as string,
  );

  if (!document) {
    errorResponse(res, 404, "Document not found");
    return;
  }

  res.setHeader("Content-Type", document.mimeType);
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${encodeURIComponent(document.fileName)}"`,
  );

  res.send(Buffer.from(document.fileData));
};

export const updateDocument = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const document = await updateDocumentService(
    req.params.id as string,
    req.body,
  );

  successResponse(res, "Document updated successfully", document);
};

export const deleteDocument = async (
  req: Request,
  res: Response,
): Promise<void> => {
  await deleteDocumentService(req.params.id as string);
  successResponse(res, "Document deleted successfully", null);
};
