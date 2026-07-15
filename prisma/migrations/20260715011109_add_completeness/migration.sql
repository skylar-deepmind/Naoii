-- CreateEnum
CREATE TYPE "PostCompleteness" AS ENUM ('COMPLETE', 'PARTIAL', 'IDEA_ONLY');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "completeness" "PostCompleteness" NOT NULL DEFAULT 'COMPLETE';
