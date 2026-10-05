/*
  Warnings:

  - Added the required column `embedding` to the `DocumentChunk` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DocumentChunk" ADD COLUMN     "embedding" vector(3072) NOT NULL;
