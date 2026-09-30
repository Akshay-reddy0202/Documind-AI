import { Router } from "express";
import {
  getDocuments,
  getDocument,
  getDocumentFile,
  updateDocument,
  deleteDocument,
  uploadDocuments,
} from "./documents.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { documentIdSchema, updateDocumentSchema } from "./documents.schema.js";
import upload from "./documents.upload.js";

const router = Router();

router.post("/upload", upload.array("files", 5), uploadDocuments);

router.get("/", getDocuments);

router.get(
  "/:id",
  validate({
    params: documentIdSchema,
  }),
  getDocument,
);

router.get(
  "/:id/file",
  validate({
    params: documentIdSchema,
  }),
  getDocumentFile,
);

router.patch(
  "/:id",
  validate({
    params: documentIdSchema,
    body: updateDocumentSchema,
  }),
  updateDocument,
);

router.delete("/:id", deleteDocument);

export default router;
