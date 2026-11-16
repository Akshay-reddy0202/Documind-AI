import { Worker } from "bullmq";
import { prisma } from "../config/prisma.js";
import { redisConnection } from "../config/redis.js";
import { extractDocumentPages } from "../modules/documents/services/document-extraction.service.js";
import { documentProcessingService } from "../modules/documents/services/document-processing.factory.js";
import { publishDocumentStatus } from "../modules/documents/services/document-status-events.service.js";
import { processReportExtraction } from "../modules/documents/services/report-extraction.service.js";
import type { DocumentProcessingJob } from "../queues/queue.types.js";

export const documentWorker = new Worker<DocumentProcessingJob>(
  "document-processing",
  async (job) => {
    const { documentId } = job.data;

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        fileName: true,
        fileData: true,
      },
    });

    if (!document) {
      console.warn(
        `Skipping document job ${job.id}: document ${documentId} no longer exists.`,
      );

      return;
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { status: "PROCESSING" },
    });

    await publishDocumentStatus({
      documentId,
      status: "PROCESSING",
    });

    try {
      const pages = await extractDocumentPages(
        Buffer.from(document.fileData),
        document.fileName,
      );

      const extractedText = pages.map((page) => page.text).join("\n\n");

      await prisma.document.update({
        where: { id: documentId },
        data: { extractedText },
      });

      // Extract client metadata and structured issues if this is an incident report
      try {
        await processReportExtraction(documentId, extractedText);
      } catch (extractionError) {
        console.warn(
          `Report metadata/issue extraction skipped for document ${documentId}:`,
          extractionError,
        );
      }

      await prisma.documentChunk.deleteMany({
        where: { documentId },
      });

      await documentProcessingService.processDocument(documentId, pages);

      await prisma.document.update({
        where: { id: documentId },
        data: { status: "PROCESSED" },
      });

      await publishDocumentStatus({
        documentId,
        status: "PROCESSED",
      });
    } catch (error) {
      if (job.attemptsMade >= (job.opts.attempts ?? 1)) {
        await prisma.document.update({
          where: { id: documentId },
          data: { status: "FAILED" },
        });

        await publishDocumentStatus({
          documentId,
          status: "FAILED",
        });
      }
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 2,
  },
);

documentWorker.on("completed", (job) => {
  console.log(`Document job ${job.id} completed`);
});

documentWorker.on("failed", (job, error) => {
  console.error(`Document job ${job?.id} failed:`, error.message);
});
