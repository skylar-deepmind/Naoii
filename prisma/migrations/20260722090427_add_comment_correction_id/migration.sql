-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "correctionId" TEXT;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_correctionId_fkey" FOREIGN KEY ("correctionId") REFERENCES "Correction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
