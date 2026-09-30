import { prisma } from "../../config/prisma.js";
import type { UpdateDocumentInput } from "./documents.schema.js";
import { validatePdfFile } from "./documents.validation.js";
import { PDFParse } from "pdf-parse";

export const getDocuments = async () => {
  const documents = await prisma.document.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      fileName: true,
      fileSize: true,
      status: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return documents;
};

export const getDocument = async (id: string) => {
  const document = await prisma.document.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      title: true,
      description: true,
      fileName: true,
      fileSize: true,
      status: true,
      createdAt: true,
    },
  });
  return document;
};

export const getDocumentFile = async (id: string) => {
  return prisma.document.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      fileName: true,
      mimeType: true,
      fileData: true,
    },
  });
};

export const updateDocument = async (id: string, data: UpdateDocumentInput) => {
  const document = await prisma.document.update({
    where: {
      id,
    },
    data: {
      title: data.title,
      description: data.description,
    },
    select: {
      id: true,
      title: true,
      description: true,
      updatedAt: true,
    },
  });
  return document;
};

export const deleteDocument = async (id: string) => {
  const document = await prisma.document.delete({
    where: {
      id,
    },
  });
};

export const uploadDocuments = async (files: Express.Multer.File[]) => {
  const results = [];

  for (const file of files) {
    try {
      const { fileHash } = await validatePdfFile(file);
      const parser = new PDFParse({
        data: file.buffer,
      });

      let extractedText: string;

      try {
        const result = await parser.getText();
        extractedText = result.text.trim();
      } finally {
        await parser.destroy();
      }

      const existingDocument = await prisma.document.findFirst({
        where: {
          fileHash,
        },
        select: {
          id: true,
        },
      });

      if (existingDocument) {
        results.push({
          fileName: file.originalname,
          success: false,
          message: "This file has already been uploaded",
        });

        continue;
      }

      const document = await prisma.document.create({
        data: {
          title: file.originalname.replace(/\.pdf$/i, ""),
          fileName: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size,
          fileHash,
          fileData: new Uint8Array(file.buffer),
          extractedText,
        },
        select: {
          id: true,
          title: true,
          fileName: true,
          fileSize: true,
          status: true,
          createdAt: true,
        },
      });

      results.push({
        fileName: file.originalname,
        success: true,
        data: document,
      });
    } catch (error) {
      results.push({
        fileName: file.originalname,
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to upload document",
      });
    }
  }

  return results;
};
