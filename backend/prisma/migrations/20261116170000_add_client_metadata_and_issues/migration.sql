-- AlterTable
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "clientId" TEXT,
ADD COLUMN IF NOT EXISTS "clientName" TEXT,
ADD COLUMN IF NOT EXISTS "environment" TEXT,
ADD COLUMN IF NOT EXISTS "reportingPeriod" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Document_clientId_idx" ON "Document"("clientId");

-- CreateTable
CREATE TABLE IF NOT EXISTS "Issue" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "issueCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "component" TEXT NOT NULL,
    "firstObservedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "description" TEXT NOT NULL,
    "logSnippet" TEXT,
    "workaround" TEXT,
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Issue_documentId_idx" ON "Issue"("documentId");
CREATE INDEX IF NOT EXISTS "Issue_issueCode_idx" ON "Issue"("issueCode");
CREATE INDEX IF NOT EXISTS "Issue_status_idx" ON "Issue"("status");
CREATE INDEX IF NOT EXISTS "Issue_severity_idx" ON "Issue"("severity");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Issue_documentId_fkey'
    ) THEN
        ALTER TABLE "Issue" ADD CONSTRAINT "Issue_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
