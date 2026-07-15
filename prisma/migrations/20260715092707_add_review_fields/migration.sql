-- AlterTable
ALTER TABLE "ExpressionCollectionItem" ADD COLUMN     "lastReviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reviewStatus" TEXT;
