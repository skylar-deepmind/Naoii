-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "topicId" TEXT,
ALTER COLUMN "entryId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Comment_topicId_idx" ON "Comment"("topicId");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
