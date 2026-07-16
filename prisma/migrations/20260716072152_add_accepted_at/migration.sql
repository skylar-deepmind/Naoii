-- AlterTable
ALTER TABLE "Correction" ADD COLUMN     "acceptedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Correction_acceptedAt_idx" ON "Correction"("acceptedAt");

-- CreateIndex
CREATE INDEX "Correction_createdAt_idx" ON "Correction"("createdAt");
