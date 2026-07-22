-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('MOMENT', 'ARTICLE');

-- CreateEnum
CREATE TYPE "EntryVisibility" AS ENUM ('PUBLIC', 'UNLISTED', 'PRIVATE');

-- CreateEnum
CREATE TYPE "EntryStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "Entry" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "type" "EntryType" NOT NULL DEFAULT 'MOMENT',
    "title" TEXT,
    "content" TEXT NOT NULL,
    "coverImage" TEXT,
    "sourceLanguageId" TEXT,
    "targetLanguageId" TEXT,
    "expressionType" TEXT,
    "tone" TEXT,
    "completeness" TEXT,
    "visibility" "EntryVisibility" NOT NULL DEFAULT 'PUBLIC',
    "status" "EntryStatus" NOT NULL DEFAULT 'PUBLISHED',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Entry_authorId_idx" ON "Entry"("authorId");

-- CreateIndex
CREATE INDEX "Entry_type_status_visibility_idx" ON "Entry"("type", "status", "visibility");

-- CreateIndex
CREATE INDEX "Entry_createdAt_idx" ON "Entry"("createdAt");

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_sourceLanguageId_fkey" FOREIGN KEY ("sourceLanguageId") REFERENCES "Language"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_targetLanguageId_fkey" FOREIGN KEY ("targetLanguageId") REFERENCES "Language"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── Data Migration: Copy Post → Entry (type=MOMENT) ────────────────────────
-- Uses same IDs to maintain backward compatibility with Correction.postId FK.
-- Deleted posts are excluded; HIDDEN/FLAGGED posts are migrated as PUBLISHED.
-- Status mapping: PUBLISHED|ACCEPTED|HIDDEN|FLAGGED → PUBLISHED, DRAFT → DRAFT.
INSERT INTO "Entry" (
  "id",
  "authorId",
  "type",
  "title",
  "content",
  "sourceLanguageId",
  "targetLanguageId",
  "expressionType",
  "tone",
  "completeness",
  "visibility",
  "status",
  "createdAt",
  "updatedAt",
  "publishedAt"
)
SELECT
  "id",
  "authorId",
  'MOMENT'::"EntryType",
  "title",
  "content",
  "sourceLanguageId",
  "targetLanguageId",
  "expressionType",
  "tone",
  "completeness"::text,
  "visibility"::text::"EntryVisibility",
  CASE
    WHEN "status" IN ('PUBLISHED', 'ACCEPTED', 'HIDDEN', 'FLAGGED') THEN 'PUBLISHED'::"EntryStatus"
    WHEN "status" = 'DRAFT' THEN 'DRAFT'::"EntryStatus"
    ELSE 'PUBLISHED'::"EntryStatus"
  END,
  "createdAt",
  "updatedAt",
  "createdAt"
FROM "Post"
WHERE "status" != 'DELETED';

-- ─── Rollback: DROP TABLE "Entry"; DROP TYPE "EntryStatus"; DROP TYPE "EntryVisibility"; DROP TYPE "EntryType"; ───
