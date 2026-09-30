/*
  Warnings:

  - Added the required column `fileData` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileHash` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileName` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileSize` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "fileData" BYTEA NOT NULL,
ADD COLUMN     "fileHash" TEXT NOT NULL,
ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "fileSize" INTEGER NOT NULL,
ADD COLUMN     "mimeType" TEXT NOT NULL DEFAULT 'application/pdf',
ADD COLUMN     "status" "DocumentStatus" NOT NULL DEFAULT 'UPLOADED';

-- CreateIndex
CREATE INDEX "Document_fileHash_idx" ON "Document"("fileHash");

-- CreateIndex
CREATE INDEX "Document_status_idx" ON "Document"("status");
